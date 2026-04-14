// API Types generated from OpenAPI spec

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID_HEV' | 'HYBRID_PHEV';
export type Gearbox = 'MANUAL' | 'AUTOMATIC';
export type BodyType = 'SEDAN' | 'HATCHBACK' | 'SUV' | 'WAGON' | 'COUPE' | 'CONVERTIBLE' | 'VAN' | 'PICKUP';
export type CarState = 'AVAILABLE' | 'LEASED' | 'MAINTENANCE';
export type ContractState = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type UserRole = 'USER' | 'ADMIN';
export type PartCondition = 'NEW' | 'USED_GOOD' | 'USED_FAIR' | 'REFURBISHED';

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
  availableForLease?: boolean;
  availableForSale?: boolean;
  salePrice?: number | null;
  saleDescription?: string | null;
  cityId: number;
  seatCount: number;
  fuelType: FuelType;
  powerKW: number;
  engineCapacityL: number | null;
  bodyType: BodyType;
  gearbox: Gearbox;
  colour?: string | null;
  state: CarState;
  odometerKm: number;
  isActive?: boolean;
  images?: CarImage[];
  // Pricing config
  useDynamicPricing?: boolean;
  basePricePerDay?: number;
  minPricePerDay?: number;
  maxPricePerDay?: number;
  applyUtilizationPricing?: boolean;
  utilizationMultiplierOverride?: number | null;
}

export interface CarCreate {
  vin: string;
  numberPlate: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  availableForLease?: boolean;
  availableForSale?: boolean;
  salePrice?: number | null;
  saleDescription?: string | null;
  cityId: number;
  seatCount?: number;
  fuelType: FuelType;
  powerKW: number;
  engineCapacityL?: number | null;
  bodyType: BodyType;
  gearbox: Gearbox;
  colour?: string | null;
  state?: CarState;
  odometerKm?: number;
  // Pricing config
  useDynamicPricing?: boolean;
  basePricePerDay?: number;
  minPricePerDay?: number;
  maxPricePerDay?: number;
  applyUtilizationPricing?: boolean;
  utilizationMultiplierOverride?: number | null;
}

// User
export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  phoneNumber: string | null;
  role: UserRole;
  isActive?: boolean;
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

/** Internal calendar holds returned with GET /cars/:id/contracts (not shown as contracts to users). */
export interface CarPrepBlock {
  id: number;
  carId: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

export interface CarContractsCalendar {
  contracts: Contract[];
  prepBlocks: CarPrepBlock[];
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
export interface OperationArea {
  id?: number; // Include ID for updates to prevent recreation
  cityId: number;
  address?: string;
}

export interface OperationAreaDetail {
  id: number;
  cityId: number;
  cityName: string;
  country: string;
  address?: string;
}

export interface Contact {
  id: number;
  email: string;
  phone: string;
  businessHoursWeekdays: string;
  businessHoursWeekend: string;
  operationAreas: string; // Comma-separated city names
  operationAreasDetails: OperationAreaDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactUpdate {
  email: string;
  phone: string;
  businessHoursWeekdays: string;
  businessHoursWeekend: string;
  operationAreas: OperationArea[];
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Part
export interface PartImage {
  id: number;
  partId: number;
  filename: string;
  url: string;
  isMain: boolean;
  createdAt: string;
}

export interface Part {
  id: number;
  name: string;
  description?: string | null;
  partNumber?: string | null;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: PartCondition;
  quantity: number;
  categoryId?: number | null;
  categoryName?: string | null;
  location?: string | null;
  images?: PartImage[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartCreate {
  name: string;
  description?: string | null;
  partNumber?: string | null;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: PartCondition;
  quantity: number;
  categoryId?: number | null;
  location?: string | null;
}

export interface PartUpdate {
  name?: string;
  description?: string | null;
  partNumber?: string | null;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  condition?: PartCondition;
  quantity?: number;
  categoryId?: number | null;
  location?: string | null;
  isActive?: boolean;
}

// Part Category
export interface PartCategory {
  id: number;
  name: string;
  nameEn: string;
  nameLt: string;
  icon?: string | null;
  parentId?: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartCategoryCreate {
  name: string;
  nameEn: string;
  nameLt: string;
  icon?: string | null;
  parentId?: number | null;
  sortOrder?: number;
}

export interface PartCategoryUpdate {
  name?: string;
  nameEn?: string;
  nameLt?: string;
  icon?: string | null;
  parentId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}
