import React from 'react';
import { useTranslation } from 'react-i18next';

const StepIndicator = ({ currentStep, totalSteps = 3, isRTL }) => {
  const { t } = useTranslation();

  const steps = [
    { number: 1, title: t('category_and_details') },
    { number: 2, title: t('advanced_details') },
    { number: 3, title: t('review') }
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`flex flex-col items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.number
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <div className="text-sm mt-2 text-center">{step.title}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const CreateListingSteps = {
  StepIndicator
};

export default CreateListingSteps;
