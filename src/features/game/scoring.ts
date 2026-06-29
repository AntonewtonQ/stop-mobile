import type {
  AnswerChallenge,
  AnswerChallengeStatus,
  AnswerScore,
  Player,
  PlayerRoundScore,
  RoundAnswers,
  RoundResult,
} from './types';
import {
  hasScorableContent,
  isKnownAnswer,
  normalizeAnswer,
  startsWithLetter,
} from './word-validation';

function makeChallengeId(category: string, answer: string) {
  return `${normalizeAnswer(category)}::${normalizeAnswer(answer)}`;
}

function resolveChallenge(challenge: AnswerChallenge, players: Player[]): AnswerChallengeStatus {
  const eligibleVoterIds = players
    .filter((player) => player.isOnline && !challenge.playerIds.includes(player.id))
    .map((player) => player.id);

  if (eligibleVoterIds.length === 0) return 'approved';

  const votes = eligibleVoterIds.map((playerId) => challenge.votes[playerId]).filter(Boolean);

  if (votes.length < eligibleVoterIds.length) return 'pending';

  const approvals = votes.filter((vote) => vote === 'approve').length;
  const rejections = votes.length - approvals;
  return approvals > rejections ? 'approved' : 'rejected';
}

function buildChallenges({
  players,
  categories,
  letter,
  answers,
  existingChallenges,
}: {
  players: Player[];
  categories: string[];
  letter: string;
  answers: Record<string, RoundAnswers>;
  existingChallenges: Record<string, AnswerChallenge>;
}) {
  const challenges: Record<string, AnswerChallenge> = {};

  for (const category of categories) {
    for (const player of players) {
      const answer = answers[player.id]?.[category]?.trim() ?? '';
      if (
        !startsWithLetter(answer, letter) ||
        !hasScorableContent(answer) ||
        isKnownAnswer(category, answer)
      ) {
        continue;
      }

      const id = makeChallengeId(category, answer);
      const existingChallenge = challenges[id] ?? existingChallenges[id];
      challenges[id] = {
        id,
        category,
        answer: existingChallenge?.answer ?? answer,
        normalizedAnswer: normalizeAnswer(answer),
        playerIds: Array.from(new Set([...(existingChallenge?.playerIds ?? []), player.id])),
        votes: existingChallenge?.votes ?? {},
        status: 'pending',
      };
    }
  }

  for (const challenge of Object.values(challenges)) {
    challenge.status = resolveChallenge(challenge, players);
  }

  return challenges;
}

export function scoreRound({
  players,
  categories,
  letter,
  answers,
  stoppedBy,
  existingChallenges = {},
  endedAt = Date.now(),
}: {
  players: Player[];
  categories: string[];
  letter: string;
  answers: Record<string, RoundAnswers>;
  stoppedBy: string | null;
  existingChallenges?: Record<string, AnswerChallenge>;
  endedAt?: number;
}): RoundResult {
  const challenges = buildChallenges({
    players,
    categories,
    letter,
    answers,
    existingChallenges,
  });
  const scores: Record<string, PlayerRoundScore> = Object.fromEntries(
    players.map((player) => [player.id, { playerId: player.id, answers: {}, total: 0 }]),
  );

  for (const category of categories) {
    const acceptedAnswers = players
      .map((player) => {
        const answer = answers[player.id]?.[category]?.trim() ?? '';
        const challenge = challenges[makeChallengeId(category, answer)];
        const accepted =
          startsWithLetter(answer, letter) &&
          hasScorableContent(answer) &&
          (isKnownAnswer(category, answer) || challenge?.status === 'approved');

        return { playerId: player.id, answer, accepted };
      })
      .filter(({ accepted }) => accepted);

    const answerCounts = acceptedAnswers.reduce<Record<string, number>>((counts, { answer }) => {
      const normalizedAnswer = normalizeAnswer(answer);
      counts[normalizedAnswer] = (counts[normalizedAnswer] ?? 0) + 1;
      return counts;
    }, {});

    for (const player of players) {
      const answer = answers[player.id]?.[category]?.trim() ?? '';
      const challenge = challenges[makeChallengeId(category, answer)];
      const known = isKnownAnswer(category, answer);
      const startsCorrectly = startsWithLetter(answer, letter);
      const hasEnoughContent = hasScorableContent(answer);
      let score: AnswerScore = {
        answer,
        points: 0,
        status: 'invalid',
        validation: startsCorrectly && challenge?.status === 'rejected' ? 'rejected' : 'invalid',
        challengeId: challenge?.id ?? null,
      };

      if (challenge?.status === 'pending') {
        score = {
          answer,
          points: 0,
          status: 'doubtful',
          validation: 'doubtful',
          challengeId: challenge.id,
        };
      } else if (
        startsCorrectly &&
        hasEnoughContent &&
        (known || challenge?.status === 'approved')
      ) {
        const count = answerCounts[normalizeAnswer(answer)] ?? 0;
        const validation = known ? 'automatic' : 'approved';

        if (acceptedAnswers.length === 1) {
          score = {
            answer,
            points: 20,
            status: 'unique',
            validation,
            challengeId: challenge?.id ?? null,
          };
        } else if (count > 1) {
          score = {
            answer,
            points: 5,
            status: 'duplicate',
            validation,
            challengeId: challenge?.id ?? null,
          };
        } else {
          score = {
            answer,
            points: 10,
            status: 'correct',
            validation,
            challengeId: challenge?.id ?? null,
          };
        }
      }

      scores[player.id].answers[category] = score;
      scores[player.id].total += score.points;
    }
  }

  return {
    endedAt,
    stoppedBy,
    players: scores,
    challenges,
    votingComplete: Object.values(challenges).every((challenge) => challenge.status !== 'pending'),
  };
}

export function getPlayerTotal(history: { result: RoundResult | null }[], playerId: string) {
  return history.reduce((total, round) => total + (round.result?.players[playerId]?.total ?? 0), 0);
}
