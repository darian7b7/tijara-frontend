import { useState } from "react";
import { FormState } from "@/types/listings";
import {
  ListingCategory,
  VehicleType,
  FuelType,
  TransmissionType,
  Condition,
  PropertyType,
} from "@/types/enums";
import { listingsAPI, createListing } from "@/api/listings.api";
import { toast } from "react-hot-toast";
import type { APIResponse, SingleListingResponse } from "@/api/listings.api";

export interface UseCreateListingReturn {
  formData: FormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleSubmit: (
    data: FormData | FormState,
  ) => Promise<SingleListingResponse | undefined>;
}

const initialFormState: FormState = {
  title: "",
  description: "",
  price: 0,
  category: {
    mainCategory: ListingCategory.VEHICLES,
    subCategory: VehicleType.CAR,
  },
  location: "",
  images: [],
  details: {
    vehicles: {
      vehicleType: VehicleType.CAR,
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      mileage: "",
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATIC,
      color: "",
      condition: Condition.GOOD,
      features: [],
      interiorColor: "",
      engine: "",
      horsepower: undefined,
      torque: undefined,
      warranty: "",
      serviceHistory: "",
      previousOwners: undefined,
      registrationStatus: "",
    },
  },
  listingAction: "sell",
};

export const useCreateListing = (): UseCreateListingReturn => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: FormState) => {
      const keys = field.split(".");
      const newFormData = { ...prev };
      let current: any = newFormData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newFormData;
    });
  };

  const validateForm = (data: FormState) => {
    const newErrors: Record<string, string> = {};
    const missingFields: string[] = [];

    // Basic validation rules with detailed logging
    if (!data.title?.trim()) {
      newErrors["title"] = "Title is required";
      missingFields.push("title");
    }
    if (!data.description?.trim()) {
      newErrors["description"] = "Description is required";
      missingFields.push("description");
    }
    const numericPrice =
      typeof data.price === "string" ? parseFloat(data.price) : data.price || 0;
    if (isNaN(numericPrice) || numericPrice <= 0) {
      newErrors["price"] = "Valid price is required";
      missingFields.push("price");
    }
    if (!data.location?.trim()) {
      newErrors["location"] = "Location is required";
      missingFields.push("location");
    }
    if (!data.category?.mainCategory) {
      newErrors["category.mainCategory"] = "Category is required";
      missingFields.push("category.mainCategory");
    }
    if (!data.category?.subCategory) {
      newErrors["category.subCategory"] = "Subcategory is required";
      missingFields.push("category.subCategory");
    }
    if (!data.images || data.images.length === 0) {
      newErrors["images"] = "At least one image is required";
      missingFields.push("images");
    }

    // Category-specific validation with detailed logging
    if (data.category?.mainCategory === ListingCategory.VEHICLES) {
      const vehicles = data.details?.vehicles;
      if (!vehicles) {
        newErrors["details.vehicles"] = "Vehicle details are required";
        missingFields.push("details.vehicles");
      } else {
        const vehicleFields = {
          make: vehicles.make?.trim(),
          model: vehicles.model?.trim(),
          year: vehicles.year?.trim(),
          mileage: vehicles.mileage?.trim(),
          fuelType: vehicles.fuelType,
          transmission: vehicles.transmission,
          color: vehicles.color?.trim(),
          condition: vehicles.condition,
          interiorColor: vehicles.interiorColor?.trim(),
          warranty: vehicles.warranty?.toString()?.trim(),
          serviceHistory: vehicles.serviceHistory?.trim(),
          previousOwners: vehicles.previousOwners,
          registrationStatus: vehicles.registrationStatus?.trim(),
        };

        // Log vehicle field values
        console.log("Vehicle field values:", vehicleFields);

        Object.entries(vehicleFields).forEach(([field, value]) => {
          if (!value) {
            newErrors[`details.vehicles.${field}`] = `${field} is required`;
            missingFields.push(`details.vehicles.${field}`);
          }
        });
      }
    } else if (data.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      const realEstate = data.details?.realEstate;
      if (!realEstate) {
        newErrors["details.realEstate"] = "Real estate details are required";
        missingFields.push("details.realEstate");
      } else {
        const realEstateFields = {
          propertyType: realEstate.propertyType,
          size: realEstate.size?.trim(),
          yearBuilt: realEstate.yearBuilt?.trim(),
          bedrooms: realEstate.bedrooms?.trim(),
          bathrooms: realEstate.bathrooms?.trim(),
          condition: realEstate.condition,
        };

        // Log real estate field values
        console.log("Real estate field values:", realEstateFields);

        Object.entries(realEstateFields).forEach(([field, value]) => {
          if (!value) {
            newErrors[`details.realEstate.${field}`] = `${field} is required`;
            missingFields.push(`details.realEstate.${field}`);
          }
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.error("Validation errors:", {
        errors: newErrors,
        missingFields: missingFields,
        formData: {
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          category: data.category,
          images: data.images?.length,
          details: data.details,
        },
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    data: FormData | FormState,
  ): Promise<SingleListingResponse | undefined> => {
    try {
      setIsSubmitting(true);

      if (!(data instanceof FormData)) {
        // Log the incoming data
        console.log("Incoming form data:", {
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          category: data.category,
          images: data.images?.length,
          details: data.details,
        });

        // Validate and normalize form data
        if (!validateForm(data)) {
          console.error("Form validation failed. Current errors:", errors);
          throw new Error("Form validation failed");
        }

        // Create a new FormData instance
        const formData = new FormData();

        // Ensure price is a valid number
        const price =
          typeof data.price === "string"
            ? parseFloat(data.price)
            : data.price || 0;
        if (isNaN(price)) {
          throw new Error("Invalid price format");
        }

        // Add basic fields with null checks
        formData.append("title", data.title || "");
        formData.append("description", data.description || "");
        formData.append("price", price.toString());
        formData.append("location", data.location || "");
        formData.append(
          "listingAction",
          (data.listingAction || "sell").toUpperCase(),
        );

        // Add category information
        const category = {
          mainCategory: data.category?.mainCategory || ListingCategory.VEHICLES,
          subCategory: data.category?.subCategory || VehicleType.CAR,
        };
        formData.append("category", JSON.stringify(category));

        // Add details based on category
        const details = {
          vehicles:
            data.category?.mainCategory === ListingCategory.VEHICLES
              ? {
                  ...data.details?.vehicles,
                  vehicleType:
                    data.details?.vehicles?.vehicleType || VehicleType.CAR,
                  make: data.details?.vehicles?.make || "",
                  model: data.details?.vehicles?.model || "",
                  year:
                    data.details?.vehicles?.year ||
                    new Date().getFullYear().toString(),
                  mileage: data.details?.vehicles?.mileage || "0",
                  fuelType:
                    data.details?.vehicles?.fuelType || FuelType.GASOLINE,
                  transmission:
                    data.details?.vehicles?.transmission ||
                    TransmissionType.AUTOMATIC,
                  color: data.details?.vehicles?.color || "",
                  condition:
                    data.details?.vehicles?.condition || Condition.GOOD,
                  features: data.details?.vehicles?.features || [],
                  interiorColor: data.details?.vehicles?.interiorColor || "",
                  warranty: data.details?.vehicles?.warranty?.toString() || "",
                  serviceHistory: data.details?.vehicles?.serviceHistory || "",
                  previousOwners:
                    data.details?.vehicles?.previousOwners?.toString() || "0",
                  registrationStatus:
                    data.details?.vehicles?.registrationStatus || "",
                  engine: data.details?.vehicles?.engine || "",
                  horsepower:
                    data.details?.vehicles?.horsepower?.toString() || "0",
                  torque: data.details?.vehicles?.torque?.toString() || "0",
                }
              : undefined,
          realEstate:
            data.category?.mainCategory === ListingCategory.REAL_ESTATE
              ? {
                  ...data.details?.realEstate,
                  propertyType:
                    data.details?.realEstate?.propertyType ||
                    PropertyType.HOUSE,
                  size: data.details?.realEstate?.size || "",
                  yearBuilt: data.details?.realEstate?.yearBuilt || "",
                  bedrooms: data.details?.realEstate?.bedrooms || "",
                  bathrooms: data.details?.realEstate?.bathrooms || "",
                  condition:
                    data.details?.realEstate?.condition || Condition.GOOD,
                  features: data.details?.realEstate?.features || [],
                }
              : undefined,
        };
        formData.append("details", JSON.stringify(details));

        // Add images
        if (data.images && data.images.length > 0) {
          data.images.forEach((image, index) => {
            if (image instanceof File) {
              formData.append(`images`, image);
            }
          });
        }

        // Log the FormData entries for debugging
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }

        // Submit the form data
        const response = await createListing(formData);
        if (response.success) {
          toast.success("Listing created successfully!");
          return response;
        } else {
          throw new Error(response.error || "Failed to create listing");
        }
      } else {
        // If data is already FormData, submit it directly
        const response = await createListing(data);
        if (response.success) {
          toast.success("Listing created successfully!");
          return response;
        } else {
          throw new Error(response.error || "Failed to create listing");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while creating the listing";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
  };
};

export default useCreateListing;
