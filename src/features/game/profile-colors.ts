export const PROFILE_COLORS = [
  { id: 'petroleum', value: '#0F2D3D' },
  { id: 'amber', value: '#F0B24A' },
  { id: 'steel', value: '#5A8293' },
  { id: 'coral', value: '#D96C4D' },
  { id: 'violet', value: '#6C63A8' },
  { id: 'green', value: '#2E8B71' },
  { id: 'rose', value: '#C85C83' },
  { id: 'cyan', value: '#238DA5' },
  { id: 'red', value: '#B84A4A' },
  { id: 'brown', value: '#845B42' },
] as const;

export type ProfileColor = (typeof PROFILE_COLORS)[number]['value'];

export const DEFAULT_PROFILE_COLOR: ProfileColor = PROFILE_COLORS[0].value;
export const PROFILE_COLOR_VALUES = PROFILE_COLORS.map((color) => color.value) as ProfileColor[];

export function isProfileColor(value: unknown): value is ProfileColor {
  return typeof value === 'string' && PROFILE_COLOR_VALUES.includes(value as ProfileColor);
}
