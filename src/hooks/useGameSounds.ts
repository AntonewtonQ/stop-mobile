import { useEffect, useRef } from 'react';

import type { Room, RoomStatus } from '@/features/game/types';
import { useGameSoundControls } from '@/features/sounds/GameSoundProvider';

export function useGameSounds(room: Room | null) {
  const { play } = useGameSoundControls();
  const previousStatus = useRef<RoomStatus | null>(null);
  const lastTickSecond = useRef<number | null>(null);
  const status = room?.status ?? null;
  const stoppedBy = room?.round?.stoppedBy ?? null;
  const roundNumber = room?.round?.number ?? null;
  const startedAt = room?.round?.startedAt ?? null;
  const duration = room?.round?.duration ?? null;

  useEffect(() => {
    if (!status) return;

    const previous = previousStatus.current;
    if (previous === 'letter-selection' && status === 'round') {
      play('start');
    } else if (previous === 'round' && status === 'results' && stoppedBy) {
      play('stop');
    }

    previousStatus.current = status;
  }, [play, status, stoppedBy]);

  useEffect(() => {
    lastTickSecond.current = null;
  }, [roundNumber]);

  useEffect(() => {
    if (status !== 'round' || startedAt === null || duration === null) return;

    const deadline = startedAt + duration * 1000;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (remaining >= 1 && remaining <= 5 && remaining !== lastTickSecond.current) {
        play('tick');
      }
      lastTickSecond.current = remaining;
    }, 250);

    return () => clearInterval(interval);
  }, [duration, play, startedAt, status]);
}
