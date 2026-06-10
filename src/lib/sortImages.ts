export interface OrderedImage {
  id: number;
  order?: number;
  createdAt?: string;
}

/** Gallery display order — matches backend IMAGE_DISPLAY_ORDER. */
export function sortImagesByOrder<T extends OrderedImage>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return a.id - b.id;
  });
}

export function reorderImageIds<T extends OrderedImage>(images: T[], fromIndex: number, toIndex: number): number[] {
  const sorted = sortImagesByOrder(images);
  if (fromIndex < 0 || fromIndex >= sorted.length || toIndex < 0 || toIndex >= sorted.length) {
    return sorted.map((img) => img.id);
  }
  const next = [...sorted];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((img) => img.id);
}
