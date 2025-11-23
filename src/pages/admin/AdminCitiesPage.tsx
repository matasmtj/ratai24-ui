import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { citiesApi } from '../../api/cities';
import type { City, CityCreate } from '../../types/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function AdminCitiesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState<CityCreate>({
    name: '',
    country: '',
  });

  const { data: cities, isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: citiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CityCreate }) => citiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: citiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });

  const handleOpenModal = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setFormData({ name: city.name, country: city.country });
    } else {
      setEditingCity(null);
      setFormData({ name: '', country: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCity(null);
    setFormData({ name: '', country: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCity) {
      updateMutation.mutate({ id: editingCity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Ar tikrai norite ištrinti šį miestą?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Miestai</h2>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Pridėti miestą
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : cities && cities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => (
            <Card key={city.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{city.name}</h3>
                  <p className="text-gray-600">{city.country}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => handleOpenModal(city)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(city.id)}>
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Nerasta miestų</p>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCity ? 'Redaguoti miestą' : 'Pridėti miestą'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pavadinimas"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Šalis (kodas)"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
            maxLength={2}
            placeholder="LT"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Atšaukti
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingCity ? 'Išsaugoti' : 'Pridėti'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
