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

export const AVATAR_GLYPHS: Record<AvatarId, string> = {
  spark: '◆',
  rocket: '↗',
  crown: '♛',
  bolt: 'ϟ',
  flame: '▲',
  music: '♪',
  football: '★',
  gamepad: '▣',
  sun: '☀',
  globe: '◎',
};

export function AvatarGlyph({ avatarId }: { avatarId?: AvatarId }) {
  return AVATAR_GLYPHS[avatarId ?? DEFAULT_AVATAR_ID];
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
        <Text
          style={[
            styles.initials,
            {
              color: colors.surface,
              fontSize: size === 'lg' ? 20 : size === 'sm' ? 12 : 15,
            },
          ]}
        >
          <AvatarGlyph avatarId={player.avatarId} />
        </Text>
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
  initials: {
    fontWeight: '900',
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
