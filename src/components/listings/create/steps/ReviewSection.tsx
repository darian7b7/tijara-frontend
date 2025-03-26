import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FormState, ListingCategory } from "@/types/listings";
import {
  FaEdit,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaMoneyBillWave,
  FaCar,
  FaHome,
  FaImages,
  FaHistory,
} from "react-icons/fa";

interface ReviewSectionProps {
  formData: FormState;
  onSubmit: (data: FormState) => void;
  onBack: () => void;
}

// Light animations for performance
const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

const ReviewSection: React.FC<ReviewSectionProps> = ({
  formData,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingAction, setListingAction] = useState<"sell" | "rent">("sell");

  // Add debugging information
  useEffect(() => {
    console.log("ReviewSection mounted with data:", formData);
  }, [formData]);

  // Enhanced handleSubmit with better error handling
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Submitting final form data:", formData);

      // Prepare the data for API submission
      const apiData = prepareFormDataForSubmission(formData);
      console.log("Prepared data for API:", apiData);

      // Call the parent's onSubmit function
      await onSubmit(apiData);

      // Show success notification
      toast.success(t("listingCreatedSuccessfully"), {
        duration: 3000,
        icon: "🎉",
      });

      // Reset submission state
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting listing:", error);

      // Show error notification
      toast.error(t("errorCreatingListing"), {
        duration: 4000,
      });

      setIsSubmitting(false);
    }
  };

  // Helper function to prepare form data for API submission
  const prepareFormDataForSubmission = (data: FormState) => {
    // Create a copy to avoid mutating the original
    const prepared = { ...data };

    // Handle any specific transformations needed for the API
    // For example, ensuring numeric fields are sent as numbers, not strings
    if (prepared.price) {
      prepared.price = Number(prepared.price);
    }

    if (prepared.category.mainCategory === ListingCategory.VEHICLES && prepared.details) {
      // Convert string numeric values to actual numbers
      if (prepared.details.mileage) {
        prepared.details.mileage = Number(prepared.details.mileage);
      }
      if (prepared.details.year) {
        prepared.details.year = Number(prepared.details.year);
      }
    }

    if (prepared.category.mainCategory === ListingCategory.REAL_ESTATE && prepared.details) {
      // Convert string numeric values to actual numbers
      if (prepared.details.size) {
        prepared.details.size = Number(prepared.details.size);
      }
      if (prepared.details.yearBuilt) {
        prepared.details.yearBuilt = Number(prepared.details.yearBuilt);
      }
      if (prepared.details.bedrooms) {
        prepared.details.bedrooms = Number(prepared.details.bedrooms);
      }
      if (prepared.details.bathrooms) {
        prepared.details.bathrooms = Number(prepared.details.bathrooms);
      }
    }

    return prepared;
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
          {t("edit")}
        </button>
      </div>
      {children}
    </div>
  );

  // Enhanced renderVehicleDetails to handle all vehicle fields
  const renderVehicleDetails = () => {
    if (!formData.details) return null;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-500">{t("make")}</div>
            <div className="font-medium">
              {formData.details.make || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("model")}</div>
            <div className="font-medium">
              {formData.details.model || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("year")}</div>
            <div className="font-medium">
              {formData.details.year || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("vehicleType")}</div>
            <div className="font-medium">
              {formData.details.vehicleType
                ? t(`vehicleTypes.${formData.details.vehicleType}`)
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("mileage")}</div>
            <div className="font-medium">
              {formData.details.mileage
                ? `${formData.details.mileage} ${t("miles")}`
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("fuelType")}</div>
            <div className="font-medium">
              {formData.details.fuelType
                ? t(`fuelTypes.${formData.details.fuelType}`)
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("transmissionType")}</div>
            <div className="font-medium">
              {formData.details.transmissionType
                ? t(`transmissionTypes.${formData.details.transmissionType}`)
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("color")}</div>
            <div className="font-medium">
              {formData.details.color || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("condition")}</div>
            <div className="font-medium">
              {formData.details.condition
                ? t(`conditions.${formData.details.condition}`)
                : t("notProvided")}
            </div>
          </div>
        </div>

        {/* Features */}
        {formData.details.features && formData.details.features.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-1">{t("features")}</div>
            <div className="flex flex-wrap gap-2">
              {formData.details.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
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

  const renderRealEstateDetails = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {formData.details.realEstate?.propertyType && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("propertyType")}
          </h4>
          <p className="mt-1 text-base font-medium capitalize">
            {t(formData.details.realEstate.propertyType.toLowerCase())}
          </p>
        </div>
      )}

      {formData.details.realEstate?.size && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("size")}
          </h4>
          <p className="mt-1 text-base font-medium">
            {formData.details.realEstate.size} m²
          </p>
        </div>
      )}

      {formData.details.realEstate?.bedrooms && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("bedrooms")}
          </h4>
          <p className="mt-1 text-base font-medium">
            {formData.details.realEstate.bedrooms}
          </p>
        </div>
      )}

      {formData.details.realEstate?.bathrooms && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("bathrooms")}
          </h4>
          <p className="mt-1 text-base font-medium">
            {formData.details.realEstate.bathrooms}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("reviewYourListing")}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("reviewDescription")}
          </p>
        </div>
      </div>

      {/* Basic Details */}
      {renderSection(
        t("basicDetails"),
        <FaTag className="text-blue-500" />,
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("title")}
            </h4>
            <p className="mt-1 text-xl font-semibold">{formData.title}</p>
          </div>

          <div className="flex items-start">
            <FaMoneyBillWave className="h-5 w-5 text-green-500 mt-1 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("price")}
              </h4>
              <p className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">
                {formatPrice(formData.price)}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <FaMapMarkerAlt className="h-5 w-5 text-red-500 mt-1 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("location")}
              </h4>
              <p className="mt-1 text-base">{formData.location}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("description")}
            </h4>
            <p className="mt-1 text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {formData.description}
            </p>
          </div>
        </div>,
      )}

      {/* Category-specific details */}
      {renderSection(
        formData.category.mainCategory === ListingCategory.VEHICLES
          ? t("vehicleDetails")
          : t("propertyDetails"),
        formData.category.mainCategory === ListingCategory.VEHICLES ? (
          <FaCar className="text-blue-500" />
        ) : (
          <FaHome className="text-green-500" />
        ),
        formData.category.mainCategory === ListingCategory.VEHICLES
          ? renderVehicleDetails()
          : renderRealEstateDetails(),
      )}

      {/* Images */}
      {renderSection(
        t("photos"),
        <FaImages className="text-purple-500" />,
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {formData.images && formData.images.length > 0 ? (
            formData.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <img
                  src={
                    typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                  }
                  alt={`${t("image")} ${index + 1}`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
              {t("noImages")}
            </p>
          )}
        </div>,
      )}

      {/* Listing Action */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("listingAction")}
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => setListingAction("sell")}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center ${
              listingAction === "sell"
                ? "bg-blue-100 border-blue-500 dark:bg-blue-900/50 dark:border-blue-500"
                : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            }`}
            aria-pressed={listingAction === "sell"}
          >
            <FaCheck
              className={`w-8 h-8 mb-2 ${
                listingAction === "sell" ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <span className="text-lg font-medium">{t("sell")}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {t("sellDescription")}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setListingAction("rent")}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center ${
              listingAction === "rent"
                ? "bg-green-100 border-green-500 dark:bg-green-900/50 dark:border-green-500"
                : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            }`}
            aria-pressed={listingAction === "rent"}
          >
            <FaHistory
              className={`w-8 h-8 mb-2 ${
                listingAction === "rent" ? "text-green-500" : "text-gray-400"
              }`}
            />
            <span className="text-lg font-medium">{t("rent")}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {t("rentDescription")}
            </p>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 flex-1 sm:flex-none justify-center"
        >
          <FaTimes className="inline-block mr-2" />
          {t("back")}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex-1 sm:flex-none justify-center flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {t("submitting")}
            </>
          ) : (
            <>
              <FaCheck className="inline-block mr-2" />
              {t("submitListing")}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewSection;
