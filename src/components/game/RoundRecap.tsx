import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { Room } from '@/features/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function RoundRecap({ room }: { room: Room }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const result = room.round?.result;
  if (!result) return null;
  const stoppedBy = room.players.find((player) => player.id === result.stoppedBy);
  const completed = room.players.filter((player) =>
    room.settings.categories.every((category) =>
      result.players[player.id]?.answers[category]?.answer.trim(),
    ),
  );
  return (
    <Card title={t('results.roundSnapshot')}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.muted }]}>{t('results.whoStopped')}</Text>
        <Text style={[styles.value, { color: colors.petroleum }]}>
          {stoppedBy?.name ?? t('results.timerStopped')}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.muted }]}>{t('results.whoCompleted')}</Text>
        <Text style={[styles.value, { color: colors.petroleum }]}>
          {completed.map((player) => player.name).join(', ') || t('results.noCompletedPlayers')}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { marginTop: 14, gap: 4 },
  label: { fontSize: 12, fontWeight: '700' },
  value: { fontSize: 17, fontWeight: '800' },
});
