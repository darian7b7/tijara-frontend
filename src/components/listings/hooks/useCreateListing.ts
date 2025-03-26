import { useState } from "react";
import { ListingCategory } from "@/types/listings";

interface VehicleDetails {
  make: string;
  model: string;
  year: string;
  power: string;
  doors: string;
  paintCondition: string;
  bodyType: string;
  mileage: string;
  fuelType: string;
  transmission: string;
}

interface RealEstateDetails {
  propertyType: string;
  size: string;
  bedrooms: string;
  bathrooms: string;
}

interface FormState {
  title: string;
  description: string;
  price: string;
  category: ListingCategory;
  location: string;
  images: File[];
  features: string[];
  details: {
    vehicles?: VehicleDetails;
    realEstate?: RealEstateDetails;
  };
}

interface UseCreateListingReturn {
  formData: FormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleSubmit: () => Promise<void>;
}

const initialFormState: FormState = {
  title: "",
  description: "",
  price: "",
  category: ListingCategory.VEHICLES,
  location: "",
  images: [],
  features: [],
  details: {
    vehicles: {
      make: "",
      model: "",
      year: "",
      power: "",
      doors: "",
      paintCondition: "",
      bodyType: "",
      mileage: "",
      fuelType: "",
      transmission: "",
    },
  },
};

export const useCreateListing = (): UseCreateListingReturn => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation rules
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.location) newErrors.location = "Location is required";

    // Category-specific validation
    if (formData.category === ListingCategory.VEHICLES) {
      const vehicles = formData.details.vehicles;
      if (!vehicles?.make) newErrors.make = "Make is required";
      if (!vehicles?.model) newErrors.model = "Model is required";
      if (!vehicles?.year) newErrors.year = "Year is required";
    } else {
      const realEstate = formData.details.realEstate;
      if (!realEstate?.propertyType)
        newErrors.propertyType = "Property type is required";
      if (!realEstate?.size) newErrors.size = "Size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // API call would go here
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create listing");
      }

      // Reset form after successful submission
      setFormData(initialFormState);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to create listing. Please try again.",
      }));
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
