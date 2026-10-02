import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';

import { secureStorage } from '@/storage/appStorage';

import { DEFAULT_AVATAR_ID, isAvatarId } from './avatars';
import {
  createPlayerSession as createGamePlayerSession,
  getInitials,
  makeRoomCode,
  normalizeRoomCode,
} from './engine';
import { DEFAULT_PROFILE_COLOR, isProfileColor } from './profile-colors';
import type { PlayerSession } from './types';

const SESSION_PREFIX = 'jogastop:player:';
const SECURE_SESSION_PREFIX = 'jogastop.session.';
const LAST_ROOM_KEY = 'jogastop:last-room';

let migrationComplete = false;
let pendingStorage: Promise<unknown> = Promise.resolve();

export { makeRoomCode, normalizeRoomCode };

export class SessionStorageError extends Error {
  constructor() {
    super('The player session could not be stored or recovered safely.');
    this.name = 'SessionStorageError';
  }
}

export function createPlayerSession(
  ...args: Parameters<typeof createGamePlayerSession>
): PlayerSession {
  try {
    return { ...createGamePlayerSession(...args), id: randomUUID(), token: randomUUID() };
  } catch {
    throw new SessionStorageError();
  }
}

function parseSession(raw: string | null, code: string): PlayerSession | null {
  if (!raw || code.length < 4) return null;
  try {
    const session: unknown = JSON.parse(raw);
    if (!session || typeof session !== 'object') return null;
    if (!('id' in session) || typeof session.id !== 'string' || !session.id) return null;
    if (!('name' in session) || typeof session.name !== 'string' || !session.name.trim())
      return null;
    if (!('token' in session) || typeof session.token !== 'string' || !session.token.trim())
      return null;
    if (
      !('roomCode' in session) ||
      typeof session.roomCode !== 'string' ||
      normalizeRoomCode(session.roomCode) !== code
    )
      return null;

    const avatarId = 'avatarId' in session ? session.avatarId : undefined;
    const color = 'color' in session ? session.color : undefined;
    return {
      id: session.id,
      name: session.name,
      token: session.token,
      roomCode: code,
      initials:
        'initials' in session && typeof session.initials === 'string'
          ? session.initials
          : getInitials(session.name),
      avatarId: isAvatarId(avatarId) ? avatarId : DEFAULT_AVATAR_ID,
      color: isProfileColor(color) ? color : DEFAULT_PROFILE_COLOR,
    };
  } catch {
    return null;
  }
}

async function migrateLegacySessions() {
  if (Platform.OS === 'web' || migrationComplete) return;
  const keys = await AsyncStorage.getAllKeys();
  for (const key of keys) {
    if (!key.startsWith(SESSION_PREFIX)) continue;
    const code = normalizeRoomCode(key.slice(SESSION_PREFIX.length));
    const legacy = parseSession(await AsyncStorage.getItem(key), code);
    if (!legacy) continue;

    const secureKey = `${SECURE_SESSION_PREFIX}${code}`;
    const existing = await secureStorage.getItem(secureKey);
    if (existing === null) {
      await secureStorage.setItem(secureKey, JSON.stringify(legacy));
    } else if (!parseSession(existing, code)) {
      // Keep recoverable legacy data if an existing secure record is damaged.
      throw new SessionStorageError();
    }
    // Never overwrite a newer secure session or delete the only saved credential.
    await AsyncStorage.removeItem(key);
  }
  migrationComplete = true;
}

function withSessionStorage<T>(operation: () => Promise<T>): Promise<T> {
  // Serialize migration, reads and writes so stale legacy data cannot win a race.
  const result = pendingStorage.then(async () => {
    try {
      await migrateLegacySessions();
      return await operation();
    } catch {
      // Do not expose platform errors or fall back to plaintext on native failures.
      throw new SessionStorageError();
    }
  });
  pendingStorage = result.catch(() => undefined);
  return result;
}

async function readStoredSession(code: string) {
  if (code.length < 4) return null;
  const raw =
    Platform.OS === 'web'
      ? await AsyncStorage.getItem(`${SESSION_PREFIX}${code}`)
      : await secureStorage.getItem(`${SECURE_SESSION_PREFIX}${code}`);
  return parseSession(raw, code);
}

export function savePlayerSession(session: PlayerSession) {
  return withSessionStorage(async () => {
    const code = normalizeRoomCode(session.roomCode);
    const normalized = parseSession(JSON.stringify(session), code);
    if (!normalized) throw new SessionStorageError();
    const value = JSON.stringify(normalized);

    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(`${SESSION_PREFIX}${code}`, value);
    } else {
      await secureStorage.setItem(`${SECURE_SESSION_PREFIX}${code}`, value);
      await AsyncStorage.removeItem(`${SESSION_PREFIX}${code}`);
    }
    await AsyncStorage.setItem(LAST_ROOM_KEY, code);
  });
}

export function readPlayerSession(code: string): Promise<PlayerSession | null> {
  return withSessionStorage(() => readStoredSession(normalizeRoomCode(code)));
}

export function readLastPlayerSession(): Promise<PlayerSession | null> {
  return withSessionStorage(async () => {
    const code = await AsyncStorage.getItem(LAST_ROOM_KEY);
    return code ? readStoredSession(normalizeRoomCode(code)) : null;
  });
}
