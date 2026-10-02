import { beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from './fixtures';

const mocks = vi.hoisted(() => ({
  local: new Map<string, string>(),
  secure: new Map<string, string>(),
  platform: { OS: 'ios' },
  getAllKeys: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  multiSet: vi.fn(),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
  randomUUID: vi.fn(),
}));

vi.mock('react-native', () => ({ Platform: mocks.platform }));
vi.mock('expo-crypto', () => ({ randomUUID: mocks.randomUUID }));
vi.mock('expo-secure-store', () => ({
  getItemAsync: mocks.getItemAsync,
  setItemAsync: mocks.setItemAsync,
  deleteItemAsync: mocks.deleteItemAsync,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
}));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getAllKeys: mocks.getAllKeys,
    getItem: mocks.getItem,
    setItem: mocks.setItem,
    removeItem: mocks.removeItem,
    multiSet: mocks.multiSet,
  },
}));

const legacyKey = 'jogastop:player:ABCDE';
const secureKey = 'jogastop.session.ABCDE';
const lastKey = 'jogastop:last-room';
const serialized = JSON.stringify(session);
const loadStorage = () => import('@/features/game/mobileStorage');

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  mocks.platform.OS = 'ios';
  mocks.local.clear();
  mocks.secure.clear();
  mocks.getAllKeys.mockImplementation(async () => [...mocks.local.keys()]);
  mocks.getItem.mockImplementation(async (key: string) => mocks.local.get(key) ?? null);
  mocks.setItem.mockImplementation(async (key: string, value: string) => {
    mocks.local.set(key, value);
  });
  mocks.multiSet.mockImplementation(async (entries: [string, string][]) => {
    for (const [key, value] of entries) mocks.local.set(key, value);
  });
  mocks.removeItem.mockImplementation(async (key: string) => {
    mocks.local.delete(key);
  });
  mocks.getItemAsync.mockImplementation(async (key: string) => mocks.secure.get(key) ?? null);
  mocks.setItemAsync.mockImplementation(async (key: string, value: string) => {
    if (!/^[a-zA-Z0-9._-]+$/.test(key)) throw new Error('Invalid SecureStore key');
    mocks.secure.set(key, value);
  });
});

