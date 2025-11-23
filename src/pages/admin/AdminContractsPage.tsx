import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import { contractsApi } from '../../api/contracts';
import { carsApi } from '../../api/cars';

import { format } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

export function AdminContractsPage() {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['admin-contracts'],
    queryFn: contractsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: contractsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Ar tikrai norite ištrinti šią rezervaciją?')) {
      deleteMutation.mutate(id);
    }
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
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Visos rezervacijos</h2>
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
              onDelete={() => handleDelete(contract.id)}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Nerasta rezervacijų</p>
        </Card>
      )}
    </div>
  );
}

function ContractCard({
  contract,
  onDelete,
  getStatusBadge,
  getStatusIcon,
}: {
  contract: any;
  onDelete: () => void;
  getStatusBadge: (state: string) => string;
  getStatusIcon: (state: string) => React.ReactElement | null;
}) {
  const { data: car } = useQuery({
    queryKey: ['car', contract.carId],
    queryFn: () => carsApi.getById(contract.carId),
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold mr-3">
              Rezervacija #{contract.id}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(contract.state)}`}>
              {getStatusIcon(contract.state)}
              <span className="ml-1">{contract.state}</span>
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Automobilis: {car ? `${car.make} ${car.model}` : `#${contract.carId}`}</div>
            <div>Naudotojas: #{contract.userId}</div>
            <div>
              Datos: {format(new Date(contract.startDate), 'yyyy-MM-dd HH:mm')} -{' '}
              {format(new Date(contract.endDate), 'yyyy-MM-dd HH:mm')}
            </div>
            <div>Pradinis ridos rodmuo: {contract.mileageStartKm} km</div>
            {contract.mileageEndKm && <div>Galutinis ridos rodmuo: {contract.mileageEndKm} km</div>}
            <div>Kaina: €{contract.totalPrice}</div>
            {contract.extraFees > 0 && <div>Papildomi mokesčiai: €{contract.extraFees}</div>}
            {contract.notes && <div className="italic">Pastabos: {contract.notes}</div>}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <TrashIcon className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
