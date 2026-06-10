import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { LoadingSpinner } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/useLanguage';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { partsApi } from '../api/parts';
import { getAllMakes, getModelsForMake } from '../data/customCarData';
import { partYears } from '../data/partData';
import { getFuelTypeKey, getGearboxKey } from '../lib/translationHelpers';
import {
  WrenchScrewdriverIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { PaginationBar } from '../components/ui/PaginationBar';
import { slicePage, visibleRange } from '../lib/pagination';
import { useScrollToTopOnPageChange } from '../hooks/useScrollToTopOnPageChange';

export function PartsPage() {
  const { t } = useLanguage();
  const lp = useLocalizedPath();
  const [searchTerm, setSearchTerm] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState(1);
  const listAnchorRef = useRef<HTMLDivElement>(null);

  const { data: parts, isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsApi.getAll(),
  });

  const makeFilterOptions = useMemo(() => {
    const fromParts = parts ? [...new Set(parts.map((p) => p.make).filter(Boolean))] : [];
    const merged = getAllMakes();
    for (const make of fromParts) {
      if (!merged.includes(make)) merged.push(make);
    }
    if (makeFilter && !merged.includes(makeFilter)) {
      return [makeFilter, ...merged];
    }
    return merged;
  }, [parts, makeFilter]);

  const modelFilterOptions = useMemo(() => {
    const fromData = makeFilter ? getModelsForMake(makeFilter) : [];
    const fromParts = parts
      ? [...new Set(
          parts
            .filter((p) => !makeFilter || p.make === makeFilter)
            .map((p) => p.model)
            .filter(Boolean)
        )]
      : [];
    const merged = [...fromData];
    for (const model of fromParts) {
      if (!merged.includes(model)) merged.push(model);
    }
    if (modelFilter && !merged.includes(modelFilter)) {
      return [modelFilter, ...merged];
    }
    return merged;
  }, [parts, makeFilter, modelFilter]);

  const filteredAndSortedParts = useMemo(() => {
    if (!parts) return [];

    return parts
      .filter((part) => {
        const matchesSearch =
          part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (part.oemNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesMake = !makeFilter || part.make === makeFilter;
        const matchesModel = !modelFilter || part.model === modelFilter;
        const matchesYear = !yearFilter || part.year.toString() === yearFilter;
        const matchesCondition = !conditionFilter || part.condition === conditionFilter;
        return matchesSearch && matchesMake && matchesModel && matchesYear && matchesCondition;
      })
      .sort((a, b) => {
        if (!sortBy) return 0;
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        if (sortBy === 'nameAsc') return a.partName.localeCompare(b.partName);
        if (sortBy === 'nameDesc') return b.partName.localeCompare(a.partName);
        if (sortBy === 'yearDesc') return b.year - a.year;
        if (sortBy === 'yearAsc') return a.year - b.year;
        return 0;
      });
  }, [parts, searchTerm, makeFilter, modelFilter, yearFilter, conditionFilter, sortBy]);

  const pageSize = rowsPerPage === -1 ? -1 : rowsPerPage;
  const list = filteredAndSortedParts;
  const paginatedParts = useMemo(() => slicePage(list, page, pageSize), [list, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, makeFilter, modelFilter, yearFilter, conditionFilter, sortBy, rowsPerPage]);

  useScrollToTopOnPageChange(page, listAnchorRef);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMakeFilter('');
    setModelFilter('');
    setYearFilter('');
    setConditionFilter('');
    setSortBy('');
  };

  const hasActiveFilters = searchTerm || makeFilter || modelFilter || yearFilter || conditionFilter || sortBy;

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return 'bg-green-100 text-green-800';
      case 'USED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DAMAGED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return t('partConditionNew');
      case 'USED':
        return t('partConditionUsed');
      case 'DAMAGED':
        return t('partConditionDamaged');
      default:
        return condition;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('partsMarketplace')}</h1>
          <p className="text-gray-600">{t('findPerfectPart')}</p>
        </div>

        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Input
                placeholder={t('searchParts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: '', label: t('sortBy') },
                { value: 'priceAsc', label: t('priceAsc') },
                { value: 'priceDesc', label: t('priceDesc') },
                { value: 'nameAsc', label: t('nameAsc') },
                { value: 'nameDesc', label: t('nameDesc') },
                { value: 'yearDesc', label: t('yearDesc') },
                { value: 'yearAsc', label: t('yearAsc') },
              ]}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {t('advancedFilters')}
              {showAdvancedFilters ? (
                <ChevronUpIcon className="h-5 w-5 ml-2" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 ml-2" />
              )}
            </button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <XMarkIcon className="h-4 w-4 mr-1" />
                {t('resetFilters')}
              </Button>
            )}
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <SearchableSelect
                label={t('carMake')}
                value={makeFilter}
                onChange={(value) => {
                  const next = typeof value === 'string' ? value : value[0] || '';
                  setMakeFilter(next);
                  if (next !== makeFilter) setModelFilter('');
                }}
                options={[
                  { value: '', label: t('allMakes') },
                  ...makeFilterOptions.map((make) => ({ value: make, label: make })),
                ]}
                placeholder={t('selectMake')}
                allowCustom
                customOptionLabel={t('common.comboboxUseCustom')}
              />
              <SearchableSelect
                label={t('model')}
                value={modelFilter}
                onChange={(value) => setModelFilter(typeof value === 'string' ? value : value[0] || '')}
                options={[
                  { value: '', label: t('allModels') },
                  ...modelFilterOptions.map((model) => ({ value: model, label: model })),
                ]}
                placeholder={t('selectModel')}
                allowCustom
                customOptionLabel={t('common.comboboxUseCustom')}
              />
              <Select
                label={t('yearField')}
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                options={[
                  { value: '', label: t('allYears') },
                  ...partYears.map((year) => ({ value: year.toString(), label: year.toString() })),
                ]}
              />
              <Select
                label={t('partConditionField')}
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                options={[
                  { value: '', label: t('allConditions') },
                  { value: 'NEW', label: t('partConditionNew') },
                  { value: 'USED', label: t('partConditionUsed') },
                  { value: 'DAMAGED', label: t('partConditionDamaged') },
                ]}
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('rowsPerPage')}:</label>
            <div className="w-20">
              <Select
                value={rowsPerPage.toString()}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                options={[
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                  { value: '-1', label: t('all') },
                ]}
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : list.length > 0 ? (
          <>
            <div ref={listAnchorRef} className="h-0" aria-hidden />
            <div className="mb-4 text-gray-600">
              {rowsPerPage === -1
                ? `${t('partsFound')}: ${paginatedParts.length} / ${list.length}`
                : (() => {
                    const { from, to } = visibleRange(page, pageSize, list.length, paginatedParts.length);
                    return t('showingRangeFromTo')
                      .replace('{from}', from ? String(from) : '0')
                      .replace('{to}', to ? String(to) : '0')
                      .replace('{total}', String(list.length));
                  })()}
            </div>
            <div className="space-y-3">
              {paginatedParts.map((part) => {
                const mainImage = part.images?.find((img) => img.isMain) || part.images?.[0];
                return (
                  <Link key={part.id} to={`${lp('/parts')}/${part.id}`} className="block">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex items-stretch gap-4 p-3 sm:p-4">
                        <div className="flex-shrink-0 w-28 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {mainImage ? (
                            <img
                              src={mainImage.url}
                              alt={part.partName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <WrenchScrewdriverIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{part.partName}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConditionBadgeColor(part.condition)}`}>
                                {getConditionLabel(part.condition)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span>{part.make} {part.model} ({part.year})</span>
                              {part.colour && <span>{t('colour')}: {part.colour}</span>}
                              {part.engineCapacityL && <span>{part.engineCapacityL}L</span>}
                              {part.gearbox && <span>{t(getGearboxKey(part.gearbox) as any)}</span>}
                              {part.fuelType && <span>{t(getFuelTypeKey(part.fuelType) as any)}</span>}
                              {part.oemNumber && <span>{t('partNumber')}: {part.oemNumber}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-xl font-bold text-primary-600">
                              €{Number(part.price).toFixed(2)}
                            </div>
                            <Button size="sm" variant="primary">{t('view')}</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {rowsPerPage !== -1 && (
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalItems={list.length}
                onPageChange={setPage}
                className="mt-4"
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t('noPartsFound')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
