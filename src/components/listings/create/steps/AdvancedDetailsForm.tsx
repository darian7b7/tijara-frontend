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

const AdvancedDetailsForm: React.FC<AdvancedDetailsFormProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ExtendedFormState>(
    initialData as ExtendedFormState
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("essential");

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
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => {
      const newFormData = { ...prev };
      const category = prev.category.mainCategory.toLowerCase();

      if (category === "vehicles" && prev.details?.vehicles) {
        newFormData.details = {
          ...prev.details,
          vehicles: {
            ...prev.details.vehicles,
            [field]: value,
          },
        };
      } else if (category === "real_estate" && prev.details?.realEstate) {
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
      (field) => field.section === activeSection
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionFields.map((field: ListingFieldSchema) => (
          <FormField
            key={field.name}
            name={field.name}
            label={t(field.label)}
            type={field.type}
            options={field.options?.map((opt: string) => ({ 
              value: opt, 
              label: t(`options.${opt}`)
            }))}
            value={
              isVehicle
                ? formData.details?.vehicles?.[field.name] || ""
                : formData.details?.realEstate?.[field.name] || ""
            }
            onChange={(value) => handleInputChange(field.name, value)}
            error={errors[`details.${field.name}`]}
            required={field.required}
          />
        ))}
      </div>
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const fields = listingsAdvancedFieldSchema[categoryType] || [];

    fields.forEach((field) => {
      const value = isVehicle
        ? formData.details?.vehicles?.[field.name]
        : formData.details?.realEstate?.[field.name];

      if (field.required && !value) {
        newErrors[`details.${field.name}`] = t("fieldRequired");
      }

      if (value && field.type === "number") {
        const numValue = parseFloat(value as string);
        if (isNaN(numValue) || numValue < 0) {
          newErrors[`details.${field.name}`] = t("invalidNumber");
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = validateForm();
    onSubmit(formData, isFormValid);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section Switcher */}
      <div className="flex space-x-4 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {React.createElement(section.icon, { className: "w-5 h-5" })}
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      {renderFields()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          {t("continue")}
        </button>
      </div>
    </form>
  );
};

export default AdvancedDetailsForm;
