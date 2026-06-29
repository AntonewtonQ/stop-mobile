export const CATEGORY_OPTIONS = [
  'Nome',
  'País',
  'Comida',
  'Profissão',
  'Animal',
  'Cidade',
  'Música',
  'Filme',
] as const;

export const DEFAULT_CATEGORIES = ['Nome', 'País', 'Comida', 'Profissão', 'Animal'];

export const MIN_CATEGORIES = 3;
export const MAX_CATEGORIES = 10;
export const MIN_CATEGORY_LENGTH = 2;
export const MAX_CATEGORY_LENGTH = 24;

export const ROUND_DURATION_OPTIONS = [30, 45, 60, 90] as const;

export const PRESENCE_HEARTBEAT_INTERVAL = 10_000;
export const PRESENCE_OFFLINE_AFTER = 35_000;
export const PRESENCE_DISCONNECT_GRACE = PRESENCE_OFFLINE_AFTER;
export const ROOM_SYNC_ACTIVE_POLL_INTERVAL = 900;
export const ROOM_SYNC_LOBBY_POLL_INTERVAL = 2_500;
export const ROOM_SYNC_RESULTS_POLL_INTERVAL = 2_000;
export const ROOM_SYNC_POLL_INTERVAL = 20_000;
export const ROOM_SYNC_FALLBACK_POLL_INTERVAL = 3_000;
export const ROOM_SYNC_HIDDEN_POLL_INTERVAL = 45_000;
export const ROOM_REALTIME_STALE_AFTER = 40_000;

export const PLAYABLE_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'L',
  'M',
  'N',
  'O',
  'P',
  'R',
  'S',
  'T',
  'V',
];

export const MIN_ROUNDS_TO_PLAY = 1;
export const MAX_ROUNDS_TO_PLAY = PLAYABLE_LETTERS.length;

export function normalizeCategoryName(category: string) {
  const cleaned = category
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s'’._-]/gu, '')
    .trim()
    .replace(/\s+/g, ' ');

  return Array.from(cleaned).slice(0, MAX_CATEGORY_LENGTH).join('').trim();
}

export function normalizeCategoryKey(category: string) {
  return normalizeCategoryName(category)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-AO');
}

export function normalizeCategories(categories: readonly string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const category of categories) {
    const name = normalizeCategoryName(category);
    const key = normalizeCategoryKey(name);
    if (name.length < MIN_CATEGORY_LENGTH || seen.has(key)) continue;

    seen.add(key);
    normalized.push(name);
    if (normalized.length === MAX_CATEGORIES) break;
  }

  return normalized;
}

export function getSafeCategories(categories?: readonly string[]) {
  const normalized = normalizeCategories(categories ?? DEFAULT_CATEGORIES);
  return normalized.length >= MIN_CATEGORIES ? normalized : normalizeCategories(DEFAULT_CATEGORIES);
}
