import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { ProfileOptions } from '@/components/game/ProfileOptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DEFAULT_AVATAR_ID, type AvatarId } from '@/features/game/avatars';
import { PLAYABLE_LETTERS } from '@/features/game/constants';
import { joinRoom } from '@/features/game/mobileApi';
import {
  createPlayerSession,
  savePlayerSession,
  SessionStorageError,
} from '@/features/game/mobileStorage';
import { DEFAULT_PROFILE_COLOR, type ProfileColor } from '@/features/game/profile-colors';
import type { Room } from '@/features/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function JoinRoomGate({ room, onJoined }: { room: Room; onJoined: () => Promise<unknown> }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const [color, setColor] = useState<ProfileColor>(DEFAULT_PROFILE_COLOR);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  async function join() {
    if (busy.current) return;
    if (name.trim().length < 2) return Alert.alert(t('entry.nameMissing'), t('join.nameRequired'));
    if (room.players.length >= PLAYABLE_LETTERS.length) return Alert.alert(t('join.roomFull'));
    busy.current = true;
    setPending(true);
    try {
      const session = createPlayerSession(name.trim(), room.code, avatarId, color);
      await savePlayerSession(session);
      await joinRoom(room.code, session);
      await onJoined();
    } catch (error) {
      Alert.alert(
        t('entry.joinFailed'),
        error instanceof SessionStorageError
          ? t('error.sessionStorage')
          : error instanceof Error
            ? error.message
            : t('error.generic'),
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Logo />
          <Text style={[styles.code, { color: colors.amberDeep }]}>
            {t('common.room')} {room.code}
          </Text>
          <Card title={t('join.title')} subtitle={t('join.body')}>
            <Input
              label={t('join.nameLabel')}
              placeholder={t('join.namePlaceholder')}
              value={name}
              onChangeText={setName}
              maxLength={24}
              autoCapitalize="words"
              editable={!pending}
              containerStyle={styles.input}
            />
            <ProfileOptions
              avatarId={avatarId}
              color={color}
              onAvatarChange={setAvatarId}
              onColorChange={setColor}
            />
            <Button
              fullWidth
              label={pending ? t('entry.joiningRoom') : t('entry.joinRoom')}
              loading={pending}
              onPress={() => void join()}
              variant="accent"
            />
          </Card>
          <Button label={t('common.home')} onPress={() => router.replace('/')} variant="ghost" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 20,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  code: { fontSize: 15, fontWeight: '900' },
  input: { marginTop: 18 },
});
