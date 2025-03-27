// Import vehicle models data and types
import type { VehicleType, ModelData, VehicleDataStructure } from "@/components/listings/data/vehicleModels";
import { getMakesForType, getModelsForMakeAndType, searchMakesForType, searchModelsForMakeAndType } from "@/components/listings/data/vehicleModels";

export enum ListingCategory {
  VEHICLES = 'VEHICLES',
  REAL_ESTATE = 'REAL_ESTATE',
}

export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  CONDO = 'CONDO',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  OTHER = 'OTHER',
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  PLUGIN_HYBRID = 'pluginHybrid',
  LPG = 'lpg',
  CNG = 'cng',
  OTHER = 'other'
}

export enum TransmissionType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  SEMI_AUTOMATIC = 'semiAutomatic',
  CONTINUOUSLY_VARIABLE = 'continuouslyVariable',
  DUAL_CLUTCH = 'dualClutch',
  OTHER = 'other'
}

export enum Condition {
  NEW = 'new',
  LIKE_NEW = 'likeNew',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  SALVAGE = 'salvage'
}

export interface VehicleDetails {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  vehicleType?: VehicleType;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  color?: string;
  interiorColor?: string;
  condition?: Condition;
  warranty?: number;
  serviceHistory?: string;
  previousOwners?: number;
  registrationStatus?: string;
  engine?: string;
  horsepower?: number;
  torque?: number;
  drivetrain?: string;
  fuelEfficiency?: number;
  engineConfiguration?: string;
  turbocharger?: boolean;
  supercharger?: boolean;
  tires?: string;
  brakeType?: string;
  airConditioning?: string;
  seatingMaterial?: string;
  seatHeating?: string;
  seatVentilation?: string;
  seatMemory?: boolean;
  steeringAdjustment?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface RealEstateDetails {
  propertyType?: PropertyType;
  size?: number;
  yearBuilt?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parkingSpaces?: number;
  furnished?: boolean;
  condition?: Condition;
  heatingType?: string;
  coolingType?: string;
  waterType?: string;
  internetType?: string;
  securitySystem?: boolean;
  fireplace?: boolean;
  pool?: string;
  garden?: boolean;
  balcony?: boolean;
  elevator?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface Category {
  mainCategory: ListingCategory;
  subCategory?: string;
}

export interface ListingFieldSchema {
  name: string;
  label: string;
  type: string;
  section: string;
  options?: string[];
  required?: boolean;
}

export interface FormState {
  title: string;
  description: string;
  price: number;
  category: Category;
  location: string;
  images: Array<string | File>;
  details?: {
    vehicles?: VehicleDetails;
    realEstate?: RealEstateDetails;
  };
  features?: string[];
  listingAction?: 'sell' | 'rent';
}

export interface AdvancedDetailsFormProps {
  initialData: FormState;
  onSubmit: (data: FormState, isValid: boolean) => void;
  onBack: () => void;
}

export interface PaginatedListingResponse {
  data?: {
    items: Listing[];
    total: number;
    page: number;
    limit: number;
  };
  success: boolean;
  error?: string;
}

export interface Listing extends FormState {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  favorite?: boolean;
}

export interface ListingUpdateInput {
  title?: string;
  description?: string;
  price?: number;
  category?: Category;
  location?: string;
  images?: Array<string | File>;
  details?: {
    vehicles?: VehicleDetails;
    realEstate?: RealEstateDetails;
  };
  features?: string[];
  listingAction?: 'sell' | 'rent';
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ListingResponse {
  success: boolean;
  data: Listing | null;
  error?: string;
  status: number;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ListingFilters {
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListingParams extends ListingFilters {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface ListingWithRelations extends Listing {
  seller?: {
    id: string;
    username: string;
    profilePicture?: string | null;
  };
  savedBy?: Array<{ id: string; userId: string; }>;
}

export interface ListingCreateInput {
  title: string;
  description: string;
  price: number;
  location: Location;
  category: Category;
  images: string[];
  attributes?: Record<string, string>;
  features?: string[];
}

export interface Details {
  vehicles?: VehicleDetails;
  realEstate?: RealEstateDetails;
}

// For backward compatibility
export type Category = ListingCategory;