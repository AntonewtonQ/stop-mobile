import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { dictionaries, type Locale, type TranslationKey } from './dictionaries';

const LANGUAGE_STORAGE_KEY = 'jogastop:language';

type TranslationParams = Record<string, string | number>;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  category: (name: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return value === 'pt' || value === 'en' || value === 'fr';
}

function interpolate(value: string, params?: TranslationParams) {
  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>('pt');

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((value) => {
      if (mounted && isLocale(value)) setLocaleState(value);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: async (nextLocale) => {
        setLocaleState(nextLocale);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
      },
      t: (key, params) => interpolate(dictionaries[locale][key] ?? dictionaries.pt[key], params),
      category: (name) => dictionaries[locale][`category.${name}` as TranslationKey] ?? name,
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
