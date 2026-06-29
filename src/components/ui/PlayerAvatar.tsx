import {
  Crown,
  Flame,
  Gamepad2,
  Globe2,
  Music,
  Rocket,
  Sparkles,
  Sun,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { DEFAULT_AVATAR_ID, type AvatarId } from '@/features/game/avatars';
import type { Player } from '@/features/game/types';
import { useTheme } from '@/theme/ThemeProvider';

type PlayerAvatarProps = {
  player: Pick<Player, 'avatarId' | 'color' | 'initials' | 'isHost' | 'isOnline' | 'name'>;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
};

const SIZES = {
  sm: 32,
  md: 44,
  lg: 58,
};

const AVATAR_ICONS: Record<AvatarId, LucideIcon> = {
  spark: Sparkles,
  rocket: Rocket,
  crown: Crown,
  bolt: Zap,
  flame: Flame,
  music: Music,
  football: Trophy,
  gamepad: Gamepad2,
  sun: Sun,
  globe: Globe2,
};

type AvatarIconProps = {
  avatarId?: AvatarId;
  color: string;
  size?: number;
  strokeWidth?: number;
};

export function AvatarIcon({ avatarId, color, size = 20, strokeWidth = 2.8 }: AvatarIconProps) {
  const Icon = AVATAR_ICONS[avatarId ?? DEFAULT_AVATAR_ID];

  return <Icon color={color} size={size} strokeWidth={strokeWidth} />;
}

export function PlayerAvatar({ player, showName = false, size = 'md' }: PlayerAvatarProps) {
  const { colors } = useTheme();
  const dimension = SIZES[size];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: player.color,
            borderColor: player.isOnline ? colors.surface : colors.border,
            height: dimension,
            opacity: player.isOnline ? 1 : 0.45,
            width: dimension,
          },
        ]}
      >
        <AvatarIcon
          avatarId={player.avatarId}
          color={colors.surface}
          size={size === 'lg' ? 27 : size === 'sm' ? 16 : 21}
        />
        {player.isHost && <View style={[styles.hostDot, { backgroundColor: colors.amber }]} />}
      </View>
      {showName && (
        <Text numberOfLines={1} style={[styles.name, { color: colors.petroleum }]}>
          {player.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
  },
  hostDot: {
    borderRadius: 999,
    bottom: -1,
    height: 12,
    position: 'absolute',
    right: -1,
    width: 12,
  },
  name: {
    fontSize: 11,
    fontWeight: '800',
    maxWidth: 64,
    textAlign: 'center',
  },
  wrapper: {
    alignItems: 'center',
    gap: 5,
  },
});
