import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_THEME_ID,
  THEME_IDS,
  type ThemeId,
  type ThemePalette,
  themePalettes,
} from './tokens';

const THEME_STORAGE_KEY = 'jogastop:theme';

type ThemeContextValue = {
  colors: ThemePalette;
  isReady: boolean;
  setThemeId: (themeId: ThemeId) => Promise<void>;
  themeId: ThemeId;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.includes(value as ThemeId);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (mounted && isThemeId(value)) setThemeIdState(value);
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: themePalettes[themeId],
      isReady,
      setThemeId: async (nextThemeId) => {
        setThemeIdState(nextThemeId);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, nextThemeId);
      },
      themeId,
    }),
    [isReady, themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
