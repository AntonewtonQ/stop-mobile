import type { AnswerVote, PlayerSession, Room, RoomSettings, RoundAnswers } from './types';
import { normalizeRoomCode } from './engine';
import { readPlayerSession } from './mobileStorage';

const DEFAULT_ERROR = 'A ligacao a sala falhou. Tenta novamente.';

export class GameApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getApiBaseUrl() {
  return (process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_WEB_URL ?? '').replace(
    /\/$/,
    '',
  );
}

function makeUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new GameApiError('Define EXPO_PUBLIC_API_URL com a URL do servidor jogastop.', 500);
  }

  return `${baseUrl}${path}`;
}

async function requestRoom(path: string, init?: RequestInit) {
  const response = await fetch(makeUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const data = (await response.json()) as { room?: Room; error?: string };

  if (!response.ok || !data.room) {
    throw new GameApiError(data.error ?? DEFAULT_ERROR, response.status);
  }

  return data.room;
}

async function getActor(code: string) {
  const session = await readPlayerSession(code);
  if (!session) {
    throw new GameApiError('A tua sessao expirou. Volta a entrar na sala.', 401);
  }

  return { id: session.id, token: session.token };
}

async function sendAction(code: string, type: string, payload: Record<string, unknown> = {}) {
  const normalizedCode = normalizeRoomCode(code);

  return requestRoom(`/api/rooms/${normalizedCode}/actions`, {
    method: 'POST',
    body: JSON.stringify({
      actor: await getActor(normalizedCode),
      type,
      payload,
    }),
  });
}

export async function readRoom(code: string) {
  const normalizedCode = normalizeRoomCode(code);
  const session = await readPlayerSession(normalizedCode);
  const response = await fetch(makeUrl(`/api/rooms/${normalizedCode}`), {
    headers: session
      ? {
          'x-stop-player-id': session.id,
          'x-stop-player-token': session.token,
        }
      : undefined,
  });

  if (response.status === 404) return null;

  const data = (await response.json()) as { room?: Room; error?: string };
  if (!response.ok || !data.room) {
    throw new GameApiError(
      data.error ?? 'Nao conseguimos carregar a sala. Tenta novamente.',
      response.status,
    );
  }

  return data.room;
}

export function createRoom(code: string, host: PlayerSession) {
  return requestRoom('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({ code, host }),
  });
}

export function joinRoom(code: string, session: PlayerSession) {
  return requestRoom(`/api/rooms/${normalizeRoomCode(code)}/join`, {
    method: 'POST',
    body: JSON.stringify({ session }),
  });
}

export function updateRoomSettings(
  code: string,
  settings: Partial<Pick<RoomSettings, 'categories' | 'roundDuration' | 'roundsToPlay'>>,
) {
  return sendAction(code, 'update-settings', settings);
}

export function startFirstRound(code: string) {
  return sendAction(code, 'start-game');
}

export function chooseRoundLetter(code: string, letter: string) {
  return sendAction(code, 'choose-letter', { letter });
}

export function saveRoundAnswers(code: string, answers: RoundAnswers) {
  return sendAction(code, 'save-answers', { answers });
}

export function finishRound(code: string, timedOut = false, answers?: RoundAnswers) {
  return sendAction(code, 'finish-round', { timedOut, answers });
}

export function castAnswerVote(code: string, challengeId: string, vote: AnswerVote) {
  return sendAction(code, 'vote', { challengeId, vote });
}

export function prepareNextRound(code: string) {
  return sendAction(code, 'prepare-next-round');
}

export function finishGame(code: string) {
  return sendAction(code, 'finish-game');
}

export function startRematch(code: string) {
  return sendAction(code, 'rematch');
}

export async function syncPlayerPresence(code: string, online = true) {
  return requestRoom(`/api/rooms/${normalizeRoomCode(code)}/presence`, {
    method: 'POST',
    body: JSON.stringify({
      actor: await getActor(code),
      online,
    }),
  });
}
