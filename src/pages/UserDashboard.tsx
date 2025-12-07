import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Loading';
import { Select } from '../components/ui/Select';
import { contractsApi } from '../api/contracts';
import { carsApi } from '../api/cars';
import type { Contract } from '../types/api';
import { 
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

export function UserDashboard() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { data: contracts, isLoading, error, isError } = useQuery({
    queryKey: ['my-contracts'],
    queryFn: contractsApi.getMy, // Use getMy() for user's own contracts
  });

  // Debug logging
  console.log('UserDashboard - isLoading:', isLoading);
  console.log('UserDashboard - isError:', isError);
  console.log('UserDashboard - error:', error);
  console.log('UserDashboard - contracts:', contracts);
  console.log('UserDashboard - contracts length:', contracts?.length);

  const cancelMutation = useMutation({
    mutationFn: (id: number) => contractsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contracts'] });
      // Also invalidate car-contracts to update calendars
      queryClient.invalidateQueries({ queryKey: ['car-contracts'] });
    },
  });

  const paginatedContracts = useMemo(() => {
    if (!contracts) return [];
    if (itemsPerPage === -1) return contracts;
    return contracts.slice(0, itemsPerPage);
  }, [contracts, itemsPerPage]);

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

        {/* Items per page selector */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('itemsPerPage')}:</label>
            <div className="w-28">
              <Select
                value={itemsPerPage.toString()}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
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

        {contracts && contracts.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            {t('showingXofY')
              .replace('{current}', paginatedContracts.length.toString())
              .replace('{total}', contracts.length.toString())}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <Card className="p-12 text-center">
            <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Klaida kraunant rezervacijas</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Nepavyko užkrauti rezervacijų. Bandykite dar kartą.'}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['my-contracts'] })}>
              Bandyti dar kartą
            </Button>
          </Card>
        ) : contracts && contracts.length > 0 ? (
          <div className="space-y-4">
            {paginatedContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onCancel={() => {
                  if (confirm('Ar tikrai norite atšaukti šią rezervaciją?')) {
                    cancelMutation.mutate(contract.id);
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
    </Layout>
  );
}

function ContractCard({
  contract,
  onCancel,
  getStatusBadge,
  getStatusIcon,
  getStatusText,
}: {
  contract: Contract;
  onCancel: () => void;
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
          {(contract.state === 'DRAFT' || contract.state === 'ACTIVE') && (
            <Button size="sm" variant="danger" onClick={onCancel}>
              Atšaukti
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
