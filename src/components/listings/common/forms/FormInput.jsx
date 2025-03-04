import React from 'react';

const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  disabled = false,
  min,
  max,
  step
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200';
  const stateClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed'
    : error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  const inputProps = {
    type,
    value: value || '',
    onChange: (e) => onChange(e.target.value),
    className: `${baseClasses} ${stateClasses}`,
    placeholder,
    disabled,
    ...(type === 'number' && {
      min,
      max,
      step
    })
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input {...inputProps} />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
