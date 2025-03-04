import React, { useState, useEffect } from "react";
import { FormInput, FormSelect, FormNumberInput } from "@/common/forms";

const VehicleDetails = ({ details, subcategory, onChange, errors = {} }) => {
  const [showExtraFields, setShowExtraFields] = useState(false);

  useEffect(() => {
    setShowExtraFields(details.mileage > 0);
  }, [details.mileage]);

  const handleChange = (field, value) => {
    onChange(field, value);
  };

  // Options for different dropdowns
  const options = {
    condition: [
      "Brand New", 
      "Like New", 
      "Excellent", 
      "Good", 
      "Fair", 
      "Needs Repair"
    ],
    ownership: [
      "First Owner", 
      "Second Owner", 
      "Third Owner", 
      "More than Three Owners"
    ],
    accidentHistory: [
      "No Accidents", 
      "Minor Accidents", 
      "Major Accidents"
    ],
    fuelType: ["Petrol", "Diesel", "Hybrid", "Electric"],
    transmission: ["Manual", "Automatic", "CVT", "Semi-Automatic"],
    doors: ["2", "3", "4", "5", "6+"]
  };

  return (
    <div className="space-y-6">
      <FormSelect
        label="Vehicle Condition"
        value={details.condition}
        onChange={(value) => handleChange("condition", value)}
        options={options.condition}
        placeholder="Select Condition"
        error={errors.condition}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Ownership"
          value={details.ownership}
          onChange={(value) => handleChange("ownership", value)}
          options={options.ownership}
          placeholder="Select Ownership"
          error={errors.ownership}
        />

        <FormSelect
          label="Accident History"
          value={details.accidentHistory}
          onChange={(value) => handleChange("accidentHistory", value)}
          options={options.accidentHistory}
          placeholder="Select Accident History"
          error={errors.accidentHistory}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Year"
          value={details.year}
          onChange={(value) => handleChange("year", value)}
          options={Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)}
          placeholder="Select Year"
          error={errors.year}
        />

        <FormSelect
          label="Month"
          value={details.registrationMonth}
          onChange={(value) => handleChange("registrationMonth", value)}
          options={[
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ].map((month, index) => ({ value: index + 1, label: month }))}
          placeholder="Select Month"
          error={errors.registrationMonth}
        />
      </div>

      <FormNumberInput
        label="Mileage (km)"
        value={details.mileage}
        onChange={(value) => handleChange("mileage", value)}
        placeholder="Enter mileage"
        error={errors.mileage}
        min={0}
      />

      {["Cars", "Trucks"].includes(subcategory) && (
        <div className="grid grid-cols-2 gap-4">
          <FormNumberInput
            label="Power (HP)"
            value={details.power}
            onChange={(value) => handleChange("power", value)}
            placeholder="Enter vehicle power"
            error={errors.power}
            min={0}
          />

          <FormSelect
            label="Fuel Type"
            value={details.fuelType}
            onChange={(value) => handleChange("fuelType", value)}
            options={options.fuelType}
            placeholder="Select Fuel Type"
            error={errors.fuelType}
          />
        </div>
      )}

      {showExtraFields && (
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Transmission"
            value={details.transmission}
            onChange={(value) => handleChange("transmission", value)}
            options={options.transmission}
            placeholder="Select Transmission"
            error={errors.transmission}
          />

          <FormSelect
            label="Doors"
            value={details.doors}
            onChange={(value) => handleChange("doors", value)}
            options={options.doors}
            placeholder="Select Doors"
            error={errors.doors}
          />
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;
