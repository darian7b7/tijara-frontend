// Shared API Response types
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
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

export interface PaginatedResponse<T> extends APIResponse<PaginatedData<T>> {}

// Listing related types
export enum ListingCategory {
  VEHICLES = "VEHICLES",
  REAL_ESTATE = "REAL_ESTATE",
}

export enum VehicleType {
  CARS = "CARS",
  MOTORCYCLES = "MOTORCYCLES",
  TRUCKS = "TRUCKS",
  BUSES = "BUSES",
  VANS = "VANS",
  CONSTRUCTION = "CONSTRUCTION",
  TRACTORS = "TRACTORS",
  BOATS = "BOATS",
  OTHER = "OTHER",
}

export enum PropertyType {
  HOUSE = "HOUSE",
  APARTMENT = "APARTMENT",
  LAND = "LAND",
  OTHER = "OTHER",
}

export enum FuelType {
  GASOLINE = "GASOLINE",
  DIESEL = "DIESEL",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID",
  OTHER = "OTHER",
}

export enum TransmissionType {
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL",
  SEMI_AUTOMATIC = "SEMI_AUTOMATIC",
}

export enum Condition {
  NEW = "NEW",
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
}

export interface CategoryType {
  mainCategory: ListingCategory;
  subCategory: VehicleType | PropertyType;
}

export interface VehicleDetails {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  color: string;
  condition: Condition;
  features: string[];
  customMake?: string;
  customModel?: string;
}

export interface PropertyDetails {
  propertyType: PropertyType;
  size: string;
  bedrooms: string;
  bathrooms: string;
  yearBuilt: string;
  features: string[];
}

export interface ListingDetails {
  vehicles?: VehicleDetails;
  realEstate?: PropertyDetails;
}

export interface FormState {
  title: string;
  description: string;
  price: string | number;
  category: CategoryType;
  location: string;
  condition?: string;
  images: (File | string)[];
  details: ListingDetails;
  attributes?: any[];
  features?: any[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  status: string;
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
  savedBy?: {
    id: string;
    userId: string;
  }[];
  attributes?: any;
  features?: string[];
}

export type ListingWithRelations = Listing;

export interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListingUpdateInput {
  title?: string;
  description?: string;
  price?: number | string;
  category?: string | CategoryType;
  location?: string;
  condition?: string;
  images?: (File | string)[];
  attributes?: any[];
  features?: any[];
}

export interface ListingParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
  listing?: Listing;
}
