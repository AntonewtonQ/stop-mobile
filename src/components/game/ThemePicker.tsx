import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { THEME_IDS, themeLabels, themePalettes } from '@/theme/tokens';

type ThemePickerProps = {
  compact?: boolean;
};

export function ThemePicker({ compact = false }: ThemePickerProps) {
  const { colors, setThemeId, themeId } = useTheme();

  return (
    <View style={[styles.wrapper, compact && styles.compactWrapper]}>
      <Text style={[styles.label, { color: colors.petroleum }]}>Tema</Text>
      <View style={[styles.row, compact && styles.compactRow]}>
        {THEME_IDS.map((id) => {
          const palette = themePalettes[id];
          const selected = id === themeId;

          return (
            <Pressable
              accessibilityRole="button"
              key={id}
              onPress={() => void setThemeId(id)}
              style={[
                compact ? styles.compactOption : styles.option,
                {
                  backgroundColor: selected ? colors.petroleum : colors.warmWhite,
                  borderColor: selected ? colors.petroleum : colors.border,
                },
              ]}
            >
              <View style={[styles.swatches, compact && styles.compactSwatches]}>
                <View style={[styles.swatch, { backgroundColor: palette.petroleum }]} />
                <View style={[styles.swatch, { backgroundColor: palette.amber }]} />
              </View>
              {!compact && (
                <Text
                  style={[
                    styles.optionText,
                    { color: selected ? colors.surface : colors.petroleum },
                  ]}
                >
                  {themeLabels[id]}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactOption: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 50,
  },
  compactRow: {
    justifyContent: 'flex-start',
  },
  compactSwatches: {
    gap: 0,
  },
  compactWrapper: {
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
  },
  option: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 7,
    minHeight: 68,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  optionText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  swatches: {
    flexDirection: 'row',
    gap: 4,
  },
  wrapper: {
    marginTop: 12,
  },
});
