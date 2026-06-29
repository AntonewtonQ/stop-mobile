import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type TimerProps = {
  duration: number;
  remaining: number;
};

export function Timer({ duration, remaining }: TimerProps) {
  const { colors } = useTheme();
  const progress = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;
  const isUrgent = remaining <= 5;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.petroleum }]}>
      <Text style={[styles.label, { color: colors.amber }]}>TEMPO</Text>
      <Text style={[styles.value, { color: colors.surface }]}>{remaining}s</Text>
      <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
        <View
          style={[
            styles.progress,
            {
              backgroundColor: isUrgent ? colors.danger : colors.amber,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
  },
  progress: {
    borderRadius: 999,
    height: 5,
  },
  track: {
    borderRadius: 999,
    height: 5,
    marginTop: 7,
    overflow: 'hidden',
    width: '100%',
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 1,
  },
  wrapper: {
    borderRadius: 16,
    minWidth: 86,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
