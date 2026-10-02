import type { PlayerSession, Room } from '@/features/game/types';

export const session: PlayerSession = {
  id: 'player-1',
  name: 'Ana',
  initials: 'AN',
  color: '#0F2D3D',
  avatarId: 'spark',
  roomCode: 'ABCDE',
  token: 'test-session-token',
};

export function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    code: 'ABCDE',
    hostId: session.id,
    status: 'round',
    updatedAt: 1,
    players: [{ ...session, isHost: true, isOnline: true, joinedAt: 1, lastSeenAt: 1 }],
    settings: {
      categories: ['Nome', 'País', 'Comida'],
      roundDuration: 60,
      roundsToPlay: 2,
      roundsCustomized: true,
    },
    commanderOrder: [session.id],
    history: [],
    round: {
      number: 1,
      commanderId: session.id,
      letter: 'A',
      startedAt: 1,
      duration: 60,
      stoppedAt: null,
      stoppedBy: null,
      answers: {},
      result: null,
    },
    ...overrides,
  };
}
