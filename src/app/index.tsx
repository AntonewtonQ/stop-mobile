import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { AvatarPicker } from '@/components/game/AvatarPicker';
import { LanguageSwitcher } from '@/components/game/LanguageSwitcher';
import { SoundToggle } from '@/components/game/SoundToggle';
import { ThemePicker } from '@/components/game/ThemePicker';
import { Onboarding } from '@/components/onboarding/Onboarding';
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
  savePlayerSession,
} from '@/features/game/mobileStorage';
import {
  DEFAULT_PROFILE_COLOR,
  PROFILE_COLORS,
  type ProfileColor,
} from '@/features/game/profile-colors';
import type { PlayerSession } from '@/features/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { appStorage } from '@/storage/appStorage';
import { useTheme } from '@/theme/ThemeProvider';

const ONBOARDING_STORAGE_KEY = 'jogastop:onboarding:v1';

export default function HomeScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const [profileColor, setProfileColor] = useState<ProfileColor>(DEFAULT_PROFILE_COLOR);
  const [recentSession, setRecentSession] = useState<PlayerSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingAction, setPendingAction] = useState<'creating' | 'joining' | null>(null);
  const normalizedRoomCode = useMemo(() => normalizeRoomCode(roomCode), [roomCode]);

  useEffect(() => {
    let mounted = true;

    Promise.all([readLastPlayerSession(), appStorage.getItem(ONBOARDING_STORAGE_KEY)])
      .then(([lastSession, onboardingSeen]) => {
        if (!mounted) return;
        setRecentSession(lastSession);
        setShowOnboarding(onboardingSeen !== 'done');
      })
      .finally(() => {
        if (mounted) setIsBootstrapping(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function finishOnboarding() {
    setShowOnboarding(false);
    await appStorage.setItem(ONBOARDING_STORAGE_KEY, 'done');
  }

  function validateName() {
    const name = playerName.trim();
    if (name.length >= 2) return name;

    Alert.alert(t('entry.nameMissing'), t('entry.nameFeedback'));
    return null;
  }

  async function handleCreateRoom() {
    if (pendingAction) return;
    const name = validateName();
    if (!name) return;

    const code = makeRoomCode();
    const session = createPlayerSession(name, code, avatarId, profileColor);
    setPendingAction('creating');

    try {
      await createRoom(code, session);
      await savePlayerSession(session);
      router.push({ pathname: '/sala/[code]', params: { code } });
    } catch (error) {
      Alert.alert(t('entry.createFailed'), getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleJoinRoom() {
    if (pendingAction) return;
    const name = validateName();
    if (!name) return;

    if (normalizedRoomCode.length < 4) {
      Alert.alert(t('entry.invalidCode'), t('entry.invalidCodeFeedback'));
      return;
    }

    setPendingAction('joining');
    try {
      const room = await readRoom(normalizedRoomCode);
      if (!room) {
        Alert.alert(t('entry.roomUnavailable'), t('entry.roomUnavailableFeedback'));
        return;
      }

      if (room.status !== 'lobby') {
        Alert.alert(t('entry.gameStarted'), t('entry.gameStartedFeedback'));
        return;
      }

      const session = createPlayerSession(name, normalizedRoomCode, avatarId, profileColor);
      await joinRoom(normalizedRoomCode, session);
      await savePlayerSession(session);
      router.push({ pathname: '/sala/[code]', params: { code: normalizedRoomCode } });
    } catch (error) {
      Alert.alert(t('entry.joinFailed'), getErrorMessage(error));
    } finally {
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

  if (showOnboarding) {
    return <Onboarding onFinish={finishOnboarding} />;
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

            <AvatarPicker color={profileColor} onChange={setAvatarId} value={avatarId} />

            <Text style={[styles.label, { color: colors.petroleum }]}>
              {t('profileColor.choose')}
            </Text>
            <View style={styles.colorGrid}>
              {PROFILE_COLORS.map((color) => (
                <Pressable
                  accessibilityRole="button"
                  key={color.id}
                  onPress={() => setProfileColor(color.value)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color.value,
                      borderColor: profileColor === color.value ? colors.petroleum : colors.surface,
                    },
                  ]}
                />
              ))}
            </View>

            <ThemePicker compact />

            <Button
              fullWidth
              label={t('entry.createRoom')}
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
                variant="accent"
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

function getErrorMessage(error: unknown) {
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
