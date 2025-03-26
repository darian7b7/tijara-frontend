import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ListingCategory, VehicleType, PropertyType } from "@/types/listings";
import { FuelType, TransmissionType, Condition } from "@/types/listings";
import BasicDetailsForm from "./steps/BasicDetailsForm";
import AdvancedDetailsForm from "./steps/AdvancedDetailsForm";
import ReviewSection from "./steps/ReviewSection";
import { FaCarSide, FaCog, FaCheckCircle } from "react-icons/fa";
import type { FormState } from "@/types/listings";

interface CreateListingProps {
  onSubmit: (data: FormState) => Promise<void>;
}

// Animation variants for lightweight transitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

const initialFormState: FormState = {
  title: "",
  description: "",
  price: 0,
  category: {
    mainCategory: ListingCategory.VEHICLES,
    subCategory: VehicleType.CARS,
  },
  location: "",
  images: [],
  details: {
    vehicles: {
      vehicleType: VehicleType.CARS,
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      mileage: "",
      fuelType: FuelType.GASOLINE,
      transmissionType: TransmissionType.AUTOMATIC,
      color: "",
      condition: Condition.GOOD,
      features: [],
    },
  },
};

const CreateListing: React.FC<CreateListingProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = (validationPassed: boolean) => {
    if (!validationPassed) {
      toast.error(t("errors.pleaseFixErrors"), {
        ariaProps: {
          role: "alert",
          "aria-live": "assertive",
        },
      });
      return;
    }
    setStep((prev) => prev + 1);

    // Success feedback with accessibility support
    toast.success(t("success.stepSaved"), {
      ariaProps: {
        role: "status",
        "aria-live": "polite",
      },
    });
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleBasicDetailsSubmit = async (data: FormState, isValid: boolean) => {
    if (isValid) {
      setFormData((prev) => ({
        ...prev,
        ...data,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
      }));
      setStep((prev) => prev + 1);
    }
  };

  const handleAdvancedDetailsSubmit = async (data: FormState, isValid: boolean) => {
    if (isValid) {
      setFormData((prev) => ({
        ...prev,
        ...data,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
      }));
      setStep((prev) => prev + 1);
    }
  };

  const handleFinalSubmit = async (data: FormState) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });

      // Handle images
      data.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        } else if (typeof image === 'string') {
          formData.append('imageUrls[]', image);
        }
      });

      await onSubmit(data);
      toast.success(t("listingCreatedSuccessfully"));
      setStep(1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error creating listing");
      toast.error(t("errorCreatingListing"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    console.log("Rendering step:", step);

    switch (step) {
      case 1:
        return (
          <BasicDetailsForm
            onSubmit={handleBasicDetailsSubmit}
            initialData={formData as FormState}
          />
        );
      case 2:
        return (
          <AdvancedDetailsForm
            initialData={formData as FormState}
            onSubmit={handleAdvancedDetailsSubmit}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ReviewSection
            formData={formData as FormState}
            onBack={handleBack}
            onSubmit={handleFinalSubmit}
          />
        );
      default:
        console.error("Unknown step:", step);
        return (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-red-600">
              Unknown step: {step}
            </h3>
            <p className="mt-2 text-gray-500">
              This is an error. Please start over.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => setStep(1)}
            >
              Return to Start
            </button>
          </div>
        );
    }
  };

  const stepIcons = [
    { icon: FaCarSide, label: t("basicDetails") },
    { icon: FaCog, label: t("advancedDetails") },
    { icon: FaCheckCircle, label: t("review") },
  ];

  if (error) {
    return (
      <div
        className="max-w-4xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        role="alert"
      >
        <h2 className="text-lg font-medium text-red-800 dark:text-red-300">
          {t("errors.submissionFailed")}
        </h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
            tabIndex={0}
          >
            {t("createListing")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400" tabIndex={0}>
            {t("createListingDescription")}
          </p>

          {/* Accessible step indicator */}
          <div
            className="mt-8 mb-6"
            aria-label={`Step ${step} of 3: ${stepIcons[step - 1].label}`}
          >
            <div className="flex justify-between mb-2">
              {stepIcons.map((stepInfo, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center ${
                    idx + 1 === step
                      ? "text-blue-600 dark:text-blue-400"
                      : idx + 1 < step
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 
                      ${
                        idx + 1 === step
                          ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                          : idx + 1 < step
                            ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                            : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"
                      }`}
                    aria-hidden="true"
                  >
                    <stepInfo.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                    {stepInfo.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative pt-1">
              <div className="flex h-2 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="flex flex-col justify-center overflow-hidden bg-blue-500"
                  role="progressbar"
                  style={{ width: `${(step / 3) * 100}%` }}
                  aria-valuenow={Math.round((step / 3) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className={isSubmitting ? "opacity-60 pointer-events-none" : ""}>
          <AnimatePresence mode="wait">
            <motion.div key={step} {...pageTransition}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {isSubmitting && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50"
            aria-live="polite"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {t("submitting")}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CreateListing;
