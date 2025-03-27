import React from "react";
import type { SelectOption } from "@/types/common";
import FormField, { type FormFieldValue } from "@/components/listings/create/common/FormField";
import { useTranslation } from "react-i18next";
import { FuelType, TransmissionType } from "@/types/listings";

interface VehicleFiltersProps {
  onFilterChange: (filterName: string, value: string | number) => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();

  const vehicleTypeOptions: SelectOption[] = [
    { value: "", label: t("all_types") },
    { value: "car", label: t("car") },
    { value: "motorcycle", label: t("motorcycle") },
    { value: "truck", label: t("truck") },
    { value: "van", label: t("van") },
    { value: "bus", label: t("bus") },
    { value: "tractor", label: t("tractor") },
    { value: "construction", label: t("construction") },
  ];

  const fuelTypeOptions: SelectOption[] = [
    { value: "", label: t("all_types") },
    { value: FuelType.GASOLINE, label: t("gasoline") },
    { value: FuelType.DIESEL, label: t("diesel") },
    { value: FuelType.ELECTRIC, label: t("electric") },
    { value: FuelType.HYBRID, label: t("hybrid") },
    { value: FuelType.PLUGIN_HYBRID, label: t("plugin_hybrid") },
    { value: FuelType.LPG, label: t("lpg") },
    { value: FuelType.CNG, label: t("cng") },
    { value: FuelType.OTHER, label: t("other") },
  ];

  const transmissionOptions: SelectOption[] = [
    { value: "", label: t("all_types") },
    { value: TransmissionType.AUTOMATIC, label: t("automatic") },
    { value: TransmissionType.MANUAL, label: t("manual") },
    { value: TransmissionType.SEMI_AUTOMATIC, label: t("semi_automatic") },
    { value: TransmissionType.CONTINUOUSLY_VARIABLE, label: t("cvt") },
    { value: TransmissionType.DUAL_CLUTCH, label: t("dual_clutch") },
    { value: TransmissionType.OTHER, label: t("other") },
  ];

  return (
    <div className="space-y-4">
      <FormField
        type="select"
        name="vehicleType"
        label={t("filters.vehicleType")}
        options={vehicleTypeOptions}
        onChange={(value: FormFieldValue) => onFilterChange("vehicleType", value as string)}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          type="select"
          name="fuelType"
          label={t("filters.fuelType")}
          options={fuelTypeOptions}
          onChange={(value: FormFieldValue) => onFilterChange("fuelType", value as string)}
        />

        <FormField
          type="select"
          name="transmission"
          label={t("filters.transmission")}
          options={transmissionOptions}
          onChange={(value: FormFieldValue) => onFilterChange("transmission", value as string)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          type="number"
          name="minPrice"
          label={t("filters.minPrice")}
          onChange={(value: FormFieldValue) => onFilterChange("minPrice", Number(value))}
        />

        <FormField
          type="number"
          name="maxPrice"
          label={t("filters.maxPrice")}
          onChange={(value: FormFieldValue) => onFilterChange("maxPrice", Number(value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          type="number"
          name="minYear"
          label={t("filters.minYear")}
          onChange={(value: FormFieldValue) => onFilterChange("minYear", Number(value))}
        />

        <FormField
          type="number"
          name="maxYear"
          label={t("filters.maxYear")}
          onChange={(value: FormFieldValue) => onFilterChange("maxYear", Number(value))}
        />
      </div>
    </div>
  );
};

export default VehicleFilters;
