import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingPage } from '../components/ui/Loading';
import { carsApi } from '../api/cars';
import { citiesApi } from '../api/cities';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { contractsApi } from '../api/contracts';
import type { ContractCreate, FuelType } from '../types/api';
import { 
  TruckIcon,
  MapPinIcon,
  Cog6ToothIcon,
  BoltIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    mileageStartKm: '',
    fuelLevelStartPct: '100',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: city } = useQuery({
    queryKey: ['city', car?.cityId],
    queryFn: () => citiesApi.getById(car!.cityId),
    enabled: !!car?.cityId,
  });

  const getFuelIcon = (fuelType: FuelType) => {
    if (fuelType === 'ELECTRIC') return '⚡';
    if (fuelType.includes('HYBRID')) return '🔋';
    return '⛽';
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    setIsSubmitting(true);
    try {
      const contractData: ContractCreate = {
        carId: car.id,
        startDate: new Date(bookingData.startDate).toISOString(),
        endDate: new Date(bookingData.endDate).toISOString(),
        mileageStartKm: Number(bookingData.mileageStartKm),
        fuelLevelStartPct: Number(bookingData.fuelLevelStartPct),
        notes: bookingData.notes || undefined,
      };

      await contractsApi.create(contractData);
      setIsBookingModalOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking error:', error);
      alert('Nepavyko sukurti rezervacijos. Bandykite dar kartą.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!car) return <div>Automobilis nerastas</div>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/cars" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Grįžti į sąrašą
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Image */}
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <TruckIcon className="h-48 w-48 text-gray-400" />
            </div>
          </Card>

          {/* Car Details */}
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {car.make} {car.model}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    car.state === 'AVAILABLE'
                      ? 'bg-green-100 text-green-800'
                      : car.state === 'LEASED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {car.state === 'AVAILABLE' ? 'Laisvas' : car.state === 'LEASED' ? 'Išnuomotas' : 'Servise'}
                </span>
              </div>
              <p className="text-xl text-gray-600">{car.year} m.</p>
            </div>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Specifikacijos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">VIN</div>
                  <div className="font-medium">{car.vin}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Valstybinis numeris</div>
                  <div className="font-medium">{car.numberPlate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Kuras</div>
                  <div className="font-medium flex items-center">
                    <span className="mr-2">{getFuelIcon(car.fuelType)}</span>
                    {car.fuelType}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Pavarų dėžė</div>
                  <div className="font-medium flex items-center">
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    {car.gearbox === 'AUTOMATIC' ? 'Automatinė' : 'Mechaninė'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Galia</div>
                  <div className="font-medium flex items-center">
                    <BoltIcon className="h-4 w-4 mr-2" />
                    {car.powerKW} kW
                  </div>
                </div>
                {car.engineCapacityL && (
                  <div>
                    <div className="text-sm text-gray-500">Variklio tūris</div>
                    <div className="font-medium">{car.engineCapacityL} L</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Kėbulo tipas</div>
                  <div className="font-medium">{car.bodyType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Vietų skaičius</div>
                  <div className="font-medium">{car.seatCount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Rida</div>
                  <div className="font-medium">{car.odometerKm.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Vieta</div>
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
                  <div className="text-sm text-gray-600 mb-1">Kaina per dieną</div>
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
                        Rezervuoti
                      </Button>
                    ) : !isAuthenticated ? (
                      <Link to="/login">
                        <Button size="lg">Prisijunkite, kad rezervuotumėte</Button>
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
        title="Rezervuoti automobilį"
        size="lg"
      >
        <form onSubmit={handleBooking} className="space-y-4">
          <Input
            label="Pradžios data"
            type="datetime-local"
            value={bookingData.startDate}
            onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
            required
          />
          <Input
            label="Pabaigos data"
            type="datetime-local"
            value={bookingData.endDate}
            onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
            required
          />
          <Input
            label="Pradinis ridos rodmuo (km)"
            type="number"
            value={bookingData.mileageStartKm}
            onChange={(e) => setBookingData({ ...bookingData, mileageStartKm: e.target.value })}
            placeholder={car.odometerKm.toString()}
            required
          />
          <Input
            label="Pradinis kuro lygis (%)"
            type="number"
            min="0"
            max="100"
            value={bookingData.fuelLevelStartPct}
            onChange={(e) => setBookingData({ ...bookingData, fuelLevelStartPct: e.target.value })}
            required
          />
          <Input
            label="Pastabos (neprivaloma)"
            value={bookingData.notes}
            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBookingModalOpen(false)}
            >
              Atšaukti
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Patvirtinti rezervaciją
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
