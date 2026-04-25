import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * After pagination `page` changes, scrolls the list anchor into view.
 * Skips the first run (initial mount) so the page does not jump on load.
 */
export function useScrollToTopOnPageChange(
  page: number,
  anchorRef: RefObject<HTMLElement | null>
): void {
  const isFirst = useRef(true);
  useLayoutEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page, anchorRef]);
}
