import { useState, useMemo } from 'react';
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
import { partsApi } from '../api/parts';
import { carMakes, carModels } from '../data/carData';
import { partYears } from '../data/partData';
import { 
  WrenchScrewdriverIcon, 
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

export function PartsPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [makeFilter, setMakeFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(3);

  const { data: parts, isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsApi.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['part-categories'],
    queryFn: partsApi.getAllCategories,
  });

  // Filter available models based on selected make
  const availableModels = useMemo(() => {
    if (!makeFilter) return [];
    return carModels[makeFilter] || [];
  }, [makeFilter]);

  // Reset model when make changes
  useMemo(() => {
    if (makeFilter && !availableModels.includes(modelFilter)) {
      setModelFilter('');
    }
  }, [makeFilter, modelFilter, availableModels]);

  const filteredAndSortedParts = useMemo(() => {
    if (!parts) return [];

    return parts
      .filter((part) => {
        const matchesSearch = 
          part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesMake = !makeFilter || part.make === makeFilter;
        const matchesModel = !modelFilter || part.model === modelFilter;
        const matchesYear = !yearFilter || part.year.toString() === yearFilter;
        const matchesCondition = !conditionFilter || part.condition === conditionFilter;
        const matchesCategory = !categoryFilter || (part.categoryId && part.categoryId.toString() === categoryFilter);
        const matchesActive = part.isActive !== false && (part.quantity || 0) > 0;

        return matchesSearch && matchesMake && matchesModel && matchesYear && matchesCondition && matchesCategory && matchesActive;
      })
      .sort((a, b) => {
        if (!sortBy) return 0;
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
        if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
        if (sortBy === 'yearDesc') return b.year - a.year;
        if (sortBy === 'yearAsc') return a.year - b.year;
        return 0;
      });
  }, [parts, searchTerm, makeFilter, modelFilter, yearFilter, conditionFilter, categoryFilter, sortBy]);

  const paginatedParts = useMemo(() => {
    const partsPerRow = 3;
    const totalParts = rowsPerPage === -1 ? filteredAndSortedParts.length : rowsPerPage * partsPerRow;
    return filteredAndSortedParts.slice(0, totalParts);
  }, [filteredAndSortedParts, rowsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMakeFilter('');
    setModelFilter('');
    setYearFilter('');
    setConditionFilter('');
    setCategoryFilter('');
    setSortBy('');
  };

  const hasActiveFilters = searchTerm || makeFilter || modelFilter || yearFilter || conditionFilter || categoryFilter || sortBy;

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return 'bg-green-100 text-green-800';
      case 'REFURBISHED':
        return 'bg-blue-100 text-blue-800';
      case 'USED_GOOD':
        return 'bg-yellow-100 text-yellow-800';
      case 'USED_FAIR':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return t('partConditionNew');
      case 'REFURBISHED':
        return t('partConditionRefurbished');
      case 'USED_GOOD':
        return t('partConditionUsedGood');
      case 'USED_FAIR':
        return t('partConditionUsedFair');
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

        {/* Filters */}
        <Card className="p-6 mb-8">
          {/* Always Visible: Search and Sort */}
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

          {/* Toggle Advanced Filters Button */}
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                {t('resetFilters')}
              </Button>
            )}
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <SearchableSelect
                label={t('manufacturer')}
                value={makeFilter}
                onChange={(value) => setMakeFilter(typeof value === 'string' ? value : value[0] || '')}
                options={[
                  { value: '', label: t('allMakes') },
                  ...carMakes.map((make) => ({ value: make, label: make })),
                ]}
                placeholder={t('selectMake')}
              />
              <SearchableSelect
                label={t('model')}
                value={modelFilter}
                onChange={(value) => setModelFilter(typeof value === 'string' ? value : value[0] || '')}
                options={[
                  { value: '', label: t('allModels') },
                  ...availableModels.map((model) => ({ value: model, label: model })),
                ]}
                placeholder={t('selectModel')}
                disabled={!makeFilter}
              />
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                options={[
                  { value: '', label: t('allYears') },
                  ...partYears.map((year) => ({ value: year.toString(), label: year.toString() })),
                ]}
              />
              <Select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                options={[
                  { value: '', label: t('allConditions') },
                  { value: 'NEW', label: t('partConditionNew') },
                  { value: 'REFURBISHED', label: t('partConditionRefurbished') },
                  { value: 'USED_GOOD', label: t('partConditionUsedGood') },
                  { value: 'USED_FAIR', label: t('partConditionUsedFair') },
                ]}
              />
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: '', label: t('allCategories') },
                  ...(categories?.map((cat) => ({ 
                    value: cat.id.toString(), 
                    label: t('locale') === 'lt' ? cat.nameLt : cat.nameEn 
                  })) || []),
                ]}
              />
            </div>
          )}
          
          {/* Rows per page selector */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('rowsPerPage')}:</label>
            <div className="w-20">
              <Select
                value={rowsPerPage.toString()}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                options={[
                  { value: '3', label: '3' },
                  { value: '7', label: '7' },
                  { value: '17', label: '17' },
                  { value: '-1', label: t('all') },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAndSortedParts && filteredAndSortedParts.length > 0 ? (
          <>
            <div className="mb-6 text-gray-600">
              {t('showingXofY')
                .replace('{current}', paginatedParts.length.toString())
                .replace('{total}', filteredAndSortedParts.length.toString())}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedParts.map((part) => {
                const mainImage = part.images?.find(img => img.isMain);
                
                return (
                <Link key={part.id} to={`/parts/${part.id}`} className="block">
                  <Card hover className="overflow-hidden h-full">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      {mainImage ? (
                        <img 
                          src={mainImage.url} 
                          alt={part.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <WrenchScrewdriverIcon className="h-24 w-24 text-gray-400" />
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getConditionBadgeColor(part.condition)}`}>
                        {getConditionLabel(part.condition)}
                      </div>
                      {part.quantity <= 3 && part.quantity > 0 && (
                        <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                          {t('onlyXLeft').replace('{count}', part.quantity.toString())}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold line-clamp-2">
                          {part.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-1">{part.make} {part.model}</p>
                      <p className="text-gray-500 text-sm mb-4">{part.year} {t('year')}</p>
                      
                      {part.partNumber && (
                        <div className="text-sm text-gray-600 mb-4">
                          {t('partNumber')}: {part.partNumber}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                          <div className="text-sm text-gray-500">{t('price')}</div>
                          <div className="text-2xl font-bold text-primary-600">
                            €{part.price.toFixed(2)}
                          </div>
                        </div>
                        <Button size="sm">{t('view')}</Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              )})}
            </div>
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
