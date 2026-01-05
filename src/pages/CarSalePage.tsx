import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/useLanguage';
import { getFuelTypeKey, getGearboxKey } from '../lib/translationHelpers';
import { carsApi } from '../api/cars';
import { citiesApi } from '../api/cities';
import { 
  TruckIcon, 
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

export function CarSalePage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('');
  const [bodyFilter, setBodyFilter] = useState<string>('');
  const [gearboxFilter, setGearboxFilter] = useState<string>('');
  const [engineCapacityFilter, setEngineCapacityFilter] = useState<string>('');
  const [seatCountFilter, setSeatCountFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(3);

  // Auto-select city from URL params
  useEffect(() => {
    const cityIdParam = searchParams.get('cityId');
    if (cityIdParam) {
      setSelectedCity(cityIdParam);
    }
  }, [searchParams]);

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.getAll,
  });

  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars-for-sale', selectedCity],
    queryFn: () => carsApi.getAllForSale(selectedCity ? Number(selectedCity) : undefined),
  });

  const filteredAndSortedCars = cars?.filter((car) => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = !fuelFilter || car.fuelType === fuelFilter;
    const matchesBody = !bodyFilter || car.bodyType === bodyFilter;
    const matchesGearbox = !gearboxFilter || car.gearbox === gearboxFilter;
    const matchesEngine = !engineCapacityFilter || !car.engineCapacityL ||
      (engineCapacityFilter === '<1.5' && car.engineCapacityL < 1.5) ||
      (engineCapacityFilter === '1.5-2.0' && car.engineCapacityL >= 1.5 && car.engineCapacityL <= 2.0) ||
      (engineCapacityFilter === '2.0-3.0' && car.engineCapacityL > 2.0 && car.engineCapacityL <= 3.0) ||
      (engineCapacityFilter === '>3.0' && car.engineCapacityL > 3.0);
    const matchesSeats = !seatCountFilter || car.seatCount.toString() === seatCountFilter;

    return matchesSearch && matchesFuel && matchesBody && matchesGearbox && matchesEngine && matchesSeats;
  }).sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === 'priceAsc') return (a.salePrice || 0) - (b.salePrice || 0);
    if (sortBy === 'priceDesc') return (b.salePrice || 0) - (a.salePrice || 0);
    return 0;
  });

  const paginatedCars = useMemo(() => {
    if (!filteredAndSortedCars) return [];
    const carsPerRow = 3;
    const totalCars = rowsPerPage === -1 ? filteredAndSortedCars.length : rowsPerPage * carsPerRow;
    return filteredAndSortedCars.slice(0, totalCars);
  }, [filteredAndSortedCars, rowsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setFuelFilter('');
    setBodyFilter('');
    setGearboxFilter('');
    setEngineCapacityFilter('');
    setSeatCountFilter('');
    setSortBy('');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('carSaleCatalog')}</h1>
          <p className="text-gray-600">{t('findPerfectCarForSale')}</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold">{t('filters')}</h3>
            </div>
            {(searchTerm || selectedCity || fuelFilter || bodyFilter || gearboxFilter || engineCapacityFilter || seatCountFilter || sortBy) && (
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
          
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={[
                { value: '', label: t('allCities') },
                ...(cities?.map((city) => ({ value: city.id.toString(), label: city.name })) || []),
              ]}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: '', label: t('sortBy') },
                { value: 'priceAsc', label: t('salePriceAsc') },
                { value: 'priceDesc', label: t('salePriceDesc') },
              ]}
            />
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="mb-4"
          >
            {showAdvancedFilters ? (
              <><ChevronUpIcon className="h-4 w-4 mr-1" /> {t('hideAdvancedFilters')}</>
            ) : (
              <><ChevronDownIcon className="h-4 w-4 mr-1" /> {t('advancedFilters')}</>
            )}
          </Button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                options={[
                  { value: '', label: t('allFuel') },
                  { value: 'PETROL', label: t('petrol') },
                  { value: 'DIESEL', label: t('diesel') },
                  { value: 'ELECTRIC', label: t('electric') },
                  { value: 'HYBRID_HEV', label: t('hybridHev') },
                  { value: 'HYBRID_PHEV', label: t('hybridPhev') },
                ]}
              />
              <Select
                value={bodyFilter}
                onChange={(e) => setBodyFilter(e.target.value)}
                options={[
                  { value: '', label: t('allBodies') },
                  { value: 'SEDAN', label: t('sedan') },
                  { value: 'HATCHBACK', label: t('hatchback') },
                  { value: 'SUV', label: t('suv') },
                  { value: 'WAGON', label: t('wagon') },
                  { value: 'COUPE', label: t('coupe') },
                  { value: 'CONVERTIBLE', label: t('convertible') },
                  { value: 'VAN', label: t('van') },
                  { value: 'PICKUP', label: t('pickup') },
                ]}
              />
              <Select
                value={gearboxFilter}
                onChange={(e) => setGearboxFilter(e.target.value)}
                options={[
                  { value: '', label: t('allGearboxes') },
                  { value: 'MANUAL', label: t('manual') },
                  { value: 'AUTOMATIC', label: t('automatic') },
                ]}
              />
              <Select
                value={engineCapacityFilter}
                onChange={(e) => setEngineCapacityFilter(e.target.value)}
                options={[
                  { value: '', label: t('allEngineCapacities') },
                  { value: '<1.5', label: t('engineUnder1_5') },
                  { value: '1.5-2.0', label: t('engine1_5to2_0') },
                  { value: '2.0-3.0', label: t('engine2_0to3_0') },
                  { value: '>3.0', label: t('engineOver3_0') },
                ]}
              />
              <Select
                value={seatCountFilter}
                onChange={(e) => setSeatCountFilter(e.target.value)}
                options={[
                  { value: '', label: t('allSeats') },
                  { value: '2', label: t('2seats') },
                  { value: '4', label: t('4seats') },
                  { value: '5', label: t('5seats') },
                  { value: '7', label: t('7seats') },
                  { value: '9', label: t('9seats') },
                ]}
              />
            </div>
          )}
          
          {/* Rows per page selector */}
          <div className="flex items-center gap-2 mt-4">
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
        ) : filteredAndSortedCars && filteredAndSortedCars.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              {t('carsFound')}: {paginatedCars.length} / {filteredAndSortedCars.length}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCars.map((car) => {
                const mainImage = car.images?.find(img => img.isMain);
                const cityName = cities?.find(c => c.id === car.cityId)?.name || '';

                return (
                  <Link key={car.id} to={`/car-sale/${car.id}`} className="block">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      {mainImage ? (
                        <img 
                          src={mainImage.url} 
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <TruckIcon className="h-16 w-16 text-gray-400" />
                      )}
                      {car.availableForLease && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          {t('alsoForLease')}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 mb-1">
                            {car.make} {car.model}
                          </h3>
                          <p className="text-sm text-gray-600">{car.year} {t('year')}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            €{car.salePrice?.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>{t('fuelType')}:</span>
                          <span className="font-medium">{t(getFuelTypeKey(car.fuelType) as any)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t('gearboxType')}:</span>
                          <span className="font-medium">{t(getGearboxKey(car.gearbox) as any)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t('power')}:</span>
                          <span className="font-medium">{car.powerKW} {t('kw')}</span>
                        </div>
                        {car.engineCapacityL && (
                          <div className="flex items-center justify-between">
                            <span>{t('engineCapacity')}:</span>
                            <span className="font-medium">{car.engineCapacityL}L</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>{t('seats')}:</span>
                          <span className="font-medium">{car.seatCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t('mileageLabel')}:</span>
                          <span className="font-medium">{car.odometerKm.toLocaleString()} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t('location')}:</span>
                          <span className="font-medium">{cityName}</span>
                        </div>
                      </div>

                      {car.saleDescription && (
                        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700 line-clamp-3">
                          {car.saleDescription}
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <Button variant="primary" size="sm" className="w-full">
                          {t('viewDetails')}
                        </Button>
                      </div>
                    </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">{t('noCarsFound')}</p>
            <Button variant="ghost" onClick={handleResetFilters}>
              {t('resetFilters')}
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
}
