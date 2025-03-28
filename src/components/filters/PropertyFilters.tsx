import React from "react";
import type { SelectOption } from "@/types/common";
import FormField from "@/components/listings/create/common/FormField";
import { useTranslation } from "react-i18next";
import type { FormFieldValue } from "@/components/listings/create/common/FormField";

interface PropertyFiltersProps {
  onFilterChange: (filterName: string, value: string | number) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFilterChange,
}) => {
  const { t } = useTranslation();

  const propertyTypeOptions: SelectOption[] = [
    { value: "", label: "All Types" },
    { value: "HOUSE", label: "House" },
    { value: "APARTMENT", label: "Apartment" },
    { value: "CONDO", label: "Condo" },
    { value: "LAND", label: "Land" },
    { value: "COMMERCIAL", label: "Commercial" },
    { value: "OTHER", label: "Other" },
  ];

  const bedroomOptions: SelectOption[] = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
    { value: "5", label: "5+" },
  ];

  const bathroomOptions: SelectOption[] = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ];

  return (
    <div className="space-y-4">
      <FormField
        type="select"
        name="propertyType"
        label={t("filters.propertyType")}
        options={propertyTypeOptions}
        onChange={(value: FormFieldValue) =>
          onFilterChange("propertyType", value as string)
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          type="select"
          name="bedrooms"
          label={t("filters.bedrooms")}
          options={bedroomOptions}
          onChange={(value: FormFieldValue) =>
            onFilterChange("bedrooms", value as string)
          }
        />

        <FormField
          type="select"
          name="bathrooms"
          label={t("filters.bathrooms")}
          options={bathroomOptions}
          onChange={(value: FormFieldValue) =>
            onFilterChange("bathrooms", value as string)
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          type="number"
          name="minPrice"
          label={t("filters.minPrice")}
          onChange={(value: FormFieldValue) =>
            onFilterChange("minPrice", Number(value))
          }
        />

        <FormField
          type="number"
          name="maxPrice"
          label={t("filters.maxPrice")}
          onChange={(value: FormFieldValue) =>
            onFilterChange("maxPrice", Number(value))
          }
        />
      </div>
    </div>
  );
};

export default PropertyFilters;
