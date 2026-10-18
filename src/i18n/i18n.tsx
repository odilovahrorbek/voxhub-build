import React, { createContext, useContext, useState, useEffect } from 'react';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

export type LanguageCode = 'uz' | 'ru' | 'en';
export type FontScaleMode = 'small' | 'standard' | 'large';

const translations: Record<LanguageCode, typeof uz> = {
  uz,
  ru,
  en,
};

interface I18nContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  fontScale: FontScaleMode;
  setFontScale: (scale: FontScaleMode) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('vox_hub_lang') as LanguageCode;
    return saved && ['uz', 'ru', 'en'].includes(saved) ? saved : 'uz';
  });

  const [fontScale, setFontScaleState] = useState<FontScaleMode>(() => {
    const saved = localStorage.getItem('vox_hub_font_scale') as FontScaleMode;
    return saved && ['small', 'standard', 'large'].includes(saved) ? saved : 'standard';
  });

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem('vox_hub_lang', newLang);
    document.documentElement.lang = newLang;
  };

  const setFontScale = (scale: FontScaleMode) => {
    setFontScaleState(scale);
    localStorage.setItem('vox_hub_font_scale', scale);
    const scaleMap: Record<FontScaleMode, string> = {
      small: '0.92',
      standard: '1',
      large: '1.1',
    };
    document.documentElement.style.setProperty('--vox-font-scale', scaleMap[scale]);
  };

  useEffect(() => {
    const scaleMap: Record<FontScaleMode, string> = {
      small: '0.92',
      standard: '1',
      large: '1.1',
    };
    document.documentElement.style.setProperty('--vox-font-scale', scaleMap[fontScale]);
    document.documentElement.lang = lang;
  }, [fontScale, lang]);

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current: unknown = translations[lang] || translations.uz;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k];
      } else {
        return path;
      }
    }
    let result = typeof current === 'string' ? current : path;
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
      }
    }
    return result;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, fontScale, setFontScale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
