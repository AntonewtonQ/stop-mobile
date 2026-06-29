import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { LanguageSwitcher } from '@/components/game/LanguageSwitcher';
import { SoundToggle } from '@/components/game/SoundToggle';
import { ThemePicker } from '@/components/game/ThemePicker';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { Input } from '@/components/ui/Input';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { ScoreRow } from '@/components/ui/ScoreRow';
import { Timer } from '@/components/ui/Timer';
import {
  CATEGORY_OPTIONS,
  MAX_CATEGORIES,
  MAX_ROUNDS_TO_PLAY,
  MIN_CATEGORIES,
  MIN_ROUNDS_TO_PLAY,
  PLAYABLE_LETTERS,
  ROUND_DURATION_OPTIONS,
  normalizeCategories,
  normalizeCategoryName,
} from '@/features/game/constants';
import { getCommanderForRound } from '@/features/game/engine';
import {
  castAnswerVote,
  chooseRoundLetter,
  finishGame,
  finishRound,
  prepareNextRound,
  saveRoundAnswers,
  startFirstRound,
  startRematch,
  updateRoomSettings,
} from '@/features/game/mobileApi';
import { normalizeRoomCode } from '@/features/game/mobileStorage';
import { getPlayerTotal } from '@/features/game/scoring';
import type {
  AnswerChallenge,
  AnswerScoreStatus,
  AnswerVote,
  Player,
  PlayerSession,
  Room,
  RoomSettings,
  RoomStatus,
  RoundAnswers,
} from '@/features/game/types';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useRoom, type RoomConnectionStatus } from '@/hooks/useRoom';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const SCORE_STATUS_LABELS: Record<AnswerScoreStatus, string> = {
  invalid: '0',
  doubtful: '?',
  duplicate: '5',
  correct: '10',
  unique: '20',
};

type LobbySaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type Translate = ReturnType<typeof useLanguage>['t'];

function makeLobbySettingsSnapshot(
  categories: string[],
  roundDuration: number,
  roundsToPlay: number,
) {
  return JSON.stringify({ categories, roundDuration, roundsToPlay });
}

function makeRoomSettingsSnapshot(settings: RoomSettings) {
  return makeLobbySettingsSnapshot(
    settings.categories,
    settings.roundDuration,
    settings.roundsToPlay,
  );
}

