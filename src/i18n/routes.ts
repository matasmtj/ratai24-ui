import type { Language } from './translations';

export const SUPPORTED_LANGS: Language[] = ['lt', 'en', 'ru'];
export const DEFAULT_LANG: Language = 'lt';

export function isSupportedLang(value: string | undefined): value is Language {
  return SUPPORTED_LANGS.includes(value as Language);
}

/** Build a locale-prefixed path, e.g. localizedPath('lt', '/rent-cars') => '/lt/rent-cars' */
export function localizedPath(lang: Language, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `/${lang}`;
  return `/${lang}${normalized}`;
}

export function stripLangPrefix(pathname: string): { lang: Language | null; pathWithoutLang: string } {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { lang: null, pathWithoutLang: '/' };
  }
  const first = segments[0];
  if (isSupportedLang(first)) {
    const rest = segments.slice(1);
    return {
      lang: first,
      pathWithoutLang: rest.length === 0 ? '/' : `/${rest.join('/')}`,
    };
  }
  return { lang: null, pathWithoutLang: pathname };
}

export function switchLangPath(currentPathname: string, newLang: Language): string {
  const { pathWithoutLang } = stripLangPrefix(currentPathname);
  return localizedPath(newLang, pathWithoutLang);
}

/** Safe internal redirect target — prevents open redirects */
export function isSafeInternalPath(path: string | undefined | null): path is string {
  if (!path || typeof path !== 'string') return false;
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  return true;
}
