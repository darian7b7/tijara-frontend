export enum ListingCategory {
  VEHICLES = "VEHICLES",
  REAL_ESTATE = "REAL_ESTATE"
}

export enum VehicleType {
  CARS = "CARS",
  MOTORCYCLES = "MOTORCYCLES",
  BOATS = "BOATS",
  OTHER = "OTHER"
}

export enum PropertyType {
  HOUSE = "HOUSE",
  APARTMENT = "APARTMENT",
  LAND = "LAND",
  OTHER = "OTHER"
}

export enum FuelType {
  GASOLINE = "GASOLINE",
  DIESEL = "DIESEL",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID"
}

export enum TransmissionType {
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL"
}

export enum Condition {
  NEW = "NEW",
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR"
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: Location;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  details?: {
    vehicles?: {
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
    };
    realEstate?: {
      propertyType: PropertyType;
      size: string;
      bedrooms: string;
      bathrooms: string;
      features: string[];
    };
  };
  attributes?: Record<string, string>;
  features?: string[];
}

export interface ListingResponse {
  success: boolean;
  data: Listing | null;
  error?: string;
  status: number;
}

export interface FormState {
  title: string;
  description: string;
  price: number | string;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: string;
  images: (File | string)[];
  details: {
    vehicles?: {
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
    };
    realEstate?: {
      propertyType: PropertyType;
      size: string;
      bedrooms: string;
      bathrooms: string;
      features: string[];
    };
  };
  listingAction?: 'sell' | 'rent';
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginatedListingResponse {
  success: boolean;
  data: PaginatedData<Listing>;
  status: number;
  error?: string;
}

export interface ListingCreateInput {
  title: string;
  description: string;
  price: number;
  location: Location;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  images: string[];
  attributes?: Record<string, string>;
  features?: string[];
}

export interface ListingUpdateInput extends Partial<ListingCreateInput> {
  id: string;
}

export interface ListingFilters {
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListingWithRelations extends Listing {
  seller?: {
    id: string;
    username: string;
    profilePicture?: string | null;
  };
  savedBy?: Array<{ id: string; userId: string; }>;
}

export interface ListingParams extends ListingFilters {
  page?: number;
  limit?: number;
  userId?: string;
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
}

export interface ListingLocation extends Location {}

// For backward compatibility
export type Category = ListingCategory;