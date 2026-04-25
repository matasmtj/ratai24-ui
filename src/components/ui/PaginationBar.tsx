import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Button } from './Button';
import { useLanguage } from '../../contexts/useLanguage';
import { buildPageList, computeTotalPages } from '../../lib/pagination';

export interface PaginationBarProps {
  /** 1-based */
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

export function PaginationBar({ page, pageSize, totalItems, onPageChange, className }: PaginationBarProps) {
  const { t } = useLanguage();
  if (pageSize <= 0 || totalItems === 0) return null;
  const totalPages = computeTotalPages(totalItems, pageSize);
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = buildPageList(safePage, totalPages);

  return (
    <div
      className={clsx('flex flex-col items-stretch sm:items-center gap-2 py-2', className)}
      role="navigation"
      aria-label={t('common.paginationNav')}
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="inline-flex items-center gap-1"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          {t('common.paginationPrev')}
        </Button>
        <div className="flex flex-wrap items-center justify-center gap-1">
          {pageItems.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`e-${idx}`} className="px-0.5 text-gray-500 select-none" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={clsx(
                  'min-w-[2.25rem] rounded-md border px-2 py-1.5 text-sm font-medium tabular-nums transition-colors',
                  item === safePage
                    ? 'border-primary-600 bg-primary-50 text-primary-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                )}
                aria-current={item === safePage ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="inline-flex items-center gap-1"
        >
          {t('common.paginationNext')}
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <span className="text-center text-sm text-gray-600 tabular-nums">
        {t('common.paginationPageOf')
          .replace('{page}', String(safePage))
          .replace('{totalPages}', String(totalPages))}
      </span>
    </div>
  );
}
