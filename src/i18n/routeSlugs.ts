import type { Language } from './translations';

/** Internal canonical route keys used in code (lp('/parts'), etc.) */
export const PUBLIC_ROUTES = [
  'rent-cars',
  'sale-cars',
  'parts',
  'contacts',
  'privacy-policy',
  'rental-terms',
] as const;

export type PublicRouteKey = (typeof PUBLIC_ROUTES)[number];

/** Localized URL segment per language (Latin script for RU). */
export const ROUTE_SLUGS: Record<PublicRouteKey, Record<Language, string>> = {
  'rent-cars': {
    lt: 'nuomoti-automobilius',
    en: 'rent-cars',
    ru: 'arenda-avto',
  },
  'sale-cars': {
    lt: 'parduodami-automobiliai',
    en: 'sale-cars',
    ru: 'prodazha-avto',
  },
  parts: {
    lt: 'dalys',
    en: 'parts',
    ru: 'zapchasti',
  },
  contacts: {
    lt: 'kontaktai',
    en: 'contacts',
    ru: 'kontakty',
  },
  'privacy-policy': {
    lt: 'privatumo-politika',
    en: 'privacy-policy',
    ru: 'politika-konfidencialnosti',
  },
  'rental-terms': {
    lt: 'nuomos-salygos',
    en: 'rental-terms',
    ru: 'usloviya-arendy',
  },
};

const slugToRouteKey = new Map<string, PublicRouteKey>();

for (const routeKey of PUBLIC_ROUTES) {
  for (const lang of ['lt', 'en', 'ru'] as Language[]) {
    slugToRouteKey.set(ROUTE_SLUGS[routeKey][lang], routeKey);
  }
  // Also map canonical key itself (legacy English-style paths)
  slugToRouteKey.set(routeKey, routeKey);
}

export function isPublicRouteKey(value: string): value is PublicRouteKey {
  return (PUBLIC_ROUTES as readonly string[]).includes(value);
}

export function getRouteSlug(routeKey: PublicRouteKey, lang: Language): string {
  return ROUTE_SLUGS[routeKey][lang];
}

/** Resolve any localized (or legacy) slug to canonical route key. */
export function resolveRouteKeyFromSlug(slug: string): PublicRouteKey | null {
  return slugToRouteKey.get(slug) ?? null;
}

/** All unique URL slugs that should render a given route. */
export function getAllSlugsForRoute(routeKey: PublicRouteKey): string[] {
  const slugs = new Set<string>([
    routeKey,
    ROUTE_SLUGS[routeKey].lt,
    ROUTE_SLUGS[routeKey].en,
    ROUTE_SLUGS[routeKey].ru,
  ]);
  return [...slugs];
}

export function localizePathSegments(lang: Language, pathWithoutLang: string): string {
  if (!pathWithoutLang || pathWithoutLang === '/') {
    return `/${lang}`;
  }

  const [pathPart, ...queryParts] = pathWithoutLang.split('?');
  const query = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';

  const segments = pathPart.split('/').filter(Boolean);
  if (segments.length === 0) {
    return `/${lang}${query}`;
  }

  const routeKey = resolveRouteKeyFromSlug(segments[0]);
  const localizedFirst = routeKey ? getRouteSlug(routeKey, lang) : segments[0];
  const rest = segments.slice(1);

  return `/${lang}/${[localizedFirst, ...rest].join('/')}${query}`;
}
