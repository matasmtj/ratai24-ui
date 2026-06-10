import { useLanguage } from '../contexts/useLanguage';
import { localizedPath } from '../i18n/routes';
import type { Language } from '../i18n/translations';

export function useLocalizedPath() {
  const { language } = useLanguage();
  return (path: string, lang?: Language) => localizedPath(lang ?? language, path);
}

