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
import { Badge } from '@/components/ui/Badge';
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
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const [profileColor, setProfileColor] = useState<ProfileColor>(DEFAULT_PROFILE_COLOR);
  const [recentSession, setRecentSession] = useState<PlayerSession | null>(null);
  const [pendingAction, setPendingAction] = useState<'creating' | 'joining' | null>(null);
  const normalizedRoomCode = useMemo(() => normalizeRoomCode(roomCode), [roomCode]);

  useEffect(() => {
    void readLastPlayerSession().then(setRecentSession);
  }, []);

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
            <Badge label="AO" tone="muted" />
          </View>

          <View style={styles.hero}>
            <Badge label={t('landing.heroEyebrow')} />
            <Text style={[styles.title, { color: colors.petroleum }]}>
              {t('landing.heroTitle')}
              <Text style={{ color: colors.amber }}> {t('landing.heroTitleAccent')}</Text>
            </Text>
            <Text style={[styles.lead, { color: colors.muted }]}>{t('landing.heroLead')}</Text>
          </View>

          <Card>
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

            <ThemePicker />
            <LanguageSwitcher />
            <View style={styles.soundRow}>
              <SoundToggle />
            </View>

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
              label={t('landing.privacy')}
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
  codeInput: {
    minWidth: 0,
    textTransform: 'uppercase',
    width: '100%',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    borderRadius: 999,
    borderWidth: 3,
    height: 32,
    width: 32,
  },
  content: {
    padding: spacing.screen,
    paddingBottom: 36,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '800',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  hero: {
    gap: 14,
    marginBottom: 28,
  },
  joinButton: {
    minWidth: 100,
  },
  joinRow: {
    alignItems: 'flex-end',
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
    marginBottom: 8,
    marginTop: 12,
  },
  privacyButton: {
    marginTop: 10,
  },
  lead: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25,
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
  soundRow: {
    marginTop: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 43,
  },
  topAction: {
    marginTop: 22,
  },
});
