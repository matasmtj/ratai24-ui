import type { LegalPageContentData } from '../types/api';
import defaultsJson from './legal-page-defaults.json';

type Lang = 'lt' | 'en' | 'ru';
type PageKey = 'privacy-policy' | 'rental-terms';

const defaults = defaultsJson as Record<PageKey, Record<Lang, LegalPageContentData>>;

export function getLegalPageDefaults(pageKey: PageKey, language: Lang): LegalPageContentData {
  return defaults[pageKey][language];
}

export function getAllLegalPageDefaults(): typeof defaults {
  return defaults;
}
