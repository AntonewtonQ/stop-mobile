import {
  DEFAULT_CATEGORIES,
  MAX_ROUNDS_TO_PLAY,
  MIN_CATEGORIES,
  MIN_ROUNDS_TO_PLAY,
  PLAYABLE_LETTERS,
  ROUND_DURATION_OPTIONS,
  getSafeCategories,
  normalizeCategories,
} from './constants';
import { AVATAR_IDS, DEFAULT_AVATAR_ID, type AvatarId } from './avatars';
import { PROFILE_COLOR_VALUES, type ProfileColor } from './profile-colors';
import { scoreRound } from './scoring';
import type {
  AnswerScore,
  AnswerVote,
  Player,
  PlayerSession,
  Room,
  RoomSettings,
  RoundAnswers,
  RoundResult,
  RoundState,
} from './types';

function randomFrom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeId() {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const value = Math.floor(Math.random() * 16);
    const resolved = token === 'x' ? value : (value & 0x3) | 0x8;
    return resolved.toString(16);
  });
}

function isValidRoundsToPlay(value: number) {
  return Number.isInteger(value) && value >= MIN_ROUNDS_TO_PLAY && value <= MAX_ROUNDS_TO_PLAY;
}

function commanderIndexForRound(room: Room, roundNumber: number) {
  if (room.commanderOrder.length === 0) return -1;
  return (roundNumber - 1) % room.commanderOrder.length;
}

export function getCommanderForRound(room: Room, roundNumber: number) {
  const commanderIndex = commanderIndexForRound(room, roundNumber);
  return room.commanderOrder[commanderIndex] ?? room.hostId;
}

function makeRound(room: Room, number: number): RoundState {
  return {
    number,
    commanderId: getCommanderForRound(room, number),
    letter: '',
    startedAt: 0,
    duration: room.settings.roundDuration,
    stoppedAt: null,
    stoppedBy: null,
    answers: {},
    result: null,
  };
}

function normalizeResult(result: RoundResult | null): RoundResult | null {
  if (!result) return null;

  return {
    ...result,
    players: Object.fromEntries(
      Object.entries(result.players).map(([playerId, score]) => [
        playerId,
        {
          ...score,
          answers: Object.fromEntries(
            Object.entries(score.answers).map(([category, answer]) => [
              category,
              {
                ...answer,
                validation:
                  answer.validation ?? (answer.status === 'invalid' ? 'invalid' : 'automatic'),
                challengeId: answer.challengeId ?? null,
              } satisfies AnswerScore,
            ]),
          ),
        },
      ]),
    ),
    challenges: result.challenges ?? {},
    votingComplete: result.votingComplete ?? true,
  };
}

function finishRoomIfComplete(room: Room): Room {
  const gameComplete =
    room.status === 'results' &&
    room.round?.result?.votingComplete &&
    room.round.number >= room.settings.roundsToPlay;

  return gameComplete ? { ...room, status: 'finished' as const } : room;
}

function normalizeRound(round: RoundState, commanderOrder: string[], hostId: string): RoundState {
  const commanderIndex =
    commanderOrder.length > 0 ? (round.number - 1) % commanderOrder.length : -1;

  return {
    ...round,
    commanderId: round.commanderId ?? commanderOrder[commanderIndex] ?? hostId,
    stoppedAt: round.stoppedAt ?? null,
    stoppedBy: round.stoppedBy ?? null,
    answers: round.answers ?? {},
    result: normalizeResult(round.result ?? null),
  };
}

export function normalizeRoom(room: Room): Room {
  const commanderOrder =
    room.commanderOrder?.length > 0 ? room.commanderOrder : room.players.map((player) => player.id);

  return {
    ...room,
    players: room.players.map((player) => ({
      ...player,
      avatarId: player.avatarId ?? DEFAULT_AVATAR_ID,
      isOnline: player.isOnline ?? true,
      lastSeenAt: player.lastSeenAt ?? player.joinedAt,
    })),
    status: room.status ?? 'lobby',
    commanderOrder,
    settings: {
      categories: getSafeCategories(room.settings?.categories),
      roundDuration: room.settings?.roundDuration ?? 60,
      roundsToPlay: isValidRoundsToPlay(room.settings?.roundsToPlay)
        ? room.settings.roundsToPlay
        : Math.max(room.players.length, MIN_ROUNDS_TO_PLAY),
      roundsCustomized: room.settings?.roundsCustomized ?? false,
    },
    history: (room.history ?? []).map((round) =>
      normalizeRound(round, commanderOrder, room.hostId),
    ),
    round: room.round ? normalizeRound(room.round, commanderOrder, room.hostId) : null,
  };
}

