import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { contractsApi } from '../api/contracts';
import { carsApi } from '../api/cars';
import type { Contract, ContractComplete } from '../types/api';
import { 
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export function UserDashboard() {
  const queryClient = useQueryClient();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeData, setCompleteData] = useState({
    mileageEndKm: '',
    fuelLevelEndPct: '',
    damageFee: '0',
    notes: '',
  });

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['my-contracts'],
    queryFn: contractsApi.getAll,
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContractComplete }) =>
      contractsApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contracts'] });
      setIsCompleteModalOpen(false);
      setSelectedContract(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contracts'] });
    },
  });

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const data: ContractComplete = {
      mileageEndKm: Number(completeData.mileageEndKm),
      fuelLevelEndPct: Number(completeData.fuelLevelEndPct),
      damageFee: Number(completeData.damageFee),
      notes: completeData.notes || undefined,
    };

    completeMutation.mutate({ id: selectedContract.id, data });
  };

  const getStatusBadge = (state: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return styles[state as keyof typeof styles] || styles.DRAFT;
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5" />;
      case 'ACTIVE':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getStatusText = (state: string) => {
    const translations = {
      DRAFT: 'Juodraštis',
      ACTIVE: 'Aktyvi',
      COMPLETED: 'Užbaigta',
      CANCELLED: 'Atšaukta',
    };
    return translations[state as keyof typeof translations] || state;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mano rezervacijos</h1>
          <p className="text-gray-600">Peržiūrėkite ir valdykite savo automobilių nuomos rezervacijas</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : contracts && contracts.length > 0 ? (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onComplete={() => {
                  setSelectedContract(contract);
                  setIsCompleteModalOpen(true);
                }}
                onDelete={() => {
                  if (confirm('Ar tikrai norite atšaukti šią rezervaciją?')) {
                    deleteMutation.mutate(contract.id);
                  }
                }}
                getStatusBadge={getStatusBadge}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Neturite rezervacijų</h3>
            <p className="text-gray-600">Pradėkite ieškoti automobilių ir sukurkite savo pirmąją rezervaciją</p>
          </Card>
        )}
      </div>

      {/* Complete Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedContract(null);
        }}
        title="Užbaigti rezervaciją"
        size="lg"
      >
        <form onSubmit={handleComplete} className="space-y-4">
          <Input
            label="Galutinis ridos rodmuo (km)"
            type="number"
            value={completeData.mileageEndKm}
            onChange={(e) => setCompleteData({ ...completeData, mileageEndKm: e.target.value })}
            required
          />
          <Input
            label="Galutinis kuro lygis (%)"
            type="number"
            min="0"
            max="100"
            value={completeData.fuelLevelEndPct}
            onChange={(e) => setCompleteData({ ...completeData, fuelLevelEndPct: e.target.value })}
            required
          />
          <Input
            label="Žalos mokestis (€)"
            type="number"
            min="0"
            step="0.01"
            value={completeData.damageFee}
            onChange={(e) => setCompleteData({ ...completeData, damageFee: e.target.value })}
          />
          <Input
            label="Pastabos (neprivaloma)"
            value={completeData.notes}
            onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCompleteModalOpen(false);
                setSelectedContract(null);
              }}
            >
              Atšaukti
            </Button>
            <Button type="submit" isLoading={completeMutation.isPending}>
              Užbaigti rezervaciją
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

function ContractCard({
  contract,
  onComplete,
  onDelete,
  getStatusBadge,
  getStatusIcon,
  getStatusText,
}: {
  contract: Contract;
  onComplete: () => void;
  onDelete: () => void;
  getStatusBadge: (state: string) => string;
  getStatusIcon: (state: string) => React.ReactElement;
  getStatusText: (state: string) => string;
}) {
  const { data: car } = useQuery({
    queryKey: ['car', contract.carId],
    queryFn: () => carsApi.getById(contract.carId),
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold mr-3">
              {car ? `${car.make} ${car.model}` : `Automobilis #${contract.carId}`}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(contract.state)}`}>
              {getStatusIcon(contract.state)}
              <span className="ml-1">{getStatusText(contract.state)}</span>
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>
                {format(new Date(contract.startDate), 'yyyy-MM-dd HH:mm')} -{' '}
                {format(new Date(contract.endDate), 'yyyy-MM-dd HH:mm')}
              </span>
            </div>
            <div>Pradinis ridos rodmuo: {contract.mileageStartKm} km</div>
            {contract.mileageEndKm && <div>Galutinis ridos rodmuo: {contract.mileageEndKm} km</div>}
            <div>Kaina: €{contract.totalPrice}</div>
            {contract.extraFees > 0 && <div>Papildomi mokesčiai: €{contract.extraFees}</div>}
            {contract.notes && <div className="italic">Pastabos: {contract.notes}</div>}
          </div>
        </div>
        <div className="flex space-x-2">
          {contract.state === 'ACTIVE' && (
            <Button size="sm" onClick={onComplete}>
              Užbaigti
            </Button>
          )}
          {(contract.state === 'DRAFT' || contract.state === 'ACTIVE') && (
            <Button size="sm" variant="danger" onClick={onDelete}>
              Atšaukti
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
