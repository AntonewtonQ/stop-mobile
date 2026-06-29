import type { AvatarId } from './avatars';

export type RoomStatus = 'lobby' | 'letter-selection' | 'round' | 'results' | 'finished';

export type Player = {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarId: AvatarId;
  isHost: boolean;
  isOnline: boolean;
  lastSeenAt: number;
  joinedAt: number;
};

export type RoomSettings = {
  categories: string[];
  roundDuration: number;
  roundsToPlay: number;
  roundsCustomized: boolean;
};

export type RoundAnswers = Record<string, string>;

export type AnswerScoreStatus = 'invalid' | 'doubtful' | 'duplicate' | 'correct' | 'unique';

export type AnswerValidationStatus = 'invalid' | 'automatic' | 'doubtful' | 'approved' | 'rejected';

export type AnswerVote = 'approve' | 'reject';

export type AnswerChallengeStatus = 'pending' | 'approved' | 'rejected';

export type AnswerChallenge = {
  id: string;
  category: string;
  answer: string;
  normalizedAnswer: string;
  playerIds: string[];
  votes: Record<string, AnswerVote>;
  status: AnswerChallengeStatus;
};

export type AnswerScore = {
  answer: string;
  points: 0 | 5 | 10 | 20;
  status: AnswerScoreStatus;
  validation: AnswerValidationStatus;
  challengeId: string | null;
};

export type PlayerRoundScore = {
  playerId: string;
  answers: Record<string, AnswerScore>;
  total: number;
};

export type RoundResult = {
  endedAt: number;
  stoppedBy: string | null;
  players: Record<string, PlayerRoundScore>;
  challenges: Record<string, AnswerChallenge>;
  votingComplete: boolean;
};

export type RoundAnswerProgress = {
  playerId: string;
  answered: number;
  total: number;
  completed: boolean;
};

export type RoundState = {
  number: number;
  commanderId: string;
  letter: string;
  startedAt: number;
  duration: number;
  stoppedAt: number | null;
  stoppedBy: string | null;
  answers: Record<string, RoundAnswers>;
  answerProgress?: Record<string, RoundAnswerProgress>;
  result: RoundResult | null;
};

export type Room = {
  code: string;
  hostId: string;
  status: RoomStatus;
  players: Player[];
  commanderOrder: string[];
  settings: RoomSettings;
  round: RoundState | null;
  history: RoundState[];
  updatedAt: number;
};

export type PlayerSession = Pick<Player, 'id' | 'name' | 'initials' | 'color' | 'avatarId'> & {
  roomCode: string;
  token: string;
};
