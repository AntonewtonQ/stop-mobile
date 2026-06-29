import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_AVATAR_ID, isAvatarId } from './avatars';
import { createPlayerSession, makeRoomCode, normalizeRoomCode } from './engine';
import { DEFAULT_PROFILE_COLOR, isProfileColor } from './profile-colors';
import type { PlayerSession } from './types';

const SESSION_PREFIX = 'jogastop:player:';
const LAST_ROOM_KEY = 'jogastop:last-room';

export { createPlayerSession, makeRoomCode, normalizeRoomCode };

export async function savePlayerSession(session: PlayerSession) {
  const normalizedCode = normalizeRoomCode(session.roomCode);
  const normalizedSession = { ...session, roomCode: normalizedCode };
  const value = JSON.stringify(normalizedSession);

  await AsyncStorage.multiSet([
    [`${SESSION_PREFIX}${normalizedCode}`, value],
    [LAST_ROOM_KEY, normalizedCode],
  ]);
}

export async function readPlayerSession(code: string): Promise<PlayerSession | null> {
  const normalizedCode = normalizeRoomCode(code);
  const rawSession = await AsyncStorage.getItem(`${SESSION_PREFIX}${normalizedCode}`);
  if (!rawSession) return null;

  try {
    const session = JSON.parse(rawSession) as PlayerSession;
    if (!session.token) return null;

    const normalizedSession: PlayerSession = {
      ...session,
      roomCode: normalizedCode,
      avatarId: isAvatarId(session.avatarId) ? session.avatarId : DEFAULT_AVATAR_ID,
      color: isProfileColor(session.color) ? session.color : DEFAULT_PROFILE_COLOR,
    };

    await savePlayerSession(normalizedSession);
    return normalizedSession;
  } catch {
    return null;
  }
}

export async function readLastPlayerSession(): Promise<PlayerSession | null> {
  const code = await AsyncStorage.getItem(LAST_ROOM_KEY);
  return code ? readPlayerSession(code) : null;
}
