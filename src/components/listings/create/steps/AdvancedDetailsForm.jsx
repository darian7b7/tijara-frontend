import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import FormField from '@/common/FormField';
import Tooltip from '@/common/Tooltip';

const AdvancedDetailsForm = ({ formData, updateFormData, errors, isRTL }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState(formData.features || []);
  const [expandedSection, setExpandedSection] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  // Primary Details Step Fields
  const primaryDetailsFields = {
    vehicles: [
      {
        name: 'fuelType',
        label: t('fuel_type'),
        type: 'select',
        options: [
          { value: 'gasoline', label: 'Gasoline', icon: '⛽' },
          { value: 'diesel', label: 'Diesel', icon: '🛢️' },
          { value: 'electric', label: 'Electric', icon: '⚡' },
          { value: 'hybrid', label: 'Hybrid', icon: '🔋' }
        ],
        required: true,
        tooltip: 'Select the type of fuel your vehicle uses'
      },
      {
        name: 'transmission',
        label: t('transmission'),
        type: 'select',
        options: [
          { value: 'manual', label: 'Manual', icon: '🔧' },
          { value: 'automatic', label: 'Automatic', icon: '🎮' },
          { value: 'cvt', label: 'CVT', icon: '⚙️' }
        ],
        required: true,
        tooltip: 'Choose your vehicle\'s transmission type'
      },
      {
        name: 'year',
        label: t('year_of_manufacture'),
        type: 'number',
        min: 1900,
        max: new Date().getFullYear(),
        required: true,
        tooltip: 'Enter the year your vehicle was manufactured'
      },
      {
        name: 'make',
        label: t('make'),
        type: 'select',
        options: [], // Dynamic options based on API
        required: true,
        tooltip: 'Select your vehicle\'s manufacturer'
      },
      {
        name: 'model',
        label: t('model'),
        type: 'select',
        options: [], // Dynamic options based on make
        required: true,
        tooltip: 'Select your vehicle\'s model'
      },
      {
        name: 'price',
        label: t('price'),
        type: 'number',
        min: 0,
        required: true,
        tooltip: 'Set your listing price',
        suffix: 'USD',
        hint: estimatedPrice ? `Estimated market price: $${estimatedPrice}` : null
      },
      {
        name: 'location',
        label: t('location'),
        type: 'location',
        required: true,
        tooltip: 'Enter the vehicle\'s location',
        autoDetect: true
      }
    ],
    realEstate: [
      {
        name: 'propertyType',
        label: t('property_type'),
        type: 'select',
        options: [
          { value: 'apartment', label: 'Apartment', icon: '🏢' },
          { value: 'house', label: 'House', icon: '🏠' },
          { value: 'villa', label: 'Villa', icon: '🏰' },
          { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
          { value: 'land', label: 'Land', icon: '🌳' },
          { value: 'commercial', label: 'Commercial', icon: '🏢' }
        ],
        required: true,
        tooltip: 'Select the type of property'
      },
      {
        name: 'size',
        label: t('total_area'),
        type: 'number',
        suffix: 'm²',
        min: 0,
        required: true,
        tooltip: 'Enter the total area in square meters'
      },
      {
        name: 'bedrooms',
        label: t('bedrooms'),
        type: 'number',
        min: 0,
        required: true,
        tooltip: 'Number of bedrooms'
      },
      {
        name: 'bathrooms',
        label: t('bathrooms'),
        type: 'number',
        min: 0,
        required: true,
        tooltip: 'Number of bathrooms'
      },
      {
        name: 'price',
        label: t('price'),
        type: 'number',
        min: 0,
        required: true,
        tooltip: 'Set your listing price',
        suffix: 'USD',
        hint: estimatedPrice ? `Estimated market price: $${estimatedPrice}` : null
      },
      {
        name: 'location',
        label: t('location'),
        type: 'location',
        required: true,
        tooltip: 'Enter the property\'s location',
        autoDetect: true
      }
    ]
  };

  // Vehicle Fields (Always Required)
  const vehicleEssentialFields = [
    {
      name: 'condition',
      label: t('vehicle_condition'),
      type: 'select',
      options: [
        { value: 'new', label: 'New (Never Used)', icon: '✨' },
        { value: 'like_new', label: 'Like New (Minimal Wear)', icon: '🌟' },
        { value: 'excellent', label: 'Excellent (Well Maintained)', icon: '👌' },
        { value: 'good', label: 'Good (Normal Wear)', icon: '👍' },
        { value: 'fair', label: 'Fair (Needs Minor Work)', icon: '🔧' },
        { value: 'needs_work', label: 'Needs Work (Repairs Required)', icon: '⚠️' }
      ],
      required: true,
      tooltip: 'Select the overall condition that best describes your vehicle'
    },
    {
      name: 'mileage',
      label: t('mileage'),
      type: 'number',
      suffix: 'km',
      min: 0,
      required: true,
      tooltip: 'Enter the current odometer reading in kilometers'
    },
    {
      name: 'warranty',
      label: t('warranty_status'),
      type: 'select',
      options: [
        { value: 'factory', label: 'Factory Warranty (Still Valid)', icon: '🏭' },
        { value: 'extended', label: 'Extended Warranty Available', icon: '📋' },
        { value: 'expired', label: 'Warranty Expired', icon: '⌛' },
        { value: 'none', label: 'No Warranty', icon: '❌' }
      ],
      required: true,
      tooltip: 'Indicate the current warranty status of your vehicle'
    },
    {
      name: 'serviceHistory',
      label: t('service_history'),
      type: 'select',
      options: [
        { value: 'full', label: 'Full Service History (All Records)', icon: '📚' },
        { value: 'partial', label: 'Partial Service History', icon: '📑' },
        { value: 'dealer', label: 'Dealer Maintained', icon: '🏢' },
        { value: 'none', label: 'No Service Records', icon: '❌' }
      ],
      required: true,
      tooltip: 'Select the level of service documentation available'
    },
    {
      name: 'accidentHistory',
      label: t('accident_history'),
      type: 'select',
      options: [
        { value: 'none', label: 'No Accidents', icon: '✅' },
        { value: 'minor', label: 'Minor Repairs (Cosmetic)', icon: '🔨' },
        { value: 'major', label: 'Major Repairs (Structural)', icon: '🏗️' },
        { value: 'repaired', label: 'Fully Repaired', icon: '🔄' }
      ],
      required: true,
      tooltip: 'Disclose any accident history or repairs'
    },
    {
      name: 'ownershipCount',
      label: t('ownership_count'),
      type: 'select',
      options: [
        { value: 'first', label: 'First Owner (Original)', icon: '1️⃣' },
        { value: 'second', label: 'Second Owner', icon: '2️⃣' },
        { value: 'third', label: 'Third Owner', icon: '3️⃣' },
        { value: 'multiple', label: 'Multiple Owners', icon: '➕' }
      ],
      required: true,
      tooltip: 'Indicate how many owners the vehicle has had'
    },
    {
      name: 'imported',
      label: t('imported_vehicle'),
      type: 'select',
      options: [
        { value: 'no', label: 'Local Vehicle', icon: '🏠' },
        { value: 'yes', label: 'Imported Vehicle', icon: '🌍' }
      ],
      required: true,
      tooltip: 'Specify if the vehicle was imported or purchased locally'
    }
  ];

  // Vehicle Additional Information (Optional)
  const vehicleAdditionalSections = {
    technical: {
      title: t('technical_specifications'),
      icon: '🛠️',
      fields: [
        {
          name: 'engineSize',
          label: t('engine_size'),
          type: 'number',
          suffix: 'cc',
          min: 0,
          tooltip: 'Engine displacement in cubic centimeters (cc)'
        },
        {
          name: 'power',
          label: t('power'),
          type: 'number',
          suffix: 'HP',
          min: 0,
          tooltip: 'Engine power output in horsepower (HP)'
        },
        {
          name: 'fuelEconomy',
          label: t('fuel_economy'),
          type: 'number',
          suffix: 'L/100km',
          min: 0,
          tooltip: 'Average fuel consumption in liters per 100 kilometers'
        },
        {
          name: 'emissionStandard',
          label: t('emission_standard'),
          type: 'select',
          options: [
            { value: 'euro6', label: 'Euro 6 (Latest Standard)', icon: '🌿' },
            { value: 'euro5', label: 'Euro 5', icon: '🌱' },
            { value: 'euro4', label: 'Euro 4', icon: '🍃' }
          ],
          tooltip: 'Vehicle emission standard certification'
        }
      ]
    },
    features: {
      title: t('vehicle_features'),
      icon: '✨',
      categories: {
        comfort: {
          title: t('comfort_features'),
          icon: '💺',
          items: [
            { id: 'leather_seats', label: 'Leather Seats', icon: '💺', description: 'Premium leather upholstery' },
            { id: 'heated_seats', label: 'Heated Seats', icon: '🔥', description: 'Seats with heating function' },
            { id: 'cooled_seats', label: 'Cooled Seats', icon: '❄️', description: 'Ventilated seats for comfort' },
            { id: 'sunroof', label: 'Sunroof', icon: '☀️', description: 'Opening roof panel' },
            { id: 'panoramic_roof', label: 'Panoramic Roof', icon: '🌅', description: 'Full-length glass roof' },
            { id: 'climate_control', label: 'Climate Control', icon: '🌡️', description: 'Automatic temperature control' }
          ]
        },
        technology: {
          title: t('technology_features'),
          icon: '📱',
          items: [
            { id: 'touchscreen', label: 'Touchscreen Display', icon: '📱', description: 'Interactive infotainment screen' },
            { id: 'apple_carplay', label: 'Apple CarPlay', icon: '🍎', description: 'iPhone integration system' },
            { id: 'android_auto', label: 'Android Auto', icon: '🤖', description: 'Android phone integration' },
            { id: 'bluetooth', label: 'Bluetooth', icon: '📶', description: 'Wireless connectivity' },
            { id: 'wireless_charging', label: 'Wireless Charging', icon: '🔌', description: 'Phone charging pad' }
          ]
        },
        safety: {
          title: t('safety_features'),
          icon: '🛡️',
          items: [
            { id: 'parking_sensors', label: 'Parking Sensors', icon: '📡', description: 'Proximity warning system' },
            { id: 'camera_360', label: '360° Camera', icon: '📸', description: 'Surround view camera system' },
            { id: 'adaptive_cruise', label: 'Adaptive Cruise Control', icon: '🚗', description: 'Smart speed control' },
            { id: 'lane_assist', label: 'Lane Assist', icon: '↔️', description: 'Lane departure warning' },
            { id: 'blind_spot', label: 'Blind Spot Monitor', icon: '👁️', description: 'Side traffic warning' }
          ]
        }
      }
    }
  };

  // Essential Fields for Real Estate
  const realEstateEssentialFields = [
    {
      name: 'propertyCondition',
      label: t('property_condition'),
      type: 'select',
      options: [
        { value: 'new', label: 'Brand New (Never Lived In)', icon: '✨' },
        { value: 'like_new', label: 'Like New (Excellent Condition)', icon: '🌟' },
        { value: 'well_maintained', label: 'Well Maintained', icon: '👌' },
        { value: 'needs_minor_repairs', label: 'Needs Minor Repairs', icon: '🔧' },
        { value: 'needs_major_repairs', label: 'Needs Major Renovation', icon: '🏗️' }
      ],
      required: true,
      tooltip: 'Select the current condition of the property'
    },
    {
      name: 'propertyType',
      label: t('property_type'),
      type: 'select',
      options: [
        { value: 'apartment', label: 'Apartment', icon: '🏢' },
        { value: 'house', label: 'House', icon: '🏠' },
        { value: 'villa', label: 'Villa', icon: '🏰' },
        { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
        { value: 'land', label: 'Land', icon: '🌳' },
        { value: 'commercial', label: 'Commercial', icon: '🏢' }
      ],
      required: true,
      tooltip: 'Select the type of property'
    },
    {
      name: 'size',
      label: t('total_area'),
      type: 'number',
      suffix: 'm²',
      min: 0,
      required: true,
      tooltip: 'Enter the total area in square meters'
    },
    {
      name: 'bedrooms',
      label: t('bedrooms'),
      type: 'number',
      min: 0,
      required: true,
      tooltip: 'Number of bedrooms'
    },
    {
      name: 'bathrooms',
      label: t('bathrooms'),
      type: 'number',
      min: 0,
      required: true,
      tooltip: 'Number of bathrooms'
    },
    {
      name: 'ownership',
      label: t('ownership_type'),
      type: 'select',
      options: [
        { value: 'freehold', label: 'Freehold', icon: '📋' },
        { value: 'leasehold', label: 'Leasehold', icon: '📄' },
        { value: 'commonhold', label: 'Commonhold', icon: '🤝' }
      ],
      required: true,
      tooltip: 'Type of property ownership'
    },
    {
      name: 'completion',
      label: t('completion_status'),
      type: 'select',
      options: [
        { value: 'ready', label: 'Ready to Move In', icon: '🔑' },
        { value: 'under_construction', label: 'Under Construction', icon: '🏗️' },
        { value: 'off_plan', label: 'Off Plan', icon: '📝' }
      ],
      required: true,
      tooltip: 'Current completion status of the property'
    }
  ];

  // Additional Information for Real Estate
  const realEstateAdditionalSections = {
    specifications: {
      title: t('property_specifications'),
      icon: '📏',
      fields: [
        {
          name: 'landArea',
          label: t('land_area'),
          type: 'number',
          suffix: 'm²',
          tooltip: 'Total land area (for houses and villas)'
        },
        {
          name: 'builtYear',
          label: t('year_built'),
          type: 'number',
          min: 1900,
          max: new Date().getFullYear(),
          tooltip: 'Year the property was built'
        },
        {
          name: 'floorLevel',
          label: t('floor_level'),
          type: 'number',
          min: 0,
          tooltip: 'Floor level (for apartments)'
        },
        {
          name: 'parkingSpaces',
          label: t('parking_spaces'),
          type: 'number',
          min: 0,
          tooltip: 'Number of parking spaces'
        }
      ]
    },
    features: {
      title: t('property_features'),
      icon: '✨',
      categories: {
        interior: {
          title: t('interior_features'),
          icon: '🏠',
          items: [
            { id: 'furnished', label: 'Furnished', icon: '🛋️', description: 'Comes with furniture' },
            { id: 'central_ac', label: 'Central AC', icon: '❄️', description: 'Central air conditioning' },
            { id: 'built_in_kitchen', label: 'Built-in Kitchen', icon: '🍳', description: 'Fitted kitchen with appliances' },
            { id: 'storage', label: 'Storage Room', icon: '📦', description: 'Dedicated storage space' },
            { id: 'maids_room', label: "Maid's Room", icon: '🛏️', description: 'Separate maid\'s quarters' },
            { id: 'walk_in_closet', label: 'Walk-in Closet', icon: '👔', description: 'Walk-in wardrobe' }
          ]
        },
        amenities: {
          title: t('building_amenities'),
          icon: '🏊‍♂️',
          items: [
            { id: 'swimming_pool', label: 'Swimming Pool', icon: '🏊‍♂️', description: 'Access to swimming pool' },
            { id: 'gym', label: 'Gym', icon: '💪', description: 'Fitness center' },
            { id: 'security', label: '24/7 Security', icon: '👮', description: 'Round-the-clock security' },
            { id: 'parking', label: 'Covered Parking', icon: '🅿️', description: 'Dedicated parking space' },
            { id: 'elevator', label: 'Elevator', icon: '🛗', description: 'Building elevator' },
            { id: 'garden', label: 'Garden', icon: '🌳', description: 'Private or shared garden' }
          ]
        },
        views: {
          title: t('views_and_location'),
          icon: '🌅',
          items: [
            { id: 'sea_view', label: 'Sea View', icon: '🌊', description: 'Views of the sea' },
            { id: 'city_view', label: 'City View', icon: '🌆', description: 'Views of the city' },
            { id: 'garden_view', label: 'Garden View', icon: '🌳', description: 'Views of gardens' },
            { id: 'corner_unit', label: 'Corner Unit', icon: '📐', description: 'Corner position' },
            { id: 'private_entrance', label: 'Private Entrance', icon: '🚪', description: 'Separate entrance' }
          ]
        },
        smart: {
          title: t('smart_features'),
          icon: '📱',
          items: [
            { id: 'smart_home', label: 'Smart Home System', icon: '🏠', description: 'Home automation' },
            { id: 'smart_ac', label: 'Smart AC Control', icon: '❄️', description: 'Smart climate control' },
            { id: 'video_intercom', label: 'Video Intercom', icon: '📹', description: 'Video door phone' },
            { id: 'smart_lighting', label: 'Smart Lighting', icon: '💡', description: 'Automated lighting' },
            { id: 'smart_security', label: 'Smart Security', icon: '🔐', description: 'Smart security system' }
          ]
        }
      }
    }
  };

  // Use the appropriate fields based on the category
  const essentialFields = formData.mainCategory === 'realEstate' 
    ? realEstateEssentialFields 
    : vehicleEssentialFields;

  const additionalSections = formData.mainCategory === 'realEstate'
    ? realEstateAdditionalSections
    : vehicleAdditionalSections;

  const handleFeatureToggle = (featureId) => {
    setSelectedFeatures(prev => {
      const newFeatures = prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId];
      updateFormData('features', newFeatures);
      return newFeatures;
    });
  };

  // Calculate estimated price based on selected details
  useEffect(() => {
    if (formData.mainCategory === 'vehicles' && formData.make && formData.model && formData.year) {
      // Simulated API call to get estimated price
      // Replace with actual API integration
      setTimeout(() => {
        const mockEstimate = Math.floor(Math.random() * 50000) + 10000;
        setEstimatedPrice(mockEstimate.toLocaleString());
      }, 500);
    }
  }, [formData.make, formData.model, formData.year]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                {t('primary_details')}
              </h2>
              <p className="text-blue-600">
                {t('primary_details_description')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {primaryDetailsFields[formData.mainCategory].map(renderField)}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                {t('condition_and_history')}
              </h2>
              <p className="text-green-600">
                {t('condition_description')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {essentialFields.map(renderField)}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">
                {t('features_and_specifications')}
              </h2>
              <p className="text-purple-600">
                {t('features_description')}
              </p>
            </div>
            {renderFeatures()}
          </motion.div>
        );
      default:
        return null;
    }
  };

  const renderField = (field) => (
    <div key={field.name} className="relative group">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
        <div className="mb-3">
          <h3 className="text-lg font-medium text-gray-900">{field.label}</h3>
          {field.tooltip && (
            <p className="mt-1 text-sm text-gray-500">{field.tooltip}</p>
          )}
        </div>
        <FormField
          {...field}
          value={formData[field.name] || ''}
          onChange={(value) => updateFormData(field.name, value)}
          error={errors[field.name]}
          className="w-full focus:ring-2 focus:ring-blue-500"
        />
        {field.hint && (
          <p className="mt-2 text-sm text-blue-600">{field.hint}</p>
        )}
        {errors[field.name] && (
          <p className="mt-2 text-sm text-red-600">{errors[field.name]}</p>
        )}
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      {Object.entries(additionalSections.features.categories).map(([key, category]) => (
        <motion.div
          key={key}
          className="bg-white rounded-lg shadow-sm border"
          initial={false}
        >
          <button
            onClick={() => setExpandedSection(expandedSection === key ? null : key)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium">{category.title}</span>
            </div>
            <span className={`transform transition-transform ${expandedSection === key ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          <AnimatePresence>
            {expandedSection === key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {category.items.map(feature => (
                    <motion.button
                      key={feature.id}
                      onClick={() => handleFeatureToggle(feature.id)}
                      className={`p-4 rounded-lg text-left transition-all ${
                        selectedFeatures.includes(feature.id)
                          ? 'bg-blue-100 border-blue-500 border-2'
                          : 'bg-gray-50 border-gray-200 border hover:border-blue-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{feature.icon}</span>
                        <div>
                          <div className="font-medium">{feature.label}</div>
                          <div className="text-sm text-gray-500">{feature.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );

  const calculateProgress = () => {
    const totalSteps = 3;
    const stepProgress = Math.round((currentStep / totalSteps) * 100);
    return Math.min(stepProgress, 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {t('step')} {currentStep}/3 - {currentStep === 3 ? t('final_step') : t('keep_going')}
          </h2>
          <span className="text-sm font-medium text-blue-600">
            {calculateProgress()}% {t('completed')}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            className="h-full bg-blue-500"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg font-medium ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {t('previous_step')}
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
          className={`px-6 py-3 rounded-lg font-medium ${
            currentStep === 3
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {currentStep === 3 ? t('publish_listing') : t('continue_to_next')}
        </button>
      </div>
    </div>
  );
};

export default AdvancedDetailsForm;