export default function RoomScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ code?: string }>();
  const code = normalizeRoomCode(String(params.code ?? ''));
  const { room, session, isLoading, connectionStatus, refresh } = useRoom(code);
  useGameSounds(room);
  const [answers, setAnswers] = useState<RoundAnswers>({});
  const [customCategory, setCustomCategory] = useState('');
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftDuration, setDraftDuration] = useState<(typeof ROUND_DURATION_OPTIONS)[number]>(60);
  const [draftRounds, setDraftRounds] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lobbySaveState, setLobbySaveState] = useState<LobbySaveState>('idle');
  const [now, setNow] = useState(Date.now());
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lobbyAutosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lobbyDraftSnapshotRef = useRef('');
  const lobbyDraftTouchedRef = useRef(false);
  const lobbyLastServerSnapshotRef = useRef('');
  const lobbyRoomCodeRef = useRef('');
  const lastAutosavedRef = useRef('');
  const timeoutSubmittedRef = useRef(false);

  const currentPlayer = useMemo(
    () => room?.players.find((player) => player.id === session?.id) ?? null,
    [room?.players, session?.id],
  );
  const isHost = Boolean(room && session && room.hostId === session.id);
  const isCommander = Boolean(room?.round && session && room.round.commanderId === session.id);
  const usedLetters = useMemo(
    () => new Set(room?.history.map((round) => round.letter).filter(Boolean) ?? []),
    [room?.history],
  );
  const currentCommander = useMemo(() => {
    if (!room?.round) return null;
    return room.players.find((player) => player.id === room.round?.commanderId) ?? null;
  }, [room]);
  const remainingSeconds = useMemo(() => {
    if (room?.status !== 'round' || !room.round?.startedAt) return null;
    const deadline = room.round.startedAt + room.round.duration * 1000;
    return Math.max(0, Math.ceil((deadline - now) / 1000));
  }, [now, room?.round, room?.status]);
  const standings = useMemo(() => {
    if (!room) return [];

    return [...room.players]
      .map((player) => ({
        player,
        total: getPlayerTotal(room.history, player.id),
      }))
      .sort((a, b) => b.total - a.total);
  }, [room]);
  const lobbyRoomCode = room?.code;
  const lobbyRoomStatus = room?.status;
  const lobbyRoomSettings = room?.settings;

  const runAction = useCallback(
    async (action: () => Promise<unknown>) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        await action();
        await refresh();
      } catch (error) {
        Alert.alert(
          t('error.actionUnavailable'),
          error instanceof Error ? error.message : t('error.generic'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, refresh, t],
  );

  useEffect(() => {
    if (!lobbyRoomCode || lobbyRoomStatus !== 'lobby' || !lobbyRoomSettings) return;
    const serverSnapshot = makeRoomSettingsSnapshot(lobbyRoomSettings);
    const roomChanged = lobbyRoomCodeRef.current !== lobbyRoomCode;

    lobbyRoomCodeRef.current = lobbyRoomCode;
    lobbyLastServerSnapshotRef.current = serverSnapshot;

    if (roomChanged || !lobbyDraftTouchedRef.current) {
      lobbyDraftTouchedRef.current = false;
      lobbyDraftSnapshotRef.current = serverSnapshot;
      setDraftCategories(lobbyRoomSettings.categories);
      setDraftDuration(lobbyRoomSettings.roundDuration as (typeof ROUND_DURATION_OPTIONS)[number]);
      setDraftRounds(lobbyRoomSettings.roundsToPlay);
      setLobbySaveState('saved');
      return;
    }

    if (serverSnapshot === lobbyDraftSnapshotRef.current) {
      lobbyDraftTouchedRef.current = false;
      setLobbySaveState('saved');
    }
  }, [lobbyRoomCode, lobbyRoomSettings, lobbyRoomStatus]);

  useEffect(() => {
    if (!lobbyRoomCode || lobbyRoomStatus !== 'lobby' || !isHost || !lobbyDraftTouchedRef.current) {
      return;
    }
    const snapshot = makeLobbySettingsSnapshot(draftCategories, draftDuration, draftRounds);
    lobbyDraftSnapshotRef.current = snapshot;

    if (snapshot === lobbyLastServerSnapshotRef.current) {
      lobbyDraftTouchedRef.current = false;
      setLobbySaveState('saved');
      return;
    }

    if (draftCategories.length < MIN_CATEGORIES) {
      setLobbySaveState('dirty');
      return;
    }

    if (lobbyAutosaveRef.current) clearTimeout(lobbyAutosaveRef.current);
    setLobbySaveState('dirty');

    lobbyAutosaveRef.current = setTimeout(() => {
      const pendingSnapshot = snapshot;
      setLobbySaveState('saving');

      void updateRoomSettings(lobbyRoomCode, {
        categories: draftCategories,
        roundDuration: draftDuration,
        roundsToPlay: draftRounds,
      })
        .then((nextRoom) => {
          const savedSnapshot = makeRoomSettingsSnapshot(nextRoom.settings);
          lobbyLastServerSnapshotRef.current = savedSnapshot;

          if (
            lobbyDraftSnapshotRef.current === pendingSnapshot ||
            lobbyDraftSnapshotRef.current === savedSnapshot
          ) {
            lobbyDraftTouchedRef.current = false;
            lobbyDraftSnapshotRef.current = savedSnapshot;
            setLobbySaveState('saved');
          } else {
            setLobbySaveState('dirty');
          }

          return refresh();
        })
        .catch(() => {
          if (lobbyDraftSnapshotRef.current === pendingSnapshot) {
            setLobbySaveState('error');
          }
        });
    }, 700);

    return () => {
      if (lobbyAutosaveRef.current) clearTimeout(lobbyAutosaveRef.current);
    };
  }, [
    draftCategories,
    draftDuration,
    draftRounds,
    isHost,
    lobbyRoomCode,
    lobbyRoomStatus,
    refresh,
  ]);

  useEffect(() => {
    if (room?.status !== 'round') return;

    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [room?.status]);

  useEffect(() => {
    if (room?.status !== 'round' || !session || !room.round) return;

    timeoutSubmittedRef.current = false;
    setAnswers((current) =>
      room.settings.categories.reduce<RoundAnswers>((draft, category) => {
        draft[category] = current[category] ?? room.round?.answers[session.id]?.[category] ?? '';
        return draft;
      }, {}),
    );
  }, [room?.round?.number, room?.settings.categories, room?.status, session, room?.round]);

  useEffect(() => {
    if (room?.status !== 'round' || !session) return;
    const serialized = JSON.stringify(answers);
    if (serialized === lastAutosavedRef.current) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);

    autosaveRef.current = setTimeout(() => {
      lastAutosavedRef.current = serialized;
      void saveRoundAnswers(room.code, answers).catch(() => undefined);
    }, 800);

    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [answers, room?.code, room?.status, session]);

  useEffect(() => {
    if (
      room?.status !== 'round' ||
      remainingSeconds === null ||
      remainingSeconds > 0 ||
      timeoutSubmittedRef.current
    ) {
      return;
    }

    timeoutSubmittedRef.current = true;
    void finishRound(room.code, true, answers)
      .then(refresh)
      .catch(() => undefined);
  }, [answers, refresh, remainingSeconds, room?.code, room?.status]);

  useEffect(() => {
    if (room?.status === 'results' && room.round?.stoppedBy) {
      Vibration.vibrate(80);
    }
  }, [room?.round?.stoppedBy, room?.status]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.amber} />
        <Text style={[styles.loadingText, { color: colors.petroleum }]}>A carregar sala...</Text>
      </SafeAreaView>
    );
  }

  if (!room || !session || !currentPlayer) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Logo />
        <Text style={[styles.emptyTitle, { color: colors.petroleum }]}>
          {getUnavailableTitle(room, session, currentPlayer, t)}
        </Text>
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          {getUnavailableBody(room, session, currentPlayer, t)}
        </Text>
        <Button label={t('common.home')} onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const allAnswered =
    room.status === 'round' &&
    room.settings.categories.every((category) => answers[category]?.trim());
  const activeRoom = room;
  const pendingChallenges =
    room.round?.result &&
    Object.values(room.round.result.challenges).filter(
      (challenge) => challenge.status === 'pending',
    );

  function setLobbyDraftSettings({
    categories = draftCategories,
    duration = draftDuration,
    rounds = draftRounds,
  }: {
    categories?: string[];
    duration?: (typeof ROUND_DURATION_OPTIONS)[number];
    rounds?: number;
  }) {
    const normalizedCategories = normalizeCategories(categories);
    lobbyDraftTouchedRef.current = true;
    lobbyDraftSnapshotRef.current = makeLobbySettingsSnapshot(
      normalizedCategories,
      duration,
      rounds,
    );
    setLobbySaveState('dirty');
    setDraftCategories(normalizedCategories);
    setDraftDuration(duration);
    setDraftRounds(rounds);
  }

  function toggleCategory(category: string) {
    if (!isHost || isSubmitting) return;
    const removing = draftCategories.includes(category);
    if (removing && draftCategories.length <= MIN_CATEGORIES) return;
    const nextCategories = draftCategories.includes(category)
      ? draftCategories.filter((item) => item !== category)
      : [...draftCategories, category];
    setLobbyDraftSettings({ categories: nextCategories });
  }

  function addCustomCategory() {
    const category = normalizeCategoryName(customCategory);
    if (!category) return;
    setLobbyDraftSettings({ categories: [...draftCategories, category] });
    setCustomCategory('');
  }

  function removeCategory(category: string) {
    if (!isHost || isSubmitting) return;
    if (draftCategories.length <= MIN_CATEGORIES) return;
    setLobbyDraftSettings({ categories: draftCategories.filter((item) => item !== category) });
  }

  function saveLobbySettings() {
    lobbyDraftTouchedRef.current = true;
    setLobbySaveState('saving');

    return updateRoomSettings(activeRoom.code, {
      categories: draftCategories,
      roundDuration: draftDuration,
      roundsToPlay: draftRounds,
    })
      .then((nextRoom) => {
        const savedSnapshot = makeRoomSettingsSnapshot(nextRoom.settings);
        lobbyLastServerSnapshotRef.current = savedSnapshot;
        lobbyDraftSnapshotRef.current = savedSnapshot;
        lobbyDraftTouchedRef.current = false;
        setLobbySaveState('saved');
        return refresh();
      })
      .catch((error) => {
        setLobbySaveState('error');
        Alert.alert(
          'Nao foi possivel guardar',
          error instanceof Error ? error.message : 'Tenta novamente.',
        );
      });
  }

  function shareInvite() {
    const message = makeInviteMessage(activeRoom.code, t);

    return Share.share({ message });
  }

  async function shareWhatsAppInvite() {
    const message = makeInviteMessage(activeRoom.code, t);
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(whatsappUrl);
    } catch {
      await Share.share({ message });
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo compact />
          <View style={styles.roomCodeBadge}>
            <Text style={[styles.roomCodeLabel, { color: colors.muted }]}>SALA</Text>
            <Text style={[styles.roomCode, { color: colors.petroleum }]}>{room.code}</Text>
          </View>
        </View>

        <StateHero commander={currentCommander} connectionStatus={connectionStatus} room={room} />

        <View style={styles.quickPlayers}>
          {room.players.map((player) => (
            <PlayerAvatar key={player.id} player={player} showName size="sm" />
          ))}
        </View>

        {room.status === 'lobby' && (
          <LobbySection
            addCustomCategory={addCustomCategory}
            customCategory={customCategory}
            draftCategories={draftCategories}
            draftDuration={draftDuration}
            draftRounds={draftRounds}
            isHost={isHost}
            isSubmitting={isSubmitting}
            lobbySaveState={lobbySaveState}
            players={room.players}
            removeCategory={removeCategory}
            room={room}
            saveLobbySettings={saveLobbySettings}
            setCustomCategory={setCustomCategory}
            setDraftDuration={(duration) => setLobbyDraftSettings({ duration })}
            setDraftRounds={(rounds) => setLobbyDraftSettings({ rounds })}
            shareInvite={shareInvite}
            shareWhatsAppInvite={shareWhatsAppInvite}
            startGame={() => runAction(() => startFirstRound(room.code))}
            toggleCategory={toggleCategory}
          />
        )}

        {room.status === 'letter-selection' && room.round && (
          <Card
            subtitle={
              isCommander
                ? 'Escolhe uma letra ainda nao usada.'
                : `A espera de ${currentCommander?.name ?? 'comandante'} escolher a letra.`
            }
            title="Escolha da letra"
          >
            <View style={styles.letterGrid}>
              {PLAYABLE_LETTERS.map((letter) => {
                const disabled = !isCommander || usedLetters.has(letter) || isSubmitting;

                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={disabled}
                    key={letter}
                    onPress={() => runAction(() => chooseRoundLetter(room.code, letter))}
                    style={[
                      styles.letterButton,
                      {
                        backgroundColor: disabled ? colors.warmWhite : colors.petroleum,
                        borderColor: disabled ? colors.border : colors.petroleum,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.letterButtonText,
                        { color: disabled ? colors.muted : colors.surface },
                      ]}
                    >
                      {letter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        )}

        {room.status === 'round' && room.round && (
          <Card>
            <View style={styles.roundHeader}>
              <View style={styles.roundCopy}>
                <Text style={[styles.roundKicker, { color: colors.muted }]}>
                  Ronda {room.round.number} de {room.settings.roundsToPlay}
                </Text>
                <Text style={[styles.roundTitle, { color: colors.petroleum }]}>
                  Letra {room.round.letter}
                </Text>
                {room.round.stoppedBy && (
                  <Text style={[styles.statusHint, { color: colors.muted }]}>
                    STOP por{' '}
                    {room.players.find((player) => player.id === room.round?.stoppedBy)?.name}
                  </Text>
                )}
              </View>
              <View style={[styles.bigLetter, { backgroundColor: colors.petroleum }]}>
                <Text style={[styles.bigLetterText, { color: colors.surface }]}>
                  {room.round.letter}
                </Text>
              </View>
            </View>

            <Timer
              duration={room.round.duration}
              remaining={remainingSeconds ?? room.round.duration}
            />

            <View style={styles.answerProgress}>
              <Text style={[styles.progressText, { color: colors.muted }]}>
                {Object.values(answers).filter((value) => value.trim()).length}/
                {room.settings.categories.length} respostas
              </Text>
              <Text style={[styles.progressText, { color: colors.muted }]}>Autosave activo</Text>
            </View>

            {room.settings.categories.map((category) => (
              <Input
                autoCapitalize="words"
                editable={!isSubmitting}
                key={category}
                label={category}
                onChangeText={(value) =>
                  setAnswers((current) => ({ ...current, [category]: value }))
                }
                placeholder={`${category} com ${room.round?.letter}`}
                value={answers[category] ?? ''}
              />
            ))}

            <View style={styles.actionRow}>
              <Button
                fullWidth
                label="Guardar"
                onPress={() => runAction(() => saveRoundAnswers(room.code, answers))}
                style={styles.rowButton}
                variant="outline"
              />
              <Button
                fullWidth
                disabled={!allAnswered || isSubmitting}
                label="STOP"
                onPress={() => {
                  Vibration.vibrate(100);
                  void runAction(() => finishRound(room.code, false, answers));
                }}
                style={[styles.rowButton, styles.stopAction]}
                variant="accent"
              />
            </View>
          </Card>
        )}

        {(room.status === 'results' || room.status === 'finished') && room.round?.result && (
          <ResultsSection
            castVote={(challengeId, vote) =>
              runAction(() => castAnswerVote(room.code, challengeId, vote))
            }
            finishCurrentGame={() => runAction(() => finishGame(room.code))}
            isHost={isHost}
            isSubmitting={isSubmitting}
            prepareNext={() => runAction(() => prepareNextRound(room.code))}
            room={room}
            sessionId={session.id}
            standings={standings}
            startCurrentRematch={() => runAction(() => startRematch(room.code))}
          />
        )}

        {pendingChallenges && pendingChallenges.length > 0 && (
          <Text style={[styles.footerHint, { color: colors.muted }]}>
            Existem respostas duvidosas por votar antes da proxima ronda.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StateHero({
  commander,
  connectionStatus,
  room,
}: {
  commander: Player | null;
  connectionStatus: RoomConnectionStatus;
  room: Room;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const showCommander = room.status !== 'lobby' && room.status !== 'finished' && Boolean(commander);

  return (
    <View
      style={[
        styles.stateHero,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.stateHeroTop}>
        <Text style={[styles.stateEyebrow, { color: colors.amberDeep }]}>
          {getStatusLabel(room.status, t)}
        </Text>
        <Badge
          label={connectionStatus === 'connected' ? t('common.online') : connectionStatus}
          tone={connectionStatus === 'connected' ? 'success' : 'muted'}
        />
      </View>
      <Text style={[styles.stateTitle, { color: colors.petroleum }]}>
        {getStatusTitle(room.status, t)}
      </Text>
      <Text style={[styles.stateHint, { color: colors.muted }]}>
        {getRoomHint(room, commander, t)}
      </Text>
      {showCommander && commander && (
        <View style={[styles.commanderStrip, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.commanderLabel, { color: colors.muted }]}>
            {t('letter.commander')}
          </Text>
          <PlayerAvatar player={commander} size="sm" />
          <Text style={[styles.commanderName, { color: colors.petroleum }]}>{commander.name}</Text>
        </View>
      )}
    </View>
  );
}

function makeInviteUrl(code: string) {
  const baseUrl =
    process.env.EXPO_PUBLIC_WEB_URL ??
    process.env.EXPO_PUBLIC_SITE_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    'https://jogastop.ao';

  return `${baseUrl.replace(/\/$/, '')}/sala/${code}`;
}

function makeInviteMessage(code: string, t: Translate) {
  return t('lobby.whatsappMessage', {
    code,
    url: makeInviteUrl(code),
  });
}

function getUnavailableTitle(
  room: Room | null,
  session: PlayerSession | null,
  currentPlayer: Player | null,
  t: Translate,
) {
  if (!room) return t('game.roomNotFoundTitle');
  if (room.status !== 'lobby' && !currentPlayer) return t('entry.gameStarted');
  if (!session || !currentPlayer) return t('error.session');
  if (room.status !== 'lobby') return t('entry.gameStarted');
  return t('entry.roomUnavailable');
}

function getUnavailableBody(
  room: Room | null,
  session: PlayerSession | null,
  currentPlayer: Player | null,
  t: Translate,
) {
  if (!room) return t('game.roomNotFoundBody');
  if (room.status !== 'lobby' && !currentPlayer) return t('entry.gameStartedFeedback');
  if (!session || !currentPlayer) return t('entry.roomUnavailableFeedback');
  if (room.status !== 'lobby') return t('entry.gameStartedFeedback');
  return t('error.generic');
}

type LobbySectionProps = {
  addCustomCategory: () => void;
  customCategory: string;
  draftCategories: string[];
  draftDuration: (typeof ROUND_DURATION_OPTIONS)[number];
  draftRounds: number;
  isHost: boolean;
  isSubmitting: boolean;
  lobbySaveState: LobbySaveState;
  players: Player[];
  removeCategory: (category: string) => void;
  room: Room;
  saveLobbySettings: () => void;
  setCustomCategory: (value: string) => void;
  setDraftDuration: (value: (typeof ROUND_DURATION_OPTIONS)[number]) => void;
  setDraftRounds: (value: number) => void;
  shareInvite: () => Promise<unknown>;
  shareWhatsAppInvite: () => Promise<unknown>;
  startGame: () => void;
  toggleCategory: (category: string) => void;
};

function LobbySection({
  addCustomCategory,
  customCategory,
  draftCategories,
  draftDuration,
  draftRounds,
  isHost,
  isSubmitting,
  lobbySaveState,
  players,
  removeCategory,
  room,
  saveLobbySettings,
  setCustomCategory,
  setDraftDuration,
  setDraftRounds,
  shareInvite,
  shareWhatsAppInvite,
  startGame,
  toggleCategory,
}: LobbySectionProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const settingsChanged =
    JSON.stringify(draftCategories) !== JSON.stringify(room.settings.categories) ||
    draftDuration !== room.settings.roundDuration ||
    draftRounds !== room.settings.roundsToPlay;
  const validSettings = draftCategories.length >= MIN_CATEGORIES;
  const autosaveLabel = getLobbySaveLabel(lobbySaveState, validSettings, t);
  const autosaveTone = getLobbySaveTone(lobbySaveState, validSettings);

  return (
    <>
      <Card subtitle={t('lobby.callBody')} title={t('lobby.title')}>
        <View style={styles.actionRow}>
          <Button
            fullWidth
            label={t('lobby.whatsappInvite')}
            onPress={() => void shareWhatsAppInvite()}
            style={styles.rowButton}
            variant="accent"
          />
          <Button
            fullWidth
            label={t('lobby.shareInvite')}
            onPress={() => void shareInvite()}
            style={styles.rowButton}
            variant="outline"
          />
        </View>
        {isHost && (
          <View style={styles.actionRow}>
            <Button
              fullWidth
              disabled={isSubmitting || !validSettings}
              label={t('lobby.prepareFirst')}
              onPress={startGame}
              style={styles.rowButton}
            />
          </View>
        )}
        {!isHost && (
          <Text style={[styles.waitingText, { color: colors.muted }]}>
            {t('lobby.hostPreparing')}
          </Text>
        )}
      </Card>

      <Card
        title={t('lobby.commandOrder')}
        subtitle={t('lobby.playersRounds', {
          players: players.length,
          rounds: room.settings.roundsToPlay,
        })}
      >
        <View style={styles.playerList}>
          {players.map((player) => (
            <View key={player.id} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
              <PlayerAvatar player={player} />
              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, { color: colors.petroleum }]}>{player.name}</Text>
                <Text style={[styles.playerMeta, { color: colors.muted }]}>
                  {player.isHost ? t('player.host') : t('common.player')} ·{' '}
                  {player.isOnline ? t('common.online') : t('common.offline')}
                </Text>
              </View>
              {player.isHost && <Badge label={t('player.host')} tone="accent" />}
            </View>
          ))}
        </View>
      </Card>

      <Card
        title={t('lobby.rules')}
        subtitle={isHost ? t('lobby.youDecide') : t('lobby.hostDecides')}
      >
        <View style={styles.rulesHeader}>
          <Text style={[styles.rulesHint, { color: colors.muted }]}>
            {t('lobby.customHint', { count: MAX_CATEGORIES })}
          </Text>
          <Badge label={autosaveLabel} tone={autosaveTone} />
        </View>

        <Text style={[styles.fieldTitle, { color: colors.petroleum }]}>
          {t('lobby.categories')} · {t('lobby.selected', { count: draftCategories.length })}
        </Text>
        <View style={styles.categoryList}>
          {CATEGORY_OPTIONS.map((category) => (
            <CategoryChip
              disabled={!isHost || isSubmitting}
              key={category}
              label={category}
              onPress={() => toggleCategory(category)}
              selected={draftCategories.includes(category)}
            />
          ))}
        </View>
        <View style={styles.selectedCategories}>
          {draftCategories.map((category) => (
            <CategoryChip
              disabled={!isHost || isSubmitting || draftCategories.length <= MIN_CATEGORIES}
              key={category}
              label={`${category}${isHost && draftCategories.length > MIN_CATEGORIES ? ' x' : ''}`}
              onPress={isHost ? () => removeCategory(category) : undefined}
              selected
            />
          ))}
        </View>
        {isHost && (
          <View style={styles.customCategoryRow}>
            <View style={styles.customCategoryInput}>
              <Input
                maxLength={24}
                onChangeText={setCustomCategory}
                placeholder={t('lobby.customPlaceholder')}
                value={customCategory}
              />
            </View>
            <Button label={t('lobby.addCategory')} onPress={addCustomCategory} variant="outline" />
          </View>
        )}

        <Text style={[styles.fieldTitle, { color: colors.petroleum }]}>{t('lobby.roundTime')}</Text>
        <View style={styles.optionRow}>
          {ROUND_DURATION_OPTIONS.map((duration) => (
            <CategoryChip
              disabled={!isHost || isSubmitting}
              key={duration}
              label={t('lobby.seconds', { count: duration })}
              onPress={() => setDraftDuration(duration)}
              selected={duration === draftDuration}
            />
          ))}
        </View>

        <Text style={[styles.fieldTitle, { color: colors.petroleum }]}>{t('lobby.rounds')}</Text>
        <View style={styles.roundStepper}>
          <Button
            disabled={!isHost || draftRounds <= MIN_ROUNDS_TO_PLAY}
            label="-"
            onPress={() => setDraftRounds(Math.max(MIN_ROUNDS_TO_PLAY, draftRounds - 1))}
            variant="outline"
          />
          <Text style={[styles.roundCount, { color: colors.petroleum }]}>{draftRounds}</Text>
          <Button
            disabled={!isHost || draftRounds >= MAX_ROUNDS_TO_PLAY}
            label="+"
            onPress={() => setDraftRounds(Math.min(MAX_ROUNDS_TO_PLAY, draftRounds + 1))}
            variant="outline"
          />
        </View>

        <ThemePicker />
        <LanguageSwitcher />
        <View style={styles.soundRow}>
          <SoundToggle />
        </View>

        {isHost && (
          <Button
            fullWidth
            disabled={
              !settingsChanged || !validSettings || isSubmitting || lobbySaveState === 'saving'
            }
            label={lobbySaveState === 'error' ? t('connection.retry') : t('common.saveNow')}
            onPress={saveLobbySettings}
            style={styles.sectionAction}
            variant={lobbySaveState === 'error' ? 'danger' : 'outline'}
          />
        )}
      </Card>
    </>
  );
}

type ResultsSectionProps = {
  castVote: (challengeId: string, vote: AnswerVote) => void;
  finishCurrentGame: () => void;
  isHost: boolean;
  isSubmitting: boolean;
  prepareNext: () => void;
  room: Room;
  sessionId: string;
  standings: { player: Player; total: number }[];
  startCurrentRematch: () => void;
};

function ResultsSection({
  castVote,
  finishCurrentGame,
  isHost,
  isSubmitting,
  prepareNext,
  room,
  sessionId,
  standings,
  startCurrentRematch,
}: ResultsSectionProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const result = room.round?.result;
  if (!result || !room.round) return null;
  const pendingChallenges = Object.values(result.challenges).filter(
    (challenge) => challenge.status === 'pending',
  );
  const isFinished = room.status === 'finished';
  const nextCommanderId =
    room.round.number < room.settings.roundsToPlay
      ? getCommanderForRound(room, room.round.number + 1)
      : null;
  const canPrepareNext = nextCommanderId === sessionId && result.votingComplete;

  return (
    <>
      <Card
        subtitle={
          result.stoppedBy
            ? t('results.stoppedBy', {
                name:
                  room.players.find((player) => player.id === result.stoppedBy)?.name ??
                  t('common.player'),
              })
            : t('results.timedOut')
        }
        title={isFinished ? t('final.ranking') : t('results.title')}
      >
        {standings.map(({ player, total }, index) => (
          <View key={player.id} style={[styles.standingRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.standingRank, { color: colors.amberDeep }]}>{index + 1}</Text>
            <PlayerAvatar player={player} size="sm" />
            <Text style={[styles.standingName, { color: colors.petroleum }]}>{player.name}</Text>
            <Text style={[styles.standingScore, { color: colors.petroleum }]}>
              {total} {t('common.points')}
            </Text>
          </View>
        ))}
      </Card>

      {pendingChallenges.length > 0 && (
        <Card subtitle={t('results.roomDecides')} title={t('challenge.pending')}>
          {pendingChallenges.map((challenge) => (
            <ChallengeCard
              challenge={challenge}
              key={challenge.id}
              onVote={(vote) => castVote(challenge.id, vote)}
              playerId={sessionId}
              voterCount={room.players.length - challenge.playerIds.length}
            />
          ))}
        </Card>
      )}

      <Card title={t('results.roundSnapshot')}>
        <View style={styles.scoreList}>
          {room.players.map((player) => {
            const score = result.players[player.id];
            if (!score) return null;

            return (
              <View
                key={player.id}
                style={[styles.scoreCard, { backgroundColor: colors.warmWhite }]}
              >
                <View style={styles.scoreHeader}>
                  <PlayerAvatar player={player} size="sm" />
                  <Text style={[styles.scorePlayer, { color: colors.petroleum }]}>
                    {player.name}
                  </Text>
                  <Badge label={`${score.total} pts`} tone="accent" />
                </View>
                {room.settings.categories.map((category) => {
                  const answer = score.answers[category];
                  return (
                    <ScoreRow
                      answer={answer?.answer ?? ''}
                      category={category}
                      key={category}
                      points={answer ? SCORE_STATUS_LABELS[answer.status] : '0'}
                      status={answer ? getScoreStatusCopy(answer.status, t) : undefined}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        {room.status === 'results' && !result.votingComplete && (
          <Text style={[styles.waitingText, { color: colors.muted }]}>
            {t('results.votingPending')}
          </Text>
        )}

        {room.status === 'results' && result.votingComplete && (
          <View style={styles.actionRow}>
            {room.round.number < room.settings.roundsToPlay && (
              <Button
                fullWidth
                disabled={!canPrepareNext || isSubmitting}
                label={
                  canPrepareNext
                    ? t('results.nextLetter')
                    : t('results.nextCommander', {
                        name:
                          room.players.find((player) => player.id === nextCommanderId)?.name ??
                          t('letter.commander'),
                      })
                }
                onPress={prepareNext}
              />
            )}
            {room.round.number >= room.settings.roundsToPlay && (
              <Button
                fullWidth
                disabled={isSubmitting}
                label={t('results.finalRanking')}
                onPress={finishCurrentGame}
              />
            )}
          </View>
        )}

        {isFinished && isHost && (
          <Button
            fullWidth
            disabled={isSubmitting}
            label={t('final.rematch')}
            onPress={startCurrentRematch}
            variant="accent"
          />
        )}
      </Card>
    </>
  );
}

function ChallengeCard({
  challenge,
  onVote,
  playerId,
  voterCount,
}: {
  challenge: AnswerChallenge;
  onVote: (vote: AnswerVote) => void;
  playerId: string;
  voterCount: number;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const canVote = challenge.status === 'pending' && !challenge.playerIds.includes(playerId);

  return (
    <View style={[styles.challengeCard, { borderColor: colors.border }]}>
      <Text style={[styles.challengeTitle, { color: colors.muted }]}>{challenge.category}</Text>
      <Text style={[styles.challengeAnswer, { color: colors.petroleum }]}>{challenge.answer}</Text>
      <Text style={[styles.challengeStatus, { color: colors.muted }]}>
        {t('challenge.votes', {
          authors: challenge.playerIds.length,
          current: Object.keys(challenge.votes).length,
          total: voterCount,
        })}
      </Text>
      {canVote && (
        <View style={styles.actionRow}>
          <Button
            fullWidth
            label={t('challenge.accept')}
            onPress={() => onVote('approve')}
            style={styles.rowButton}
            variant="outline"
          />
          <Button
            fullWidth
            label={t('challenge.reject')}
            onPress={() => onVote('reject')}
            style={styles.rowButton}
            variant="danger"
          />
        </View>
      )}
    </View>
  );
}

function getStatusLabel(status: RoomStatus, t: Translate) {
  const labels: Record<RoomStatus, string> = {
    lobby: t('lobby.eyebrow'),
    'letter-selection': t('letter.chooseBadge'),
    round: t('round.timeLeft'),
    results: t('results.eyebrow'),
    finished: t('final.gameOver'),
  };

  return labels[status];
}

function getStatusTitle(status: RoomStatus, t: Translate) {
  const labels: Record<RoomStatus, string> = {
    lobby: t('lobby.title'),
    'letter-selection': t('letter.available'),
    round: t('round.title'),
    results: t('results.title'),
    finished: t('final.ranking'),
  };

  return labels[status];
}

function getRoomHint(room: Room, commander: Player | null, t: Translate) {
  if (room.status === 'lobby') return t('lobby.callBody');
  if (room.status === 'letter-selection') {
    if (commander) return t('letter.otherBody', { name: commander.name });
    return t('letter.otherNotice');
  }
  if (room.status === 'round') return t('round.firstStops');
  if (room.status === 'results') return t('results.voting');
  return t('final.hostDecides');
}

function getScoreStatusCopy(status: AnswerScoreStatus, t: Translate) {
  if (status === 'invalid') return t('results.invalid');
  if (status === 'doubtful') return t('results.doubtful');
  if (status === 'duplicate') return t('results.duplicate');
  if (status === 'correct') return t('results.correct');
  return t('results.unique');
}

function getLobbySaveLabel(saveState: LobbySaveState, validSettings: boolean, t: Translate) {
  if (!validSettings) return t('lobby.minCategories');
  if (saveState === 'saving') return t('lobby.autosaving');
  if (saveState === 'dirty') return t('lobby.autosavePending');
  if (saveState === 'error') return t('lobby.autosaveError');
  return t('lobby.autosaveSaved');
}

function getLobbySaveTone(
  saveState: LobbySaveState,
  validSettings: boolean,
): 'default' | 'accent' | 'muted' | 'danger' | 'success' {
  if (!validSettings || saveState === 'error') return 'danger';
  if (saveState === 'saving' || saveState === 'dirty') return 'accent';
  if (saveState === 'saved') return 'success';
  return 'muted';
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  answerProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  bigLetter: {
    alignItems: 'center',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  bigLetterText: {
    fontSize: 40,
    fontWeight: '900',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: spacing.screen,
  },
  challengeAnswer: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  challengeCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  challengeStatus: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  challengeTitle: {
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    gap: 12,
    padding: spacing.screen,
    paddingBottom: 40,
  },
  customCategoryInput: {
    flex: 1,
  },
  customCategoryRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 14,
  },
  fieldTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 18,
  },
  footerHint: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  letterButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  letterButtonText: {
    fontSize: 20,
    fontWeight: '900',
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '800',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  playerInfo: {
    flex: 1,
  },
  playerList: {
    marginTop: 10,
  },
  playerMeta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '900',
  },
  playerRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 2,
  },
  roomCode: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  roomCodeBadge: {
    alignItems: 'flex-end',
  },
  roomCodeLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  rowButton: {
    flex: 1,
  },
  roundCopy: {
    flex: 1,
  },
  rulesHeader: {
    alignItems: 'flex-start',
    gap: 10,
  },
  rulesHint: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  roundCount: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  roundHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roundKicker: {
    fontSize: 12,
    fontWeight: '900',
  },
  roundStepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  roundTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 3,
  },
  safeArea: {
    flex: 1,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 12,
  },
  scoreHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  scoreList: {
    gap: 12,
    marginTop: 8,
  },
  scorePlayer: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  sectionAction: {
    marginTop: 18,
  },
  selectedCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  soundRow: {
    marginTop: 12,
  },
  standingName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  standingRank: {
    fontSize: 16,
    fontWeight: '900',
    width: 24,
  },
  standingRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
  },
  standingScore: {
    fontSize: 15,
    fontWeight: '900',
  },
  commanderLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  commanderName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  commanderStrip: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    padding: 10,
  },
  stateEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  stateHero: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  stateHeroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stateHint: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 6,
  },
  stateTitle: {
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 33,
    marginTop: 10,
  },
  statusCopy: {
    flex: 1,
  },
  statusHint: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 3,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  stopAction: {
    minHeight: 58,
  },
  waitingText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 14,
  },
});
