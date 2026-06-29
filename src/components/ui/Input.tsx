import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type InputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
};

export function Input({ containerStyle, label, style, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.petroleum }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            backgroundColor: colors.warmWhite,
            borderColor: colors.border,
            color: colors.petroleum,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
  },
  wrapper: {
    gap: 0,
  },
});
