import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveRoundAnswers } from '@/features/game/mobileApi';
import { useRoundDraft } from '@/hooks/useRoundDraft';
import type { RoundAnswers } from '@/features/game/types';
import { makeRoom } from './fixtures';

vi.mock('@/features/game/mobileApi', () => ({ saveRoundAnswers: vi.fn() }));

describe('round draft', () => {
  let root: ReactTestRenderer;
  let state: ReturnType<typeof useRoundDraft>;
  function Probe({ initial = {}, enabled = true }: { initial?: RoundAnswers; enabled?: boolean }) {
    state = useRoundDraft('ABCDE', initial, enabled);
    return null;
  }
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(saveRoundAnswers).mockResolvedValue(makeRoom());
  });
  afterEach(async () => {
    if (root) await act(() => root.unmount());
    vi.useRealTimers();
  });

  it('preserves typing across server refreshes, but clears it for a new round', async () => {
    await act(() => {
      root = create(createElement(Probe, { key: 1 }));
    });
    await act(() => state.updateAnswer('Nome', 'Ana'));
    await act(() => root.update(createElement(Probe, { key: 1, initial: { Nome: '' } })));
    expect(state.answers.Nome).toBe('Ana');
    await act(() => root.update(createElement(Probe, { key: 2 })));
    expect(state.answers).toEqual({});
  });

  it('retries failed writes and only marks success after acknowledgement', async () => {
    vi.mocked(saveRoundAnswers).mockRejectedValueOnce(new Error('offline'));
    await act(() => {
      root = create(createElement(Probe));
    });
    await act(() => state.updateAnswer('Nome', 'Ana'));
    expect(state.saveStatus).toBe('pending');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(state.saveStatus).toBe('error');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(saveRoundAnswers).toHaveBeenCalledTimes(2);
    expect(state.saveStatus).toBe('saved');
  });

  it('serializes saves and retains edits made while a request is running', async () => {
    let resolve!: (room: ReturnType<typeof makeRoom>) => void;
    vi.mocked(saveRoundAnswers).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    await act(() => {
      root = create(createElement(Probe));
    });
    await act(() => state.updateAnswer('Nome', 'A'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    await act(() => state.updateAnswer('Nome', 'Ana'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(saveRoundAnswers).toHaveBeenCalledTimes(1);
    await act(() => resolve(makeRoom()));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(saveRoundAnswers).toHaveBeenLastCalledWith('ABCDE', { Nome: 'Ana' });
    expect(state.saveStatus).toBe('saved');
  });

  it('cancels a scheduled save when STOP starts', async () => {
    await act(() => {
      root = create(createElement(Probe));
    });
    await act(() => state.updateAnswer('Nome', 'Ana'));
    await act(() => root.update(createElement(Probe, { enabled: false })));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(saveRoundAnswers).not.toHaveBeenCalled();
  });
});