export function normalizeRoomCode(code: string) {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}

export function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () =>
    alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
  ).join('');
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function createPlayerSession(
  name: string,
  roomCode: string,
  avatarId: AvatarId = randomFrom(AVATAR_IDS),
  color: ProfileColor = randomFrom(PROFILE_COLOR_VALUES),
): PlayerSession {
  return {
    id: makeId(),
    name: name.trim(),
    initials: getInitials(name),
    color,
    avatarId,
    roomCode,
    token: makeId(),
  };
}

function asRoomPlayer(session: PlayerSession, isHost: boolean): Player {
  const now = Date.now();

  return {
    id: session.id,
    name: session.name,
    initials: session.initials,
    color: session.color,
    avatarId: session.avatarId,
    isHost,
    isOnline: true,
    lastSeenAt: now,
    joinedAt: now,
  };
}

export function createRoom(
  code: string,
  host: PlayerSession,
  settings?: Partial<RoomSettings>,
): Room {
  return {
    code,
    hostId: host.id,
    status: 'lobby',
    players: [asRoomPlayer(host, true)],
    commanderOrder: [],
    settings: {
      categories: getSafeCategories(settings?.categories ?? DEFAULT_CATEGORIES),
      roundDuration: settings?.roundDuration ?? 60,
      roundsToPlay: isValidRoundsToPlay(settings?.roundsToPlay ?? 1)
        ? (settings?.roundsToPlay ?? 1)
        : 1,
      roundsCustomized: settings?.roundsCustomized ?? settings?.roundsToPlay !== undefined,
    },
    round: null,
    history: [],
    updatedAt: Date.now(),
  };
}

export function joinRoom(room: Room, session: PlayerSession) {
  const playerExists = room.players.some((player) => player.id === session.id);
  if (playerExists) return room;
  if (room.status !== 'lobby') return room;
  if (room.players.length >= PLAYABLE_LETTERS.length) return room;

  return {
    ...room,
    players: [...room.players, asRoomPlayer(session, false)],
    settings: room.settings.roundsCustomized
      ? room.settings
      : { ...room.settings, roundsToPlay: room.players.length + 1 },
  };
}

export function updateRoomSettings(
  room: Room,
  requesterId: string,
  settings: Partial<Pick<RoomSettings, 'categories' | 'roundDuration' | 'roundsToPlay'>>,
) {
  if (room.status !== 'lobby' || room.hostId !== requesterId) return room;

  const categories =
    settings.categories === undefined
      ? room.settings.categories
      : normalizeCategories(settings.categories);
  const roundDuration = settings.roundDuration ?? room.settings.roundDuration;
  const roundsToPlay = settings.roundsToPlay ?? room.settings.roundsToPlay;
  const validCategories = categories.length >= MIN_CATEGORIES;
  const validDuration = ROUND_DURATION_OPTIONS.includes(
    roundDuration as (typeof ROUND_DURATION_OPTIONS)[number],
  );
  const validRoundsToPlay = isValidRoundsToPlay(roundsToPlay);

  if (!validCategories || !validDuration || !validRoundsToPlay) return room;

  return {
    ...room,
    settings: {
      ...room.settings,
      categories,
      roundDuration,
      roundsToPlay,
      roundsCustomized: settings.roundsToPlay === undefined ? room.settings.roundsCustomized : true,
    },
  };
}

export function startFirstRound(room: Room, requesterId: string) {
  if (room.hostId !== requesterId || room.status !== 'lobby') return room;

  const commanderOrder = [
    room.hostId,
    ...room.players.filter((player) => player.id !== room.hostId).map((player) => player.id),
  ];
  const preparedRoom = {
    ...room,
    commanderOrder,
  };

  return {
    ...preparedRoom,
    status: 'letter-selection' as const,
    round: makeRound(preparedRoom, 1),
  };
}

