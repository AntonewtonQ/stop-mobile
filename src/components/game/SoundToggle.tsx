import { Volume2, VolumeX } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useGameSoundControls } from '@/features/sounds/GameSoundProvider';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

type SoundToggleProps = {
  compact?: boolean;
};

export function SoundToggle({ compact = false }: SoundToggleProps) {
  const { enabled, toggle } = useGameSoundControls();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const iconColor = enabled ? colors.surface : colors.petroleum;
  const Icon = enabled ? Volume2 : VolumeX;

  return (
    <Pressable
      accessibilityLabel={enabled ? t('sound.disable') : t('sound.enable')}
      accessibilityRole="button"
      onPress={() => void toggle()}
      style={[
        styles.button,
        compact && styles.compactButton,
        {
          backgroundColor: enabled ? colors.petroleum : colors.warmWhite,
          borderColor: colors.border,
        },
      ]}
    >
      <Icon color={iconColor} size={17} strokeWidth={2.8} />
      {!compact && (
        <Text style={[styles.text, { color: enabled ? colors.surface : colors.petroleum }]}>
          {enabled ? t('sound.disable') : t('sound.enable')}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  compactButton: {
    height: 42,
    paddingHorizontal: 13,
    width: 42,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
  },
});
