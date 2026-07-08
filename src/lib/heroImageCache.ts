const HERO_IMAGE_CACHE_KEY = 'ratai24.heroImageUrl';

export function getCachedHeroImageUrl(): string | null {
  try {
    return localStorage.getItem(HERO_IMAGE_CACHE_KEY);
  } catch {
    return null;
  }
}

export function setCachedHeroImageUrl(url: string | null): void {
  try {
    if (url) {
      localStorage.setItem(HERO_IMAGE_CACHE_KEY, url);
    } else {
      localStorage.removeItem(HERO_IMAGE_CACHE_KEY);
    }
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}
