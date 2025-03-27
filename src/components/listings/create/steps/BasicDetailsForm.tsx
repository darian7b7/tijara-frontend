import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCar,
  FaTruck,
  FaMotorcycle,
  FaShip,
  FaPlane,
  FaHome,
  FaBuilding,
  FaWarehouse,
} from "react-icons/fa";
import { BiLandscape, BiBuildingHouse } from "react-icons/bi";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  Condition,
  FormState,
  VehicleDetails,
  RealEstateDetails,
} from "../../../types/listings";

// Add TypeScript types for state variables
type Errors = Record<string, string>;
type TouchedFields = Record<string, boolean>;

// Vehicle subcategories with string literals
const vehicleSubcategories = [
  { value: "CAR" as VehicleType, label: "Car", icon: <FaCar /> },
  { value: "TRUCK" as VehicleType, label: "Truck", icon: <FaTruck /> },
  { value: "MOTORCYCLE" as VehicleType, label: "Motorcycle", icon: <FaMotorcycle /> },
  { value: "BOAT" as VehicleType, label: "Boat", icon: <FaShip /> },
  { value: "OTHER" as VehicleType, label: "Other", icon: <FaPlane /> },
] as const;

// Property subcategories with string literals
const propertySubcategories = [
  { value: "HOUSE" as PropertyType, label: "House", icon: <FaHome /> },
  { value: "APARTMENT" as PropertyType, label: "Apartment", icon: <BiBuildingHouse /> },
  { value: "CONDO" as PropertyType, label: "Condo", icon: <FaBuilding /> },
  { value: "LAND" as PropertyType, label: "Land", icon: <BiLandscape /> },
  { value: "COMMERCIAL" as PropertyType, label: "Commercial", icon: <FaWarehouse /> },
  { value: "OTHER" as PropertyType, label: "Other", icon: <FaBuilding /> },
] as const;

// Helper function to convert VehicleType string to VehicleDataType
const getVehicleDataType = (vehicleType: string): string => {
  const mapping: Record<string, string> = {
    CAR: "car",
    TRUCK: "truck",
    MOTORCYCLE: "motorcycle",
    BOAT: "boat",
    OTHER: "other",
  };
  return mapping[vehicleType] || "car";
};

// Initial form state
const initialFormState: FormState = {
  title: "",
  description: "",
  price: "0",
  category: {
    mainCategory: ListingCategory.VEHICLES,
    subCategory: "CAR" as VehicleType,
  },
  location: "",
  images: [],
  details: {
    vehicles: {
      vehicleType: "CAR" as VehicleType,
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      mileage: "0",
      fuelType: FuelType.GASOLINE,
      condition: Condition.GOOD,
      features: [] as string[],
    },
  },
  listingAction: "sell",
};

