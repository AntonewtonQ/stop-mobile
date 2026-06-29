import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';

type ButtonProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

export function Button({
  disabled = false,
  fullWidth = false,
  label,
  loading = false,
  onPress,
  style,
  variant = 'primary',
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const backgroundColor =
    variant === 'primary'
      ? colors.petroleum
      : variant === 'accent'
        ? colors.amber
        : variant === 'danger'
          ? colors.danger
          : 'transparent';
  const borderColor =
    variant === 'outline' || variant === 'ghost' ? colors.border : backgroundColor;
  const textColor =
    variant === 'primary' || variant === 'danger'
      ? colors.surface
      : variant === 'accent'
        ? colors.petroleum
        : colors.petroleum;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          alignSelf: fullWidth ? 'stretch' : undefined,
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.48 : 1,
        },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  ghost: {
    minHeight: 42,
  },
  text: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