export function chooseRoundLetter(room: Room, commanderId: string, letter: string) {
  const normalizedLetter = letter.trim().toUpperCase();
  const usedLetters = room.history.map((round) => round.letter);
  const canChoose =
    room.status === 'letter-selection' &&
    room.round?.commanderId === commanderId &&
    PLAYABLE_LETTERS.includes(normalizedLetter as (typeof PLAYABLE_LETTERS)[number]) &&
    !usedLetters.includes(normalizedLetter);

  if (!canChoose || !room.round) return room;

  return {
    ...room,
    status: 'round' as const,
    round: {
      ...room.round,
      letter: normalizedLetter,
      startedAt: Date.now(),
    },
  };
}

export function saveRoundAnswers(room: Room, playerId: string, answers: RoundAnswers) {
  if (
    room.status !== 'round' ||
    !room.round ||
    !room.players.some((player) => player.id === playerId)
  ) {
    return room;
  }

  return {
    ...room,
    round: {
      ...room.round,
      answers: { ...room.round.answers, [playerId]: answers },
    },
  };
}

export function finishRound(room: Room, stoppedBy: string | null, now = Date.now()) {
  if (room.status !== 'round' || !room.round || room.round.result) return room;
  if (stoppedBy !== null) {
    const isPlayer = room.players.some((player) => player.id === stoppedBy);
    const completedAllCategories = room.settings.categories.every((category) =>
      room.round?.answers[stoppedBy]?.[category]?.trim(),
    );

    if (!isPlayer || !completedAllCategories) return room;
  }

  const deadline = room.round.startedAt + room.round.duration * 1000;
  if (stoppedBy === null && now < deadline) return room;

  const result = scoreRound({
    players: room.players,
    categories: room.settings.categories,
    letter: room.round.letter,
    answers: room.round.answers,
    stoppedBy,
  });
  const completedRound: RoundState = {
    ...room.round,
    stoppedAt: result.endedAt,
    stoppedBy,
    result,
  };

  return finishRoomIfComplete({
    ...room,
    status: 'results' as const,
    round: completedRound,
    history: [...room.history, completedRound],
  });
}

export function castAnswerVote(room: Room, voterId: string, challengeId: string, vote: AnswerVote) {
  if (room.status !== 'results' || !room.round?.result) return room;

  const challenge = room.round.result.challenges[challengeId];
  const canVote =
    challenge?.status === 'pending' &&
    room.players.some((player) => player.id === voterId && player.isOnline) &&
    !challenge.playerIds.includes(voterId);

  if (!canVote) return room;

  const result = scoreRound({
    players: room.players,
    categories: room.settings.categories,
    letter: room.round.letter,
    answers: room.round.answers,
    stoppedBy: room.round.result.stoppedBy,
    endedAt: room.round.result.endedAt,
    existingChallenges: {
      ...room.round.result.challenges,
      [challengeId]: {
        ...challenge,
        votes: { ...challenge.votes, [voterId]: vote },
      },
    },
  });
  const updatedRound = { ...room.round, result };

  return finishRoomIfComplete({
    ...room,
    round: updatedRound,
    history: room.history.map((round) =>
      round.number === updatedRound.number ? updatedRound : round,
    ),
  });
}

export function prepareNextRound(room: Room, requesterId: string) {
  const nextRoundNumber = (room.round?.number ?? 0) + 1;
  const nextCommanderId = getCommanderForRound(room, nextRoundNumber);

  if (
    room.status !== 'results' ||
    !room.round ||
    !room.round.result?.votingComplete ||
    room.round.number >= room.settings.roundsToPlay ||
    requesterId !== nextCommanderId
  ) {
    return room;
  }

  return {
    ...room,
    status: 'letter-selection' as const,
    round: makeRound(room, room.round.number + 1),
  };
}

export function finishGame(room: Room, requesterId: string) {
  if (
    room.status !== 'results' ||
    !room.round?.result?.votingComplete ||
    room.round.number < room.settings.roundsToPlay ||
    !room.players.some((player) => player.id === requesterId)
  ) {
    return room;
  }

  return { ...room, status: 'finished' as const };
}

