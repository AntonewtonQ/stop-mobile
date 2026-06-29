import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type CategoryChipProps = {
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  selected?: boolean;
};

export function CategoryChip({ disabled, label, onPress, selected = false }: CategoryChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || !onPress}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.petroleum : colors.warmWhite,
          borderColor: selected ? colors.petroleum : colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[styles.text, { color: selected ? colors.surface : colors.petroleum }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
  },
});
