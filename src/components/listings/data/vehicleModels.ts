// Vehicle type definitions
export enum VehicleType {
  CAR = "car",
  MOTORCYCLE = "motorcycle",
  TRUCK = "truck",
  VAN = "van",
  BUS = "bus",
  TRACTOR = "tractor",
  CONSTRUCTION = "construction",
}

export type ModelData = {
  [make: string]: string[];
};

export type VehicleDataStructure = {
  regular: ModelData;
  electric?: ModelData;
};

import { carModels } from "@/components/listings/data/subcategories/carModels";
import { trucksModels } from "@/components/listings/data/subcategories/trucksModels";
import { vansModels } from "@/components/listings/data/subcategories/vansModels";
import { busesModels } from "@/components/listings/data/subcategories/busesModels";
import { motorcycleModels } from "@/components/listings/data/subcategories/motorcyclesModels";
import { tractorsModels } from "@/components/listings/data/subcategories/tractorsModels";
import { constructionModels } from "@/components/listings/data/subcategories/constructionModels";

const vehicleModelsByType: Record<VehicleType, VehicleDataStructure> = {
  [VehicleType.CAR]: {
    regular: carModels.regular || {},
    electric: carModels.electric || {},
  },
  [VehicleType.TRUCK]: {
    regular: trucksModels.regular || {},
    electric: trucksModels.electric || {},
  },
  [VehicleType.VAN]: {
    regular: vansModels.regular || {},
    electric: vansModels.electric || {},
  },
  [VehicleType.BUS]: {
    regular: busesModels.regular || {},
  },
  [VehicleType.MOTORCYCLE]: {
    regular: motorcycleModels.regular || {},
    electric: motorcycleModels.electric || {},
  },
  [VehicleType.TRACTOR]: {
    regular: tractorsModels.regular || {},
  },
  [VehicleType.CONSTRUCTION]: {
    regular: constructionModels.regular || {},
  },
};

export const getMakesForType = (type: VehicleType): string[] => {
  const vehicleData = vehicleModelsByType[type];
  if (!vehicleData) return [];

  const regularMakes = Object.keys(vehicleData.regular);
  const electricMakes = vehicleData.electric
    ? Object.keys(vehicleData.electric)
    : [];

  return [...new Set([...regularMakes, ...electricMakes])];
};

export const getModelsForMakeAndType = (
  make: string,
  type: VehicleType,
): string[] => {
  const vehicleData = vehicleModelsByType[type];
  if (!vehicleData) return [];

  const regularModels = vehicleData.regular[make] || [];
  const electricModels = vehicleData.electric?.[make] || [];

  return [...new Set([...regularModels, ...electricModels])];
};

export const isElectricModel = (model: string, type: VehicleType): boolean => {
  const vehicleData = vehicleModelsByType[type];
  if (!vehicleData?.electric) return false;

  return Object.values(vehicleData.electric).some((models) =>
    models.includes(model),
  );
};

export const searchMakesForType = (
  type: VehicleType,
  query: string,
): string[] => {
  const makes = getMakesForType(type);
  return makes.filter((make) =>
    make.toLowerCase().includes(query.toLowerCase()),
  );
};

export const searchModelsForMake = (
  make: string,
  type: VehicleType,
  query: string,
): string[] => {
  const models = getModelsForMakeAndType(make, type);
  return models.filter((model) =>
    model.toLowerCase().includes(query.toLowerCase()),
  );
};

export default vehicleModelsByType;
