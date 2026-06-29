import { Pressable, StyleSheet, Text } from 'react-native';

import { useGameSoundControls } from '@/features/sounds/GameSoundProvider';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function SoundToggle() {
  const { enabled, toggle } = useGameSoundControls();
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void toggle()}
      style={[
        styles.button,
        {
          backgroundColor: enabled ? colors.petroleum : colors.warmWhite,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: enabled ? colors.surface : colors.petroleum }]}>
        {enabled ? t('sound.disable') : t('sound.enable')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
  },
});
