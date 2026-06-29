import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type LogoProps = {
  compact?: boolean;
  light?: boolean;
};

export function Logo({ compact = false, light = false }: LogoProps) {
  const { colors } = useTheme();
  const textColor = light ? colors.surface : colors.petroleum;

  return (
    <View accessibilityLabel="jogastop" style={styles.logo}>
      <View
        style={[
          styles.symbol,
          {
            backgroundColor: light ? colors.surface : colors.petroleum,
            shadowColor: colors.petroleum,
          },
        ]}
      >
        <Text style={[styles.symbolLetter, { color: light ? colors.petroleum : colors.surface }]}>
          S
        </Text>
      </View>

      {!compact && (
        <View style={styles.wordmark}>
          <Text style={[styles.wordPrimary, { color: textColor }]}>joga</Text>
          <Text style={[styles.wordAccent, { color: colors.amber }]}>stop</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  symbol: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    width: 44,
  },
  symbolLetter: {
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 30,
  },
  wordmark: {
    flexDirection: 'row',
  },
  wordPrimary: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  wordAccent: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
