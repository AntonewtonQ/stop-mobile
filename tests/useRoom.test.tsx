import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readRoom, syncPlayerPresence } from '@/features/game/mobileApi';
import { useRoom } from '@/hooks/useRoom';
import { makeRoom, session } from './fixtures';
import type { Room } from '@/features/game/types';

const native = vi.hoisted(() => ({
  listener: null as ((state: string) => void) | null,
  currentState: 'active',
}));
vi.mock('react-native', () => ({
  AppState: {
    get currentState() {
      return native.currentState;
    },
    addEventListener: (_event: string, callback: (state: string) => void) => {
      native.listener = callback;
      return {
        remove: () => {
          native.listener = null;
        },
      };
    },
  },
}));
vi.mock('expo-router', async () => {
  const { useEffect } = await import('react');
  return { useFocusEffect: (callback: () => void) => useEffect(callback, [callback]) };
});
vi.mock('@/features/game/mobileApi', () => ({ readRoom: vi.fn(), syncPlayerPresence: vi.fn() }));
vi.mock('@/features/game/mobileStorage', () => ({ readPlayerSession: vi.fn(async () => session) }));

describe('room synchronization', () => {
  let root: ReactTestRenderer;
  let state: ReturnType<typeof useRoom>;
  function Probe() {
    state = useRoom('ABCDE');
    return null;
  }
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    native.currentState = 'active';
    vi.mocked(readRoom).mockResolvedValue(makeRoom());
    vi.mocked(syncPlayerPresence).mockResolvedValue({ ok: true, changed: false });
  });
  afterEach(async () => {
    if (root) await act(() => root.unmount());
    vi.useRealTimers();
  });

  it('shares a pending read instead of sending overlapping refresh requests', async () => {
    let resolve!: (room: Room) => void;
    vi.mocked(readRoom).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    await act(() => {
      root = create(createElement(Probe));
    });
    const first = state.refresh();
    expect(state.refresh()).toBe(first);
    expect(readRoom).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve(makeRoom());
      await first;
    });
    expect(state.isLoading).toBe(false);
  });

  it('does not let an older poll undo a successful STOP action', async () => {
    await act(() => {
      root = create(createElement(Probe));
    });
    let resolve!: (room: Room) => void;
    vi.mocked(readRoom).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const request = state.refresh();
    await act(() => state.applyRoom(makeRoom({ status: 'results', updatedAt: 3 })));
    await act(async () => {
      resolve(makeRoom({ updatedAt: 2 }));
      await request;
    });
    expect(state.room?.status).toBe('results');
  });

  it('pauses reads and heartbeats in the background and refreshes on return', async () => {
    await act(() => {
      root = create(createElement(Probe));
    });
    const initialReads = vi.mocked(readRoom).mock.calls.length;
    const initialPresence = vi.mocked(syncPlayerPresence).mock.calls.length;
    await act(() => native.listener?.('background'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(40_000);
    });
    expect(readRoom).toHaveBeenCalledTimes(initialReads);
    expect(syncPlayerPresence).toHaveBeenCalledTimes(initialPresence);
    await act(() => native.listener?.('active'));
    expect(readRoom).toHaveBeenCalledTimes(initialReads + 1);
    expect(syncPlayerPresence).toHaveBeenCalledTimes(initialPresence + 1);
  });

  it('preserves the last room through an outage and recovers', async () => {
    await act(() => {
      root = create(createElement(Probe));
    });
    vi.mocked(readRoom).mockRejectedValue(new Error('offline'));
    await act(async () => {
      await state.refresh();
    });
    expect(state.connectionStatus).toBe('reconnecting');
    expect(state.room?.code).toBe('ABCDE');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9_000);
    });
    expect(state.connectionStatus).toBe('offline');
    vi.mocked(readRoom).mockResolvedValue(makeRoom({ status: 'results', updatedAt: 2 }));
    await act(async () => {
      await state.refresh();
    });
    expect(state.connectionStatus).toBe('connected');
    expect(state.room?.status).toBe('results');
  });

  it('keeps the final screen responsive to a rematch', async () => {
    vi.mocked(readRoom).mockResolvedValueOnce(makeRoom({ status: 'finished' }));
    await act(() => {
      root = create(createElement(Probe));
    });
    vi.mocked(readRoom).mockResolvedValue(makeRoom({ status: 'lobby', updatedAt: 2 }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_500);
    });
    expect(state.room?.status).toBe('lobby');
  });
});
