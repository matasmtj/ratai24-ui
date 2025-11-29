import type { FuelType, BodyType, Gearbox } from '../types/api';

export function getFuelTypeKey(fuelType: FuelType): string {
  const map: Record<FuelType, string> = {
    PETROL: 'petrol',
    DIESEL: 'diesel',
    ELECTRIC: 'electric',
    HYBRID_HEV: 'hybridHev',
    HYBRID_PHEV: 'hybridPhev',
  };
  return map[fuelType] || fuelType;
}

export function getBodyTypeKey(bodyType: BodyType): string {
  const map: Record<BodyType, string> = {
    SEDAN: 'sedan',
    HATCHBACK: 'hatchback',
    SUV: 'suv',
    WAGON: 'wagon',
    COUPE: 'coupe',
    CONVERTIBLE: 'convertible',
    VAN: 'van',
    PICKUP: 'pickup',
  };
  return map[bodyType] || bodyType;
}

export function getGearboxKey(gearbox: Gearbox): string {
  const map: Record<Gearbox, string> = {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
  };
  return map[gearbox] || gearbox;
}
