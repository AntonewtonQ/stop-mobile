import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type ScoreRowProps = {
  answer: string;
  category: string;
  points: number | string;
  status?: string;
};

export function ScoreRow({ answer, category, points, status }: ScoreRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.category, { color: colors.muted }]}>{category}</Text>
        <Text numberOfLines={1} style={[styles.answer, { color: colors.petroleum }]}>
          {answer || '-'}
        </Text>
      </View>
      <View
        style={[styles.points, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.pointsText, { color: colors.petroleum }]}>{points}</Text>
      </View>
      {status && <Text style={[styles.status, { color: colors.muted }]}>{status}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  answer: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  category: {
    fontSize: 11,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
  },
  points: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: 8,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '900',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    paddingVertical: 7,
  },
  status: {
    fontSize: 11,
    fontWeight: '800',
  },
});
