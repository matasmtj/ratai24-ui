import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { carMakes, carModels, carYears } from '../../data/carData';
import { useLanguage } from '../../contexts/LanguageContext';
import { carsApi } from '../../api/cars';
import { citiesApi } from '../../api/cities';
import type { Car, CarCreate } from '../../types/api';
import { PlusIcon, PencilIcon, TrashIcon, TruckIcon, PhotoIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CarImagesManager } from '../../components/admin/CarImagesManager';

export function AdminCarsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [imagesModalCarId, setImagesModalCarId] = useState<number | null>(null);
  const [deleteCarId, setDeleteCarId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(3); // 3 rows x 3 columns = 9 cars

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.getAll,
  });

  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll(),
  });

  const filteredAndSortedCars = useMemo(() => {
    if (!cars) return [];
    
    let filtered = cars.filter((car) => {
      const matchesSearch = 
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.numberPlate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !cityFilter || car.cityId.toString() === cityFilter;
      const matchesState = !stateFilter || car.state === stateFilter;
      return matchesSearch && matchesCity && matchesState;
    });

    return filtered.sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === 'makeAsc') return a.make.localeCompare(b.make);
      if (sortBy === 'makeDesc') return b.make.localeCompare(a.make);
      if (sortBy === 'yearAsc') return a.year - b.year;
      if (sortBy === 'yearDesc') return b.year - a.year;
      if (sortBy === 'priceAsc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'priceDesc') return b.pricePerDay - a.pricePerDay;
      return 0;
    });
  }, [cars, searchTerm, cityFilter, stateFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setStateFilter('');
    setSortBy('');
  };

  const hasActiveFilters = searchTerm || cityFilter || stateFilter || sortBy;

  const paginatedCars = useMemo(() => {
    const carsPerRow = 3; // Grid has 3 columns
    const totalCars = rowsPerPage === -1 ? filteredAndSortedCars.length : rowsPerPage * carsPerRow;
    return filteredAndSortedCars.slice(0, totalCars);
  }, [filteredAndSortedCars, rowsPerPage]);

  const deleteMutation = useMutation({
    mutationFn: carsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setDeleteCarId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeleteCarId(id);
  };

  const confirmDelete = () => {
    if (deleteCarId) {
      deleteMutation.mutate(deleteCarId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('cars')}</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('addCar')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold">{t('filters')}</h3>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder={t('searchCars')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            options={[
              { value: '', label: t('allCities') },
              ...(cities?.map((city) => ({ value: city.id.toString(), label: city.name })) || []),
            ]}
          />
          <Select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            options={[
              { value: '', label: t('allStates') },
              { value: 'AVAILABLE', label: t('available') },
              { value: 'LEASED', label: t('leased') },
              { value: 'MAINTENANCE', label: t('maintenance') },
            ]}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: '', label: t('sortBy') },
              { value: 'makeAsc', label: t('makeAsc') },
              { value: 'makeDesc', label: t('makeDesc') },
              { value: 'yearAsc', label: t('yearAsc') },
              { value: 'yearDesc', label: t('yearDesc') },
              { value: 'priceAsc', label: t('priceAsc') },
              { value: 'priceDesc', label: t('priceDesc') },
            ]}
          />
        </div>
        
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAndSortedCars && filteredAndSortedCars.length > 0 ? (
        <>
          <div className="mb-4 text-gray-600">
            {t('showingXofY')
              .replace('{current}', paginatedCars.length.toString())
              .replace('{total}', filteredAndSortedCars.length.toString())}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCars.map((car) => {
            const mainImage = car.images?.find(img => img.isMain);
            console.log(`Car ${car.id}:`, { 
              totalImages: car.images?.length, 
              mainImage: mainImage ? { id: mainImage.id, url: mainImage.url, isMain: mainImage.isMain } : null 
            });
            
            return (
            <Card key={car.id} className="overflow-hidden">
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
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                  {car.images?.length || 0} {t('photos')}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">
                  {car.make} {car.model}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{car.year} {t('year')} • {car.numberPlate}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-primary-600 font-bold">€{car.pricePerDay}/d</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    car.state === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                    car.state === 'LEASED' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {car.state}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => {
                    setEditingCar(car);
                    setIsModalOpen(true);
                  }}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setImagesModalCarId(car.id)}
                  >
                    <PhotoIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(car.id)}>
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          )})}
        </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600">{t('noCarsFound')}</p>
        </Card>
      )}

      <CarFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCar(null);
        }}
        car={editingCar}
        cities={cities || []}
      />

      {imagesModalCarId && (
        <CarImagesManager
          carId={imagesModalCarId}
          isOpen={imagesModalCarId !== null}
          onClose={() => setImagesModalCarId(null)}
        />
      )}
      
      <ConfirmDialog
        isOpen={deleteCarId !== null}
        onClose={() => setDeleteCarId(null)}
        onConfirm={confirmDelete}
        title={t('delete')}
        message={t('confirmDeleteCar')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function CarFormModal({ isOpen, onClose, car, cities }: { 
  isOpen: boolean; 
  onClose: () => void; 
  car: Car | null;
  cities: Array<{ id: number; name: string }>;
}) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  // Form state with string values for number inputs to prevent 0 prefix bug
  type FormState = Omit<CarCreate, 'year' | 'pricePerDay' | 'cityId' | 'seatCount' | 'powerKW' | 'engineCapacityL' | 'odometerKm'> & {
    year: number;
    pricePerDay: string | number;
    cityId: number;
    seatCount: string | number;
    powerKW: string | number;
    engineCapacityL: string | number | null;
    odometerKm: string | number;
  };
  
  const [formData, setFormData] = useState<FormState>({
    vin: '',
    numberPlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    pricePerDay: '50',
    cityId: cities[0]?.id || 1,
    seatCount: '5',
    fuelType: 'PETROL',
    powerKW: '100',
    engineCapacityL: '1.6',
    bodyType: 'SEDAN',
    gearbox: 'MANUAL',
    state: 'AVAILABLE',
    odometerKm: '0',
  });

  // Update form data when car changes (for edit mode)
  useEffect(() => {
    if (car) {
      setFormData({
        vin: car.vin,
        numberPlate: car.numberPlate,
        make: car.make,
        model: car.model,
        year: car.year,
        pricePerDay: car.pricePerDay.toString(),
        cityId: car.cityId,
        seatCount: car.seatCount.toString(),
        fuelType: car.fuelType,
        powerKW: car.powerKW.toString(),
        engineCapacityL: car.engineCapacityL?.toString() || '',
        bodyType: car.bodyType,
        gearbox: car.gearbox,
        state: car.state,
        odometerKm: car.odometerKm.toString(),
      });
    } else {
      // Reset form for create mode
      setFormData({
        vin: '',
        numberPlate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: '50',
        cityId: cities[0]?.id || 1,
        seatCount: '5',
        fuelType: 'PETROL',
        powerKW: '100',
        engineCapacityL: '1.6',
        bodyType: 'SEDAN',
        gearbox: 'MANUAL',
        state: 'AVAILABLE',
        odometerKm: '0',
      });
    }
  }, [car, cities]);

  const createMutation = useMutation({
    mutationFn: carsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CarCreate> }) => carsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers for API
    const submitData: CarCreate = {
      ...formData,
      pricePerDay: typeof formData.pricePerDay === 'string' ? Number(formData.pricePerDay) : formData.pricePerDay,
      seatCount: typeof formData.seatCount === 'string' ? Number(formData.seatCount) : formData.seatCount,
      powerKW: typeof formData.powerKW === 'string' ? Number(formData.powerKW) : formData.powerKW,
      engineCapacityL: formData.engineCapacityL === null || formData.engineCapacityL === '' 
        ? null 
        : typeof formData.engineCapacityL === 'string' 
          ? Number(formData.engineCapacityL) 
          : formData.engineCapacityL,
      odometerKm: typeof formData.odometerKm === 'string' ? Number(formData.odometerKm) : formData.odometerKm,
    };
    
    if (car) {
      updateMutation.mutate({ id: car.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={car ? t('editCar') : t('addCar')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect 
            label={t('manufacturer')} 
            value={formData.make} 
            onChange={(value) => setFormData({ ...formData, make: value, model: '' })} 
            options={carMakes}
            required 
          />
          <SearchableSelect 
            label={t('model')} 
            value={formData.model} 
            onChange={(value) => setFormData({ ...formData, model: value })} 
            options={formData.make ? (carModels[formData.make] || []) : []}
            disabled={!formData.make}
            required 
          />
          <Input label={t('vin')} value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} required />
          <Input label={t('numberPlate')} value={formData.numberPlate} onChange={(e) => setFormData({ ...formData, numberPlate: e.target.value })} required />
          <SearchableSelect 
            label={t('yearField')} 
            value={String(formData.year)} 
            onChange={(value) => setFormData({ ...formData, year: Number(value) })} 
            options={carYears.map(y => String(y))}
            required 
          />
          <Input label={t('pricePerDayField')} type="number" value={formData.pricePerDay || ''} onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })} required />
          <Select label={t('city')} value={formData.cityId} onChange={(e) => setFormData({ ...formData, cityId: Number(e.target.value) })} options={cities.map(c => ({ value: c.id, label: c.name }))} />
          <Input label={t('seatsCount')} type="number" value={formData.seatCount || ''} onChange={(e) => setFormData({ ...formData, seatCount: e.target.value })} />
          <Select label={t('fuel')} value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })} options={[
            { value: 'PETROL', label: t('petrol') },
            { value: 'DIESEL', label: t('diesel') },
            { value: 'ELECTRIC', label: t('electric') },
            { value: 'HYBRID_HEV', label: t('hybridHev') },
            { value: 'HYBRID_PHEV', label: t('hybridPhev') },
          ]} />
          <Input label={t('power')} type="number" value={formData.powerKW || ''} onChange={(e) => setFormData({ ...formData, powerKW: e.target.value })} required />
          <Input label={t('engineCapacity')} type="number" step="0.1" value={formData.engineCapacityL || ''} onChange={(e) => setFormData({ ...formData, engineCapacityL: e.target.value })} />
          <Select label={t('bodyTypeField')} value={formData.bodyType} onChange={(e) => setFormData({ ...formData, bodyType: e.target.value as any })} options={[
            { value: 'SEDAN', label: t('sedan') },
            { value: 'HATCHBACK', label: t('hatchback') },
            { value: 'SUV', label: t('suv') },
            { value: 'WAGON', label: t('wagon') },
          ]} />
          <Select label={t('gearboxField')} value={formData.gearbox} onChange={(e) => setFormData({ ...formData, gearbox: e.target.value as any })} options={[
            { value: 'MANUAL', label: t('manual') },
            { value: 'AUTOMATIC', label: t('automatic') },
          ]} />
          <Select label={t('status')} value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value as any })} options={[
            { value: 'AVAILABLE', label: t('available') },
            { value: 'LEASED', label: t('leased') },
            { value: 'MAINTENANCE', label: t('maintenance') },
          ]} />
          <Input label={t('mileage')} type="number" value={formData.odometerKm || ''} onChange={(e) => setFormData({ ...formData, odometerKm: e.target.value })} />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {car ? t('save') : t('add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
