import React from 'react';

const CheckboxGroup = ({ label, options, selectedOptions, updateFormData, fieldName }) => {
  const handleChange = (option) => {
    const updatedSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option) // Remove if already selected
      : [...selectedOptions, option]; // Add if not selected

    updateFormData(`details.${fieldName}`, updatedSelection);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleChange(option)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
