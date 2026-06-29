export const colors = {
  petroleum: '#0F2D3D',
  petroleumSoft: '#173E52',
  amber: '#F0B24A',
  amberLight: '#FFC35B',
  amberDeep: '#C9810F',
  warmWhite: '#F4F2EC',
  background: '#FFFEFA',
  surface: '#FFFFFF',
  muted: '#637784',
  border: 'rgba(15, 45, 61, 0.12)',
  danger: '#B84A4A',
  success: '#2E8B71',
};

export const themePalettes = {
  classic: colors,
  atlantic: {
    ...colors,
    petroleum: '#06384B',
    petroleumSoft: '#0B5268',
    amber: '#27B8AA',
    amberLight: '#4FD0C2',
    amberDeep: '#138B81',
    warmWhite: '#EAF6F4',
    background: '#F8FFFE',
    muted: '#587B82',
  },
  kizomba: {
    ...colors,
    petroleum: '#4B2435',
    petroleumSoft: '#663148',
    amber: '#EF8453',
    amberLight: '#FFA477',
    amberDeep: '#C65B35',
    warmWhite: '#F8EEE9',
    background: '#FFFAF7',
    muted: '#816B75',
  },
  neon: {
    ...colors,
    petroleum: '#29264E',
    petroleumSoft: '#3B3768',
    amber: '#9B80F7',
    amberLight: '#B5A0FF',
    amberDeep: '#7055D2',
    warmWhite: '#F0EEF9',
    background: '#FBFAFF',
    muted: '#716E8D',
  },
};

export const THEME_IDS = ['classic', 'atlantic', 'kizomba', 'neon'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = 'classic';

export const themeLabels: Record<ThemeId, string> = {
  classic: 'Classico',
  atlantic: 'Atlantico',
  kizomba: 'Kizomba',
  neon: 'Neon',
};

export type ThemePalette = typeof colors;

export const spacing = {
  screen: 20,
  radius: 16,
};
