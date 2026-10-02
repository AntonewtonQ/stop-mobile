import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { finishRound, GameApiError, readRoom, syncPlayerPresence } from '@/features/game/mobileApi';
import { makeRoom, session } from './fixtures';

vi.mock('@/features/game/mobileStorage', () => ({ readPlayerSession: vi.fn(async () => session) }));

describe('mobile API contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('EXPO_PUBLIC_API_URL', 'https://example.test/');
  });
  afterEach(() => vi.useRealTimers());

  it('sends the session headers when reading private answers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ room: makeRoom() }));
    vi.stubGlobal('fetch', fetchMock);
    expect((await readRoom('abcde'))?.code).toBe('ABCDE');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/api/rooms/ABCDE',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-stop-player-id': session.id,
          'x-stop-player-token': session.token,
        }),
      }),
    );
  });

  it('uses light presence without requiring or replacing the room', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true, changed: false }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(syncPlayerPresence('ABCDE')).resolves.toEqual({ ok: true, changed: false });
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://example.test/api/rooms/ABCDE/presence?light=1',
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      actor: { id: session.id, token: session.token },
      online: true,
    });
  });

  it('sends the final draft atomically with STOP', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ room: makeRoom({ status: 'results' }) }));
    vi.stubGlobal('fetch', fetchMock);
    const answers = { Nome: 'Ana', País: 'Angola', Comida: 'Arroz' };
    expect((await finishRound('ABCDE', false, answers)).status).toBe('results');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      actor: { id: session.id, token: session.token },
      type: 'finish-round',
      payload: { timedOut: false, answers },
    });
  });

  it('only treats a 404 as a missing room', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ error: 'Missing' }, { status: 404 }))
        .mockResolvedValueOnce(Response.json({ error: 'Unavailable' }, { status: 503 })),
    );
    await expect(readRoom('ABCDE')).resolves.toBeNull();
    await expect(readRoom('ABCDE')).rejects.toMatchObject({ status: 503 });
  });

  it('bounds hanging requests and cleans up its timer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );
    const result = readRoom('ABCDE').catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(12_000);
    expect(await result).toBeInstanceOf(GameApiError);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('forwards cancellation when the app leaves the foreground', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );
    const controller = new AbortController();
    const result = readRoom('ABCDE', controller.signal).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    expect(await result).toMatchObject({ name: 'AbortError' });
    expect(vi.getTimerCount()).toBe(0);
  });
});
