import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { RoomConnectionStatus } from '@/hooks/useRoom';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function ConnectionNotice({
  status,
  onRetry,
}: {
  status: RoomConnectionStatus;
  onRetry: () => void;
}) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  if (status === 'connected') return null;
  const offline = status === 'offline';
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, { backgroundColor: colors.warmWhite, borderColor: colors.amberDeep }]}
    >
      <Text style={[styles.title, { color: colors.petroleum }]}>
        {t(offline ? 'connection.offlineTitle' : 'connection.reconnectingTitle')}
      </Text>
      <Text style={{ color: colors.muted }}>
        {t(offline ? 'connection.offlineBody' : 'connection.reconnectingBody')}
      </Text>
      <Button label={t('connection.retry')} onPress={onRetry} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 8 },
  title: { fontSize: 15, fontWeight: '800' },
});
