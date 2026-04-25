import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Loading';
import { Select } from '../components/ui/Select';
import { LoyaltyBadge } from '../components/pricing/LoyaltyBadge';
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
import { useLanguage } from '../contexts/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { PaginationBar } from '../components/ui/PaginationBar';
import { slicePage, visibleRange } from '../lib/pagination';
import { useScrollToTopOnPageChange } from '../hooks/useScrollToTopOnPageChange';

export function UserDashboard() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isAuthenticated, role } = useAuth();
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [page, setPage] = useState(1);
  const listAnchorRef = useRef<HTMLDivElement>(null);
  const accessToken = localStorage.getItem('accessToken');

  const { data: contracts, isLoading, error, isError } = useQuery({
    queryKey: ['my-contracts', accessToken],
    queryFn: contractsApi.getMy, // Use getMy() for user's own contracts
    enabled: isAuthenticated && role === 'USER',
    refetchOnMount: 'always',
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => contractsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contracts'] });
      // Also invalidate car-contracts to update calendars
      queryClient.invalidateQueries({ queryKey: ['car-contracts'] });
    },
  });

  const list = contracts ?? [];
  const pageSize = itemsPerPage === -1 ? -1 : itemsPerPage;

  const paginatedContracts = useMemo(
    () => slicePage(list, page, pageSize),
    [list, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [itemsPerPage]);

  useScrollToTopOnPageChange(page, listAnchorRef);

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
      DRAFT: t('pendingApproval'),
      ACTIVE: t('active'),
      COMPLETED: t('completed'),
      CANCELLED: t('cancelled'),
    };
    return translations[state as keyof typeof translations] || state;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('myReservationsTitle')}</h1>
          <p className="text-gray-600">{t('myReservationsSubtitle')}</p>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-3 inline-block">
            {t('cancellationPolicyNote')}
          </p>
        </div>

        {/* Loyalty Badge */}
        <div className="mb-6">
          <LoyaltyBadge />
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
            {itemsPerPage === -1
              ? t('showingXofY')
                  .replace('{current}', paginatedContracts.length.toString())
                  .replace('{total}', list.length.toString())
              : (() => {
                  const { from, to } = visibleRange(page, pageSize, list.length, paginatedContracts.length);
                  return t('showingRangeFromTo')
                    .replace('{from}', from ? String(from) : '0')
                    .replace('{to}', to ? String(to) : '0')
                    .replace('{total}', String(list.length));
                })()}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <Card className="p-12 text-center">
            <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('errorLoadingReservations')}</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : t('failedToLoadReservations')}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['my-contracts'] })}>
              {t('tryAgain')}
            </Button>
          </Card>
        ) : contracts && contracts.length > 0 ? (
          <div className="space-y-4">
            <div ref={listAnchorRef} className="h-0" aria-hidden />
            {paginatedContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onCancel={() => {
                  if (confirm(t('confirmCancelReservationUser'))) {
                    cancelMutation.mutate(contract.id);
                  }
                }}
                getStatusBadge={getStatusBadge}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
              />
            ))}
            {itemsPerPage !== -1 && (
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalItems={list.length}
                onPageChange={setPage}
                className="mt-2"
              />
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noReservations')}</h3>
            <p className="text-gray-600">{t('noReservationsDescription')}</p>
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
  const { t } = useLanguage();
  const { data: car } = useQuery({
    queryKey: ['car', contract.carId],
    queryFn: () => carsApi.getById(contract.carId),
  });

  const canCancel = contract.state === 'DRAFT';

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold mr-3">
              {car ? `${car.make} ${car.model}` : `${t('carNumber')}${contract.carId}`}
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
            <div>{t('startingMileage')}: {contract.mileageStartKm} km</div>
            {contract.mileageEndKm && <div>{t('endingMileage')}: {contract.mileageEndKm} km</div>}
            <div>{t('priceLabel')}: €{contract.totalPrice}</div>
            {contract.extraFees > 0 && <div>{t('extraFeesLabel')}: €{contract.extraFees}</div>}
            {contract.notes && <div className="italic">{t('notesLabel')}: {contract.notes}</div>}
          </div>
        </div>
        <div className="flex space-x-2">
          {canCancel && (
            <Button size="sm" variant="danger" onClick={onCancel}>
              {t('cancelButton')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