describe('secure mobile sessions', () => {
  it.each(['ios', 'android'])('stores the full %s session only in SecureStore', async (os) => {
    mocks.platform.OS = os;
    const storage = await loadStorage();
    await storage.savePlayerSession({ ...session, roomCode: ' abcde ' });

    expect(JSON.parse(mocks.secure.get(secureKey)!)).toEqual(session);
    expect(mocks.local).toEqual(new Map([[lastKey, 'ABCDE']]));
    expect(mocks.setItemAsync).toHaveBeenCalledWith(secureKey, expect.any(String), {
      keychainAccessible: 6,
    });
    expect(mocks.multiSet).not.toHaveBeenCalled();
    expect(await storage.readPlayerSession('abcde')).toEqual(session);
    expect(await storage.readLastPlayerSession()).toEqual(session);
  });

  it('uses native cryptographic UUIDs for new credentials', async () => {
    const storage = await loadStorage();
    mocks.randomUUID.mockReturnValueOnce('secure-player-id').mockReturnValueOnce('secure-token');
    const created = storage.createPlayerSession('Ana', 'ABCDE', 'spark', '#0F2D3D');
    expect(created).toMatchObject({ id: 'secure-player-id', token: 'secure-token', name: 'Ana' });
    expect(mocks.randomUUID).toHaveBeenCalledTimes(2);
  });

  it('does not return a Math.random credential if native crypto fails', async () => {
    const storage = await loadStorage();
    mocks.randomUUID.mockImplementation(() => {
      throw new Error('Crypto unavailable');
    });
    expect(() => storage.createPlayerSession('Ana', 'ABCDE')).toThrow(storage.SessionStorageError);
  });

  it('migrates all valid legacy sessions on first access without changing tokens or preferences', async () => {
    const second = { ...session, id: 'player-2', roomCode: 'FGHIJ', token: 'other-secret' };
    mocks.local.set(legacyKey, serialized);
    mocks.local.set('jogastop:player:FGHIJ', JSON.stringify(second));
    mocks.local.set(lastKey, 'ABCDE');
    mocks.local.set('jogastop:language', 'fr');
    const storage = await loadStorage();

    expect(await storage.readLastPlayerSession()).toEqual(session);
    expect(JSON.parse(mocks.secure.get('jogastop.session.FGHIJ')!)).toEqual(second);
    expect(mocks.local.has(legacyKey)).toBe(false);
    expect(mocks.local.has('jogastop:player:FGHIJ')).toBe(false);
    expect(mocks.local.get('jogastop:language')).toBe('fr');
    expect(mocks.setItemAsync.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.removeItem.mock.invocationCallOrder[0],
    );
  });

  it('recovers a secure session after a fresh module load without writing credentials again', async () => {
    const storage = await loadStorage();
    await storage.savePlayerSession(session);
    vi.resetModules();
    mocks.setItemAsync.mockClear();
    expect(await (await loadStorage()).readLastPlayerSession()).toEqual(session);
    expect(mocks.setItemAsync).not.toHaveBeenCalled();
  });

  it('does not replace an existing secure session with an old plaintext copy', async () => {
    const current = { ...session, id: 'new-player', token: 'new-token' };
    mocks.local.set(legacyKey, serialized);
    mocks.secure.set(secureKey, JSON.stringify(current));
    const storage = await loadStorage();
    expect(await storage.readPlayerSession('ABCDE')).toEqual(current);
    expect(mocks.local.has(legacyKey)).toBe(false);
    expect(mocks.setItemAsync).not.toHaveBeenCalled();
  });

  it('keeps legacy credentials on a failed migration and retries without falling back', async () => {
    mocks.local.set(legacyKey, serialized);
    mocks.local.set(lastKey, 'ABCDE');
    mocks.setItemAsync.mockRejectedValueOnce(new Error(`Native error: ${session.token}`));
    const storage = await loadStorage();

    await expect(storage.readLastPlayerSession()).rejects.toThrow(storage.SessionStorageError);
    expect(mocks.local.get(legacyKey)).toBe(serialized);
    expect(mocks.removeItem).not.toHaveBeenCalled();
    expect(await storage.readLastPlayerSession()).toEqual(session);
    expect(mocks.local.has(legacyKey)).toBe(false);
  });

  it('preserves the only copy when secure reads fail', async () => {
    mocks.local.set(legacyKey, serialized);
    mocks.getItemAsync.mockRejectedValueOnce(new Error('Device locked'));
    const storage = await loadStorage();
    await expect(storage.readPlayerSession('ABCDE')).rejects.toThrow(storage.SessionStorageError);
    expect(mocks.local.get(legacyKey)).toBe(serialized);
    expect(mocks.setItemAsync).not.toHaveBeenCalled();
  });

  it('finishes interrupted cleanup without re-writing a newer secure session', async () => {
    mocks.local.set(legacyKey, serialized);
    mocks.removeItem.mockRejectedValueOnce(new Error('Cleanup interrupted'));
    const storage = await loadStorage();
    await expect(storage.readPlayerSession('ABCDE')).rejects.toThrow(storage.SessionStorageError);
    const current = { ...session, token: 'replacement-token' };
    mocks.secure.set(secureKey, JSON.stringify(current));
    expect(await storage.readPlayerSession('ABCDE')).toEqual(current);
    expect(mocks.setItemAsync).toHaveBeenCalledTimes(1);
    expect(mocks.local.has(legacyKey)).toBe(false);
  });

  it('resumes a partial multi-room migration', async () => {
    mocks.local.set(legacyKey, serialized);
    const second = { ...session, roomCode: 'FGHIJ' };
    mocks.local.set('jogastop:player:FGHIJ', JSON.stringify(second));
    mocks.setItemAsync
      .mockImplementationOnce(async (key: string, value: string) => {
        mocks.secure.set(key, value);
      })
      .mockRejectedValueOnce(new Error('Device locked'));
    const storage = await loadStorage();
    await expect(storage.readPlayerSession('ABCDE')).rejects.toThrow(storage.SessionStorageError);
    expect(mocks.local.has(legacyKey)).toBe(false);
    expect(mocks.local.has('jogastop:player:FGHIJ')).toBe(true);
    expect(await storage.readPlayerSession('FGHIJ')).toEqual(second);
    expect(mocks.local.has('jogastop:player:FGHIJ')).toBe(false);
  });

  it('serializes concurrent migration, writes and reads', async () => {
    mocks.local.set(legacyKey, serialized);
    const current = { ...session, id: 'new-player', token: 'new-token' };
    const storage = await loadStorage();
    const [old, , latest] = await Promise.all([
      storage.readPlayerSession('ABCDE'),
      storage.savePlayerSession(current),
      storage.readPlayerSession('ABCDE'),
    ]);
    expect(old).toEqual(session);
    expect(latest).toEqual(current);
    expect(JSON.parse(mocks.secure.get(secureKey)!)).toEqual(current);
    expect(mocks.getAllKeys).toHaveBeenCalledTimes(1);
  });

  it('keeps a previously saved session on a failed write and sanitizes platform errors', async () => {
    const storage = await loadStorage();
    await storage.savePlayerSession(session);
    mocks.setItemAsync.mockRejectedValueOnce(new Error(`Native error: ${session.token}`));
    const failure = await storage
      .savePlayerSession({ ...session, token: 'new-token' })
      .catch((e) => e);
    expect(failure).toBeInstanceOf(storage.SessionStorageError);
    expect(failure.message).not.toContain(session.token);
    expect(failure.cause).toBeUndefined();
    expect(await storage.readPlayerSession('ABCDE')).toEqual(session);
    expect(mocks.local).toEqual(new Map([[lastKey, 'ABCDE']]));
  });

  it('does not create an insecure session when SecureStore is unavailable', async () => {
    mocks.setItemAsync.mockRejectedValueOnce(new Error('SecureStore unavailable'));
    const storage = await loadStorage();
    await expect(storage.savePlayerSession(session)).rejects.toThrow(storage.SessionStorageError);
    expect(mocks.local.size).toBe(0);
    expect(mocks.multiSet).not.toHaveBeenCalled();
  });

  it('preserves recovery data instead of replacing a damaged secure record with old credentials', async () => {
    mocks.local.set(legacyKey, serialized);
    mocks.secure.set(secureKey, '{broken');
    const storage = await loadStorage();
    await expect(storage.readPlayerSession('ABCDE')).rejects.toThrow(storage.SessionStorageError);
    expect(mocks.local.get(legacyKey)).toBe(serialized);
    expect(mocks.setItemAsync).not.toHaveBeenCalled();
  });

  it.each([
    'null',
    '[]',
    '{broken',
    '{}',
    JSON.stringify({ ...session, token: null }),
    JSON.stringify({ ...session, roomCode: 'OTHER' }),
  ])('ignores malformed or mismatched saved data: %s', async (raw) => {
    mocks.secure.set(secureKey, raw);
    expect(await (await loadStorage()).readPlayerSession('ABCDE')).toBeNull();
  });

  it('ignores invalid legacy entries without destroying data or other app keys', async () => {
    mocks.local.set(legacyKey, '{broken');
    mocks.local.set('jogastop:theme', 'neon');
    const storage = await loadStorage();
    expect(await storage.readPlayerSession('ABCDE')).toBeNull();
    expect(mocks.local.get(legacyKey)).toBe('{broken');
    expect(mocks.local.get('jogastop:theme')).toBe('neon');
  });

  it('restores defaults for missing profile fields in older sessions', async () => {
    mocks.local.set(
      legacyKey,
      JSON.stringify({
        ...session,
        avatarId: undefined,
        color: 'invalid',
        initials: undefined,
      }),
    );
    expect(await (await loadStorage()).readPlayerSession('ABCDE')).toEqual({
      ...session,
      initials: 'A',
    });
  });

  it('rejects invalid sessions before writing credentials', async () => {
    const storage = await loadStorage();
    await expect(storage.savePlayerSession({ ...session, token: '' })).rejects.toThrow(
      storage.SessionStorageError,
    );
    await expect(storage.savePlayerSession({ ...session, roomCode: '' })).rejects.toThrow(
      storage.SessionStorageError,
    );
    expect(mocks.setItemAsync).not.toHaveBeenCalled();
    expect(await storage.readPlayerSession('')).toBeNull();
  });

  it('does not change the last room when browser session storage fails', async () => {
    mocks.platform.OS = 'web';
    mocks.local.set(lastKey, 'FGHIJ');
    mocks.setItem.mockRejectedValueOnce(new Error('Storage full'));
    const storage = await loadStorage();
    await expect(storage.savePlayerSession(session)).rejects.toThrow(storage.SessionStorageError);
    expect(mocks.local.get(lastKey)).toBe('FGHIJ');
    expect(mocks.local.has(legacyKey)).toBe(false);
    expect(mocks.setItem).toHaveBeenCalledTimes(1);
  });

  it('keeps browser storage explicit and never calls native SecureStore on web', async () => {
    mocks.platform.OS = 'web';
    mocks.local.set(legacyKey, serialized);
    const storage = await loadStorage();
    expect(await storage.readPlayerSession('ABCDE')).toEqual(session);
    await storage.savePlayerSession(session);
    expect(await storage.readLastPlayerSession()).toEqual(session);
    expect(JSON.parse(mocks.local.get(legacyKey)!)).toEqual(session);
    expect(mocks.getItemAsync).not.toHaveBeenCalled();
    expect(mocks.setItemAsync).not.toHaveBeenCalled();
    expect(mocks.getAllKeys).not.toHaveBeenCalled();
  });
});
