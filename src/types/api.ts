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

// Car Image
export interface CarImage {
  id: number;
  carId: number;
  filename: string;
  url: string;
  isMain: boolean;
  createdAt: string;
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
  images?: CarImage[];
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

// User
export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdate {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  password?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface UserAdminUpdate {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  password?: string;
  role?: UserRole;
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
  user?: User; // Populated user data (admin endpoint)
  car?: Car; // Populated car data (admin endpoint)
}

export interface ContractCreate {
  carId: number;
  startDate: string;
  endDate: string;
  mileageStartKm: number;
  fuelLevelStartPct: number;
  notes?: string;
}

// Contact
export interface Contact {
  id: number;
  email: string;
  phone: string;
  operationAreas: string; // Comma-separated list of cities/regions
  updatedAt: string;
}

export interface ContactUpdate {
  email: string;
  phone: string;
  operationAreas: string;
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
