import { useEffect, useRef, useState } from 'react';

import { saveRoundAnswers } from '@/features/game/mobileApi';
import type { RoundAnswers } from '@/features/game/types';

// Mount once per round. Incoming room snapshots must never replace local typing.
export function useRoundDraft(code: string, initialAnswers: RoundAnswers, enabled: boolean) {
  const [answers, setAnswers] = useState<RoundAnswers>(() => ({ ...initialAnswers }));
  const [status, setStatus] = useState<'saved' | 'saving' | 'pending' | 'error'>('saved');
  const [attempt, setAttempt] = useState(0);
  const snapshot = JSON.stringify(answers);
  const lastSaved = useRef(snapshot);
  const busy = useRef(false);
  const mounted = useRef(false);
  const retryDelay = useRef(800);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || busy.current) return;
    if (snapshot === lastSaved.current) {
      setStatus('saved');
      return;
    }
    const timeout = setTimeout(async () => {
      busy.current = true;
      setStatus('saving');
      try {
        await saveRoundAnswers(code, JSON.parse(snapshot) as RoundAnswers);
        lastSaved.current = snapshot;
        retryDelay.current = 800;
        if (mounted.current) setStatus('saved');
      } catch {
        retryDelay.current = 3_000;
        if (mounted.current) setStatus('error');
      } finally {
        busy.current = false;
        if (mounted.current) setAttempt((value) => value + 1);
      }
    }, retryDelay.current);
    return () => clearTimeout(timeout);
  }, [code, enabled, snapshot, attempt]);

  function updateAnswer(category: string, value: string) {
    setStatus('pending');
    setAnswers((current) => ({ ...current, [category]: value }));
  }

  return {
    answers,
    updateAnswer,
    saveStatus:
      snapshot === lastSaved.current
        ? ('saved' as const)
        : status === 'saved'
          ? ('pending' as const)
          : status,
  };
}
