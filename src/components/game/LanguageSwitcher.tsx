import { Check, ChevronDown, Languages } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { useLanguage } from '@/i18n/LanguageProvider';
import type { Locale, TranslationKey } from '@/i18n/dictionaries';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const LOCALES = [
  { id: 'pt', labelKey: 'language.pt', short: 'PT' },
  { id: 'en', labelKey: 'language.en', short: 'EN' },
  { id: 'fr', labelKey: 'language.fr', short: 'FR' },
] satisfies { id: Locale; labelKey: TranslationKey; short: string }[];

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  async function selectLocale(nextLocale: Locale) {
    setOpen(false);
    await setLocale(nextLocale);
  }

  return (
    <View style={[styles.wrapper, compact && styles.compactWrapper]}>
      {!compact && (
        <Text style={[styles.label, { color: colors.petroleum }]}>{t('language.label')}</Text>
      )}

      <Pressable
        accessibilityLabel={t('language.label')}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[
          styles.button,
          compact && styles.compactButton,
          {
            backgroundColor: colors.warmWhite,
            borderColor: colors.border,
          },
        ]}
      >
        <Languages color={colors.petroleum} size={17} strokeWidth={2.6} />
        <Text style={[styles.buttonText, { color: colors.petroleum }]}>{selected.short}</Text>
        <ChevronDown color={colors.muted} size={15} strokeWidth={2.8} />
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.menu,
              compact ? styles.compactMenu : styles.defaultMenu,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {LOCALES.map((item) => {
              const selectedLocale = item.id === locale;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() => void selectLocale(item.id)}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: selectedLocale ? colors.petroleum : colors.surface,
                    },
                  ]}
                >
                  <Languages
                    color={selectedLocale ? colors.surface : colors.amberDeep}
                    size={16}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: selectedLocale ? colors.surface : colors.petroleum },
                    ]}
                  >
                    {t(item.labelKey)}
                  </Text>
                  {selectedLocale && <Check color={colors.surface} size={16} strokeWidth={3} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  compactButton: {
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  compactMenu: {
    right: spacing.screen,
    top: 72,
  },
  compactWrapper: {
    marginTop: 0,
  },
  defaultMenu: {
    right: spacing.screen,
    top: 160,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
  },
  menu: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    minWidth: 170,
    padding: 6,
    position: 'absolute',
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  menuItem: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  modalRoot: {
    flex: 1,
  },
  wrapper: {
    marginTop: 12,
  },
});
