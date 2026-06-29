import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type BadgeTone = 'default' | 'accent' | 'muted' | 'danger' | 'success';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'default' }: BadgeProps) {
  const { colors } = useTheme();
  const backgroundColor =
    tone === 'accent'
      ? colors.amber
      : tone === 'danger'
        ? colors.danger
        : tone === 'success'
          ? colors.success
          : tone === 'muted'
            ? colors.warmWhite
            : colors.surface;
  const textColor = tone === 'danger' || tone === 'success' ? colors.surface : colors.petroleum;

  return (
    <View style={[styles.badge, { backgroundColor, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
