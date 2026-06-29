import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { THEME_IDS, themeLabels, themePalettes } from '@/theme/tokens';

export function ThemePicker() {
  const { colors, setThemeId, themeId } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.petroleum }]}>Tema</Text>
      <View style={styles.row}>
        {THEME_IDS.map((id) => {
          const palette = themePalettes[id];
          const selected = id === themeId;

          return (
            <Pressable
              accessibilityRole="button"
              key={id}
              onPress={() => void setThemeId(id)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.petroleum : colors.warmWhite,
                  borderColor: selected ? colors.petroleum : colors.border,
                },
              ]}
            >
              <View style={styles.swatches}>
                <View style={[styles.swatch, { backgroundColor: palette.petroleum }]} />
                <View style={[styles.swatch, { backgroundColor: palette.amber }]} />
              </View>
              <Text
                style={[styles.optionText, { color: selected ? colors.surface : colors.petroleum }]}
              >
                {themeLabels[id]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
