import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
  subtitle?: string;
  title?: string;
}>;

export function Card({ children, style, subtitle, title }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.petroleum,
        },
        style,
      ]}
    >
      {title && <Text style={[styles.title, { color: colors.petroleum }]}>{title}</Text>}
      {subtitle && <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 22,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
