import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { ProfileOptions } from '@/components/game/ProfileOptions';
import { LanguageSwitcher } from '@/components/game/LanguageSwitcher';
import { SoundToggle } from '@/components/game/SoundToggle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DEFAULT_AVATAR_ID, type AvatarId } from '@/features/game/avatars';
import { createRoom, joinRoom, readRoom } from '@/features/game/mobileApi';
import {
  createPlayerSession,
  makeRoomCode,
  normalizeRoomCode,
  readLastPlayerSession,
  readPlayerSession,
  savePlayerSession,
  SessionStorageError,
} from '@/features/game/mobileStorage';
import { DEFAULT_PROFILE_COLOR, type ProfileColor } from '@/features/game/profile-colors';
import type { PlayerSession } from '@/features/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function HomeScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const [profileColor, setProfileColor] = useState<ProfileColor>(DEFAULT_PROFILE_COLOR);
  const [recentSession, setRecentSession] = useState<PlayerSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const pendingRef = useRef(false);
  const restoredProfile = useRef(false);
  const [pendingAction, setPendingAction] = useState<'creating' | 'joining' | null>(null);
  const normalizedRoomCode = useMemo(() => normalizeRoomCode(roomCode), [roomCode]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      readLastPlayerSession()
        .then((lastSession) => {
          if (!mounted) return;
          setRecentSession(lastSession);
          if (lastSession && !restoredProfile.current) {
            setPlayerName(lastSession.name);
            setAvatarId(lastSession.avatarId);
            setProfileColor(lastSession.color as ProfileColor);
          }
          restoredProfile.current = true;
        })
        .catch(() => {
          if (mounted) Alert.alert(t('error.generic'), t('error.sessionStorage'));
        })
        .finally(() => {
          if (mounted) setIsBootstrapping(false);
        });

      return () => {
        mounted = false;
      };
    }, [t]),
  );

  function validateName() {
    const name = playerName.trim();
    if (name.length >= 2) return name;

    Alert.alert(t('entry.nameMissing'), t('entry.nameFeedback'));
    return null;
  }

  async function handleCreateRoom() {
    if (pendingRef.current) return;
    const name = validateName();
    if (!name) return;

    setPendingAction('creating');
    pendingRef.current = true;

    try {
      const code = makeRoomCode();
      const session = createPlayerSession(name, code, avatarId, profileColor);
      await savePlayerSession(session);
      await createRoom(code, session);
      router.push({ pathname: '/sala/[code]', params: { code } });
    } catch (error) {
      Alert.alert(t('entry.createFailed'), getErrorMessage(error, t('error.sessionStorage')));
    } finally {
      pendingRef.current = false;
      setPendingAction(null);
    }
  }

  async function handleJoinRoom() {
    if (pendingRef.current) return;

    if (normalizedRoomCode.length < 4) {
      Alert.alert(t('entry.invalidCode'), t('entry.invalidCodeFeedback'));
      return;
    }

    setPendingAction('joining');
    pendingRef.current = true;
    try {
      const room = await readRoom(normalizedRoomCode);
      if (!room) {
        Alert.alert(t('entry.roomUnavailable'), t('entry.roomUnavailableFeedback'));
        return;
      }

      const existingSession = await readPlayerSession(normalizedRoomCode);
      if (existingSession && room.players.some((player) => player.id === existingSession.id)) {
        router.push({ pathname: '/sala/[code]', params: { code: normalizedRoomCode } });
        return;
      }
      if (room.status !== 'lobby') {
        Alert.alert(t('entry.gameStarted'), t('entry.gameStartedFeedback'));
        return;
      }

      const name = validateName();
      if (!name) return;
      const session = createPlayerSession(name, normalizedRoomCode, avatarId, profileColor);
      await savePlayerSession(session);
      await joinRoom(normalizedRoomCode, session);
      router.push({ pathname: '/sala/[code]', params: { code: normalizedRoomCode } });
    } catch (error) {
      Alert.alert(t('entry.joinFailed'), getErrorMessage(error, t('error.sessionStorage')));
    } finally {
      pendingRef.current = false;
      setPendingAction(null);
    }
  }

  if (isBootstrapping) {
    return (
      <SafeAreaView style={[styles.boot, { backgroundColor: colors.background }]}>
        <Logo />
        <ActivityIndicator color={colors.amber} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Logo />
            <View style={styles.headerControls}>
              <LanguageSwitcher compact />
              <SoundToggle compact />
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={[styles.title, { color: colors.petroleum }]}>
              {t('landing.heroTitle')}
              <Text style={{ color: colors.amber }}> {t('landing.heroTitleAccent')}</Text>
            </Text>
          </View>

          <Card style={styles.entryCard}>
            {pendingAction && (
              <View style={[styles.loadingOverlay, { backgroundColor: `${colors.background}E8` }]}>
                <ActivityIndicator color={colors.amber} />
                <Text style={[styles.loadingText, { color: colors.petroleum }]}>
                  {pendingAction === 'creating' ? t('entry.creatingRoom') : t('entry.joiningRoom')}
                </Text>
              </View>
            )}

            <Input
              autoCapitalize="words"
              editable={!pendingAction}
              label={t('entry.nameQuestion')}
              maxLength={24}
              onChangeText={setPlayerName}
              placeholder={t('entry.namePlaceholder')}
              value={playerName}
            />

            <ProfileOptions
              avatarId={avatarId}
              color={profileColor}
              onAvatarChange={setAvatarId}
              onColorChange={setProfileColor}
            />

            <Button
              fullWidth
              label={t('entry.createRoom')}
              variant="accent"
              loading={pendingAction === 'creating'}
              onPress={handleCreateRoom}
              style={styles.topAction}
            />

            {recentSession && (
              <Button
                fullWidth
                label={t('entry.resumeRoom', { code: recentSession.roomCode })}
                onPress={() =>
                  router.push({
                    pathname: '/sala/[code]',
                    params: { code: recentSession.roomCode },
                  })
                }
                style={styles.resumeAction}
                variant="outline"
              />
            )}

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.muted }]}>{t('entry.orJoin')}</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.joinRow}>
              <Input
                autoCapitalize="characters"
                autoCorrect={false}
                accessibilityLabel={t('entry.roomCode')}
                containerStyle={styles.joinInput}
                editable={!pendingAction}
                maxLength={8}
                onChangeText={setRoomCode}
                placeholder={t('entry.codePlaceholder')}
                style={styles.codeInput}
                value={roomCode}
              />
              <Button
                label={t('entry.joinRoom')}
                loading={pendingAction === 'joining'}
                onPress={handleJoinRoom}
                style={styles.joinButton}
                variant="primary"
              />
            </View>
            <Button
              fullWidth
              label={t('landing.privacyShort')}
              onPress={() => router.push('/privacidade')}
              style={styles.privacyButton}
              variant="ghost"
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown, sessionMessage: string) {
  if (error instanceof SessionStorageError) return sessionMessage;
  return error instanceof Error ? error.message : 'Tenta novamente.';
}

const styles = StyleSheet.create({
  boot: {
    alignItems: 'center',
    flex: 1,
    gap: 18,
    justifyContent: 'center',
  },
  codeInput: {
    minWidth: 0,
    textTransform: 'uppercase',
    width: '100%',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    borderRadius: 999,
    borderWidth: 2,
    height: 28,
    width: 28,
  },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    padding: 18,
    paddingBottom: 30,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '800',
  },
  entryCard: {
    borderRadius: 16,
    padding: 14,
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  hero: {
    gap: 8,
    marginBottom: 18,
  },
  joinButton: {
    minWidth: 104,
  },
  joinInput: {
    flex: 1,
  },
  joinRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  keyboard: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 7,
    marginTop: 14,
  },
  privacyButton: {
    marginTop: 6,
  },
  resumeAction: {
    marginTop: 9,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    borderRadius: 18,
    gap: 10,
    justifyContent: 'center',
    zIndex: 2,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '800',
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
  },
  topAction: {
    marginTop: 18,
  },
});
