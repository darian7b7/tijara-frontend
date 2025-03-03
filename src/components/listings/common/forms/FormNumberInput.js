import React, { useState, useEffect } from 'react';

const FormNumberInput = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  disabled = false,
  min,
  max,
  step,
  validateOnBlur = true,
  customValidation
}) => {
  const [localError, setLocalError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const validate = (value) => {
    if (required && !value) {
      return 'This field is required';
    }

    const numValue = Number(value);
    if (value && isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    if (min !== undefined && numValue < min) {
      return `Value must be at least ${min}`;
    }

    if (max !== undefined && numValue > max) {
      return `Value must be less than ${max}`;
    }

    if (customValidation) {
      return customValidation(value);
    }

    return '';
  };

  const handleBlur = () => {
    if (validateOnBlur) {
      setTouched(true);
      const validationError = validate(value);
      setLocalError(validationError);
      if (!validationError) {
        onChange(value); // Only update parent if valid
      }
    }
  };

  const handleChange = (newValue) => {
    if (touched) {
      const validationError = validate(newValue);
      setLocalError(validationError);
    }
    onChange(newValue);
  };

  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200';
  const stateClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed'
    : (localError || error)
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
      <input
        type="number"
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={`${baseClasses} ${stateClasses}`}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
      {(localError || error) && (
        <p className="mt-1 text-sm text-red-500">{localError || error}</p>
      )}
    </div>
  );
};

export default FormNumberInput;
