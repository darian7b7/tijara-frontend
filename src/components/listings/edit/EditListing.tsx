import { listingsAPI } from "@/api/listings.api";
import { PRICE_CHANGE } from "@/constants/socketEvents";
import { FormField } from "@/components/form/FormField";
import type { FormFieldProps } from "@/components/form/FormField";
import type { SectionId } from "@/components/listings/create/advanced/listingsAdvancedFieldSchema";
import {
  listingsAdvancedFieldSchema,
  SECTION_CONFIG,
} from "@/components/listings/create/advanced/listingsAdvancedFieldSchema";
import ListingCard from "@/components/listings/details/ListingCard";
// Import ColorPickerField statically to avoid issues with React Children in production
import ColorPickerField from "@/components/listings/forms/ColorPickerField";
import ImageManager from "@/components/listings/images/ImageManager";
import { Button } from "@/components/ui/Button2";
import { useAuth } from "@/hooks/useAuth";
import type { PropertyType, VehicleType } from "@/types/enums";
import { Condition, TransmissionType, FuelType } from "@/types/enums";
import type { Listing, ListingFieldSchema, Location } from "@/types/listings";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaCar,
  FaHistory,
  FaHome,
  FaInfo,
  FaSave,
  FaShieldAlt,
  FaTools,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@/contexts/SocketContext";
interface EditFormData {
  id?: string; // Added ID field to store the listing ID
  title: string;
  description: string;
  price: number;
  location: Location;
  details: {
    vehicles?: Record<string, any>;
    realEstate?: Record<string, any>;
  };
  images: (string | File)[]; // Existing image URLs and new files
  existingImages: string[]; // Original image URLs from the server
  deletedImages?: string[]; // Track deleted image URLs
}

// Define the features structure to match ListingDetails.tsx
const featuresDetails = {
  safetyFeatures: [
    "blindSpotMonitor",
    "laneAssist",
    "adaptiveCruiseControl",
    "tractionControl",
    "abs",
    "emergencyBrakeAssist",
    "tirePressureMonitoring",
    "parkingSensors",
    "frontAirbags",
    "sideAirbags",
    "curtainAirbags",
    "kneeAirbags",
    "cruiseControl",
    "laneDepartureWarning",
    "laneKeepAssist",
    "automaticEmergencyBraking",
  ],
  cameraFeatures: ["rearCamera", "camera360", "dashCam", "nightVision"],
  climateFeatures: [
    "climateControl",
    "heatedSeats",
    "ventilatedSeats",
    "dualZoneClimate",
    "rearAC",
    "airQualitySensor",
  ],
  enternmentFeatures: [
    "bluetooth",
    "appleCarPlay",
    "androidAuto",
    "premiumSound",
    "wirelessCharging",
    "usbPorts",
    "cdPlayer",
    "dvdPlayer",
    "rearSeatEntertainment",
  ],
  lightingFeatures: [
    "ledHeadlights",
    "adaptiveHeadlights",
    "ambientLighting",
    "fogLights",
    "automaticHighBeams",
  ],
  convenienceFeatures: [
    "keylessEntry",
    "sunroof",
    "spareKey",
    "remoteStart",
    "powerTailgate",
    "autoDimmingMirrors",
    "rainSensingWipers",
  ],
};

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType } = {
    car: FaCar,
    home: FaHome,
    info: FaInfo,
    tools: FaTools,
    history: FaHistory,
    shield: FaShieldAlt,
  };
  return iconMap[iconName] || FaInfo;
};

