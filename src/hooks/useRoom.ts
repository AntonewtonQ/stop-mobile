import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
  if (room?.status === 'lobby' || room?.status === 'finished') return ROOM_SYNC_LOBBY_POLL_INTERVAL;
  if (room?.status === 'results') return ROOM_SYNC_RESULTS_POLL_INTERVAL;
  return 20_000;
}

export function useRoom(code: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<RoomConnectionStatus>('connected');
  const roomRef = useRef<Room | null>(null);
  const refreshRef = useRef<() => Promise<boolean>>(async () => false);

  const applyRoom = useCallback(
    (nextRoom: Room) => {
      if (nextRoom.code !== code) return;
      if (roomRef.current?.code === code && nextRoom.updatedAt < roomRef.current.updatedAt) return;
      roomRef.current = nextRoom;
      setRoom(nextRoom);
    },
    [code],
  );
  const refresh = useCallback(() => refreshRef.current(), []);

  useFocusEffect(
    useCallback(() => {
      let disposed = false;
      let foreground =
        AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
      let failures = 0;
      let generation = 0;
      let inFlight: Promise<boolean> | null = null;
      let controller = new AbortController();
      let poll: ReturnType<typeof setTimeout> | undefined;
      let heartbeat: ReturnType<typeof setTimeout> | undefined;
      if (roomRef.current?.code !== code) {
        roomRef.current = null;
        setRoom(null);
        setSession(null);
        setIsLoading(true);
      }

      function refreshRoom(): Promise<boolean> {
        if (disposed || !foreground) return Promise.resolve(false);
        if (inFlight) return inFlight;
        clearTimeout(poll);
        const requestGeneration = generation;
        inFlight = (async () => {
          try {
            const [nextRoom, nextSession] = await Promise.all([
              readRoom(code, controller.signal),
              readPlayerSession(code),
            ]);
            if (disposed || requestGeneration !== generation) return false;
            if (nextRoom) applyRoom(nextRoom);
            else {
              roomRef.current = null;
              setRoom(null);
            }
            setSession(nextSession);
            failures = 0;
            setConnectionStatus('connected');
            return true;
          } catch {
            if (disposed || requestGeneration !== generation) return false;
            failures += 1;
            setConnectionStatus(failures >= 3 ? 'offline' : 'reconnecting');
            return false;
          } finally {
            if (!disposed && requestGeneration === generation) {
              inFlight = null;
              setIsLoading(false);
              if (foreground) {
                const delay = failures
                  ? Math.min(3_000 * 2 ** (failures - 1), 15_000)
                  : getPollDelay(roomRef.current);
                poll = setTimeout(() => void refreshRoom(), delay);
              }
            }
          }
        })();
        return inFlight;
      }

      async function sendPresence() {
        const requestGeneration = generation;
        try {
          const actor = await readPlayerSession(code);
          if (!actor || disposed || !foreground || requestGeneration !== generation) return;
          await syncPlayerPresence(code, true, controller.signal);
        } catch {
          // Room reads determine connection state; a heartbeat never overwrites the room.
        } finally {
          if (!disposed && foreground && requestGeneration === generation) {
            heartbeat = setTimeout(() => void sendPresence(), PRESENCE_HEARTBEAT_INTERVAL);
          }
        }
      }

      refreshRef.current = refreshRoom;
      if (foreground) {
        void refreshRoom();
        void sendPresence();
      }
      const subscription = AppState.addEventListener('change', (state) => {
        const nextForeground = state === 'active';
        if (foreground === nextForeground) return;
        foreground = nextForeground;
        generation += 1;
        controller.abort();
        controller = new AbortController();
        inFlight = null;
        clearTimeout(poll);
        clearTimeout(heartbeat);
        if (foreground) {
          setConnectionStatus('reconnecting');
          void refreshRoom();
          void sendPresence();
        }
      });

      return () => {
        disposed = true;
        controller.abort();
        clearTimeout(poll);
        clearTimeout(heartbeat);
        subscription.remove();
        refreshRef.current = async () => false;
      };
    }, [applyRoom, code]),
  );

  return { room, session, isLoading, connectionStatus, refresh, applyRoom };
}
