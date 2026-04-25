/** 1-based page, pageSize > 0. Use pageSize <= 0 to mean “show all” (returns full array). */
export function computeTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1;
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function slicePage<T>(items: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return items;
  const totalPages = computeTotalPages(items.length, pageSize);
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/** Inclusive 1-based indices for “Showing X–Y of Z” */
export function visibleRange(
  page: number,
  pageSize: number,
  totalItems: number,
  sliceLength: number
): { from: number; to: number } {
  if (totalItems === 0 || sliceLength === 0) return { from: 0, to: 0 };
  const p = Math.max(1, page);
  const from = (p - 1) * pageSize + 1;
  const to = (p - 1) * pageSize + sliceLength;
  return { from, to: Math.min(to, totalItems) };
}

/** 1-based page numbers with gaps marked as "ellipsis" for compact numeric pagination. */
export function buildPageList(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  const cur = Math.min(Math.max(1, currentPage), totalPages);
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const near = new Set<number>([1, totalPages]);
  for (let i = cur - 2; i <= cur + 2; i++) {
    if (i >= 1 && i <= totalPages) near.add(i);
  }
  const sorted = [...near].sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - sorted[i - 1]! > 1) {
      out.push('ellipsis');
    }
    out.push(n);
  }
  return out;
}
