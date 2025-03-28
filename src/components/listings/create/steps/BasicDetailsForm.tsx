import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FormState,
  ListingCategory,
  PropertyType,
  VehicleDetails,
  RealEstateDetails,
} from "@/types/listings";
import {
  getMakesForType,
  getModelsForMakeAndType,
  VehicleType,
} from "@/components/listings/data/vehicleModels";
import {
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaShuttleVan,
  FaBus,
  FaTractor,
  FaTruckPickup,
  FaMapMarkerAlt,
  FaTag,
  FaMoneyBillWave,
  FaAlignLeft,
} from "react-icons/fa";
import { BiBuildingHouse, BiBuildings, BiLandscape } from "react-icons/bi";
import FormField from "@/components/listings/create/common/FormField";
import { listingsFieldSchema } from "@/components/listings/create/basic/listingsBasicFieldSchema";

// Define interfaces
interface BasicDetailsFormProps {
  initialData: FormState;
  onSubmit: (data: FormState, isValid: boolean) => void;
}

interface ListingFieldSchema {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "date"
    | "colorpicker"
    | "multiselect"
    | "email"
    | "password"
    | "tel";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

// Motion animation variants
const formAnimations = { opacity: 1 };

// Vehicle subcategories with proper type safety
const vehicleSubcategories = [
  { value: VehicleType.CAR, label: "Cars", icon: <FaCar /> },
  {
    value: VehicleType.MOTORCYCLE,
    label: "Motorcycles",
    icon: <FaMotorcycle />,
  },
  { value: VehicleType.TRUCK, label: "Trucks", icon: <FaTruck /> },
  { value: VehicleType.VAN, label: "Vans", icon: <FaShuttleVan /> },
  { value: VehicleType.BUS, label: "Buses", icon: <FaBus /> },
  { value: VehicleType.TRACTOR, label: "Tractors", icon: <FaTractor /> },
  {
    value: VehicleType.CONSTRUCTION,
    label: "Construction",
    icon: <FaTruckPickup />,
  },
] as const;

// Real estate subcategories with proper type safety
const realEstateSubcategories = [
  { value: PropertyType.HOUSE, label: "Houses", icon: <BiBuildingHouse /> },
  { value: PropertyType.APARTMENT, label: "Apartments", icon: <BiBuildings /> },
  { value: PropertyType.LAND, label: "Land", icon: <BiLandscape /> },
  {
    value: PropertyType.COMMERCIAL,
    label: "Commercial",
    icon: <BiBuildings />,
  },
  {
    value: PropertyType.INDUSTRIAL,
    label: "Industrial",
    icon: <BiBuildings />,
  },
] as const;

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormState>({
    ...initialData,
    details: initialData.details || {
      vehicles: undefined,
      realEstate: undefined,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category selection UI state
  const [showCategorySelector, setShowCategorySelector] = useState(true);

  // Add new state for make and model fields
  const [makeValue, setMakeValue] = useState<string>("");
  const [modelValue, setModelValue] = useState<string>("");
  const [yearValue, setYearValue] = useState<string>(
    new Date().getFullYear().toString(),
  );

  // Helper function to convert VehicleType enum to VehicleDataType
  const mapEnumToModelType = (vehicleType: VehicleType): string => {
    const mapping: Record<VehicleType, string> = {
      [VehicleType.CAR]: "car",
      [VehicleType.TRUCK]: "truck",
      [VehicleType.MOTORCYCLE]: "motorcycle",
      [VehicleType.RV]: "van", // mapping RV to van as closest match
      [VehicleType.BOAT]: "construction", // mapping BOAT to construction as fallback
      [VehicleType.OTHER]: "car", // fallback to car for OTHER
    };
    return mapping[vehicleType] || "car";
  };

  const getBasicFieldsForSubcategory = () => {
    if (
      formData.category.mainCategory === ListingCategory.VEHICLES &&
      formData.category.subCategory
    ) {
      return listingsFieldSchema[formData.category.subCategory] || [];
    }
    return [];
  };

  // Generate make options for the current vehicle type
  const generateMakeOptions = () => {
    if (!formData.category.subCategory) return [];
    const makes = getMakesForType(
      mapEnumToModelType(formData.category.subCategory as VehicleType),
    );
    return makes.map((make) => ({ value: make, label: make }));
  };

  // Generate model options based on selected make
  const getModelOptions = (make: string) => {
    if (!formData.category.subCategory || !make) return [];
    const models = getModelsForMakeAndType(
      make,
      mapEnumToModelType(formData.category.subCategory as VehicleType),
    );
    return models.map((model) => ({ value: model, label: model }));
  };

  // Initialize make/model/year values from formData
  useEffect(() => {
    if (formData.details?.vehicles) {
      // Set make value from form data
      if (formData.details.vehicles.make) {
        setMakeValue(formData.details.vehicles.make);
      }

      // Set model value from form data
      if (formData.details.vehicles.model) {
        setModelValue(formData.details.vehicles.model);
      }

      // Set year value from form data
      if (formData.details.vehicles.year) {
        setYearValue(formData.details.vehicles.year);
      }
    }
  }, [
    formData.details?.vehicles?.make,
    formData.details?.vehicles?.model,
    formData.details?.vehicles?.year,
  ]);

  // Effect to update title when make, model, or year changes
  useEffect(() => {
    if (makeValue && modelValue) {
      // Get the selected make and model labels
      const vehicleDataType = mapEnumToModelType(
        formData.category.subCategory as VehicleType,
      );
      const makes = getMakesForType(vehicleDataType);
      const models = getModelsForMakeAndType(makeValue, vehicleDataType);

      // Find the make and model with proper capitalization
      const makeLabel = makes.find((m) => m === makeValue) || makeValue;
      const modelLabel = models.find((m) => m === modelValue) || modelValue;

      // Generate the title
      const autoTitle = `${makeLabel} ${modelLabel} ${yearValue}`;

      // Only update if title is empty or previously auto-generated
      if (
        autoTitle &&
        (!formData.title ||
          formData.title === "" ||
          formData.title.startsWith("🚗") ||
          formData.title.startsWith("🏠"))
      ) {
        handleInputChange("title", autoTitle);
      }

      // Also update the vehicle details in formData
      if (
        formData.category.mainCategory === ListingCategory.VEHICLES &&
        formData.details.vehicles
      ) {
        setFormData((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            vehicles: {
              ...prev.details.vehicles!,
              make: makeLabel,
              model: modelLabel,
              year: yearValue,
            },
          },
        }));
      }
    }
  }, [
    makeValue,
    modelValue,
    yearValue,
    formData.location,
    formData.category.subCategory,
  ]);

  // Fixed handleInputChange to handle nested objects properly with type safety
  const handleInputChange = (fieldName: string, value: any) => {
    const fieldPath = fieldName.split(".");

    setFormData((prevData) => {
      const newData = { ...prevData };
      let current: any = newData;

      // Navigate to the nested object
      for (let i = 0; i < fieldPath.length - 1; i++) {
        const key = fieldPath[i];
        if (!current[key]) {
          current[key] = {};
        }
        current[key] = { ...current[key] };
        current = current[key];
      }

      // Set the value at the final path
      const lastKey = fieldPath[fieldPath.length - 1];
      current[lastKey] = value;

      // Special handling for vehicle details
      if (fieldName === "category.subCategory" && value) {
        // Initialize vehicle details if not present
        if (!newData.details.vehicles) {
          newData.details.vehicles = {
            vehicleType: value,
            make: "",
            model: "",
            year: new Date().getFullYear().toString(),
            fuelType: "GASOLINE",
            transmissionType: "AUTOMATIC",
            condition: "GOOD",
            features: [],
          };
        } else {
          newData.details.vehicles.vehicleType = value;
        }
      }

      return newData;
    });

    // Clear error when field is modified
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Update type definition for form field types
  type FormFieldType =
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "date"
    | "colorpicker"
    | "multiselect"
    | "email"
    | "password"
    | "tel";

  // Fixed renderFormField to handle nested objects with proper type safety
  const renderFormField = (
    label: string,
    fieldName: string,
    type: FormFieldType = "text",
    options?: Array<{ value: string; label: string }>,
    icon?: React.ReactNode,
    placeholder?: string,
    min?: number,
    max?: number,
    step?: number,
    required: boolean = true,
    helpText?: string,
  ) => {
    const fieldPath = fieldName.split(".");

    // Get the value from nested objects with type safety
    let fieldValue: any = formData;
    for (const path of fieldPath) {
      if (fieldValue && typeof fieldValue === "object") {
        fieldValue = fieldValue[path];
      } else {
        fieldValue = undefined;
        break;
      }
    }

    const fieldError = errors[fieldName];
    const isTouched = touched[fieldName];

    return (
      <div className={`relative ${icon ? "pl-8" : ""}`}>
        {icon && (
          <div className="absolute left-0 top-8 text-gray-400">{icon}</div>
        )}
        <FormField
          name={fieldName}
          label={label}
          type={type}
          value={fieldValue ?? ""}
          onChange={(value) => handleInputChange(fieldName, value)}
          error={isTouched ? fieldError : undefined}
          placeholder={placeholder}
          options={options}
          required={required}
          min={min}
          max={max}
          step={step}
          helpText={helpText}
        />
      </div>
    );
  };

  const renderVehicleFields = () => {
    if (!formData.details?.vehicles) {
      return null;
    }

    const fields = getBasicFieldsForSubcategory();

    return (
      <div className="space-y-6">
        {fields.map((field: ListingFieldSchema) => {
          const fieldValue = formData.details?.vehicles?.[field.name];

          // Handle numeric values
          let processedValue: string | number = fieldValue || "";
          if (field.type === "number" && fieldValue) {
            const numValue = parseFloat(fieldValue as string);
            if (!isNaN(numValue)) {
              processedValue = numValue;
            }
          }

          // Get field options
          let options = field.options;
          if (field.name === "make") {
            options = getMakesForType(
              mapEnumToModelType(formData.category.subCategory as VehicleType),
            );
          } else if (field.name === "model" && makeValue) {
            options = getModelsForMakeAndType(
              makeValue,
              mapEnumToModelType(formData.category.subCategory as VehicleType),
            );
          }

          return (
            <FormField
              key={field.name}
              name={field.name}
              label={t(field.label)}
              type={field.type}
              options={options?.map((opt: string) => ({
                value: opt,
                label: t(`options.${opt}`),
              }))}
              value={processedValue}
              onChange={(value) => handleVehicleFieldChange(field.name, value)}
              required={field.required}
              placeholder={field.placeholder ? t(field.placeholder) : undefined}
              min={field.min}
              max={field.max}
            />
          );
        })}
      </div>
    );
  };

  const renderRealEstateFields = () => {
    if (formData.category.mainCategory !== ListingCategory.REAL_ESTATE) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {renderFormField(
            t("bedrooms"),
            "details.realEstate.bedrooms",
            "number",
            undefined,
            undefined,
            t("enterBedrooms"),
            0,
          )}
          {renderFormField(
            t("bathrooms"),
            "details.realEstate.bathrooms",
            "number",
            undefined,
            undefined,
            t("enterBathrooms"),
            0,
            undefined,
            t("halfBathroomsAllowed"),
          )}
          {renderFormField(
            t("size"),
            "details.realEstate.size",
            "number",
            undefined,
            undefined,
            t("enterSize"),
            0,
          )}
          {renderFormField(
            t("yearBuilt"),
            "details.realEstate.yearBuilt",
            "number",
            undefined,
            undefined,
            t("enterYearBuilt"),
            1900,
            new Date().getFullYear() + 1,
          )}
        </div>
      </div>
    );
  };

  const renderCategoryFields = () => {
    if (!formData.details) {
      return null;
    }

    if (formData.category.mainCategory === ListingCategory.VEHICLES) {
      return renderVehicleFields();
    } else if (formData.category.mainCategory === ListingCategory.REAL_ESTATE) {
      return renderRealEstateFields();
    }
    return null;
  };

  const handleCategoryChange = (
    mainCategory: ListingCategory,
    subCategory: VehicleType | PropertyType,
  ) => {
    // Update the category in form data
    setFormData((prev: FormState) => {
      const newData = {
        ...prev,
        category: {
          mainCategory,
          subCategory,
        },
      };

      // Initialize appropriate details structure based on category
      if (mainCategory === ListingCategory.VEHICLES) {
        newData.details = {
          vehicles: {
            vehicleType: subCategory as VehicleType,
            make: "",
            model: "",
            year: new Date().getFullYear().toString(),
            fuelType: "GASOLINE",
            transmissionType: "AUTOMATIC",
            condition: "GOOD",
            features: [],
          },
        };
      } else if (mainCategory === ListingCategory.REAL_ESTATE) {
        newData.details = {
          realEstate: {
            propertyType: subCategory as PropertyType,
            size: "",
            yearBuilt: "",
            bedrooms: "",
            bathrooms: "",
            condition: "GOOD",
            features: [],
          },
        };
      }

      return newData;
    });

    // Reset errors and touched state
    setErrors({});
    setTouched({});

    // Reset make/model state
    setMakeValue("");
    setModelValue("");

    // Show category selector
    setShowCategorySelector(false);
  };

  const handleMakeChange = (value: string) => {
    const newMake = value.toString();

    // Update both local and form state
    setMakeValue(newMake);
    setModelValue("");

    // Update vehicle details with type safety
    handleInputChange("details.vehicles", {
      ...formData.details.vehicles!,
      make: newMake,
      model: "",
      vehicleType: formData.category.subCategory as VehicleType,
    });
  };

  const handleModelChange = (value: string) => {
    const newModel = value.toString();

    // Update both local and form state
    setModelValue(newModel);

    // Update vehicle details with type safety
    handleInputChange("details.vehicles", {
      ...formData.details.vehicles!,
      model: newModel,
      vehicleType: formData.category.subCategory as VehicleType,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Image upload started");

    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      console.log(`Selected ${fileArray.length} files`, fileArray);

      // Check file size and type
      const validFiles = fileArray.filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
          file.type,
        );
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

        if (!isValidType) {
          console.error(`Invalid file type: ${file.type}`);
        }
        if (!isValidSize) {
          console.error(`File too large: ${file.size / (1024 * 1024)}MB`);
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

      console.log(`${validFiles.length} valid files to be added`);

      // Update the form data with the new images
      const newImages = [...formData.images, ...validFiles];
      setFormData({
        ...formData,
        images: newImages,
      });
      console.log("Images updated in form state", newImages);
    }
  };

  // Handle image removal function
  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });

