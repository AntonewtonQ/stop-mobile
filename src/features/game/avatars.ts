export const AVATAR_IDS = [
  'spark',
  'rocket',
  'crown',
  'bolt',
  'flame',
  'music',
  'football',
  'gamepad',
  'sun',
  'globe',
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export const DEFAULT_AVATAR_ID: AvatarId = 'spark';

export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === 'string' && AVATAR_IDS.includes(value as AvatarId);
}
