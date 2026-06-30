import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type LogoProps = {
  compact?: boolean;
  light?: boolean;
};

const logoMark = require('../../../assets/brand/jogastop-mobile-mark.png');

export function Logo({ compact = false, light = false }: LogoProps) {
  const { colors } = useTheme();
  const textColor = light ? colors.surface : colors.petroleum;
  const symbolSize = compact ? 42 : 52;

  return (
    <View accessibilityLabel="jogastop" style={styles.logo}>
      <View
        style={[
          styles.symbol,
          {
            borderRadius: compact ? 13 : 16,
            height: symbolSize,
            shadowColor: colors.petroleum,
            width: symbolSize,
          },
        ]}
      >
        <Image resizeMode="cover" source={logoMark} style={styles.symbolImage} />
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
    overflow: 'hidden',
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },
  symbolImage: {
    height: '100%',
    width: '100%',
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
