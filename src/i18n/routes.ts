import type { Language } from './translations';
import { localizePathSegments, resolveRouteKeyFromSlug, getRouteSlug } from './routeSlugs';

export const SUPPORTED_LANGS: Language[] = ['lt', 'en', 'ru'];
export const DEFAULT_LANG: Language = 'lt';

export function isSupportedLang(value: string | undefined): value is Language {
  return SUPPORTED_LANGS.includes(value as Language);
}

/** Build a locale-prefixed path with localized slug, e.g. localizedPath('lt', '/parts') => '/lt/dalys' */
export function localizedPath(lang: Language, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `/${lang}`;

  const [pathPart, ...queryParts] = normalized.split('?');
  const query = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';

  const segments = pathPart.split('/').filter(Boolean);
  const routeKey = resolveRouteKeyFromSlug(segments[0]);
  const slug = routeKey ? getRouteSlug(routeKey, lang) : segments[0];
  const rest = segments.slice(1);

  return `/${lang}/${[slug, ...rest].join('/')}${query}`;
}

export function stripLangPrefix(pathname: string): { lang: Language | null; pathWithoutLang: string } {
  const [pathOnly, query = ''] = pathname.split('?');
  const segments = pathOnly.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { lang: null, pathWithoutLang: query ? `/?${query}` : '/' };
  }
  const first = segments[0];
  if (isSupportedLang(first)) {
    const rest = segments.slice(1);
    const base = rest.length === 0 ? '/' : `/${rest.join('/')}`;
    return {
      lang: first,
      pathWithoutLang: query ? `${base}?${query}` : base,
    };
  }
  return { lang: null, pathWithoutLang: pathname };
}

export function switchLangPath(currentPathname: string, newLang: Language): string {
  const { pathWithoutLang } = stripLangPrefix(currentPathname);
  return localizePathSegments(newLang, pathWithoutLang);
}

/** If URL uses a non-preferred slug for the language, return the canonical localized path. */
export function getCanonicalRedirectPath(lang: Language, pathWithoutLang: string): string | null {
  const [pathPart] = pathWithoutLang.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const routeKey = resolveRouteKeyFromSlug(segments[0]);
  if (!routeKey) return null;

  const preferred = getRouteSlug(routeKey, lang);
  if (segments[0] === preferred) return null;

  const rest = segments.slice(1).join('/');
  const suffix = pathWithoutLang.includes('?') ? pathWithoutLang.slice(pathWithoutLang.indexOf('?')) : '';
  return `/${lang}/${preferred}${rest ? `/${rest}` : ''}${suffix}`;
}

/** Safe internal redirect target — prevents open redirects */
export function isSafeInternalPath(path: string | undefined | null): path is string {
  if (!path || typeof path !== 'string') return false;
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  return true;
}
