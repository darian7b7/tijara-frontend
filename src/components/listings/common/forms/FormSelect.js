import React from 'react';

const FormSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  className = '',
  disabled = false
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200';
  const stateClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed'
    : error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseClasses} ${stateClasses}`}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value || option} 
            value={option.value || option}
          >
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
