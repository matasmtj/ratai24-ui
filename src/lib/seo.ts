import type { PublicRouteKey } from '../i18n/routeSlugs';

const SEO_KEYS: Record<PublicRouteKey | 'home', { title: string; description: string }> = {
  home: { title: 'seoHomeTitle', description: 'seoHomeDescription' },
  'rent-cars': { title: 'seoRentCarsTitle', description: 'seoRentCarsDescription' },
  'sale-cars': { title: 'seoSaleCarsTitle', description: 'seoSaleCarsDescription' },
  contacts: { title: 'seoContactsTitle', description: 'seoContactsDescription' },
  'privacy-policy': { title: 'seoPrivacyTitle', description: 'seoPrivacyDescription' },
  'rental-terms': { title: 'seoRentalTermsTitle', description: 'seoRentalTermsDescription' },
};

export function getSeoTranslationKeys(routeKey: PublicRouteKey | null) {
  return SEO_KEYS[routeKey ?? 'home'];
}
