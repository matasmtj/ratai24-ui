import type { Car } from '../types/api';

function byPopularity(a: Car, b: Car): number {
  const ua = a.utilizationRate ?? 0;
  const ub = b.utilizationRate ?? 0;
  if (ub !== ua) return ub - ua;
  return a.id - b.id;
}

/** Public lease catalog (rent) */
export function compareCarsLeaseCatalog(a: Car, b: Car, sortBy: string): number {
  switch (sortBy) {
    case 'priceAsc':
      return a.pricePerDay - b.pricePerDay;
    case 'priceDesc':
      return b.pricePerDay - a.pricePerDay;
    case 'yearAsc':
      return a.year - b.year;
    case 'yearDesc':
      return b.year - a.year;
    case 'popularityDesc':
      return byPopularity(a, b);
    default:
      return 0;
  }
}

/** Public sale catalog */
export function compareCarsSaleCatalog(a: Car, b: Car, sortBy: string): number {
  switch (sortBy) {
    case 'priceAsc':
      return (a.salePrice || 0) - (b.salePrice || 0);
    case 'priceDesc':
      return (b.salePrice || 0) - (a.salePrice || 0);
    case 'yearAsc':
      return a.year - b.year;
    case 'yearDesc':
      return b.year - a.year;
    case 'popularityDesc':
      return byPopularity(a, b);
    default:
      return 0;
  }
}
