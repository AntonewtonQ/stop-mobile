import { Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { ConnectionNotice } from '@/components/game/ConnectionNotice';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { Timer } from '@/components/ui/Timer';
import { finishRound } from '@/features/game/mobileApi';
import type { PlayerSession, Room } from '@/features/game/types';
import { hasScorableContent, startsWithLetter } from '@/features/game/word-validation';
import type { RoomConnectionStatus } from '@/hooks/useRoom';
import { useRoundDraft } from '@/hooks/useRoundDraft';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function RoundScreen({
  room,
  session,
  connectionStatus,
  applyRoom,
  refresh,
}: {
  room: Room;
  session: PlayerSession;
  connectionStatus: RoomConnectionStatus;
  applyRoom: (room: Room) => void;
  refresh: () => Promise<boolean>;
}) {
  const { colors } = useTheme();
  const { t, category: categoryLabel } = useLanguage();
  const round = room.round!;
  const [now, setNow] = useState(Date.now());
  const [isStopping, setIsStopping] = useState(false);
  const stoppingRef = useRef(false);
  const inputs = useRef<Record<string, TextInput | null>>({});
  const remaining = Math.max(0, Math.ceil((round.startedAt + round.duration * 1000 - now) / 1000));
  const { answers, updateAnswer, saveStatus } = useRoundDraft(
    room.code,
    round.answers[session.id] ?? {},
    !isStopping && remaining > 0 && connectionStatus === 'connected',
  );
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const answered = room.settings.categories.filter((category) => answers[category]?.trim()).length;
  const canStop = answered === room.settings.categories.length;
  const commander = room.players.find((player) => player.id === round.commanderId);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (remaining > 0 || connectionStatus !== 'connected' || stoppingRef.current) return;
    let active = true;
    let retry: ReturnType<typeof setTimeout>;
    async function endTimedRound() {
      try {
        applyRoom(await finishRound(room.code, true, answersRef.current));
      } catch {
        if (active) retry = setTimeout(() => void endTimedRound(), 3_000);
      }
    }
    void endTimedRound();
    return () => {
      active = false;
      clearTimeout(retry);
    };
  }, [remaining, connectionStatus, room.code, applyRoom]);

  async function stop() {
    if (!canStop || stoppingRef.current || remaining <= 0) return;
    stoppingRef.current = true;
    setIsStopping(true);
    Vibration.vibrate(80);
    try {
      applyRoom(await finishRound(room.code, false, answersRef.current));
    } catch (error) {
      stoppingRef.current = false;
      setIsStopping(false);
      Alert.alert(
        t('round.finishFailed'),
        error instanceof Error ? error.message : t('error.generic'),
      );
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Logo compact />
          <View style={styles.heading}>
            <Text style={[styles.kicker, { color: colors.muted }]}>
              {t('common.room')} {room.code} · {t('common.round')} {round.number}/
              {room.settings.roundsToPlay}
            </Text>
            <Text style={[styles.letter, { color: colors.petroleum }]}>
              {t('common.letter')} {round.letter}
            </Text>
          </View>
          <Timer duration={round.duration} remaining={remaining} />
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.content}
        >
          <ConnectionNotice status={connectionStatus} onRetry={() => void refresh()} />
          <Text style={[styles.kicker, { color: colors.muted }]}>
            {t('round.chosenBy', { name: commander?.name ?? '' })}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.players}
            accessibilityLabel={t('round.progressTitle')}
          >
            {room.players.map((player) => {
              const progress =
                player.id === session.id
                  ? answered
                  : (round.answerProgress?.[player.id]?.answered ?? 0);
              return (
                <View
                  key={player.id}
                  style={[styles.player, { backgroundColor: colors.warmWhite }]}
                >
                  <PlayerAvatar player={player} size="sm" />
                  <View>
                    <Text
                      numberOfLines={1}
                      style={[styles.playerName, { color: colors.petroleum }]}
                    >
                      {player.name}
                    </Text>
                    <Text
                      style={{
                        color:
                          progress === room.settings.categories.length
                            ? colors.success
                            : colors.muted,
                        fontSize: 12,
                      }}
                    >
                      {!player.isOnline
                        ? t('common.offline')
                        : progress === room.settings.categories.length
                          ? t('round.completed')
                          : t('round.answerProgress', {
                              answered: progress,
                              total: room.settings.categories.length,
                            })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <Card>
            <View style={styles.fields}>
              {room.settings.categories.map((category, index) => {
                const answer = answers[category] ?? '';
                const invalidShort = Boolean(answer.trim()) && !hasScorableContent(answer);
                const invalidStart =
                  Boolean(answer.trim()) && !startsWithLetter(answer, round.letter);
                const hint = invalidShort
                  ? t('round.tooShort')
                  : invalidStart
                    ? t('round.mustStart', { letter: round.letter })
                    : t('round.answerWith', { letter: round.letter });
                return (
                  <View key={category} style={styles.field}>
                    <Input
                      ref={(input) => {
                        inputs.current[category] = input;
                      }}
                      label={`${index + 1}. ${categoryLabel(category)}`}
                      accessibilityHint={hint}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!isStopping && remaining > 0}
                      maxLength={80}
                      placeholder={`${round.letter}...`}
                      returnKeyType={index < room.settings.categories.length - 1 ? 'next' : 'done'}
                      submitBehavior={
                        index < room.settings.categories.length - 1 ? 'submit' : 'blurAndSubmit'
                      }
                      onSubmitEditing={() =>
                        inputs.current[room.settings.categories[index + 1]]?.focus()
                      }
                      value={answer}
                      onChangeText={(value) => updateAnswer(category, value)}
                      style={{
                        borderColor: invalidShort || invalidStart ? colors.danger : colors.border,
                      }}
                    />
                    <Text
                      style={[
                        styles.hint,
                        { color: invalidShort || invalidStart ? colors.danger : colors.muted },
                      ]}
                    >
                      {hint}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </ScrollView>
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <View style={styles.footerCopy}>
            <Text style={[styles.kicker, { color: colors.petroleum }]}>
              {t('round.answerProgress', { answered, total: room.settings.categories.length })}
            </Text>
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.hint,
                { color: saveStatus === 'error' ? colors.danger : colors.muted },
              ]}
            >
              {t(`round.save.${saveStatus}`)}
            </Text>
          </View>
          <Button
            fullWidth
            icon={Send}
            label={
              isStopping
                ? t('round.stopping')
                : canStop
                  ? t('round.stop')
                  : t('round.completeToStop')
            }
            loading={isStopping}
            disabled={!canStop || remaining <= 0 || connectionStatus !== 'connected'}
            onPress={() => void stop()}
            variant="accent"
            style={styles.stop}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
  },
  heading: { flex: 1, minWidth: 0 },
  kicker: { fontSize: 12, fontWeight: '700' },
  letter: { fontSize: 28, fontWeight: '900' },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  players: { gap: 8 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, padding: 10 },
  playerName: { maxWidth: 130, fontSize: 13, fontWeight: '800' },
  fields: { gap: 18 },
  field: { gap: 5 },
  hint: { fontSize: 12, lineHeight: 17 },
  footer: { borderTopWidth: 1, padding: 12, gap: 8 },
  footerCopy: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 },
  stop: { minHeight: 58 },
});
