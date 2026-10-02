import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { AnswerChallenge, AnswerVote, Player } from '@/features/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function AnswerVoteCard({
  challenge,
  players,
  sessionId,
  busy,
  onVote,
}: {
  challenge: AnswerChallenge;
  players: Player[];
  sessionId: string;
  busy: boolean;
  onVote: (vote: AnswerVote) => void;
}) {
  const { colors } = useTheme();
  const { t, category } = useLanguage();
  const eligible = players.filter(
    (player) => player.isOnline && !challenge.playerIds.includes(player.id),
  );
  const missing = eligible.filter((player) => !challenge.votes[player.id]);
  const canVote =
    challenge.status === 'pending' && eligible.some((player) => player.id === sessionId);
  const currentVote = challenge.votes[sessionId];
  const names = (group: Player[]) =>
    group
      .map((player) =>
        player.id === sessionId ? `${player.name} (${t('common.you')})` : player.name,
      )
      .join(', ');
  const votes = Object.entries(challenge.votes).flatMap(([id, vote]) => {
    const player = players.find((candidate) => candidate.id === id);
    return player
      ? [
          t('challenge.recentVote', {
            name: names([player]),
            vote: t(vote === 'approve' ? 'challenge.voteAcceptShort' : 'challenge.voteRejectShort'),
          }),
        ]
      : [];
  });
  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.muted }]}>{category(challenge.category)}</Text>
      <Text style={[styles.answer, { color: colors.petroleum }]}>{challenge.answer}</Text>
      <Badge
        label={t(`challenge.${challenge.status}`)}
        tone={
          challenge.status === 'approved'
            ? 'success'
            : challenge.status === 'rejected'
              ? 'danger'
              : 'accent'
        }
      />
      <Text style={[styles.text, { color: colors.muted }]}>
        {t('challenge.votes', {
          authors: names(players.filter((player) => challenge.playerIds.includes(player.id))),
          current: eligible.filter((player) => challenge.votes[player.id]).length,
          total: eligible.length,
        })}
      </Text>
      {challenge.status === 'pending' && (
        <View>
          <Text style={[styles.label, { color: colors.muted }]}>{t('challenge.missingVotes')}</Text>
          <Text style={[styles.text, { color: colors.petroleum }]}>
            {names(missing) || t('challenge.noMissingVotes')}
          </Text>
        </View>
      )}
      <View accessibilityLiveRegion="polite">
        <Text style={[styles.label, { color: colors.muted }]}>{t('challenge.voters')}</Text>
        <Text style={[styles.text, { color: colors.petroleum }]}>
          {votes.join(', ') || t('challenge.noVotesYet')}
        </Text>
      </View>
      {canVote ? (
        <View style={styles.actions}>
          <Button
            label={t('challenge.accept')}
            disabled={busy}
            onPress={() => onVote('approve')}
            variant={currentVote === 'approve' ? 'primary' : 'outline'}
            style={styles.button}
          />
          <Button
            label={t('challenge.reject')}
            disabled={busy}
            onPress={() => onVote('reject')}
            variant={currentVote === 'reject' ? 'danger' : 'outline'}
            style={styles.button}
          />
        </View>
      ) : challenge.status === 'pending' && challenge.playerIds.includes(sessionId) ? (
        <Text style={{ color: colors.muted }}>{t('challenge.yoursPending')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, marginTop: 12, padding: 14, gap: 10 },
  label: { fontSize: 12, fontWeight: '800' },
  answer: { fontSize: 22, fontWeight: '900' },
  text: { fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  button: { flex: 1 },
});
