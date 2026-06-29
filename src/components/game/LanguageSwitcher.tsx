import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

const LOCALES = [
  { id: 'pt', label: 'PT' },
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
] as const;

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.petroleum }]}>{t('language.label')}</Text>
      <View style={styles.row}>
        {LOCALES.map((item) => {
          const selected = item.id === locale;
          return (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => void setLocale(item.id)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.petroleum : colors.warmWhite,
                  borderColor: selected ? colors.petroleum : colors.border,
                },
              ]}
            >
              <Text
                style={[styles.optionText, { color: selected ? colors.surface : colors.petroleum }]}
              >
                {item.label}
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
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 52,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  wrapper: {
    marginTop: 12,
  },
});
