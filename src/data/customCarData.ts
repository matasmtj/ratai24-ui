import { carMakes, carModels } from './carData';

const STORAGE_KEY = 'ratai24_custom_car_data';

interface CustomCarData {
  makes: string[];
  models: Record<string, string[]>;
}

function loadCustom(): CustomCarData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CustomCarData;
      return {
        makes: Array.isArray(parsed.makes) ? parsed.makes : [],
        models: parsed.models && typeof parsed.models === 'object' ? parsed.models : {},
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return { makes: [], models: {} };
}

function saveCustom(data: CustomCarData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** All makes: built-in list plus user-added entries from localStorage. */
export function getAllMakes(): string[] {
  const custom = loadCustom();
  const merged = [...carMakes];
  for (const make of custom.makes) {
    if (make && !merged.includes(make)) merged.push(make);
  }
  return merged.sort((a, b) => a.localeCompare(b));
}

/** Models for a make: built-in plus user-added entries from localStorage. */
export function getModelsForMake(make: string): string[] {
  const trimmed = make.trim();
  if (!trimmed) return [];
  const fromStatic = carModels[trimmed] || [];
  const custom = loadCustom();
  const fromCustom = custom.models[trimmed] || [];
  const merged = [...fromStatic];
  for (const model of fromCustom) {
    if (model && !merged.includes(model)) merged.push(model);
  }
  return merged;
}

/** Persist a custom make/model so it appears in future dropdowns. */
export function registerMakeModel(make: string, model?: string) {
  const trimmedMake = make.trim();
  if (!trimmedMake) return;

  const custom = loadCustom();
  let changed = false;

  if (!carMakes.includes(trimmedMake) && !custom.makes.includes(trimmedMake)) {
    custom.makes.push(trimmedMake);
    changed = true;
  }

  const trimmedModel = model?.trim();
  if (trimmedModel) {
    if (!custom.models[trimmedMake]) {
      custom.models[trimmedMake] = [];
    }
    const staticModels = carModels[trimmedMake] || [];
    if (!staticModels.includes(trimmedModel) && !custom.models[trimmedMake].includes(trimmedModel)) {
      custom.models[trimmedMake].push(trimmedModel);
      changed = true;
    }
  }

  if (changed) saveCustom(custom);
}
