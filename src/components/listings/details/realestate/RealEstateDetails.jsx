import React, { useState, useEffect } from 'react';
import { FaHome, FaTree, FaBuilding } from 'react-icons/fa';
import { FormSelect, FormNumberInput } from '@/common/forms';

const RealEstateDetails = ({ subcategory, details, onChange, errors = {} }) => {
  const [isResidential, setIsResidential] = useState(false);
  const [isCommercial, setIsCommercial] = useState(false);
  const [isLand, setIsLand] = useState(false);

  useEffect(() => {
    console.log("RealEstateDetails - Selected Subcategory:", subcategory); // Debugging

    setIsResidential(subcategory?.toLowerCase().includes('residential'));
    setIsCommercial(subcategory?.toLowerCase().includes('commercial'));
    setIsLand(subcategory?.toLowerCase().includes('land'));
  }, [subcategory]); // ✅ Trigger re-render when `subcategory` changes

  const handleChange = (field, value) => {
    onChange(field, value);
  };

  const getPropertyTypeOptions = () => {
    if (isResidential) {
      return ["Apartment", "House", "Villa", "Studio"];
    }
    if (isCommercial) {
      return ["Office", "Retail", "Warehouse", "Industrial"];
    }
    if (isLand) {
      return ["Residential Plot", "Commercial Plot", "Agricultural Land"];
    }
    return [];
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold flex items-center">
        {isLand ? (
          <FaTree className="mr-2 text-green-500" />
        ) : isCommercial ? (
          <FaBuilding className="mr-2 text-yellow-500" />
        ) : (
          <FaHome className="mr-2 text-blue-500" />
        )}
        Advanced Real Estate Details
      </h2>

      <FormSelect
        label="Property Type"
        value={details.propertyType || ''}
        onChange={(value) => handleChange('propertyType', value)}
        options={getPropertyTypeOptions()}
        placeholder="Select Type"
        error={errors.propertyType}
        required
      />

      {isResidential && (
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Bedrooms"
            value={details.bedrooms || ''}
            onChange={(value) => handleChange('bedrooms', value)}
            options={Array.from({ length: 10 }, (_, i) => i + 1)}
            placeholder="Select Bedrooms"
            error={errors.bedrooms}
          />

          <FormSelect
            label="Bathrooms"
            value={details.bathrooms || ''}
            onChange={(value) => handleChange('bathrooms', value)}
            options={Array.from({ length: 8 }, (_, i) => i + 1)}
            placeholder="Select Bathrooms"
            error={errors.bathrooms}
          />
        </div>
      )}

      {isLand && (
        <FormNumberInput
          label="Land Size (m²)"
          value={details.size || ''}
          onChange={(value) => handleChange('size', value)}
          placeholder="Enter land size"
          error={errors.size}
          min={0}
          required
        />
      )}

      {!isLand && (
        <FormSelect
          label="Year Built"
          value={details.yearBuilt || ''}
          onChange={(value) => handleChange('yearBuilt', value)}
          options={Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)}
          placeholder="Select Year"
          error={errors.yearBuilt}
        />
      )}
    </div>
  );
};

export default RealEstateDetails;
