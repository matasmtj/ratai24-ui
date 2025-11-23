// API Types generated from OpenAPI spec

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID_HEV' | 'HYBRID_PHEV';
export type Gearbox = 'MANUAL' | 'AUTOMATIC';
export type BodyType = 'SEDAN' | 'HATCHBACK' | 'SUV' | 'WAGON' | 'COUPE' | 'CONVERTIBLE' | 'VAN' | 'PICKUP';
export type CarState = 'AVAILABLE' | 'LEASED' | 'MAINTENANCE';
export type ContractState = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type UserRole = 'USER' | 'ADMIN';

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}

// City
export interface City {
  id: number;
  name: string;
  country: string;
}

export interface CityCreate {
  name: string;
  country: string;
}

// Car
export interface Car {
  id: number;
  vin: string;
  numberPlate: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  cityId: number;
  seatCount: number;
  fuelType: FuelType;
  powerKW: number;
  engineCapacityL: number | null;
  bodyType: BodyType;
  gearbox: Gearbox;
  state: CarState;
  odometerKm: number;
}

export interface CarCreate {
  vin: string;
  numberPlate: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  cityId: number;
  seatCount?: number;
  fuelType: FuelType;
  powerKW: number;
  engineCapacityL?: number | null;
  bodyType: BodyType;
  gearbox: Gearbox;
  state?: CarState;
  odometerKm?: number;
}

// Contract
export interface Contract {
  id: number;
  userId: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  state: ContractState;
  mileageStartKm: number;
  mileageEndKm: number | null;
  fuelLevelStartPct: number;
  fuelLevelEndPct: number | null;
  extraFees: number;
  notes: string | null;
}

export interface ContractCreate {
  carId: number;
  startDate: string;
  endDate: string;
  mileageStartKm: number;
  fuelLevelStartPct: number;
  notes?: string;
}

export interface ContractUpdate {
  carId?: number;
  startDate?: string;
  endDate?: string;
  state?: ContractState;
  mileageEndKm?: number;
  fuelLevelEndPct?: number;
  notes?: string;
}

export interface ContractComplete {
  mileageEndKm: number;
  fuelLevelEndPct: number;
  damageFee?: number;
  notes?: string;
}

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
  role: UserRole;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
