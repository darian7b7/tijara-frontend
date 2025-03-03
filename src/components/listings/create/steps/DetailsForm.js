import React from 'react';
import { FormInput, FormSelect, FormNumberInput } from '../common/forms';
import VehicleDetails from './vehicles/VehicleDetails';
import RealEstateDetails from './realestate/RealEstateDetails';

const DetailsForm = ({
  mainCategory,
  subcategory,
  details,
  onChange,
  errors = {}
}) => {
  const handleFieldChange = (field, value) => {
    onChange({
      ...details,
      [field]: value
    });
  };

  const renderCategorySpecificDetails = () => {
    const props = {
      details,
      subcategory,
      onChange: handleFieldChange,
      errors
    };

    switch (mainCategory) {
      case 'vehicles':
        return <VehicleDetails {...props} />;
      case 'real-estate':
        return <RealEstateDetails {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Title"
          value={details.title}
          onChange={(value) => handleFieldChange('title', value)}
          placeholder="Enter listing title"
          error={errors.title}
          required
        />
        
        <FormNumberInput
          label="Price"
          value={details.price}
          onChange={(value) => handleFieldChange('price', value)}
          placeholder="Enter price"
          error={errors.price}
          required
          min={0}
        />

        <FormInput
          label="Location"
          value={details.location}
          onChange={(value) => handleFieldChange('location', value)}
          placeholder="Enter location"
          error={errors.location}
          required
        />

        <FormSelect
          label="Transaction Type"
          value={details.transactionType}
          onChange={(value) => handleFieldChange('transactionType', value)}
          options={mainCategory === 'vehicles' ? ['Buy', 'Rent'] : ['Buy', 'Rent', 'Lease', 'Short-Term Rental']}
          placeholder="Select transaction type"
          error={errors.transactionType}
          required
        />
      </div>

      {/* Description */}
      <FormInput
        label="Description"
        type="textarea"
        value={details.description}
        onChange={(value) => handleFieldChange('description', value)}
        placeholder="Enter detailed description"
        error={errors.description}
        required
      />

      {/* Category Specific Details */}
      {renderCategorySpecificDetails()}
    </div>
  );
};

export default DetailsForm;