interface BasicDetailsFormProps {
  initialData: FormState;
  onSubmit: (data: FormState, isValid: boolean) => void;
}

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormState>({
    ...initialFormState,
    ...initialData,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleFieldChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Handle numeric fields
    if (field === "year" || field === "price" || field === "mileage") {
      const numericValue = typeof value === "string" ? parseFloat(value) : Number(value);
      if (!isNaN(numericValue)) {
        setFormData((prev) => ({
          ...prev,
          [field]: numericValue.toString(),
        }));
      }
      return;
    }

    // Handle vehicle fields
    if (field.startsWith("details.vehicles.")) {
      const vehicleField = field.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          vehicles: {
            ...(prev.details?.vehicles || {}),
            [vehicleField]: value,
          } as VehicleDetails,
        },
      }));
      return;
    }

    // Handle real estate fields
    if (field.startsWith("details.realEstate.")) {
      const realEstateField = field.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          realEstate: {
            ...(prev.details?.realEstate || {}),
            [realEstateField]: value,
          } as RealEstateDetails,
        },
      }));
      return;
    }

    // Handle other fields
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle category change
  const handleCategoryChange = (
    mainCategory: ListingCategory,
    subCategory: VehicleType | PropertyType,
  ) => {
    setFormData((prev) => {
      const newData: FormState = {
        ...prev,
        category: {
          mainCategory,
          subCategory,
        },
        details: mainCategory === ListingCategory.VEHICLES
          ? {
              vehicles: {
                vehicleType: subCategory as VehicleType,
                make: "",
                model: "",
                year: new Date().getFullYear().toString(),
                mileage: "0",
                fuelType: FuelType.GASOLINE,
                condition: Condition.GOOD,
                features: [] as string[],
              },
            }
          : {
              realEstate: {
                propertyType: subCategory as PropertyType,
                size: "0",
                yearBuilt: new Date().getFullYear().toString(),
                bedrooms: "0",
                bathrooms: "0",
                condition: Condition.GOOD,
                features: [] as string[],
              },
            },
      };
      return newData;
    });
  };

  // Validate form fields with proper type checking
  const validateField = (field: string, value: unknown): string => {
    if (value === undefined || value === null) {
      return t("fieldRequired");
    }

    if (typeof value === "string" && !value.trim()) {
      return t("fieldRequired");
    }

    if (field === "year" || field === "yearBuilt") {
      const year = Number(value);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        return t("invalidYear");
      }
    }

    if (field === "price") {
      const price = Number(value);
      if (isNaN(price) || price <= 0) {
        return t("invalidPrice");
      }
    }

    if (field === "mileage") {
      const mileage = Number(value);
      if (isNaN(mileage) || mileage < 0) {
        return t("invalidMileage");
      }
    }

    return "";
  };

  // Enhanced validation function with proper type safety
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    const requiredFields = ["title", "price", "location", "description"] as const;
    for (const field of requiredFields) {
      const value = formData[field];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    }

    // Validate vehicle fields
    if (formData.category.mainCategory === ListingCategory.VEHICLES && formData.details?.vehicles) {
      const vehicleFields = ["make", "model", "year", "mileage"] as const;
      for (const field of vehicleFields) {
        const value = formData.details.vehicles[field];
        const error = validateField(field, value);
        if (error) {
          newErrors[`details.vehicles.${field}`] = error;
        }
      }
    }

    // Validate real estate fields
    if (formData.category.mainCategory === ListingCategory.REAL_ESTATE && formData.details?.realEstate) {
      const realEstateFields = ["size", "yearBuilt", "bedrooms", "bathrooms"] as const;
      for (const field of realEstateFields) {
        const value = formData.details.realEstate[field];
        const error = validateField(field, value);
        if (error) {
          newErrors[`details.realEstate.${field}`] = error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with proper type safety
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setIsSubmitting(true);
      const submissionData: FormState = {
        ...formData,
        details: formData.category.mainCategory === ListingCategory.VEHICLES
          ? {
              vehicles: {
                vehicleType: formData.category.subCategory as VehicleType,
                make: formData.details?.vehicles?.make || "",
                model: formData.details?.vehicles?.model || "",
                year: formData.details?.vehicles?.year || new Date().getFullYear().toString(),
                mileage: formData.details?.vehicles?.mileage || "0",
                fuelType: formData.details?.vehicles?.fuelType || "gasoline",
                condition: formData.details?.vehicles?.condition || "good",
                features: formData.details?.vehicles?.features || [],
              },
            }
          : {
              realEstate: {
                propertyType: formData.category.subCategory as PropertyType,
                size: formData.details?.realEstate?.size || "0",
                yearBuilt: formData.details?.realEstate?.yearBuilt || new Date().getFullYear().toString(),
                bedrooms: formData.details?.realEstate?.bedrooms || "0",
                bathrooms: formData.details?.realEstate?.bathrooms || "0",
                condition: formData.details?.realEstate?.condition || "good",
                features: formData.details?.realEstate?.features || [],
              },
            }
      };
      onSubmit(submissionData, isValid);
      setIsSubmitting(false);
    }
  };

  const renderVehicleSelect = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {t("vehicleType")}
          <span className="text-red-600 ml-1" aria-hidden="true">
            *
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {vehicleSubcategories.map((category) => (
            <button
              key={category.value}
              type="button"
              className={`flex flex-col items-center p-3 border rounded-lg ${
                formData.category.subCategory === category.value
                  ? "bg-blue-500 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() =>
                handleCategoryChange(ListingCategory.VEHICLES, category.value)
              }
            >
              {category.icon}
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
        {errors.category && touched.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
    );
  };

  const renderRealEstateSelect = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {t("propertyType")}
          <span className="text-red-600 ml-1" aria-hidden="true">
            *
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {propertySubcategories.map((category) => (
            <button
              key={category.value}
              type="button"
              className={`flex flex-col items-center p-3 border rounded-lg ${
                formData.category.subCategory === category.value
                  ? "bg-green-500 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() =>
                handleCategoryChange(
                  ListingCategory.REAL_ESTATE,
                  category.value,
                )
              }
            >
              {category.icon}
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
        {errors.category && touched.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-6">
          {/* Category Selection Tab */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t("category")}
            </h2>

            <div className="flex justify-start mb-6">
              <div className="flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() =>
                    handleCategoryChange(
                      ListingCategory.VEHICLES,
                      "car",
                    )
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none focus:z-10 ${
                    formData.category.mainCategory === ListingCategory.VEHICLES
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  }`}
                  aria-pressed={
                    formData.category.mainCategory === ListingCategory.VEHICLES
                  }
                >
                  <FaCar className="inline-block mr-2 -mt-1" />
                  {t("vehicles")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCategoryChange(
                      ListingCategory.REAL_ESTATE,
                      "house",
                    )
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none focus:z-10 ${
                    formData.category.mainCategory === ListingCategory.REAL_ESTATE
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  }`}
                  aria-pressed={
                    formData.category.mainCategory === ListingCategory.REAL_ESTATE
                  }
                >
                  <BiBuildingHouse className="inline-block mr-2 -mt-1" />
                  {t("realEstate")}
                </button>
              </div>
            </div>

            {/* Subcategory selection */}
            {formData.category.mainCategory === ListingCategory.VEHICLES
              ? renderVehicleSelect()
              : renderRealEstateSelect()}
          </div>

          {/* Basic Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t("listingDetails")}
            </h2>

            {/* Title field with auto-generation helper text */}
            <FormField
              name="title"
              label={t("title")}
              type="text"
              value={formData.title ?? ""}
              onChange={(value) => handleFieldChange("title", value)}
              error={touched.title ? errors.title : undefined}
              placeholder={t("titlePlaceholder")}
            />

            {/* Render category-specific fields */}
            {formData.category.mainCategory === ListingCategory.VEHICLES ? (
              <div className="space-y-6">
                {Object.keys(formData.details.vehicles).map((field) => (
                  <FormField
                    key={field}
                    name={`details.vehicles.${field}`}
                    label={t(`vehicles.${field}`)}
                    type="text"
                    value={formData.details.vehicles[field] ?? ""}
                    onChange={(value) =>
                      handleFieldChange(`details.vehicles.${field}`, value)
                    }
                    error={
                      touched[`details.vehicles.${field}`]
                        ? errors[`details.vehicles.${field}`]
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(formData.details.realEstate).map((field) => (
                  <FormField
                    key={field}
                    name={`details.realEstate.${field}`}
                    label={t(`realEstate.${field}`)}
                    type="text"
                    value={formData.details.realEstate[field] ?? ""}
                    onChange={(value) =>
                      handleFieldChange(`details.realEstate.${field}`, value)
                    }
                    error={
                      touched[`details.realEstate.${field}`]
                        ? errors[`details.realEstate.${field}`]
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField
                name="price"
                label={t("price")}
                type="number"
                value={formData.price ?? ""}
                onChange={(value) => handleFieldChange("price", value)}
                error={touched.price ? errors.price : undefined}
                placeholder={t("pricePlaceholder")}
              />
              <FormField
                name="location"
                label={t("location")}
                type="text"
                value={formData.location ?? ""}
                onChange={(value) => handleFieldChange("location", value)}
                error={touched.location ? errors.location : undefined}
                placeholder={t("locationPlaceholder")}
              />
            </div>

            <FormField
              name="description"
              label={t("description")}
              type="textarea"
              value={formData.description ?? ""}
              onChange={(value) => handleFieldChange("description", value)}
              error={touched.description ? errors.description : undefined}
              placeholder={t("descriptionPlaceholder")}
            />

            {/* Image uploader will go here */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("images")}
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <span>{t("uploadImages")}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          console.log("Image upload started");

                          if (e.target.files) {
                            const fileArray = Array.from(e.target.files);
                            console.log(
                              `Selected ${fileArray.length} files`,
                              fileArray,
                            );

                            // Check file size and type
                            const validFiles = fileArray.filter((file) => {
                              const isValidType = [
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                              ].includes(file.type);
                              const isValidSize =
                                file.size <= 5 * 1024 * 1024; // 5MB max

                              if (!isValidType) {
                                console.error(`Invalid file type: ${file.type}`);
                              }
                              if (!isValidSize) {
                                console.error(
                                  `File too large: ${file.size / (1024 * 1024)}MB`,
                                );
                              }

                              return isValidType && isValidSize;
                            });

                            if (validFiles.length < fileArray.length) {
                              // Show error message about invalid files
                              setErrors((prev) => ({
                                ...prev,
                                images:
                                  "Some files were rejected. Please use JPEG or PNG images under 5MB.",
                              }));
                            }

                            console.log(
                              `${validFiles.length} valid files to be added`,
                            );

                            // Update the form data with the new images
                            const newImages = [
                              ...formData.images,
                              ...validFiles,
                            ];
                            setFormData({
                              ...formData,
                              images: newImages,
                            });
                            console.log("Images updated in form state", newImages);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">{t("dragAndDrop")}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </div>

              {/* Preview of uploaded images */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("uploadedImages")} ({formData.images.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden h-24"
                      >
                        {image instanceof File ? (
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                          onClick={() => {
                            const newImages = [...formData.images];
                            newImages.splice(index, 1);
                            setFormData({
                              ...formData,
                              images: newImages,
                            });
                            console.log(
                              `Removed image at index ${index}, ${newImages.length} images remaining`,
                            );
                          }}
                          aria-label={t("removeImage")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={(e) => {
              handleSubmit(e);
            }}
            disabled={isSubmitting || uploadingImages}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting || uploadingImages
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t("submitting")}
              </div>
            ) : (
              t("next")
            )}
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {(isSubmitting || uploadingImages) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>{uploadingImages ? t("uploadingImages") : t("submitting")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicDetailsForm;
