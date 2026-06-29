import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  PRESENCE_HEARTBEAT_INTERVAL,
  ROOM_SYNC_ACTIVE_POLL_INTERVAL,
  ROOM_SYNC_LOBBY_POLL_INTERVAL,
  ROOM_SYNC_RESULTS_POLL_INTERVAL,
} from '@/features/game/constants';
import { readRoom, syncPlayerPresence } from '@/features/game/mobileApi';
import { readPlayerSession } from '@/features/game/mobileStorage';
import type { PlayerSession, Room } from '@/features/game/types';

export type RoomConnectionStatus = 'connected' | 'reconnecting' | 'offline';

function getPollDelay(room: Room | null) {
  if (room?.status === 'round' || room?.status === 'letter-selection') {
    return ROOM_SYNC_ACTIVE_POLL_INTERVAL;
  }

  if (room?.status === 'lobby') return ROOM_SYNC_LOBBY_POLL_INTERVAL;
  if (room?.status === 'results') return ROOM_SYNC_RESULTS_POLL_INTERVAL;
  return 5_000;
}

export function useRoom(code: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<RoomConnectionStatus>('connected');
  const roomRef = useRef<Room | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextRoom, nextSession] = await Promise.all([readRoom(code), readPlayerSession(code)]);

      roomRef.current = nextRoom;
      setRoom(nextRoom);
      setSession(nextSession);
      setConnectionStatus('connected');
      return true;
    } catch {
      setConnectionStatus('reconnecting');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;

    async function scheduleRefresh() {
      await refresh();
      if (!active) return;
      timeout = setTimeout(scheduleRefresh, getPollDelay(roomRef.current));
    }

    timeout = setTimeout(scheduleRefresh, getPollDelay(roomRef.current));

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncPlayerPresence(code)
          .then((nextRoom) => {
            roomRef.current = nextRoom;
            setRoom(nextRoom);
            setConnectionStatus('connected');
          })
          .catch(() => void refresh());
      }
      if (state !== 'active') {
        setConnectionStatus('offline');
        void syncPlayerPresence(code, false).catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, [code, refresh]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (AppState.currentState === 'active') {
        void syncPlayerPresence(code)
          .then((nextRoom) => {
            roomRef.current = nextRoom;
            setRoom(nextRoom);
            setConnectionStatus('connected');
          })
          .catch(() => void refresh());
      }
    }, PRESENCE_HEARTBEAT_INTERVAL);

    return () => clearInterval(heartbeat);
  }, [code, refresh]);

  return {
    room,
    session,
    isLoading,
    connectionStatus,
    refresh,
  };
}
