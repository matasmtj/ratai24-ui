import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { getFuelTypeKey, getGearboxKey } from '../lib/translationHelpers';
import { carsApi } from '../api/cars';
import { citiesApi } from '../api/cities';
import { 
  TruckIcon, 
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export function CarsPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('');
  const [bodyFilter, setBodyFilter] = useState<string>('');
  const [gearboxFilter, setGearboxFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');

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
    queryKey: ['cars', selectedCity],
    queryFn: () => carsApi.getAll(selectedCity ? Number(selectedCity) : undefined),
  });

  const filteredAndSortedCars = cars?.filter((car) => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = !fuelFilter || car.fuelType === fuelFilter;
    const matchesBody = !bodyFilter || car.bodyType === bodyFilter;
    const matchesGearbox = !gearboxFilter || car.gearbox === gearboxFilter;
    const matchesAvailable = car.state === 'AVAILABLE';

    return matchesSearch && matchesFuel && matchesBody && matchesGearbox && matchesAvailable;
  }).sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === 'priceAsc') return a.pricePerDay - b.pricePerDay;
    if (sortBy === 'priceDesc') return b.pricePerDay - a.pricePerDay;
    return 0;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setFuelFilter('');
    setBodyFilter('');
    setGearboxFilter('');
    setSortBy('');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('carCatalog')}</h1>
          <p className="text-gray-600">{t('findPerfectCar')}</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold">{t('filters')}</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              {t('resetFilters')}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: '', label: t('sortBy') },
                { value: 'priceAsc', label: t('priceAsc') },
                { value: 'priceDesc', label: t('priceDesc') },
              ]}
            />
          </div>
        </Card>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAndSortedCars && filteredAndSortedCars.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              {t('carsFound')}: {filteredAndSortedCars.length}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCars.map((car) => (
                <Card key={car.id} hover className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <TruckIcon className="h-24 w-24 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">
                        {car.make} {car.model}
                      </h3>
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                        {t('available')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{car.year} {t('year')}</p>
                    
                    <div className="space-y-1 mb-4 text-sm text-gray-600">
                      <div>{t(getFuelTypeKey(car.fuelType) as any)}</div>
                      <div>{t(getGearboxKey(car.gearbox) as any)}</div>
                      <div>{car.powerKW} {t('kw')}</div>
                      <div>{car.seatCount} {t('seats')}</div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-500">{t('pricePerDay')}</div>
                        <div className="text-2xl font-bold text-primary-600">
                          €{car.pricePerDay}
                        </div>
                      </div>
                      <Link to={`/cars/${car.id}`}>
                        <Button size="sm">{t('view')}</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t('noCarsFound')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
