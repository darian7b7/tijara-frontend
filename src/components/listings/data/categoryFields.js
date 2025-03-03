export const categoryFields = {
  vehicles: {
    requiredFields: ["year", "mileage", "fuelType", "power", "transmission"],
    validations: {
      year: { type: "number", min: 1900, message: "Year must be a valid number" },
      mileage: { type: "number", min: 0, message: "Mileage must be a positive number" },
      fuelType: { type: "string", message: "Fuel type is required" },
      power: { type: "number", min: 1, message: "Power must be greater than 1" },
      transmission: { type: "string", message: "Transmission type is required" },
    },
    conditionalFields: {
      trucks: ["maxLoadCapacity"],
      motorcycles: ["engineCapacity"],
    },
  },

  realEstate: {
    requiredFields: ["size", "rooms", "propertyType", "location"],
    validations: {
      size: { type: "number", min: 1, message: "Size must be a valid number" },
      rooms: { type: "number", min: 1, message: "Rooms must be at least 1" },
      propertyType: { type: "string", message: "Property type is required" },
      location: { type: "string", message: "Location is required" },
    },
    conditionalFields: {
      commercial: ["floor", "parkingSpaces"],
      land: ["landType", "utilities"],
    },
  },
};
