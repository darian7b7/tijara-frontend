import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCarSide,
  FaCogs,
  FaCouch,
  FaShieldAlt,
  FaBuilding,
  FaSwimmingPool,
  FaTree,
  FaLock,
} from "react-icons/fa";
import {
  FormState,
  ListingFieldSchema,
  AdvancedDetailsFormProps,
  Category,
  ListingCategory,
  VehicleDetails,
  RealEstateDetails,
} from "@/types/listings";
import { listingsAdvancedFieldSchema } from "../advanced/listingsAdvancedFieldSchema";
import FormField from "../common/FormField";

interface ExtendedFormState extends FormState {
  category: Category;
  details: {
    vehicles?: VehicleDetails;
    realEstate?: RealEstateDetails;
  };
}

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

const AdvancedDetailsForm: React.FC<AdvancedDetailsFormProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ExtendedFormState>(
    initialData as ExtendedFormState,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("essential");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVehicle = formData.category.mainCategory === ListingCategory.VEHICLES;
  const categoryType = isVehicle
    ? formData.category.subCategory?.toLowerCase() || "cars"
    : formData.category.subCategory?.toLowerCase() || "residential";

  const vehicleSections = [
    { id: "essential", title: t("essential"), icon: FaCarSide },
    { id: "performance", title: t("performance"), icon: FaCogs },
    { id: "comfort", title: t("comfort"), icon: FaCouch },
    { id: "safety", title: t("safety"), icon: FaShieldAlt },
  ];

  const realEstateSections = [
    { id: "essential", title: t("essential"), icon: FaBuilding },
    { id: "features", title: t("features"), icon: FaSwimmingPool },
    { id: "outdoor", title: t("outdoor"), icon: FaTree },
    { id: "security", title: t("security"), icon: FaLock },
  ];

  const sections = isVehicle ? vehicleSections : realEstateSections;

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData((prev) => {
      const newFormData = { ...prev };

      if (isVehicle && prev.details?.vehicles) {
        newFormData.details = {
          ...prev.details,
          vehicles: {
            ...prev.details.vehicles,
            [field]: value,
          },
        };
      } else if (!isVehicle && prev.details?.realEstate) {
        newFormData.details = {
          ...prev.details,
          realEstate: {
            ...prev.details.realEstate,
            [field]: value,
          },
        };
      }

      return newFormData;
    });
  };

  const renderFields = () => {
    const fields = listingsAdvancedFieldSchema[categoryType] || [];
    const sectionFields = fields.filter(
      (field) => field.section === activeSection,
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionFields.map((field: ListingFieldSchema) => (
          <FormField
            key={field.name}
            name={field.name}
            label={t(field.label)}
            type={field.type as FormFieldType}
            options={field.options?.map((opt: string) => ({
              value: opt,
              label: t(`options.${opt}`),
            }))}
            value={
              isVehicle
                ? formData.details?.vehicles?.[field.name] || ""
                : formData.details?.realEstate?.[field.name] || ""
            }
            onChange={(value) => handleInputChange(field.name, value)}
            error={errors[`details.${field.name}`]}
            required={field.required}
            disabled={isSubmitting}
            className={errors[`details.${field.name}`] ? "border-red-500" : ""}
          />
        ))}
      </div>
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fields = listingsAdvancedFieldSchema[categoryType] || [];

    fields.forEach((field) => {
      const value = isVehicle
        ? formData.details?.vehicles?.[field.name]
        : formData.details?.realEstate?.[field.name];

      if (field.required && (!value || value === "")) {
        newErrors[`details.${field.name}`] = t("fieldRequired");
      }

      if (value && field.type === "number") {
        const numValue = parseFloat(value as string);
        if (
          isNaN(numValue) ||
          (field.min && numValue < field.min) ||
          (field.max && numValue > field.max)
        ) {
          newErrors[`details.${field.name}`] = t("invalidNumber");
        }
      }

      if (
        value &&
        field.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        newErrors[`details.${field.name}`] = t("invalidEmail");
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm();
    if (isValid) {
      onSubmit(formData, true);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex space-x-4 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            disabled={isSubmitting}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {React.createElement(section.icon, { className: "w-5 h-5" })}
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      {renderFields()}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("submitting") : t("continue")}
        </button>
      </div>
    </form>
  );
};

export default AdvancedDetailsForm;
