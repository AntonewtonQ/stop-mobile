import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPicker } from '@/components/game/AvatarPicker';
import { ThemePicker } from '@/components/game/ThemePicker';
import type { AvatarId } from '@/features/game/avatars';
import { PROFILE_COLORS, type ProfileColor } from '@/features/game/profile-colors';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function ProfileOptions({
  avatarId,
  color,
  onAvatarChange,
  onColorChange,
}: {
  avatarId: AvatarId;
  color: ProfileColor;
  onAvatarChange: (avatar: AvatarId) => void;
  onColorChange: (color: ProfileColor) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  const { t } = useLanguage();
  const Chevron = expanded ? ChevronUp : ChevronDown;
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
        style={styles.toggle}
      >
        <Text style={[styles.label, { color: colors.petroleum }]}>{t('entry.customize')}</Text>
        <Chevron size={18} color={colors.petroleum} />
      </Pressable>
      {expanded && (
        <View style={styles.options}>
          <AvatarPicker color={color} value={avatarId} onChange={onAvatarChange} />
          <Text style={[styles.label, { color: colors.petroleum }]}>
            {t('profileColor.choose')}
          </Text>
          <View style={styles.colorGrid}>
            {PROFILE_COLORS.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={t(`profileColor.${option.id}`)}
                accessibilityState={{ selected: color === option.value }}
                onPress={() => onColorChange(option.value)}
                style={[
                  styles.colorTarget,
                  { borderColor: color === option.value ? colors.petroleum : 'transparent' },
                ]}
              >
                <View style={[styles.swatch, { backgroundColor: option.value }]} />
              </Pressable>
            ))}
          </View>
          <ThemePicker compact />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, marginTop: 8 },
  label: { flexShrink: 1, fontSize: 13, fontWeight: '800' },
  options: { gap: 10, paddingBottom: 12 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  colorTarget: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 30, height: 30, borderRadius: 15 },
});
