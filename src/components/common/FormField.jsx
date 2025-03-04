import React from 'react';
import { motion } from 'framer-motion';

const FormField = ({ 
  label, 
  type = 'text', 
  options = [], 
  value, 
  onChange, 
  error, 
  touched,
  onBlur,
  prefix,
  suffix,
  required = false,
  min,
  max,
  disabled
}) => {
  const renderSelectOptions = () => {
    return options.map(option => {
      // Handle both string options and object options
      if (typeof option === 'string') {
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      } else {
        return (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        );
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && '*'}
      </label>
      
      {type === 'select' ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={`w-full p-2 border rounded-lg ${
            touched && error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : ''}`}
        >
          <option value="">{`Select ${label}`}</option>
          {renderSelectOptions()}
        </select>
      ) : (
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {prefix}
            </span>
          )}
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            min={min}
            max={max}
            disabled={disabled}
            className={`w-full p-2 border rounded-lg ${
              touched && error ? 'border-red-500' : 'border-gray-300'
            } ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} ${disabled ? 'bg-gray-100' : ''}`}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {suffix}
            </span>
          )}
        </div>
      )}
      
      {touched && error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default FormField; 
