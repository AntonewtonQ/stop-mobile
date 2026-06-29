import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarGlyph } from '@/components/ui/PlayerAvatar';
import { AVATAR_IDS, type AvatarId } from '@/features/game/avatars';
import type { ProfileColor } from '@/features/game/profile-colors';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/dictionaries';
import { useTheme } from '@/theme/ThemeProvider';

type AvatarPickerProps = {
  color: ProfileColor;
  onChange: (avatarId: AvatarId) => void;
  value: AvatarId;
};

export function AvatarPicker({ color, onChange, value }: AvatarPickerProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.petroleum }]}>{t('avatar.choose')}</Text>
      <ScrollView
        contentContainerStyle={styles.list}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {AVATAR_IDS.map((avatarId) => {
          const selected = avatarId === value;
          const label = t(`avatar.${avatarId}` as TranslationKey);

          return (
            <Pressable
              accessibilityLabel={label}
              accessibilityRole="button"
              key={avatarId}
              onPress={() => onChange(avatarId)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? color : colors.warmWhite,
                  borderColor: selected ? colors.petroleum : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.glyph,
                  { color: selected && color !== colors.amber ? colors.surface : colors.petroleum },
                ]}
              >
                <AvatarGlyph avatarId={avatarId} />
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.optionLabel,
                  { color: selected && color !== colors.amber ? colors.surface : colors.petroleum },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    fontSize: 21,
    fontWeight: '900',
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
  },
  list: {
    gap: 10,
    paddingVertical: 2,
  },
  option: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    gap: 5,
    height: 68,
    justifyContent: 'center',
    paddingHorizontal: 8,
    width: 72,
  },
  optionLabel: {
    fontSize: 9,
    fontWeight: '900',
    maxWidth: 58,
  },
  wrapper: {
    marginTop: 12,
  },
});