const EditListing = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVehicle, setIsVehicle] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  // Add a state for features to match ListingDetails.tsx
  const [features, setFeatures] = useState({
    safetyFeatures: [] as string[],
    cameraFeatures: [] as string[],
    climateFeatures: [] as string[],
    enternmentFeatures: [] as string[],
    lightingFeatures: [] as string[],
    convenienceFeatures: [] as string[],
  });

  const [formData, setFormData] = useState<EditFormData>({
    title: "",
    description: "",
    price: 0,
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
    },
    details: {
      vehicles: {},
      realEstate: {},
    },
    images: [],
    existingImages: [],
  });

  const vehicleType = formData.details?.vehicles?.vehicleType as
    | VehicleType
    | undefined;
  const propertyType = formData.details?.realEstate?.propertyType as
    | PropertyType
    | undefined;

  // Use type assertion to avoid the indexing issues
  const advancedSchema = ((): ListingFieldSchema[] => {
    if (isVehicle && vehicleType) {
      return (listingsAdvancedFieldSchema as any)[vehicleType] || [];
    } else if (!isVehicle && propertyType) {
      return (listingsAdvancedFieldSchema as any)[propertyType] || [];
    }
    return [];
  })();

  // Get unique sections from the schema and sort them according to SECTION_CONFIG
  const advancedDetail = Array.from(
    new Set(advancedSchema.map((field: ListingFieldSchema) => field.section)),
  )
    .filter(
      (sectionId: unknown): sectionId is SectionId =>
        typeof sectionId === "string" && sectionId in SECTION_CONFIG,
    )
    .map((sectionId: SectionId) => ({
      id: sectionId,
      title: SECTION_CONFIG[sectionId].label || "",
      icon: getIconComponent(SECTION_CONFIG[sectionId].icon),
      order: SECTION_CONFIG[sectionId].order,
      fields: advancedSchema.filter(
        (field: ListingFieldSchema) => field.section === sectionId,
      ),
    }))
    .sort((a, b) => a.order - b.order);

  const advancedDetailFiels = advancedDetail[0]?.fields;

  useEffect(() => {
    // Redirect if not authenticated after auth is initialized
    if (!isAuthLoading && !isAuthenticated) {
      toast.error(t("auth.requiresLogin"));
      navigate("/auth/login", { state: { from: `/listings/${id}/edit` } });
      return;
    }

    // Only fetch if authenticated and we have an ID
    if (isAuthenticated && id) {
      const fetchListing = async () => {
        try {
          setLoading(true);
          const response = await listingsAPI.getListing(id);
          if (response.success && response.data) {
            console.log("Listing res:", response.data);
            setListing(response.data);
            // Parse the location string into components
            const locationParts = response.data.location.split(", ");
            const [city = "", state = "", country = ""] = locationParts;

            // Convert image URLs to strings for existing images
            const existingImages = (response.data.images || []).map(
              (img: any) => (typeof img === "string" ? img : img.url),
            );

            // Extract vehicle details
            const vehicleDetails = response.data.details?.vehicles;

            // Populate features similar to ListingDetails.tsx
            if (vehicleDetails) {
              setFeatures({
                safetyFeatures: featuresDetails.safetyFeatures.filter(
                  (feature) => {
                    return Object.entries(vehicleDetails).some(
                      ([key, value]) => key === feature && value,
                    );
                  },
                ),
                cameraFeatures: featuresDetails.cameraFeatures.filter(
                  (feature) => {
                    return Object.entries(vehicleDetails).some(
                      ([key, value]) => key === feature && value,
                    );
                  },
                ),
                climateFeatures: featuresDetails.climateFeatures.filter(
                  (feature) => {
                    return Object.entries(vehicleDetails).some(
                      ([key, value]) => key === feature && value,
                    );
                  },
                ),
                enternmentFeatures: featuresDetails.enternmentFeatures.filter(
                  (feature) => {
                    return Object.entries(vehicleDetails).some(
                      ([key, value]) => key === feature && value,
                    );
                  },
                ),
                lightingFeatures: featuresDetails.lightingFeatures.filter(
                  (feature) => {
                    return Object.entries(vehicleDetails).some(
                      ([key, value]) => key === feature && value,
                    );
                  },
                ),
                convenienceFeatures: featuresDetails.convenienceFeatures.filter(
                  (feature) => {
                    return Object.entries(vehicleDetails).some(
                      ([key, value]) => key === feature && value,
                    );
                  },
                ),
              });
            }

            setFormData({
              title: response.data.title,
              description: response.data.description,
              price: response.data.price,
              location: {
                address: response.data.location,
                city,
                state,
                country,
              },
              details: {
                vehicles: response.data.details?.vehicles,
                realEstate: response.data.details?.realEstate,
              },
              images: existingImages,
              existingImages: existingImages,
            });
            setIsVehicle(response.data.details?.vehicles ? true : false);
          }
        } catch (error) {
          console.error("Error fetching listing:", error);
          toast.error(t("errors.fetchFailed"));
          navigate("/profile/listings");
        } finally {
          setLoading(false);
        }
      };

      fetchListing();
    }
  }, [id, isAuthenticated, isAuthLoading, t, navigate]);

  const validateImages = () => {
    console.log("=== VALIDATE IMAGES CALLED ===");
    console.log("Current formData:", JSON.parse(JSON.stringify(formData)));

    if (!formData) {
      console.error("Form data is not available");
      toast.error(t("errors.general.somethingWentWrong"));
      return false;
    }

    try {
      // Count new images that are File objects
      const newImages = formData.images.filter((img) => img instanceof File);

      // Count existing images that are not marked for deletion
      const validExistingImages = (formData.existingImages || []).filter(
        (url: string) => !(formData.deletedImages || []).includes(url),
      );

      const totalImages = newImages.length + validExistingImages.length;

      console.log("Image validation:", {
        newImages: newImages.length,
        existingImages: formData.existingImages?.length || 0,
        deletedImages: formData.deletedImages?.length || 0,
        validExistingImages: validExistingImages.length,
        totalImages,
      });

      if (totalImages === 0) {
        console.log("No images found - showing error");
        toast.error(t("errors.noImages", { ns: "listings" }));
        return false;
      }

      if (totalImages < 2) {
        console.log("Less than 2 images - showing error");
        toast.error(
          t("errors.minImages", {
            ns: "listings",
            count: 2,
            defaultValue: "At least 2 images are required",
          }),
        );
        return false;
      }

      console.log("Image validation passed");
      return true;
    } catch (error) {
      console.error("Error validating images:", error);
      toast.error(t("errors.general.somethingWentWrong"));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== FORM SUBMITTED ===");

    if (!id || !listing || !formData) {
      console.error("Missing required data:", {
        id,
        listing,
        formData: !!formData,
      });
      toast.error(t("errors.general.somethingWentWrong"));
      return;
    }

    // Validate images before proceeding
    console.log("Validating images before submission...");
    const isValid = validateImages();

    if (!isValid) {
      console.log("Image validation failed - preventing submission");
      // Error toast is shown in validateImages
      return;
    }

    // If we get here, validation passed
    console.log("Form validation passed, proceeding with submission...");

    try {
      setSaving(true);

      // Store the original price for comparison
      const originalPrice = listing.price;
      const newPrice = Number(formData.price);
      const isPriceReduced = newPrice < originalPrice;

      // Create FormData object
      const formDataObj = new FormData();

      // Add basic fields
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);
      formDataObj.append("price", String(formData.price));
      // Ensure category is correctly formatted with main and sub categories
      if (listing.category && typeof listing.category === "object") {
        // If it's already an object, stringify it
        formDataObj.append("category", JSON.stringify(listing.category));
      } else {
        // Otherwise use the string version
        formDataObj.append("category", String(listing.category));
      }
      formDataObj.append("location", formData.location.city);
      // Always set status to ACTIVE when updating to ensure it appears on the Home page
      formDataObj.append("status", "ACTIVE");

      // Mark listing as public so it appears on the home page
      formDataObj.append("publicAccess", "true");

      // Add existing images as JSON string
      formDataObj.append(
        "existingImages",
        JSON.stringify(formData.existingImages),
      );

      // Add deleted images if any
      if (formData.deletedImages && formData.deletedImages.length > 0) {
        formDataObj.append(
          "deletedImages",
          JSON.stringify(formData.deletedImages),
        );
      }

      // Add new images
      const newImages = formData.images.filter(
        (img): img is File => img instanceof File,
      );
      newImages.forEach((image) => {
        formDataObj.append("images", image);
      });

      // Process details
      const details = {
        vehicles: isVehicle ? formData.details.vehicles : undefined,
        realEstate: !isVehicle ? formData.details.realEstate : undefined,
      };

      delete details.realEstate?.listingId;
      delete details.vehicles?.listingId;

      // Append details as JSON
      formDataObj.append("details", JSON.stringify(details));

      console.log("Submitting form data:", {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        location: formData.location.city,
        details: details,
        existingImages: formData.existingImages,
        newImages: newImages.length,
      });

      const response = await listingsAPI.updateListing(id, formDataObj);
      if (response.success) {
        try {
          // Create price drop notification if price was reduced
          if (isPriceReduced) {
            try {
              const priceReduction = originalPrice - newPrice;
              const percentReduction = Math.round(
                (priceReduction / originalPrice) * 100,
              );

              // Emit socket event for real-time notification
              if (socket) {
                console.log(
                  "Emitting price change socket event",
                  priceReduction,
                );
                socket.emit(PRICE_CHANGE, {
                  listingId: id,
                  title: formData.title,
                  oldPrice: originalPrice,
                  newPrice: newPrice,
                  percentReduction: percentReduction,
                  userId: user?.id,
                });
                console.log("Price drop notification created");
              } else {
                console.error(
                  "Socket not available for price change notification",
                );
              }
            } catch (notificationError) {
              console.error(
                "Failed to create price drop notification:",
                notificationError,
              );
              // Don't block the main flow if notification creation fails
            }
          }

          // Only show success and navigate after all operations complete
          toast.success(t("listings.updateSuccess"));

          navigate("/listingsuccess", {
            state: {
              listingId: id,
              isUpdate: true,
              title: formData.title,
              isPriceReduced: isPriceReduced,
            },
          });
        } catch (error) {
          console.error("Error during post-update operations:", error);
          throw error; // Re-throw to be caught by the outer catch block
        }
      } else {
        const errorMessage = response.error || t("listings.updateFailed");
        console.error("Update failed:", errorMessage);
        toast.error(errorMessage);
        return; // Exit early on failure
      }
    } catch (error: any) {
      console.error("Error updating listing:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.message ||
        t("listings.updateFailed");
      toast.error(errorMessage);
      throw error; // Re-throw to ensure we don't proceed with success flow
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData((prevForm) => {
      const detailsKey = isVehicle ? "vehicles" : "realEstate";

      // Convert numeric fields to numbers
      let processedValue = value;
      if (
        field === "yearBuilt" ||
        field === "mileage" ||
        field === "cargoVolume" ||
        field === "payloadCapacity" ||
        field === "previousOwners" ||
        field === "seatingCapacity" ||
        field === "horsepower" ||
        field === "torque" ||
        field === "luggageSpace"
      ) {
        processedValue =
          typeof value === "string" ? parseInt(value, 10) : value;
      }

      // Ensure warranty is always a string and handle 0 values
      if (field === "warranty") {
        if (value === 0 || value === "0") {
          processedValue = "";
        } else {
          processedValue = String(value || "");
        }
        console.log(
          "Setting warranty value:",
          processedValue,
          "type:",
          typeof processedValue,
        );
      }

      return {
        ...prevForm,
        details: {
          ...prevForm.details,
          [detailsKey]: {
            ...prevForm.details[detailsKey],
            [field]: processedValue,
          },
        },
      };
    });
  };

  // Memoize the image change handler to prevent unnecessary re-renders
  const handleImageChange = useCallback((newImages: File[]) => {
    setFormData((prev) => {
      // Keep only the File objects from previous images (filter out any strings which are existing URLs)
      const existingFileImages = prev.images.filter(
        (img) => img instanceof File,
      );

      // Create a stable array to prevent unnecessary re-renders
      return {
        ...prev,
        images: [...existingFileImages, ...newImages],
      };
    });
  }, []);

  // Memoize the delete handler to prevent unnecessary re-renders
  const handleDeleteExisting = useCallback((url: string) => {
    setFormData((prev) => {
      // Check if it's an existing image (starts with http)
      if (url.startsWith("http")) {
        // Create a stable array to prevent unnecessary re-renders
        const filteredExistingImages = prev.existingImages.filter(
          (img) => img !== url,
        );
        const updatedDeletedImages = [...(prev.deletedImages || []), url];

        return {
          ...prev,
          existingImages: filteredExistingImages,
          deletedImages: updatedDeletedImages,
        };
      }

      // If it's a new image (File object), remove it from the images array
      const newImages = prev.images.filter((img) => {
        if (typeof img === "string") {
          return img !== url;
        }
        return true; // Keep all File objects
      });

      return {
        ...prev,
        images: newImages,
      };
    });
  }, []);

  // This function handles reordering of existing images
  const handleImageReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      // The ImageManager component now handles the reordering internally and just signals us
      // We need to update our state based on the new order

      setFormData((prev) => {
        // Create a copy of the existing images array
        const existingImages = [...prev.existingImages];

        // Ensure indices are valid
        if (
          fromIndex < 0 ||
          fromIndex >= existingImages.length ||
          toIndex < 0 ||
          toIndex >= existingImages.length
        ) {
          return prev; // Return unchanged state if indices are invalid
        }

        // Remove the image from its original position
        const [movedImage] = existingImages.splice(fromIndex, 1);

        // Insert it at the new position
        existingImages.splice(toIndex, 0, movedImage);

        // Return the updated state with a new reference to prevent React from batching updates
        return {
          ...prev,
          existingImages: [...existingImages],
        };
      });
    },
    [],
  );

  if (!listing) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("listings.notFound")}
        </h2>
      </div>
    );
  }

  // Helper function to format enum options
  const getEnumOptions = (enumObj: Record<string, string>) => {
    return Object.values(enumObj).map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("listings.editListing")}
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/profile/listings")}
            className="flex items-center gap-2"
          >
            <FaArrowLeft /> {t("common.back")}
          </Button>
        </div>

        <div className="mb-6">
          <ListingCard
            listing={{
              ...listing,
              vehicleDetails: listing.details?.vehicles,
              realEstateDetails: listing.details?.realEstate,
            }}
            editable={true}
            deletable={true}
            showActions={true}
            showPrice={true}
            showLocation={true}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("listings.images")}
            </h2>
            <ImageManager
              images={formData.images.filter(
                (img): img is File => img instanceof File,
              )}
              existingImages={formData.existingImages}
              onChange={handleImageChange}
              onDeleteExisting={handleDeleteExisting}
              onReorderExisting={handleImageReorder}
              maxImages={10}
              key={`image-manager-${formData.existingImages.length}`} // Add a key to force proper re-rendering when images change
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Basic Details
            </h1>
            <FormField
              label={t("listings.title")}
              name="title"
              type="text"
              value={formData.title}
              onChange={(value) =>
                setFormData({ ...formData, title: value as string })
              }
              required
            />

            <FormField
              label={t("listings.description")}
              name="description"
              type="textarea"
              value={formData.description}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  description: value as string,
                })
              }
              required
            />

            <FormField
              label={t("listings.price")}
              name="price"
              type="number"
              value={formData.price.toString()}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  price: parseFloat(value as string) || 0,
                })
              }
              required
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t("listings.location")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t("listings.city")}
                  name="city"
                  type="text"
                  value={formData.location.city}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        city: value as string,
                      },
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Details
            </h1>

            {/* Add special fields here for Transmission, FuelType, and Condition */}
            {isVehicle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <FormField
                  label={t("listings.fields.transmissionType")}
                  name="transmissionType"
                  type="select"
                  value={formData.details?.vehicles?.transmissionType || ""}
                  options={getEnumOptions(TransmissionType)}
                  onChange={(value) =>
                    handleInputChange("transmissionType", value)
                  }
                  required
                />

                <FormField
                  label={t("listings.fields.fuelType")}
                  name="fuelType"
                  type="select"
                  value={formData.details?.vehicles?.fuelType || ""}
                  options={getEnumOptions(FuelType)}
                  onChange={(value) => handleInputChange("fuelType", value)}
                  required
                />

                <FormField
                  label={t("listings.fields.condition")}
                  name="condition"
                  type="select"
                  value={formData.details?.vehicles?.condition || ""}
                  options={getEnumOptions(Condition)}
                  onChange={(value) => handleInputChange("condition", value)}
                  required
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                {advancedDetailFiels &&
                  advancedDetailFiels.map((field: any, idx: number) => {
                    // Skip fields we're now handling separately
                    if (
                      ["transmissionType", "fuelType", "condition"].includes(
                        field.name,
                      )
                    ) {
                      return null;
                    }

                    const currentValue = isVehicle
                      ? formData.details?.vehicles?.[field.name]
                      : formData.details?.realEstate?.[field.name];

                    if (field.type === "colorpicker") {
                      return (
                        <ColorPickerField
                          key={field.name || idx}
                          label={field.label}
                          value={(currentValue as string) || "#000000"}
                          onChange={(value) =>
                            handleInputChange(field.name, value)
                          }
                          required={field.required}
                        />
                      );
                    }
                    return (
                      <FormField
                        key={field.name || idx}
                        label={field.label}
                        name={field.name}
                        type={field.type as FormFieldProps["type"]}
                        value={currentValue || ""}
                        options={field.options?.map((key: string) => ({
                          value: key,
                          label: key,
                        }))}
                        onChange={(value) =>
                          handleInputChange(field.name, value)
                        }
                        required={field.required}
                      />
                    );
                  })}
              </div>
            </div>

            {/* Features Section */}
            {isVehicle && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {t("Vehicle Features")}
                </h2>

                {/* Safety Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t("Safety Features")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {featuresDetails.safetyFeatures.map((feature) => {
                      return (
                        <div
                          key={feature}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={feature}
                            checked={Boolean(
                              formData.details?.vehicles?.[feature],
                            )}
                            onChange={(e) => {
                              handleInputChange(feature, e.target.checked);
                              // Update features state when checkbox changes
                              if (e.target.checked) {
                                setFeatures((prev) => ({
                                  ...prev,
                                  safetyFeatures: [
                                    ...prev.safetyFeatures,
                                    feature,
                                  ],
                                }));
                              } else {
                                setFeatures((prev) => ({
                                  ...prev,
                                  safetyFeatures: prev.safetyFeatures.filter(
                                    (f) => f !== feature,
                                  ),
                                }));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <label
                            htmlFor={feature}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {t(`features.${feature}`) || feature}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Camera Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t("Camera Features")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {featuresDetails.cameraFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={feature}
                          checked={Boolean(
                            formData.details?.vehicles?.[feature],
                          )}
                          onChange={(e) =>
                            handleInputChange(feature, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor={feature}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {t(`features.${feature}`) || feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Climate Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t("Climate Features")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {featuresDetails.climateFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={feature}
                          checked={Boolean(
                            formData.details?.vehicles?.[feature],
                          )}
                          onChange={(e) =>
                            handleInputChange(feature, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor={feature}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {t(`features.${feature}`) || feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entertainment Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t("Entertainment Features")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {featuresDetails.enternmentFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={feature}
                          checked={Boolean(
                            formData.details?.vehicles?.[feature],
                          )}
                          onChange={(e) =>
                            handleInputChange(feature, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor={feature}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {t(`features.${feature}`) || feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lighting Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t("Lighting Features")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {featuresDetails.lightingFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={feature}
                          checked={Boolean(
                            formData.details?.vehicles?.[feature],
                          )}
                          onChange={(e) =>
                            handleInputChange(feature, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor={feature}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {t(`features.${feature}`) || feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Convenience Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t("Convenience Features")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {featuresDetails.convenienceFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={feature}
                          checked={Boolean(
                            formData.details?.vehicles?.[feature],
                          )}
                          onChange={(e) =>
                            handleInputChange(feature, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor={feature}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {t(`features.${feature}`) || feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/profile/listings")}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              <FaSave />
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
