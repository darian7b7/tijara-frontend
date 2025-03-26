// Category Types
export type Category = "vehicles" | "realEstate";
export type ListingType = "sale" | "rent";

export interface CategoryState {
  category: Category;
  listingType: ListingType;
}

// Basic Details Types
export interface BasicDetails {
  title: string;
  price: number;
  location: string;
  description: string;
  images: string[];
}

// Vehicle Types
export type VehicleType =
  | "car"
  | "motorcycle"
  | "truck"
  | "van"
  | "bus"
  | "tractor"
  | "construction";
export type VehicleCondition = "excellent" | "good" | "fair" | "poor";
export type TransmissionType = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "electric" | "hybrid";

export interface VehicleDetails {
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  features: string[];
}

// Property Types
export type PropertyType = "house" | "apartment" | "building" | "land";
export type LeaseDuration = "6months" | "1year" | "2years" | "flexible";

export interface PropertyDetails {
  type: PropertyType;
  size: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  leaseDuration?: LeaseDuration;
  amenities: string[];
}

// Form State
export interface FormState {
  category: CategoryState;
  basicDetails: BasicDetails;
  vehicleDetails: VehicleDetails;
  propertyDetails: PropertyDetails;
}

// Vehicle Form Options
export const vehicleTypes = [
  { value: "car", label: "Car" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "bus", label: "Bus" },
  { value: "tractor", label: "Tractor" },
  { value: "construction", label: "Construction Equipment" },
];

export const vehicleConditions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export const transmissionTypes = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

export const fuelTypes = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
];

export const vehicleFeatures = [
  "Air Conditioning",
  "Power Steering",
  "Power Windows",
  "ABS",
  "Airbags",
  "Navigation System",
  "Bluetooth",
  "Parking Sensors",
  "Backup Camera",
  "Sunroof",
  "Leather Seats",
  "Heated Seats",
  "Cruise Control",
  "Keyless Entry",
  "Alarm System",
];

export type ListingFieldSchema = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "date" | "colorpicker";
  required?: boolean;
  options?: string[];
  dependsOn?: string;
  section?:
    | "essential"
    | "performance"
    | "comfort"
    | "safety"
    | "features"
    | "outdoor"
    | "security";
};

export type ListingsSchemaMap = Record<string, ListingFieldSchema[]>;

export interface FormSection {
  title: string;
  fields: ListingFieldSchema[];
}
