import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { carsApi } from '../../api/cars';
import { citiesApi } from '../../api/cities';
import type { Car, CarCreate } from '../../types/api';
import { PlusIcon, PencilIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline';

export function AdminCarsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.getAll,
  });

  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: carsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Ar tikrai norite ištrinti šį automobilį?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Automobiliai</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Pridėti automobilį
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : cars && cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <Card key={car.id} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <TruckIcon className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">
                  {car.make} {car.model}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{car.year} m. • {car.numberPlate}</p>
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
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(car.id)}>
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Nerasta automobilių</p>
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
  const [formData, setFormData] = useState<CarCreate>({
    vin: car?.vin || '',
    numberPlate: car?.numberPlate || '',
    make: car?.make || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    pricePerDay: car?.pricePerDay || 50,
    cityId: car?.cityId || (cities[0]?.id || 1),
    seatCount: car?.seatCount || 5,
    fuelType: car?.fuelType || 'PETROL',
    powerKW: car?.powerKW || 100,
    engineCapacityL: car?.engineCapacityL || 1.6,
    bodyType: car?.bodyType || 'SEDAN',
    gearbox: car?.gearbox || 'MANUAL',
    state: car?.state || 'AVAILABLE',
    odometerKm: car?.odometerKm || 0,
  });

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
    if (car) {
      updateMutation.mutate({ id: car.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={car ? 'Redaguoti automobilį' : 'Pridėti automobilį'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Gamintojas" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} required />
          <Input label="Modelis" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
          <Input label="VIN" value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} required />
          <Input label="Valst. numeris" value={formData.numberPlate} onChange={(e) => setFormData({ ...formData, numberPlate: e.target.value })} required />
          <Input label="Metai" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} required />
          <Input label="Kaina/d (€)" type="number" value={formData.pricePerDay} onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })} required />
          <Select label="Miestas" value={formData.cityId} onChange={(e) => setFormData({ ...formData, cityId: Number(e.target.value) })} options={cities.map(c => ({ value: c.id, label: c.name }))} />
          <Input label="Vietų sk." type="number" value={formData.seatCount} onChange={(e) => setFormData({ ...formData, seatCount: Number(e.target.value) })} />
          <Select label="Kuras" value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })} options={[
            { value: 'PETROL', label: 'Benzinas' },
            { value: 'DIESEL', label: 'Dyzelis' },
            { value: 'ELECTRIC', label: 'Elektrinis' },
            { value: 'HYBRID_HEV', label: 'Hibridas (HEV)' },
            { value: 'HYBRID_PHEV', label: 'Hibridas (PHEV)' },
          ]} />
          <Input label="Galia (kW)" type="number" value={formData.powerKW} onChange={(e) => setFormData({ ...formData, powerKW: Number(e.target.value) })} required />
          <Input label="Variklio tūris (L)" type="number" step="0.1" value={formData.engineCapacityL || ''} onChange={(e) => setFormData({ ...formData, engineCapacityL: e.target.value ? Number(e.target.value) : null })} />
          <Select label="Kėbulas" value={formData.bodyType} onChange={(e) => setFormData({ ...formData, bodyType: e.target.value as any })} options={[
            { value: 'SEDAN', label: 'Sedanas' },
            { value: 'HATCHBACK', label: 'Hečbekas' },
            { value: 'SUV', label: 'SUV' },
            { value: 'WAGON', label: 'Universalas' },
          ]} />
          <Select label="Pavarų dėžė" value={formData.gearbox} onChange={(e) => setFormData({ ...formData, gearbox: e.target.value as any })} options={[
            { value: 'MANUAL', label: 'Mechaninė' },
            { value: 'AUTOMATIC', label: 'Automatinė' },
          ]} />
          <Select label="Būsena" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value as any })} options={[
            { value: 'AVAILABLE', label: 'Laisvas' },
            { value: 'LEASED', label: 'Išnuomotas' },
            { value: 'MAINTENANCE', label: 'Servise' },
          ]} />
          <Input label="Rida (km)" type="number" value={formData.odometerKm} onChange={(e) => setFormData({ ...formData, odometerKm: Number(e.target.value) })} />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Atšaukti</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {car ? 'Išsaugoti' : 'Pridėti'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
