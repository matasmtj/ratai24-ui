import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingPage } from '../components/ui/Loading';
import { DateTimePicker } from '../components/ui/DateTimePicker';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { Alert } from '../components/ui/Alert';
import { PricePreviewWidget } from '../components/pricing/PricePreviewWidget';
import { DemandIndicator } from '../components/pricing/DemandIndicator';
import { LoyaltyBadge } from '../components/pricing/LoyaltyBadge';
import { carsApi, normalizeCarContractsCalendar } from '../api/cars';
import { citiesApi } from '../api/cities';
import { usersApi } from '../api/users';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { contractsApi } from '../api/contracts';
import { getFuelTypeKey, getBodyTypeKey } from '../lib/translationHelpers';
import type { ContractCreate } from '../types/api';
import { 
  TruckIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export function CarDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, role } = useAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    startTime: '09',
    endDate: '',
    endTime: '09',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const mapBookingApiError = (apiError: unknown): string => {
    if (typeof apiError !== 'string') return t('bookingError');
    const normalized = apiError.toLowerCase();
    if (normalized.includes('active or pending reservations at a time')) {
      return t('bookingLimitExceeded');
    }
    return apiError;
  };

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: carContracts } = useQuery({
    queryKey: ['car-contracts', id],
    queryFn: () => carsApi.getContracts(Number(id)),
    select: normalizeCarContractsCalendar,
    enabled: !!id,
  });

  const { data: city } = useQuery({
    queryKey: ['city', car?.cityId],
    queryFn: () => citiesApi.getById(car!.cityId),
    enabled: !!car?.cityId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => usersApi.getCurrentUser(),
    enabled: isAuthenticated && role === 'USER',
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    setBookingError(null);
    setIsSubmitting(true);
    try {
      // Combine date and time (hour) into ISO datetime
      const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime.padStart(2, '0')}:00:00`);
      const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime.padStart(2, '0')}:00:00`);
      
      // Validate that end date/time is after start date/time
      if (endDateTime <= startDateTime) {
        setBookingError(t('endDateMustBeAfterStart'));
        setIsSubmitting(false);
        return;
      }
      
      const contractData: ContractCreate = {
        carId: car.id,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        mileageStartKm: car.odometerKm, // Auto-populate from car's current mileage
        fuelLevelStartPct: 100, // Always 100% at start
        notes: bookingData.notes || undefined,
      };

      await contractsApi.create(contractData);
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['my-contracts'] });
      await queryClient.invalidateQueries({ queryKey: ['car-contracts', id] });
      await queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      
      setIsBookingModalOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking error:', error);
      const apiError = (error as any)?.response?.data?.error;
      setBookingError(
        typeof apiError === 'string' && apiError.trim() !== ''
          ? mapBookingApiError(apiError)
          : t('bookingError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get blocked dates for calendar
  const blockedDates = useMemo(() => {
    if (!carContracts) return [];

    const dates: Date[] = [];
    const addInclusiveEndDay = (start: Date, end: Date) => {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    };
    const addHalfOpenDays = (start: Date, endExclusive: Date) => {
      for (let d = new Date(start); d < endExclusive; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    };

    carContracts.contracts.forEach((contract) => {
      if (contract.state === 'COMPLETED' || contract.state === 'CANCELLED') return;
      addInclusiveEndDay(new Date(contract.startDate), new Date(contract.endDate));
    });
    carContracts.prepBlocks.forEach((block) => {
      addHalfOpenDays(new Date(block.startDate), new Date(block.endDate));
    });

    return dates;
  }, [carContracts]);

  // Get minimum selectable date (today)
  const getMinDate = (): Date => {
    return new Date();
  };

  if (isLoading) return <LoadingPage />;
  if (!car) return <div>{t('carNotFound')}</div>;
  const canBookThisCar = car.availableForLease !== false && car.state !== 'MAINTENANCE';

  const carImages = car.images || [];
  const currentImage = carImages[currentImageIndex];

  const nextImage = () => {
    if (carImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % carImages.length);
    }
  };

  const previousImage = () => {
    if (carImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + carImages.length) % carImages.length);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/rent-cars" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← {t('backToList')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Image Gallery */}
          <div>
            <Card className="overflow-hidden relative cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {currentImage ? (
                  <img 
                    src={currentImage.url} 
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <TruckIcon className="h-48 w-48 text-gray-400" />
                )}
              </div>
              {carImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      previousImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </Card>
            {carImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {carImages.slice(0, 5).map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsLightboxOpen(true);
                    }}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {car.make} {car.model}
                </h1>
                {role === 'ADMIN' && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      car.state === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : car.state === 'LEASED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {car.state === 'AVAILABLE' ? t('available') : car.state === 'LEASED' ? t('leased') : t('maintenance')}
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-600">{car.year} m.</p>
              {car.occupiedToday && (
                <div className="mt-3 inline-flex items-center bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {t('occupiedToday')}
                </div>
              )}
            </div>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('specifications')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">{t('licenseNumber')}</div>
                  <div className="font-medium">{car.numberPlate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('fuelType')}</div>
                  <div className="font-medium">
                    {t(getFuelTypeKey(car.fuelType) as any)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('gearboxType')}</div>
                  <div className="font-medium">
                    {car.gearbox === 'AUTOMATIC' ? t('automatic') : t('manual')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('powerOutput')}</div>
                  <div className="font-medium">
                    {car.powerKW} kW
                  </div>
                </div>
                {car.engineCapacityL && (
                  <div>
                    <div className="text-sm text-gray-500">{t('engineVolume')}</div>
                    <div className="font-medium">{car.engineCapacityL} L</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">{t('bodyType')}</div>
                  <div className="font-medium">{t(getBodyTypeKey(car.bodyType) as any)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('seatsNumber')}</div>
                  <div className="font-medium">{car.seatCount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('mileageLabel')}</div>
                  <div className="font-medium">{car.odometerKm.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('location')}</div>
                  <div className="font-medium">{city?.name}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary-50 border-primary-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm text-gray-600">{t('pricePerDay')}</div>
                    {car.useDynamicPricing && (
                      <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 font-semibold">
                        {t('dynamicLabel')}
                      </span>
                    )}
                  </div>
                  <div className="text-4xl font-bold text-primary-600">
                    €{car.useDynamicPricing && car.basePricePerDay ? car.basePricePerDay : car.pricePerDay}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {car.useDynamicPricing ? (
                      <>
                        {t('pricing.basePrice')} • {t('dynamicPricingNote') || 'Final price varies by demand'}
                        {car.minPricePerDay && car.maxPricePerDay && (
                          <div className="mt-1 text-gray-600">
                            {t('priceRange') || 'Range'}: €{car.minPricePerDay} - €{car.maxPricePerDay}
                          </div>
                        )}
                      </>
                    ) : (
                      t('pricing.admin.fixedPrice')
                    )}
                  </div>
                </div>
                {canBookThisCar ? (
                  <div>
                    {isAuthenticated && role === 'USER' ? (
                      <Button
                        size="lg"
                        onClick={() => {
                          setIsBookingModalOpen(true);
                          setBookingError(null);
                        }}
                      >
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        {t('reserveCar')}
                      </Button>
                    ) : !isAuthenticated ? (
                      <Link to="/login">
                        <Button size="lg">{t('loginToBook')}</Button>
                      </Link>
                    ) : null}
                  </div>
                ) : isAuthenticated && role === 'USER' ? (
                  <div>
                    <Button size="lg" variant="secondary" disabled>
                      {t('carUnavailableForBooking')}
                    </Button>
                  </div>
                ) : null}
              </div>
              {city && (
                <div className="mt-3 pt-3 border-t border-primary-200">
                  <DemandIndicator cityId={city.id} />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title={t('reserveCarTitle')}
        size="xl"
      >
        <form onSubmit={handleBooking} className="space-y-4">
          {/* Error message */}
          {bookingError && (
            <Alert type="error" message={bookingError} onClose={() => setBookingError(null)} />
          )}
          
          {/* Reserved dates info */}
          {blockedDates.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-yellow-800 mb-2">{t('reservedDatesInfo')}</p>
              <p className="text-yellow-700">{t('blockedDatesHelp')}</p>
            </div>
          )}
          
          <DateTimePicker
            label={t('startDateTime')}
            selectedDate={bookingData.startDate}
            selectedTime={bookingData.startTime}
            onDateChange={(date) => setBookingData({ ...bookingData, startDate: date })}
            onTimeChange={(time) => setBookingData({ ...bookingData, startTime: time })}
            minDate={getMinDate()}
            blockedDates={blockedDates}
            required
          />
          
          <DateTimePicker
            label={t('endDateTime')}
            selectedDate={bookingData.endDate}
            selectedTime={bookingData.endTime}
            onDateChange={(date) => setBookingData({ ...bookingData, endDate: date })}
            onTimeChange={(time) => setBookingData({ ...bookingData, endTime: time })}
            minDate={getMinDate()}
            blockedDates={blockedDates}
            required
          />
          
          <Input
            label={t('notesLabel')}
            value={bookingData.notes}
            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
          />

          {/* Loyalty Badge for authenticated users */}
          {isAuthenticated && role === 'USER' && car.useDynamicPricing && (
            <div className="pt-2">
              <LoyaltyBadge />
            </div>
          )}

          {/* Dynamic pricing preview */}
          {car.useDynamicPricing && bookingData.startDate && bookingData.endDate && bookingData.startTime && bookingData.endTime && (() => {
            // Construct full ISO datetime strings for price calculation
            const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime.padStart(2, '0')}:00:00`);
            const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime.padStart(2, '0')}:00:00`);
            
            // Only show preview if end is after start
            if (endDateTime <= startDateTime) {
              return null;
            }
            
            return (
              <div className="pt-2">
                <PricePreviewWidget
                  carId={car.id}
                  startDate={startDateTime.toISOString()}
                  endDate={endDateTime.toISOString()}
                  userId={currentUser?.id}
                  showBreakdown={true}
                />
              </div>
            );
          })()}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBookingModalOpen(false)}
            >
              {t('cancelButton')}
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {t('confirmReservation')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Lightbox */}
      <ImageLightbox
        images={carImages}
        initialIndex={currentImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </Layout>
  );
}
