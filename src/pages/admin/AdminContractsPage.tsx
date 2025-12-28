import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useLanguage } from '../../contexts/LanguageContext';
import { contractsApi } from '../../api/contracts';
import { carsApi } from '../../api/cars';
import { usersApi } from '../../api/users';
import { format } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AdminContractDetailModal } from '../../components/admin/AdminContractDetailModal';
import type { Contract } from '../../types/api';

export function AdminContractsPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['admin-contracts'],
    queryFn: contractsApi.getAll,
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStateFilter('');
    setSortBy('');
  };

  const filteredAndSortedContracts = useMemo(() => {
    if (!contracts) return [];
    
    let filtered = contracts.filter((contract) => {
      const matchesSearch = 
        contract.id.toString().includes(searchTerm) ||
        contract.carId.toString().includes(searchTerm);
      const matchesState = !stateFilter || contract.state === stateFilter;
      return matchesSearch && matchesState;
    });

    return filtered.sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === 'startDateAsc') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (sortBy === 'startDateDesc') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (sortBy === 'endDateAsc') return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      if (sortBy === 'endDateDesc') return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      if (sortBy === 'state') return a.state.localeCompare(b.state);
      return 0;
    });
  }, [contracts, searchTerm, stateFilter, sortBy]);

  const paginatedContracts = useMemo(() => {
    if (itemsPerPage === -1) return filteredAndSortedContracts;
    return filteredAndSortedContracts.slice(0, itemsPerPage);
  }, [filteredAndSortedContracts, itemsPerPage]);

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

  const getStateLabel = (state: string) => {
    const labels = {
      DRAFT: t('draft'),
      ACTIVE: t('active'),
      COMPLETED: t('completed'),
      CANCELLED: t('cancelled'),
    };
    return labels[state as keyof typeof labels] || state;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t('allReservations')}</h2>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold">{t('filters')}</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder={t('searchReservations')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            options={[
              { value: '', label: t('allStates') },
              { value: 'DRAFT', label: t('draft') },
              { value: 'ACTIVE', label: t('active') },
              { value: 'COMPLETED', label: t('completed') },
              { value: 'CANCELLED', label: t('cancelled') },
            ]}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: '', label: t('sortByDate') },
              { value: 'startDateDesc', label: t('startDateDesc') },
              { value: 'startDateAsc', label: t('startDateAsc') },
              { value: 'endDateDesc', label: t('endDateDesc') },
              { value: 'endDateAsc', label: t('endDateAsc') },
              { value: 'state', label: t('stateSort') },
            ]}
          />
        </div>
        
        {/* Items per page selector */}
        <div className="flex items-center gap-2 mt-4">
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAndSortedContracts && filteredAndSortedContracts.length > 0 ? (
        <>
          <div className="mb-4 text-gray-600">
            {t('showingXofY')
              .replace('{current}', paginatedContracts.length.toString())
              .replace('{total}', filteredAndSortedContracts.length.toString())}
          </div>
          <div className="space-y-4">
            {paginatedContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                getStatusBadge={getStatusBadge}
                getStatusIcon={getStatusIcon}
                getStateLabel={getStateLabel}
                onClickContract={setSelectedContract}
                t={t}
              />
            ))}
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600">{t('noContractsFound')}</p>
        </Card>
      )}

      {/* Contract Detail Modal */}
      {selectedContract && (
        <AdminContractDetailModal
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          contract={selectedContract}
          car={selectedContract.car}
        />
      )}
    </div>
  );
}

function ContractCard({
  contract,
  getStatusBadge,
  getStatusIcon,
  getStateLabel,
  onClickContract,
  t,
}: {
  contract: any;
  getStatusBadge: (state: string) => string;
  getStatusIcon: (state: string) => React.ReactElement | null;
  getStateLabel: (state: string) => string;
  onClickContract: (contract: any) => void;
  t: (key: any) => string;
}) {
  const { data: car, isError: carError } = useQuery({
    queryKey: ['car', contract.carId],
    queryFn: () => carsApi.getById(contract.carId),
    retry: false,
  });

  const { data: user, isError: userError } = useQuery({
    queryKey: ['user', contract.userId],
    queryFn: () => usersApi.getById(contract.userId),
    enabled: !!contract.userId,
    retry: false,
  });

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClickContract({ ...contract, car, user })}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold mr-3">
              {t('reservationNumber')} #{contract.id}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(contract.state)}`}>
              {getStatusIcon(contract.state)}
              <span className="ml-1">{getStateLabel(contract.state)}</span>
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              {t('carLabel')}: {car ? `${car.make} ${car.model}` : carError ? <span className="text-red-600 italic">(Deleted Car #{contract.carId})</span> : `#${contract.carId}`}
            </div>
            <div>
              {t('userLabel')}: #{contract.userId}
              {user?.email ? (
                <span className="ml-2 text-gray-800 font-medium">({user.email})</span>
              ) : userError ? (
                <span className="ml-2 text-red-600 italic">(Deleted User)</span>
              ) : null}
            </div>
            <div>
              {t('datesLabel')}: {format(new Date(contract.startDate), 'yyyy-MM-dd HH:mm')} -{' '}
              {format(new Date(contract.endDate), 'yyyy-MM-dd HH:mm')}
            </div>
            <div>{t('startMileageContract')}: {contract.mileageStartKm} km</div>
            {contract.mileageEndKm && <div>{t('endMileageLabel')}: {contract.mileageEndKm} km</div>}
            <div>{t('totalPrice')}: €{contract.totalPrice}</div>
            {contract.extraFees > 0 && <div>{t('extraFees')}: €{contract.extraFees}</div>}
            {contract.notes && <div className="italic">{t('notesContract')}: {contract.notes}</div>}
          </div>
        </div>
      </div>
    </Card>
  );
}