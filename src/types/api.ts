// API Types generated from OpenAPI spec

export type FuelType =
  | 'PETROL'
  | 'PETROL_LPG'
  | 'DIESEL'
  | 'ELECTRIC'
  | 'HYBRID_HEV'
  | 'HYBRID_PHEV';
export type Gearbox = 'MANUAL' | 'AUTOMATIC';
export type BodyType =
  | 'SEDAN'
  | 'HATCHBACK'
  | 'SUV'
  | 'WAGON'
  | 'COUPE'
  | 'CONVERTIBLE'
  | 'VAN'
  | 'PICKUP'
  | 'MINIBUS_PASSENGER'
  | 'MINIBUS_CARGO';
export type CarState = 'AVAILABLE' | 'LEASED' | 'MAINTENANCE';
export type ContractState = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type UserRole = 'USER' | 'ADMIN';
export type PartCondition = 'NEW' | 'USED' | 'DAMAGED';

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
  order?: number;
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
  occupiedToday?: boolean;
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
  /** From API; used for “popularity” sort (rental utilization) */
  utilizationRate?: number | null;
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
export interface ContractLockHolder {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

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
  depositConfirmed?: boolean;
  user?: User; // Populated user data (admin endpoint)
  car?: Car; // Populated car data (admin endpoint)
  editLockedByUserId?: number | null;
  editLockedAt?: string | null;
  editLockedBy?: ContractLockHolder | null;
  editLockActive?: boolean;
  editLockExpiresAt?: string | null;
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
  companyName?: string;
  companyCode?: string;
  bankAccount?: string;
  companyEmail?: string;
  mainAddress?: string;
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
  companyName?: string;
  companyCode?: string;
  bankAccount?: string;
  companyEmail?: string;
  mainAddress?: string;
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
  language?: string;
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
  order?: number;
  createdAt: string;
}

export interface Part {
  id: number;
  partName: string;
  oemNumber?: string | null;
  make: string;
  model: string;
  year: number;
  colour?: string | null;
  engineCapacityL?: number | null;
  powerKW?: number | null;
  fuelType?: FuelType | null;
  gearbox?: Gearbox | null;
  bodyType?: BodyType | null;
  description?: string | null;
  condition: PartCondition;
  price: number;
  images?: PartImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PartCreate {
  partName: string;
  oemNumber?: string | null;
  make: string;
  model: string;
  year: number;
  colour?: string | null;
  engineCapacityL?: number | null;
  powerKW?: number | null;
  fuelType?: FuelType | null;
  gearbox?: Gearbox | null;
  bodyType?: BodyType | null;
  description?: string | null;
  condition: PartCondition;
  price: number;
}

export interface PartUpdate {
  partName?: string;
  oemNumber?: string | null;
  make?: string;
  model?: string;
  year?: number;
  colour?: string | null;
  engineCapacityL?: number | null;
  powerKW?: number | null;
  fuelType?: FuelType | null;
  gearbox?: Gearbox | null;
  bodyType?: BodyType | null;
  description?: string | null;
  condition?: PartCondition;
  price?: number;
}

// Legal pages CMS
export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalPageContentData {
  intro: string;
  sections: LegalSection[];
  note?: string;
}

export interface LegalPageContent {
  id: number;
  pageKey: string;
  language: string;
  content: LegalPageContentData;
  updatedAt: string;
}
