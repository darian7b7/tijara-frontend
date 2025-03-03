import { useState } from "react";
import api from "../config/axios.config";
import { validateStep } from "../components/listings/validation/formValidation.js";

const initialDetails = {
  cars: {
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    bodyType: "",
    doors: "",
    power: "",
    transactionType: "Buy", // Default transaction type
  },
  "real-estate": {
    propertyType: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    yearBuilt: "",
    amenities: [],
    parking: "",
    transactionType: "Buy",
  },
};

const useCreateListing = () => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    description: "",
    mainCategory: "",
    subcategory: "",
    condition: "",
    details: {},
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 🔥 Updates form data dynamically, including nested details.
   */
  const updateFormData = (field, value) => {
    setFormData((prev) => {
      if (field === "mainCategory") {
        return {
          ...prev,
          mainCategory: value,
          subcategory: "", // Reset subcategory when category changes
          // Preserve existing details for the selected category
          details: {
            ...prev.details,
            ...(initialDetails[value] || {}),
          },
        };
      }
  
      if (field === "subcategory") {
        return {
          ...prev,
          subcategory: value,
          // Preserve existing details when changing subcategory
          details: {
            ...prev.details,
            ...initialDetails[prev.mainCategory],
          },
        };
      }
  
      // Handle nested fields
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
  
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  /**
   * 🔥 Validates the form step-by-step.
   */
  const validateForm = (step) => {
    console.log("Validating step:", step, "with data:", formData);
    const stepErrors = validateStep(step, formData);
    console.log("Validation errors:", stepErrors);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  /**
   * 🔥 Handles form submission with image uploads.
   */
  const submitListing = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          formData.images.forEach((image) => {
            formDataToSend.append("images", image);
          });
        } else if (key === "details") {
          formDataToSend.append("details", JSON.stringify(formData.details));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await api.post("/listings", formDataToSend);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 🔥 Resets form data (useful for creating a new listing).
   */
  const resetFormData = () => {
    setFormData({
      title: "",
      price: "",
      location: "",
      description: "",
      mainCategory: "",
      subcategory: "",
      condition: "",
      details: {},
      images: [],
    });
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    updateFormData,
    validateForm,
    submitListing,
    resetFormData,
  };
};

export default useCreateListing;
