import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import useCreateListing from '../../../hooks/useCreateListing';
import { validateStep } from '../validation/formValidation';
import CreateListingSteps from './CreateListingSteps';
import CategorySelector from '../categories/CategorySelector';
import BasicDetailsForm from './steps/BasicDetailsForm';
import AdvancedDetailsForm from './steps/AdvancedDetailsForm';
import ReviewSection from './steps/ReviewSection';

const CreateListing = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, updateFormData, submitListing, isSubmitting } = useCreateListing();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Check if basic details are filled
  const isBasicDetailsFilled = () => {
    if (!formData.mainCategory) return false;

    const requiredFields = {
      vehicles: ['fuelType', 'transmission', 'year', 'make', 'model', 'price', 'location'],
      realEstate: ['propertyType', 'size', 'rooms', 'price', 'location']
    };

    const fieldsToCheck = requiredFields[formData.mainCategory === 'vehicles' ? 'vehicles' : 'realEstate'];
    
    return fieldsToCheck.every(field => {
      const value = formData[field];
      return value !== undefined && value !== null && value !== '';
    });
  };

  // Debug logging
  useEffect(() => {
    console.log('Current Step:', currentStep);
    console.log('Form Data:', formData);
    console.log('Basic Details Filled:', isBasicDetailsFilled());
  }, [currentStep, formData]);

  const handleNext = () => {
    let canProceed = false;

    if (currentStep === 1) {
      canProceed = isBasicDetailsFilled();
    } else {
      const stepErrors = validateStep(currentStep, formData);
      setErrors(stepErrors);
      canProceed = Object.keys(stepErrors).length === 0;
    }

    if (canProceed) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    } else {
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({}); 
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep, formData);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length === 0) {
      try {
        const response = await submitListing();
        navigate(`/listings/${response.id}`);
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleTouched = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleCategorySelect = (category) => {
    updateFormData('mainCategory', category);
    
    // Reset form data when changing category
    const fieldsToReset = [
      'fuelType', 'transmission', 'year', 'make', 'model',
      'propertyType', 'size', 'rooms', 'price', 'location'
    ];
    
    fieldsToReset.forEach(field => {
      updateFormData(field, '');
    });
    
    // Always set subcategory to 'Cars' for vehicles
    if (category === 'vehicles') {
      updateFormData('subcategory', 'Cars');
    }
  };

  const isRTL = i18n.language === 'ar';

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <CategorySelector
              selectedCategory={formData.mainCategory}
              onCategorySelect={handleCategorySelect}
              errors={errors}
            />
            {formData.mainCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BasicDetailsForm
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  touched={touched}
                  onTouched={handleTouched}
                  selectedCategory={formData.mainCategory}
                  isRTL={isRTL}
                />
              </motion.div>
            )}
          </div>
        );
      case 2:
        return (
          <AdvancedDetailsForm
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            isRTL={isRTL}
          />
        );
      case 3:
        return (
          <ReviewSection
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            isRTL={isRTL}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <CreateListingSteps.StepIndicator 
        currentStep={currentStep} 
        totalSteps={3}
        isRTL={isRTL} 
      />

      {errors.submit && (
        <div className="text-red-500 mb-4 text-center">{t('error_submit')}</div>
      )}

      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={`flex justify-between mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {t('back')}
          </button>
        )}
        
        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            disabled={currentStep === 1 ? !isBasicDetailsFilled() : false}
            className={`${isRTL ? 'mr-auto' : 'ml-auto'} px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t('next')}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`${isRTL ? 'mr-auto' : 'ml-auto'} px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50`}
          >
            {isSubmitting ? t('creating') : t('create_listing')}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
