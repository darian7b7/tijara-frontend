import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FormState, ListingCategory } from "@/types/listings";
import {
  FaEdit,
  FaCheck,
  FaCar,
  FaHome,
  FaImages,
  FaHistory,
  FaTag,
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
      console.log("Submitting final form data:", {
        ...formData,
        listingAction: listingAction,
      });

      // Call the parent's onSubmit function
      await onSubmit({
        ...formData,
        listingAction: listingAction,
      });

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

  const renderVehicleDetails = () => {
    const vehicleDetails = formData.details?.vehicles;
    if (!vehicleDetails) return null;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-500">{t("make")}</div>
            <div className="font-medium">
              {vehicleDetails.make || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("model")}</div>
            <div className="font-medium">
              {vehicleDetails.model || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("year")}</div>
            <div className="font-medium">
              {vehicleDetails.year || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("vehicleType")}</div>
            <div className="font-medium">
              {vehicleDetails.vehicleType
                ? t(`vehicleTypes.${vehicleDetails.vehicleType}`)
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("mileage")}</div>
            <div className="font-medium">
              {vehicleDetails.mileage
                ? `${vehicleDetails.mileage} ${t("miles")}`
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("fuelType")}</div>
            <div className="font-medium">
              {vehicleDetails.fuelType
                ? t(`fuelTypes.${vehicleDetails.fuelType}`)
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("transmission")}</div>
            <div className="font-medium">
              {vehicleDetails.transmission
                ? t(`transmissionTypes.${vehicleDetails.transmission}`)
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("color")}</div>
            <div className="font-medium">
              {vehicleDetails.color || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("condition")}</div>
            <div className="font-medium">
              {vehicleDetails.condition
                ? t(`conditions.${vehicleDetails.condition}`)
                : t("notProvided")}
            </div>
          </div>
          {formData.features && formData.features.length > 0 && (
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{t("features")}</div>
              <div className="font-medium">{formData.features.join(", ")}</div>
            </div>
          )}
        </div>
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
            <div className="text-sm text-gray-500">{t("propertyType")}</div>
            <div className="font-medium">
              {realEstateDetails.propertyType
                ? t(`propertyTypes.${realEstateDetails.propertyType}`)
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("size")}</div>
            <div className="font-medium">
              {realEstateDetails.size
                ? `${realEstateDetails.size} ${t("sqft")}`
                : t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("yearBuilt")}</div>
            <div className="font-medium">
              {realEstateDetails.yearBuilt || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("bedrooms")}</div>
            <div className="font-medium">
              {realEstateDetails.bedrooms || t("notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("bathrooms")}</div>
            <div className="font-medium">
              {realEstateDetails.bathrooms || t("notProvided")}
            </div>
          </div>
          {formData.features && formData.features.length > 0 && (
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{t("features")}</div>
              <div className="font-medium">{formData.features.join(", ")}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div {...pageTransition} className="space-y-6">
      {/* Basic Information */}
      {renderSection(
        t("basicInformation"),
        <FaTag className="w-5 h-5 text-blue-500" />,
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">{t("title")}</div>
            <div className="font-medium">{formData.title}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("description")}</div>
            <div className="font-medium">{formData.description}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("price")}</div>
            <div className="font-medium">{formatPrice(formData.price)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("location")}</div>
            <div className="font-medium">{formData.location}</div>
          </div>
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

      {/* Category-specific Details */}
      {formData.category.mainCategory === ListingCategory.VEHICLES
        ? renderSection(
            t("vehicleDetails"),
            <FaCar className="w-5 h-5 text-blue-500" />,
            renderVehicleDetails(),
          )
        : renderSection(
            t("propertyDetails"),
            <FaHome className="w-5 h-5 text-blue-500" />,
            renderRealEstateDetails(),
          )}

      {/* Images */}
      {renderSection(
        t("images"),
        <FaImages className="w-5 h-5 text-blue-500" />,
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {formData.images.map((image, index) => (
            <div
              key={index}
              className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden"
            >
              <img
                src={
                  typeof image === "string" ? image : URL.createObjectURL(image)
                }
                alt={`${t("image")} ${index + 1}`}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>,
      )}

      {/* Submit Button */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isSubmitting}
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FaHistory className="animate-spin" />
              <span>{t("submitting")}</span>
            </>
          ) : (
            <>
              <FaCheck />
              <span>{t("submit")}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewSection;
