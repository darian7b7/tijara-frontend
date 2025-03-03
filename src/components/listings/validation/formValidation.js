import { categoryFields } from '../data/categoryFields';
import { categories } from '../data/categories';

// Validation rules for different field types
const validationRules = {
  required: (value) => value !== undefined && value !== null && value !== '',
  minLength: (value, min) => value.length >= min,
  maxLength: (value, max) => value.length <= max,
  number: (value) => !isNaN(value) && value >= 0,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
};

// Validation messages
const messages = {
  required: (field) => `${field} is required`,
  minLength: (field, min) => `${field} must be at least ${min} characters`,
  maxLength: (field, max) => `${field} cannot exceed ${max} characters`,
  number: (field) => `${field} must be a valid number`,
  email: () => 'Please enter a valid email address',
  url: () => 'Please enter a valid URL',
};

// Validate individual fields
export const validateField = (field, value, rules = {}) => {
  const errors = [];
  
  Object.entries(rules).forEach(([rule, param]) => {
    if (validationRules[rule] && !validationRules[rule](value, param)) {
      errors.push(messages[rule](field, param));
    }
  });
  
  return errors;
};

// Step-specific validation
export const validateStep = (step, formData) => {
  const errors = {};

  switch (step) {
    case 1: // Category Selection
      if (!formData.mainCategory) {
        errors.mainCategory = 'Please select a category';
      }
      if (formData.mainCategory && !formData.subcategory) {
        errors.subcategory = 'Please select a subcategory';
      }
      if (!formData.details?.transactionType) {
        errors.transactionType = "Please select a transaction type";
      }
      break;

    case 2: // Basic Details & Images
      if (!formData.title?.trim()) {
        errors.title = 'Title is required';
      } else if (formData.title.length < 10) {
        errors.title = 'Title must be at least 10 characters';
      }
      
      if (!formData.price || formData.price <= 0) {
        errors.price = 'Please enter a valid price';
      }
      
      if (!formData.location?.trim()) {
        errors.location = 'Location is required';
      }
      if (!formData.description?.trim()) {
        errors.description = 'Description is required';
      }
      if (!formData.images?.length) {
        errors.images = 'At least one image is required';
      }
      break;

    case 3: // Advanced Details
      const categoryConfig = categoryFields[formData.mainCategory];
      if (categoryConfig && categoryConfig.requiredFields) {
        categoryConfig.requiredFields.forEach(field => {
          if (!formData.details || !formData.details[field]) {
            errors[field] = `${field} is required`;
          }
        });
      }

      // Validate conditional fields
      if (categoryConfig.conditionalFields) {
        Object.entries(categoryConfig.conditionalFields).forEach(([condition, fields]) => {
          if (formData.subcategory?.toLowerCase().includes(condition)) {
            fields.forEach(field => {
              if (!formData.details[field]) {
                errors[field] = `${field} is required`;
              }
            });
          }
        });
      }

      // Apply validation rules
      Object.entries(categoryConfig.validations).forEach(([field, rules]) => {
        if (formData.details[field]) {
          const fieldErrors = validateField(field, formData.details[field], rules);
          if (fieldErrors.length) {
            errors[field] = fieldErrors[0];
          }
        }
      });
      break;

    case 4: // Review
      if (!formData.description?.trim()) {
        errors.description = 'Description is required';
      } else if (formData.description.length < 50) {
        errors.description = 'Description must be at least 50 characters';
      }
      
      if (!formData.images || formData.images.length === 0) {
        errors.images = 'At least one image is required';
      }
      break;
  }

  return errors;
};

// Validate entire form
export const validateForm = (formData) => {
  let errors = {};
  
  for (let step = 1; step <= 4; step++) {
    errors = { ...errors, ...validateStep(step, formData) };
  }
  
  return errors;
};