export function startRematch(room: Room, requesterId: string) {
  if (room.hostId !== requesterId || room.status !== 'finished') return room;

  return {
    ...room,
    status: 'lobby' as const,
    round: null,
    history: [],
    commanderOrder: [],
    settings: room.settings.roundsCustomized
      ? room.settings
      : { ...room.settings, roundsToPlay: room.players.length },
  };
}

export const restartGame = startRematch;

function replaceRoundCommander(room: Room, commanderId: string) {
  if (!room.round || room.round.commanderId === commanderId) return room;

  const round = { ...room.round, commanderId };
  return {
    ...room,
    round,
    history: room.history.map((item) =>
      item.number === round.number ? { ...item, commanderId } : item,
    ),
  };
}

function transferCommanderAt(room: Room, targetIndex: number) {
  if (targetIndex < 0) return room;

  const currentCommanderId = room.commanderOrder[targetIndex];
  const currentCommander = room.players.find((player) => player.id === currentCommanderId);
  if (currentCommander?.isOnline) return room;

  const candidateId = [
    ...room.commanderOrder.slice(targetIndex + 1),
    ...room.commanderOrder.slice(0, targetIndex),
  ].find((playerId) => room.players.some((player) => player.id === playerId && player.isOnline));
  if (!candidateId) return room;

  const candidateIndex = room.commanderOrder.indexOf(candidateId);
  const commanderOrder = [...room.commanderOrder];
  commanderOrder[targetIndex] = candidateId;
  if (candidateIndex >= 0) {
    commanderOrder[candidateIndex] = currentCommanderId;
  }

  return { ...room, commanderOrder };
}

function transferHost(room: Room) {
  const host = room.players.find((player) => player.id === room.hostId);
  if (host?.isOnline) return room;

  const nextHost = room.players.find((player) => player.isOnline);
  if (!nextHost) return room;

  return {
    ...room,
    hostId: nextHost.id,
    players: room.players.map((player) => ({
      ...player,
      isHost: player.id === nextHost.id,
    })),
  };
}

function recalculatePendingVotes(room: Room) {
  if (room.status !== 'results' || !room.round?.result || room.round.result.votingComplete) {
    return room;
  }

  const result = scoreRound({
    players: room.players,
    categories: room.settings.categories,
    letter: room.round.letter,
    answers: room.round.answers,
    stoppedBy: room.round.result.stoppedBy,
    endedAt: room.round.result.endedAt,
    existingChallenges: room.round.result.challenges,
  });
  const resultChanged =
    result.votingComplete !== room.round.result.votingComplete ||
    Object.values(result.challenges).some(
      (challenge) => challenge.status !== room.round?.result?.challenges[challenge.id]?.status,
    );
  if (!resultChanged) return room;

  const round = { ...room.round, result };

  return finishRoomIfComplete({
    ...room,
    round,
    history: room.history.map((item) => (item.number === round.number ? round : item)),
  });
}

export function reconcileRoomPresence(room: Room) {
  if (!room.players.some((player) => player.isOnline)) return room;

  let nextRoom = transferHost(room);

  if ((nextRoom.status === 'letter-selection' || nextRoom.status === 'round') && nextRoom.round) {
    const targetIndex = commanderIndexForRound(nextRoom, nextRoom.round.number);
    nextRoom = transferCommanderAt(nextRoom, targetIndex);
    nextRoom = replaceRoundCommander(nextRoom, nextRoom.commanderOrder[targetIndex]);
  } else if (nextRoom.status === 'results' && nextRoom.round) {
    const isLastRound = nextRoom.round.number >= nextRoom.settings.roundsToPlay;
    const targetRoundNumber = isLastRound ? nextRoom.round.number : nextRoom.round.number + 1;
    const targetIndex = commanderIndexForRound(nextRoom, targetRoundNumber);

    nextRoom = transferCommanderAt(nextRoom, targetIndex);
    if (isLastRound) {
      nextRoom = replaceRoundCommander(nextRoom, nextRoom.commanderOrder[targetIndex]);
    }
    nextRoom = recalculatePendingVotes(nextRoom);
  }

  return nextRoom;
}
