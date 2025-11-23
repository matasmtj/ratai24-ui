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
import { carsApi } from '../api/cars';
import { citiesApi } from '../api/cities';
import type { FuelType } from '../types/api';
import { 
  TruckIcon, 
  FunnelIcon,
  BoltIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

export function CarsPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('');
  const [bodyFilter, setBodyFilter] = useState<string>('');
  const [gearboxFilter, setGearboxFilter] = useState<string>('');

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

  const filteredCars = cars?.filter((car) => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = !fuelFilter || car.fuelType === fuelFilter;
    const matchesBody = !bodyFilter || car.bodyType === bodyFilter;
    const matchesGearbox = !gearboxFilter || car.gearbox === gearboxFilter;
    const matchesAvailable = car.state === 'AVAILABLE';

    return matchesSearch && matchesFuel && matchesBody && matchesGearbox && matchesAvailable;
  });

  const getFuelIcon = (fuelType: FuelType) => {
    if (fuelType === 'ELECTRIC') return '⚡';
    if (fuelType.includes('HYBRID')) return '🔋';
    return '⛽';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automobilių katalogas</h1>
          <p className="text-gray-600">Raskite tobulą automobilį savo kelionei</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filtrai</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Paieška (make/model)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={[
                { value: '', label: 'Visi miestai' },
                ...(cities?.map((city) => ({ value: city.id.toString(), label: city.name })) || []),
              ]}
            />
            <Select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              options={[
                { value: '', label: 'Visas kuras' },
                { value: 'PETROL', label: 'Benzinas' },
                { value: 'DIESEL', label: 'Dyzelis' },
                { value: 'ELECTRIC', label: 'Elektrinis' },
                { value: 'HYBRID_HEV', label: 'Hibridas (HEV)' },
                { value: 'HYBRID_PHEV', label: 'Hibridas (PHEV)' },
              ]}
            />
            <Select
              value={bodyFilter}
              onChange={(e) => setBodyFilter(e.target.value)}
              options={[
                { value: '', label: 'Visi kėbulai' },
                { value: 'SEDAN', label: 'Sedanas' },
                { value: 'HATCHBACK', label: 'Hečbekas' },
                { value: 'SUV', label: 'SUV' },
                { value: 'WAGON', label: 'Universalas' },
                { value: 'COUPE', label: 'Kupė' },
                { value: 'CONVERTIBLE', label: 'Kabrioletas' },
                { value: 'VAN', label: 'Mikroautobusas' },
                { value: 'PICKUP', label: 'Pikapas' },
              ]}
            />
            <Select
              value={gearboxFilter}
              onChange={(e) => setGearboxFilter(e.target.value)}
              options={[
                { value: '', label: 'Visos pavarų dėžės' },
                { value: 'MANUAL', label: 'Mechaninė' },
                { value: 'AUTOMATIC', label: 'Automatinė' },
              ]}
            />
          </div>
        </Card>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCars && filteredCars.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              Rasta automobilių: {filteredCars.length}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
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
                        Laisvas
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{car.year} m.</p>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">{getFuelIcon(car.fuelType)}</span>
                        <span>{car.fuelType}</span>
                      </div>
                      <div className="flex items-center">
                        <Cog6ToothIcon className="h-4 w-4 mr-2" />
                        <span>{car.gearbox === 'AUTOMATIC' ? 'Automatinė' : 'Mechaninė'}</span>
                      </div>
                      <div className="flex items-center">
                        <BoltIcon className="h-4 w-4 mr-2" />
                        <span>{car.powerKW} kW</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        <span>{car.seatCount} vietos</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-500">Kaina per dieną</div>
                        <div className="text-2xl font-bold text-primary-600">
                          €{car.pricePerDay}
                        </div>
                      </div>
                      <Link to={`/cars/${car.id}`}>
                        <Button size="sm">Peržiūrėti</Button>
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
            <p className="text-gray-600 text-lg">Nerasta automobilių pagal pasirinktus filtrus</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