    console.log(
      `Removed image at index ${index}, ${newImages.length} images remaining`,
    );
  };

  // Enhanced validation function to ensure all required fields are checked
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic fields validation
    if (!formData.title?.trim()) newErrors.title = t("fieldRequired");
    if (!formData.description?.trim())
      newErrors.description = t("fieldRequired");
    if (!formData.price) {
      newErrors.price = t("fieldRequired");
    } else {
      const price = parseFloat(formData.price.toString());
      if (isNaN(price) || price <= 0) {
        newErrors.price = t("validPriceRequired");
      }
    }
    if (!formData.location?.trim()) newErrors.location = t("fieldRequired");
    if (!formData.category?.mainCategory)
      newErrors.category = t("categoryRequired");

    // Vehicle specific validation
    if (formData.category?.mainCategory === ListingCategory.VEHICLES) {
      const vehicles = formData.details?.vehicles;

      if (!vehicles?.vehicleType) {
        newErrors["details.vehicles.vehicleType"] = t("fieldRequired");
      }

      // Validate make
      if (!vehicles?.make) {
        newErrors["details.vehicles.make"] = t("fieldRequired");
      }

      // Validate custom make if "Other" is selected
      if (vehicles?.make === "Other" && !vehicles?.customMake?.trim()) {
        newErrors["details.vehicles.customMake"] = t("fieldRequired");
      }

      // Validate model
      if (!vehicles?.model) {
        newErrors["details.vehicles.model"] = t("fieldRequired");
      }

      // Validate custom model if "Custom" is selected
      if (vehicles?.model === "Custom" && !vehicles?.customModel?.trim()) {
        newErrors["details.vehicles.customModel"] = t("fieldRequired");
      }

      // Validate year
      if (!vehicles?.year) {
        newErrors["details.vehicles.year"] = t("fieldRequired");
      } else {
        const year = parseInt(vehicles.year as string);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          newErrors["details.vehicles.year"] = t("validYearRequired");
        }
      }
    }

    // Real estate specific validation
    if (formData.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      const realEstate = formData.details?.realEstate;

      if (!realEstate?.propertyType) {
        newErrors["details.realEstate.propertyType"] = t("fieldRequired");
      }
      if (!realEstate?.size) {
        newErrors["details.realEstate.size"] = t("fieldRequired");
      }
      if (!realEstate?.yearBuilt) {
        newErrors["details.realEstate.yearBuilt"] = t("fieldRequired");
      }
      if (!realEstate?.bedrooms) {
        newErrors["details.realEstate.bedrooms"] = t("fieldRequired");
      }
      if (!realEstate?.bathrooms) {
        newErrors["details.realEstate.bathrooms"] = t("fieldRequired");
      }
    }

    // Log for debugging
    console.log("Validation errors:", newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhance handleSubmit for better feedback
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    // Mark all fields as touched for validation display
    const allFieldsTouched: Record<string, boolean> = {};

    // Basic fields
    const basicFields = [
      "title",
      "description",
      "price",
      "location",
      "category",
    ];
    basicFields.forEach((field) => {
      allFieldsTouched[field] = true;
    });

    // Category-specific fields
    if (formData.category.mainCategory === ListingCategory.VEHICLES) {
      const vehicleFields = [
        "details.vehicles.vehicleType",
        "details.vehicles.make",
        "details.vehicles.model",
        "details.vehicles.year",
      ];
      vehicleFields.forEach((field) => {
        allFieldsTouched[field] = true;
      });

      // Add custom fields if needed
      if (formData.details?.vehicles?.make === "Other") {
        allFieldsTouched["details.vehicles.customMake"] = true;
      }
      if (formData.details?.vehicles?.model === "Custom") {
        allFieldsTouched["details.vehicles.customModel"] = true;
      }
    } else if (formData.category.mainCategory === ListingCategory.REAL_ESTATE) {
      allFieldsTouched["details.realEstate.propertyType"] = true;
      allFieldsTouched["details.realEstate.size"] = true;
      allFieldsTouched["details.realEstate.yearBuilt"] = true;
      allFieldsTouched["details.realEstate.bedrooms"] = true;
      allFieldsTouched["details.realEstate.bathrooms"] = true;
    }

    setTouched(allFieldsTouched);

    // Perform validation
    const isValid = validateForm();
    console.log("Form validation result:", isValid);

    // Prepare the data to be submitted
    let submissionData = { ...formData };

    // Handle vehicle special cases - substitute custom values if selected
    if (
      formData.category.mainCategory === ListingCategory.VEHICLES &&
      formData.details.vehicles
    ) {
      // If user selected "Other" make, use the custom make value
      if (
        formData.details.vehicles.make === "Other" &&
        formData.details.vehicles.customMake
      ) {
        submissionData = {
          ...submissionData,
          details: {
            ...submissionData.details,
            vehicles: {
              ...submissionData.details.vehicles!,
              make: formData.details.vehicles.customMake,
            },
          },
        };
      }

      // If user selected "Custom" model, use the custom model value
      if (
        formData.details.vehicles.model === "Custom" &&
        formData.details.vehicles.customModel
      ) {
        submissionData = {
          ...submissionData,
          details: {
            ...submissionData.details,
            vehicles: {
              ...submissionData.details.vehicles!,
              model: formData.details.vehicles.customModel,
            },
          },
        };
      }
    }

    // Log the final submission data
    console.log("Submitting data:", submissionData);

    // Call the parent's onSubmit function with prepared data and validation status
    onSubmit(submissionData, isValid);
    setIsSubmitting(false);
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
          {realEstateSubcategories.map((category) => (
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

  const handleVehicleFieldChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        vehicles: {
          ...prev.details.vehicles,
          [field]: field === "year" ? Number(value) : value,
        },
      },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={formAnimations}
        className="bg-white shadow-sm rounded-lg p-6"
      >
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
                      VehicleType.CAR,
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
                      PropertyType.HOUSE,
                    )
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none focus:z-10 ${
                    formData.category.mainCategory ===
                    ListingCategory.REAL_ESTATE
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  }`}
                  aria-pressed={
                    formData.category.mainCategory ===
                    ListingCategory.REAL_ESTATE
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
            {renderFormField(
              t("title"),
              "title",
              "text",
              undefined,
              <FaTag />,
              t("titlePlaceholder"),
              undefined,
              undefined,
              makeValue && modelValue
                ? t("autoGeneratedFromDetails")
                : undefined,
            )}

            {/* Render category-specific fields */}
            {renderCategoryFields()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {renderFormField(
                t("price"),
                "price",
                "number",
                undefined,
                <FaMoneyBillWave />,
                t("pricePlaceholder"),
              )}
              {renderFormField(
                t("location"),
                "location",
                "text",
                undefined,
                <FaMapMarkerAlt />,
                t("locationPlaceholder"),
              )}
            </div>

            {renderFormField(
              t("description"),
              "description",
              "textarea",
              undefined,
              <FaAlignLeft />,
              t("descriptionPlaceholder"),
            )}

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
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none"
                    >
                      <span>{t("uploadImages")}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={handleImageUpload}
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
                          onClick={() => handleRemoveImage(index)}
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
            onClick={() => {
              const isValid = validateForm();
              onSubmit(formData, isValid);
            }}
            disabled={isSubmitting || uploadingImages}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting || uploadingImages ? "opacity-70 cursor-not-allowed" : ""}`}
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
      </motion.div>

      {/* Loading overlay */}
      {(isSubmitting || uploadingImages) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>{uploadingImages ? t("uploadingImages") : t("submitting")}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BasicDetailsForm;
