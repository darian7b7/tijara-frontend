import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import type { FormState } from "@/types/forms";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
  ListingAction,
} from "@/types/enums";
import {
  FaEdit,
  FaCheck,
  FaCar,
  FaHome,
  FaImages,
  FaHistory,
  FaTag,
} from "react-icons/fa";
import { 
  ChevronLeft,
  AlertCircle,
  DollarSign,
  MapPin,
  Calendar,
  Tag
} from 'lucide-react';
import type { VehicleDetails, RealEstateDetails, ListingFieldSchema, TractorDetails } from '@/types/listings';
import { listingsAdvancedFieldSchema } from '../advanced/listingsAdvancedFieldSchema';

interface ReviewSectionProps {
  formData: FormState;
  onSubmit: (data: FormState) => void;
  onBack: () => void;
  onEdit: (section: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

const ReviewSection: React.FC<ReviewSectionProps> = ({
  formData,
  onSubmit,
  onBack,
  onEdit,
  isSubmitting,
  error,
}) => {
  const { t } = useTranslation();
  const [listingAction, setListingAction] = useState<'SELL' | 'RENT'>('SELL');
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];

    // Basic details validation
    if (!formData.title?.trim()) {
      newErrors.push(t('errors.titleRequired'));
    }
    if (!formData.description?.trim()) {
      newErrors.push(t('errors.descriptionRequired'));
    }
    
    // Price validation
    const price = formData.price;
    if (price === undefined || price === 0 || (typeof price === 'string' && price === '')) {
      newErrors.push(t('errors.priceRequired'));
    } else {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (isNaN(numericPrice) || numericPrice <= 0) {
        newErrors.push(t('errors.invalidPrice'));
      }
    }

    if (!formData.location?.trim()) {
      newErrors.push(t('errors.locationRequired'));
    }
    if (!formData.category?.subCategory) {
      newErrors.push(t('errors.subcategoryRequired'));
    }

    

    // Category-specific validation
    if (formData.category?.mainCategory === ListingCategory.VEHICLES) {
      const vehicleDetails = formData.details?.vehicles;
      if (!vehicleDetails?.make) newErrors.push(t('errors.makeRequired'));
      if (!vehicleDetails?.model) newErrors.push(t('errors.modelRequired'));
      if (!vehicleDetails?.year) newErrors.push(t('errors.yearRequired'));
      if (!vehicleDetails?.mileage) newErrors.push(t('errors.mileageRequired'));
      if (!vehicleDetails?.fuelType) newErrors.push(t('errors.fuelTypeRequired'));
      if (!vehicleDetails?.transmission) newErrors.push(t('errors.transmissionRequired'));
      if (!vehicleDetails?.color) newErrors.push(t('errors.colorRequired'));
      if (!vehicleDetails?.condition) newErrors.push(t('errors.conditionRequired'));

      // Additional required fields from schema
      const subcategory = formData.category?.subCategory || VehicleType.CAR;
      const vehicleSchema = listingsAdvancedFieldSchema[subcategory] || [];
      const requiredVehicleFields = vehicleSchema.filter((field: ListingFieldSchema) => field.required);
      
      requiredVehicleFields.forEach((field: ListingFieldSchema) => {
        const value = vehicleDetails?.[field.name as keyof VehicleDetails];
        if (!value && value !== 0) {
          newErrors.push(t(`errors.${field.name}Required`));
        }
      });

      // Special validation for tractors
      if (subcategory === 'TRACTOR') {
        const tractorDetails = vehicleDetails as TractorDetails;
        if (!tractorDetails?.horsepower) {
          newErrors.push(t('errors.horsepowerRequired'));
        }
      }
    } else if (formData.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      const realEstateDetails = formData.details?.realEstate;
      if (!realEstateDetails?.propertyType) newErrors.push(t('errors.propertyTypeRequired'));
      if (!realEstateDetails?.size) newErrors.push(t('errors.sizeRequired'));
      if (!realEstateDetails?.bedrooms) newErrors.push(t('errors.bedroomsRequired'));
      if (!realEstateDetails?.bathrooms) newErrors.push(t('errors.bathroomsRequired'));

      // Additional required fields from schema
      const realEstateSchema = listingsAdvancedFieldSchema['realEstate'] || [];
      const requiredRealEstateFields = realEstateSchema.filter((field: ListingFieldSchema) => field.required);
      
      requiredRealEstateFields.forEach((field: ListingFieldSchema) => {
        const value = realEstateDetails?.[field.name as keyof RealEstateDetails];
        if (!value) {
          newErrors.push(t(`errors.${field.name}Required`));
        }
      });
    }

    // Image validation
    if (!formData.images || formData.images.length === 0) {
      newErrors.push(t('errors.atLeastOneImage'));
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  console.log("review formdata", formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      // Update form data with the selected listing action
      const updatedFormData = {
        ...formData,
        listingAction: listingAction as ListingAction,
        // Ensure all required fields are present
        title: formData.title || '',
        description: formData.description || '',
        price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price || 0,
        location: formData.location || '',
        category: {
          mainCategory: formData.category?.mainCategory || ListingCategory.VEHICLES,
          subCategory: formData.category?.subCategory || VehicleType.CAR
        },
        details: {
          vehicles: formData.category?.mainCategory === ListingCategory.VEHICLES ? {
            ...formData.details?.vehicles,
            vehicleType: formData.details?.vehicles?.vehicleType || VehicleType.CAR,
            make: formData.details?.vehicles?.make || '',
            model: formData.details?.vehicles?.model || '',
            year: formData.details?.vehicles?.year || new Date().getFullYear().toString(),
            mileage: formData.details?.vehicles?.mileage || '0',
            fuelType: formData.details?.vehicles?.fuelType || FuelType.GASOLINE,
            transmission: formData.details?.vehicles?.transmission || TransmissionType.AUTOMATIC,
            color: formData.details?.vehicles?.color || '',
            condition: formData.details?.vehicles?.condition || Condition.GOOD,
            features: formData.details?.vehicles?.features || [],
            interiorColor: formData.details?.vehicles?.interiorColor || '',
            warranty: formData.details?.vehicles?.warranty || '',
            serviceHistory: formData.details?.vehicles?.serviceHistory || '',
            previousOwners: formData.details?.vehicles?.previousOwners || 0,
            registrationStatus: formData.details?.vehicles?.registrationStatus || '',
            brakeType: formData.details?.vehicles?.brakeType || '',
            engineSize: formData.details?.vehicles?.engineSize || '',
            // Add tractor-specific fields if it's a tractor
            ...(formData.category?.subCategory === 'TRACTOR' ? {
              horsepower: formData.details?.vehicles?.horsepower || 0,
              attachments: (formData.details?.vehicles as TractorDetails)?.attachments || [],
              fuelTankCapacity: (formData.details?.vehicles as TractorDetails)?.fuelTankCapacity || '',
              tires: (formData.details?.vehicles as TractorDetails)?.tires || '',
            } : {})
          } : undefined,
          realEstate: formData.category?.mainCategory === ListingCategory.REAL_ESTATE ? {
            ...formData.details?.realEstate,
            propertyType: formData.details?.realEstate?.propertyType || PropertyType.HOUSE,
            size: formData.details?.realEstate?.size || '',
            yearBuilt: formData.details?.realEstate?.yearBuilt || '',
            bedrooms: formData.details?.realEstate?.bedrooms || '',
            bathrooms: formData.details?.realEstate?.bathrooms || '',
            condition: formData.details?.realEstate?.condition || Condition.GOOD,
            features: formData.details?.realEstate?.features || []
          } : undefined
        },
        images: formData.images || []
      };

      console.log('Submitting form data:', updatedFormData);
      onSubmit(updatedFormData);
    } else {
      // Scroll to the first error message
      const errorElement = document.querySelector('.text-red-500');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
  ) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 mb-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:underline"
        >
          <FaEdit className="mr-1" />
          {t("common.edit")}
        </button>
      </div>
      {children}
    </div>
  );

  const renderBasicDetails = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="text-lg font-medium">{formData.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formData.description}
          </p>
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4 mr-1" />
              {formatPrice(formData.price)}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              {formData.location}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit('basic')}
          className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
          aria-label={t("common.basicDetails")}
        >
          <FaEdit className="w-5 h-5" />
          <span className="text-sm">{t("common.edit")}</span>
        </button>
      </div>
    </div>
  );

  const renderVehicleDetails = () => {
    const vehicleDetails = formData.details?.vehicles;
    if (!vehicleDetails) return null;

    // Check if this is a tractor
    const isTractor = formData.category?.subCategory === VehicleType.TRACTOR;
    const tractorDetails = isTractor ? vehicleDetails as TractorDetails : null;

    return (
      <div className="space-y-4">
        {/* Essential Details Section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t("listings.essentialDetails")}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-500">{t("listings.make")}</div>
              <div className="font-medium">
                {vehicleDetails.make || t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.model")}</div>
              <div className="font-medium">
                {vehicleDetails.model || t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.year")}</div>
              <div className="font-medium">
                {vehicleDetails.year || t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.vehicleType")}</div>
              <div className="font-medium">
                {vehicleDetails.vehicleType
                  ? t(`listings.vehicleTypes.${vehicleDetails.vehicleType}`)
                  : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.mileage")}</div>
              <div className="font-medium">
                {vehicleDetails.mileage
                  ? `${vehicleDetails.mileage} ${t("listings.miles")}`
                  : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.fuelType")}</div>
              <div className="font-medium">
                {vehicleDetails.fuelType
                  ? t(`listings.fuelTypes.${vehicleDetails.fuelType}`)
                  : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.transmission")}</div>
              <div className="font-medium">
                {vehicleDetails.transmission
                  ? t(`listings.transmissionTypes.${vehicleDetails.transmission}`)
                  : t("common.notProvided")}
              </div>
            </div>
            {isTractor && tractorDetails && (
              <>
                <div>
                  <div className="text-sm text-gray-500">{t("listings.horsepower")}</div>
                  <div className="font-medium">
                    {tractorDetails.horsepower ? `${tractorDetails.horsepower} hp` : t("common.notProvided")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t("listings.attachments")}</div>
                  <div className="font-medium">
                    {tractorDetails.attachments?.length > 0
                      ? tractorDetails.attachments.join(", ")
                      : t("common.notProvided")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t("listings.fuelTankCapacity")}</div>
                  <div className="font-medium">
                    {tractorDetails.fuelTankCapacity
                      ? `${tractorDetails.fuelTankCapacity} L`
                      : t("common.notProvided")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t("listings.tires")}</div>
                  <div className="font-medium">
                    {tractorDetails.tires || t("common.notProvided")}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Advanced Details Section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t("listings.advancedDetails")}</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Colors */}
            <div>
              <div className="text-sm text-gray-500">{t("listings.exteriorColor")}</div>
              <div className="font-medium flex items-center gap-2">
                {vehicleDetails.color || t("common.notProvided")}
                {vehicleDetails.color && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: vehicleDetails.color }}
                  />
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.interiorColor")}</div>
              <div className="font-medium flex items-center gap-2">
                {vehicleDetails.interiorColor || t("common.notProvided")}
                {vehicleDetails.interiorColor && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: vehicleDetails.interiorColor }}
                  />
                )}
              </div>
            </div>

            {/* Performance */}
            <div>
              <div className="text-sm text-gray-500">{t("listings.engine")}</div>
              <div className="font-medium">
                {vehicleDetails.engine || t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.torque")}</div>
              <div className="font-medium">
                {vehicleDetails.torque ? `${vehicleDetails.torque} Nm` : t("common.notProvided")}
              </div>
            </div>

            {/* Condition & History */}
            <div>
              <div className="text-sm text-gray-500">{t("listings.condition")}</div>
              <div className="font-medium">
                {vehicleDetails.condition
                  ? t(`listings.conditions.${vehicleDetails.condition}`)
                  : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.warranty")}</div>
              <div className="font-medium">
                {vehicleDetails.warranty ? `${vehicleDetails.warranty} ${t("common.months")}` : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.serviceHistory")}</div>
              <div className="font-medium">
                {vehicleDetails.serviceHistory
                  ? t(`listings.serviceHistory.${vehicleDetails.serviceHistory}`)
                  : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.previousOwners")}</div>
              <div className="font-medium">
                {vehicleDetails.previousOwners || t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.registrationStatus")}</div>
              <div className="font-medium">
                {vehicleDetails.registrationStatus
                  ? t(`listings.registrationStatus.${vehicleDetails.registrationStatus}`)
                  : t("common.notProvided")}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        {formData.details?.vehicles?.features && formData.details?.vehicles?.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t("listings.features")}</h4>
            <div className="flex flex-wrap gap-2">
              {formData.details?.vehicles?.features.map((feature: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRealEstateDetails = () => {
    const realEstateDetails = formData.details?.realEstate;
    if (!realEstateDetails) return null;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-500">{t("listings.propertyType")}</div>
            <div className="font-medium">
              {realEstateDetails.propertyType
                ? t(`listings.propertyTypes.${realEstateDetails.propertyType}`)
                : t("common.notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("listings.size")}</div>
            <div className="font-medium">
              {realEstateDetails.size
                ? `${realEstateDetails.size} ${t("listings.sqft")}`
                : t("common.notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("listings.yearBuilt")}</div>
            <div className="font-medium">
              {realEstateDetails.yearBuilt || t("common.notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("listings.bedrooms")}</div>
            <div className="font-medium">
              {realEstateDetails.bedrooms || t("common.notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("listings.bathrooms")}</div>
            <div className="font-medium">
              {realEstateDetails.bathrooms || t("common.notProvided")}
            </div>
          </div>
          {formData.details?.realEstate?.features && formData.details?.realEstate?.features.length > 0 && (
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{t("listings.features")}</div>
              <div className="font-medium">{formData.details?.realEstate?.features.join(", ")}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderImages = () => {
    // Create object URLs for File objects
    const imageUrls = formData.images.map((image: File | string) => {
      if (typeof image === 'object' && 'type' in image && image instanceof Blob) {
        return URL.createObjectURL(image);
      }
      return image;
    });

    // Cleanup function to revoke object URLs when component unmounts
    useEffect(() => {
      return () => {
        imageUrls.forEach((url) => {
          if (typeof url === 'string' && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }, [imageUrls]);

    return (
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">
            {t("listings.uploadedImages")} ({formData.images.length})
          </h3>
          <button
            type="button"
            onClick={() => onEdit('images')}
            className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
            aria-label={t("listings.editImages")}
          >
            <FaEdit className="w-5 h-5" />
            <span className="text-sm">{t("common.edit")}</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              <img
                src={url}
                alt={`${t("listings.image")} ${index + 1}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div {...pageTransition} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      {renderSection(
        t("common.basicDetails"),
        <FaTag className="w-5 h-5 text-blue-500" />,
        renderBasicDetails()
      )}

      {/* Listing Action */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("listings.listingAction")}
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => setListingAction("SELL")}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center ${
              listingAction === "SELL"
                ? "bg-blue-100 border-blue-500 dark:bg-blue-900/50 dark:border-blue-500"
                : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            }`}
            aria-pressed={listingAction === "SELL"}
          >
            <FaCheck
              className={`w-8 h-8 mb-2 ${
                listingAction === "SELL" ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <span className="text-lg font-medium">{t("listings.sell")}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {t("listings.sellDescription")}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setListingAction("RENT")}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center ${
              listingAction === "RENT"
                ? "bg-green-100 border-green-500 dark:bg-green-900/50 dark:border-green-500"
                : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            }`}
            aria-pressed={listingAction === "RENT"}
          >
            <FaHistory
              className={`w-8 h-8 mb-2 ${
                listingAction === "RENT" ? "text-green-500" : "text-gray-400"
              }`}
            />
            <span className="text-lg font-medium">{t("listings.rent")}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {t("listings.rentDescription")}
            </p>
          </button>
        </div>
      </div>

      {/* Category-specific Details */}
      {formData.category?.mainCategory === ListingCategory.VEHICLES
        ? renderSection(
            t("listings.vehicleDetails"),
            <FaCar className="w-5 h-5 text-blue-500" />,
            renderVehicleDetails(),
          )
        : renderSection(
            t("listings.propertyDetails"),
            <FaHome className="w-5 h-5 text-blue-500" />,
            renderRealEstateDetails(),
          )}

      {/* Images */}
      {renderSection(
        t("listings.images"),
        <FaImages className="w-5 h-5 text-blue-500" />,
        renderImages()
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <p key={index} className="text-red-500 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 inline-block mr-2" />
            {t("common.back")}
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaHistory className="animate-spin" />
                <span>{t("common.submitting")}</span>
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4 mr-2" />
                <span>{t("common.submit")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReviewSection;
