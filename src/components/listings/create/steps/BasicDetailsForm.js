import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import ImageManager from "../../images/ImageManager";
import { carModels } from "../../../listings/data/carModels";
import FormField from "../../../common/FormField";

const BasicDetailsForm = ({ 
  formData, 
  updateFormData, 
  errors, 
  touched, 
  onTouched, 
  selectedCategory, 
  isRTL,
  visibleFields 
}) => {
  const { t } = useTranslation();
  const [activeField, setActiveField] = useState(0);
  const [showShakeAnimation, setShowShakeAnimation] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Selected Category:', selectedCategory);
    console.log('Current Fields:', currentFields);
    console.log('Active Field:', activeField);
  }, [selectedCategory, activeField]);

  const carFields = [
    {
      name: 'fuelType',
      label: t('fuel_type'),
      type: 'select',
      options: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
      required: true
    },
    {
      name: 'transmission',
      label: t('transmission'),
      type: 'select',
      options: ['Manual', 'Automatic'],
      required: true
    },
    {
      name: 'year',
      label: t('year'),
      type: 'number',
      min: 1900,
      max: new Date().getFullYear() + 1,
      required: true
    },
    {
      name: 'make',
      label: t('make'),
      type: 'select',
      options: Object.keys(carModels),
      required: true
    },
    {
      name: 'model',
      label: t('model'),
      type: 'select',
      options: formData.make ? carModels[formData.make] : [],
      required: true,
      disabled: !formData.make
    },
    {
      name: 'price',
      label: t('price'),
      type: 'number',
      prefix: '$',
      required: true
    },
    {
      name: 'location',
      label: t('location'),
      type: 'text',
      required: true
    }
  ];

  const realEstateFields = [
    {
      name: 'propertyType',
      label: t('property_type'),
      type: 'select',
      options: ['Apartment', 'House', 'Land', 'Commercial'],
      required: true
    },
    {
      name: 'size',
      label: t('size'),
      type: 'number',
      suffix: 'm²',
      required: true
    },
    {
      name: 'rooms',
      label: t('rooms'),
      type: 'number',
      min: 0,
      required: true
    },
    {
      name: 'location',
      label: t('location'),
      type: 'text',
      required: true
    },
    {
      name: 'price',
      label: t('price'),
      type: 'number',
      prefix: '$',
      required: true
    }
  ];

  // Update currentFields based on selectedCategory
  const currentFields = selectedCategory === 'vehicles' ? carFields : 
                       selectedCategory === 'realEstate' ? realEstateFields : [];

  // Reset activeField when category changes
  useEffect(() => {
    setActiveField(0);
  }, [selectedCategory]);

  const handleFieldComplete = (fieldName, value) => {
    updateFormData(fieldName, value);
    onTouched(fieldName);
    
    if (value && activeField < currentFields.length - 1) {
      setActiveField(prev => prev + 1);
    }
  };

  const handleImagesChange = (updatedImages) => {
    updateFormData("images", updatedImages);
  };

  const handleMakeChange = (make) => {
    updateFormData("make", make);
    updateFormData("model", "");
    if (make) {
      setActiveField(prev => prev + 1);
    }
  };

  const validateField = (field, value) => {
    if (field.required && !value) {
      setShowShakeAnimation(true);
      setTimeout(() => setShowShakeAnimation(false), 500);
      return false;
    }
    return true;
  };

  // Calculate progress based on filled fields
  const calculateProgress = () => {
    const fields = selectedCategory === 'vehicles' ? carFields : realEstateFields;
    const filledFields = fields.filter(field => 
      formData[field.name] !== undefined && 
      formData[field.name] !== null && 
      formData[field.name] !== ''
    ).length;
    
    return Math.min(Math.round((filledFields / fields.length) * 100), 100);
  };

  // Don't render anything if no category is selected
  if (!selectedCategory || !currentFields.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {currentFields.map((field, index) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`${showShakeAnimation && errors[field.name] ? 'animate-shake' : ''}`}
          >
            <FormField
              label={field.label}
              type={field.type}
              options={field.options}
              value={formData[field.name] || ''}
              onChange={(value) => {
                if (field.name === 'make') {
                  handleMakeChange(value);
                } else {
                  handleFieldComplete(field.name, value);
                }
              }}
              error={errors[field.name]}
              touched={touched[field.name]}
              onBlur={() => onTouched(field.name)}
              prefix={field.prefix}
              suffix={field.suffix}
              required={field.required}
              min={field.min}
              max={field.max}
              disabled={field.disabled}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {activeField >= Math.min(3, currentFields.length - 1) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4">{t("upload_images")}</h3>
          <ImageManager 
            images={formData.images} 
            onImagesChange={handleImagesChange}
            className="mt-2"
          />
        </motion.div>
      )}

      {/* Progress indicator */}
      <motion.div
        className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {t("progress")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {calculateProgress()}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${calculateProgress()}%` 
              }}
              transition={{ duration: 0.3 }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BasicDetailsForm;
