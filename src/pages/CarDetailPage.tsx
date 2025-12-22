import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingPage } from '../components/ui/Loading';
import { DateTimePicker } from '../components/ui/DateTimePicker';
import { carsApi } from '../api/cars';
import { citiesApi } from '../api/cities';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { contractsApi } from '../api/contracts';
import { getFuelTypeKey, getBodyTypeKey } from '../lib/translationHelpers';
import type { ContractCreate } from '../types/api';
import { 
  TruckIcon,
  MapPinIcon,
  Cog6ToothIcon,
  BoltIcon,
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
  const [bookingData, setBookingData] = useState({
    startDate: '',
    startTime: '09',
    endDate: '',
    endTime: '09',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: carContracts } = useQuery({
    queryKey: ['car-contracts', id],
    queryFn: () => carsApi.getContracts(Number(id)),
    enabled: !!id,
  });

  const { data: city } = useQuery({
    queryKey: ['city', car?.cityId],
    queryFn: () => citiesApi.getById(car!.cityId),
    enabled: !!car?.cityId,
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    setIsSubmitting(true);
    try {
      // Combine date and time (hour) into ISO datetime
      const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime.padStart(2, '0')}:00:00`);
      const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime.padStart(2, '0')}:00:00`);
      
      const contractData: ContractCreate = {
        carId: car.id,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        mileageStartKm: car.odometerKm, // Auto-populate from car's current mileage
        fuelLevelStartPct: 100, // Always 100% at start
        notes: bookingData.notes || undefined,
      };

      console.log('Creating contract with data:', contractData);
      const result = await contractsApi.create(contractData);
      console.log('Contract created successfully:', result);
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['my-contracts'] });
      await queryClient.invalidateQueries({ queryKey: ['car-contracts', id] });
      
      setIsBookingModalOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking error:', error);
      alert(t('bookingError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get blocked dates for calendar
  const blockedDates = useMemo(() => {
    if (!carContracts) return [];
    
    const dates: Date[] = [];
    carContracts.forEach((contract: any) => {
      // Only block active or draft contracts
      if (contract.state === 'COMPLETED' || contract.state === 'CANCELLED') return;
      
      const start = new Date(contract.startDate);
      const end = new Date(contract.endDate);
      
      // Add all dates in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    });
    
    return dates;
  }, [carContracts]);

  // Get minimum selectable date (today)
  const getMinDate = (): Date => {
    return new Date();
  };

  if (isLoading) return <LoadingPage />;
  if (!car) return <div>{t('carNotFound')}</div>;

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
        <Link to="/cars" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← {t('backToList')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Image Gallery */}
          <div>
            <Card className="overflow-hidden relative">
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
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
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
                    onClick={() => setCurrentImageIndex(index)}
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
                  <div className="font-medium flex items-center">
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    {car.gearbox === 'AUTOMATIC' ? t('automatic') : t('manual')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('powerOutput')}</div>
                  <div className="font-medium flex items-center">
                    <BoltIcon className="h-4 w-4 mr-2" />
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
                  <div className="font-medium flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {city?.name}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary-50 border-primary-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">{t('pricePerDay')}</div>
                  <div className="text-4xl font-bold text-primary-600">€{car.pricePerDay}</div>
                </div>
                {car.state === 'AVAILABLE' && (
                  <div>
                    {isAuthenticated && role === 'USER' ? (
                      <Button
                        size="lg"
                        onClick={() => setIsBookingModalOpen(true)}
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
                )}
              </div>
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
            minDate={bookingData.startDate ? new Date(bookingData.startDate) : getMinDate()}
            blockedDates={blockedDates}
            required
          />
          
          <Input
            label={t('notesLabel')}
            value={bookingData.notes}
            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
          />

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
    </Layout>
  );
}
