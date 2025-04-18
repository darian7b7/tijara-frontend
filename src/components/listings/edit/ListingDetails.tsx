import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MessagesAPI } from "@/api/messaging.api";
import type { Listing } from "@/types/listings";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
  ListingAction,
} from "@/types/enums";
import type { ListingMessageInput } from "@/types/messaging";
import { toast } from "react-toastify";
import { listingsAPI } from "@/api/listings.api";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/format";
import ImageGallery from "@/components/listings/images/ImageGallery";
import { Link } from "react-router-dom";

interface ListingImage {
  url: string;
  id?: string;
  listingId?: string;
  order?: number;
}

interface ExtendedListing extends Listing {
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
}

// Using types directly from listings.ts
import type { ListingDetails } from "@/types/listings";
import { LoadingSpinner } from "@/api";

const ListingDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<ExtendedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const initializeAndFetchListing = async () => {
      if (!id) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await listingsAPI.getById(id);
        console.log("Got response:", response);

        // Log the full response data for debugging advanced details
        console.log(
          "Response data details:",
          JSON.stringify(response.data?.details, null, 2),
        );
        console.log(
          "FULL Response Data:",
          JSON.stringify(response.data, null, 2),
        );
        console.log(
          "Response data details:",
          JSON.stringify(response.data?.details, null, 2),
        );
        if (response.data?.details?.vehicles) {
          console.log(
            "Vehicle details:",
            JSON.stringify(response.data.details.vehicles, null, 2),
          );
        }

        if (!response.success || !response.data) {
          const error = response.error || "Failed to load listing";
          console.error("API error:", error);
          throw new Error(error);
        }

        const listing = response.data;
        console.log("Listing data:", listing);
        console.log("Listing images:", listing.images);

        if (!listing) {
          console.error("No listing data in response");
          throw new Error("Listing not found");
        }

        // Ensure images are in the correct format
        const processedImages = (listing.images || [])
          .map((img: string | File) => {
            if (typeof img === 'string') return img;
            if (img instanceof File) {
              // Create URL from File object
              return URL.createObjectURL(img);
            }
            return '';
          })
          .filter(Boolean);

        console.log("Processed images:", processedImages);

        const {
          category,
          details = {},
          listingAction,
          status,
          ...rest
        } = listing;

        console.log("Listing category:", category);

        // Log all the details to debug what's available
        console.log(
          "Details before transformation:",
          JSON.stringify(details, null, 2),
        );
        console.log(
          "Vehicle details before:",
          details.vehicles
            ? JSON.stringify(details.vehicles, null, 2)
            : "No vehicle details",
        );

        // Transform vehicle details if present
        const transformedDetails = {
          vehicles: details.vehicles
            ? {
                ...details.vehicles,
                vehicleType: category.subCategory as VehicleType,
                features: details.vehicles.features || [],
                // Essential fields
                mileage: typeof details.vehicles.mileage === "number" ? details.vehicles.mileage.toString() : "0",
                color: details.vehicles.color || "",
                interiorColor: details.vehicles.interiorColor || "",
                condition: details.vehicles.condition || Condition.GOOD,
                transmission: details.vehicles.transmission || TransmissionType.AUTOMATIC,
                fuelType: details.vehicles.fuelType || FuelType.GASOLINE,
                // Advanced fields
                vin: details.vehicles.vin || "",
                engineNumber: details.vehicles.engineNumber || "",
                numberOfOwners: typeof details.vehicles.numberOfOwners === "number" ? details.vehicles.numberOfOwners : 0,
                serviceHistory: details.vehicles.serviceHistory || false,
                accidentFree: details.vehicles.accidentFree || false,
                importStatus: details.vehicles.importStatus || "Local",
                registrationExpiry: details.vehicles.registrationExpiry || "",
                warranty: details.vehicles.warranty || "No",
                insuranceType: details.vehicles.insuranceType || "None",
                upholsteryMaterial: details.vehicles.upholsteryMaterial || "Other",
                // Features
                blindSpotMonitor: details.vehicles.blindSpotMonitor || false,
                laneAssist: details.vehicles.laneAssist || false,
                adaptiveCruiseControl: details.vehicles.adaptiveCruiseControl || false,
                rearCamera: details.vehicles.rearCamera || false,
                camera360: details.vehicles.camera360 || false,
                parkingSensors: details.vehicles.parkingSensors || false,
                climateControl: details.vehicles.climateControl || false,
                heatedSeats: details.vehicles.heatedSeats || false,
                ventilatedSeats: details.vehicles.ventilatedSeats || false,
                ledHeadlights: details.vehicles.ledHeadlights || false,
                adaptiveHeadlights: details.vehicles.adaptiveHeadlights || false,
                ambientLighting: details.vehicles.ambientLighting || false,
                bluetooth: details.vehicles.bluetooth || false,
                appleCarPlay: details.vehicles.appleCarPlay || false,
                androidAuto: details.vehicles.androidAuto || false,
                premiumSound: details.vehicles.premiumSound || false,
                wirelessCharging: details.vehicles.wirelessCharging || false,
                keylessEntry: details.vehicles.keylessEntry || false,
                sunroof: details.vehicles.sunroof || false,
                spareKey: details.vehicles.spareKey || false,
                remoteStart: details.vehicles.remoteStart || false,
                tireCondition: details.vehicles.tireCondition || "Good",
                // Additional fields
                engine: details.vehicles.engine || "",
                horsepower: typeof details.vehicles.horsepower === "number" ? details.vehicles.horsepower : 0,
                torque: typeof details.vehicles.torque === "number" ? details.vehicles.torque : 0,
                // For tractors
                attachments: details.vehicles.attachments || [],
                fuelTankCapacity: details.vehicles.fuelTankCapacity || "",
                tires: details.vehicles.tires || "",
              }
            : undefined,
          realEstate: details.realEstate
            ? {
                ...details.realEstate,
                propertyType: category.subCategory as PropertyType,
                features: details.realEstate.features || [],
              }
            : undefined,
        };

        setListing({
          ...rest,
          category: {
            mainCategory: category.mainCategory as ListingCategory,
            subCategory: category.subCategory as VehicleType | PropertyType,
          },
          details: transformedDetails,
          listingAction: listing.listingAction as ListingAction,
          images: processedImages,
          seller: {
            id: listing.userId || "",
            username: listing.seller?.username || "Unknown Seller",
            profilePicture: listing.seller?.profilePicture || null,
          },
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load listing";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetchListing();
  }, [id, navigate, t]);

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      toast.error(t("common.loginRequired"));
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    setShowContactForm(true);
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated || !user || !listing) {
      toast.error(t("common.loginRequired"));
      return;
    }

    setIsSending(true);
    try {
      // Create a conversation if it doesn't exist
      const conversationResponse = await MessagesAPI.createConversation({
        participantIds: [user?.id || "", listing.userId || ""],
        initialMessage: message.trim()
      });

      if (conversationResponse.success && conversationResponse.data) {
        const conversationId = conversationResponse.data._id;
        
        // Send the message using the correct structure
        const response = await MessagesAPI.sendMessage({
          conversationId,
          content: message.trim(),
          listingId: id || ""
        });

        if (response.success) {
          toast.success(t("messages.messageSent"));
          setMessage("");
          setShowContactForm(false);
        } else {
          toast.error(response.error || t("common.errorOccurred"));
        }
      } else {
        toast.error(conversationResponse.error || t("common.errorOccurred"));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("common.errorOccurred"));
    } finally {
      setIsSending(false);
    }
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          {t("common.goBack")}
        </button>
      </div>
    );
  }

  // Early return if no listing
  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">{t("listings.notFound")}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          {t("common.goBack")}
        </button>
      </div>
    );
  }

  const isVehicle =
    listing.category.mainCategory.toLocaleLowerCase() ===
    ListingCategory.VEHICLES.toLocaleLowerCase();

  const isRealEstate =
    listing.category.mainCategory.toLocaleLowerCase() ===
    ListingCategory.REAL_ESTATE.toLocaleLowerCase();
  const isOwner = user?.id === listing.userId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="w-full">
          <ImageGallery images={listing?.images || []} />
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          {/* Title and Price Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              {listing?.title}
            </h1>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {listing?.price && formatCurrency(listing.price)}
              {listing?.listingAction?.toLowerCase() === ListingAction.RENT &&
                "/month"}
            </p>
          </div>

          {/* Seller Information */}
          {listing?.seller && (
            <>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Link
                  to={`/users/${listing.seller.id}`}
                  className="flex items-center space-x-3 hover:text-blue-600"
                >
                  {listing.seller.profilePicture ? (
                    <img
                      src={listing.seller.profilePicture}
                      alt={listing.seller.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xl">
                        {listing.seller.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{listing.seller.username}</p>
                    <p className="text-sm text-gray-500">
                      {t("listings.posted_on")}: {" "}
                      {new Date(listing.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                {/* Contact Seller Button (now inside card, right-aligned) */}
                {!isOwner && !showContactForm && (
                  <button
                    onClick={handleContactSeller}
                    className="flex items-center gap-2 px-3 py-1.5 border border-blue-500 text-blue-600 bg-white dark:bg-gray-900 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                    style={{minWidth: 0}}
                    title={t("listings.contactSeller") as string}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-2.25M17.25 8.25l-5.25 5.25-5.25-5.25" />
                    </svg>
                    <span className="hidden sm:inline">{t("listings.contactSeller")}</span>
                  </button>
                )}
              </div>

              {/* Contact Seller Form (shows only when triggered) */}
              {!isOwner && showContactForm && (
                <div className="mt-4">
                  <div className="space-y-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("messages.enterMessage")}
                      className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isSending}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                      >
                        {isSending ? t("common.sending") : t("messages.send")}
                      </button>
                      <button
                        onClick={() => setShowContactForm(false)}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t("listings.basicInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("listings.title")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {listing.title}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("listings.price")}
                </p>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(listing.price)}
                  {listing.listingAction?.toLowerCase() === "rent" && "/month"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("listings.location")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {listing.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("listings.listingAction")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {listing.listingAction || t("common.notProvided")}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {isVehicle && listing?.details?.vehicles && (
            <div className=" ">
              {/* <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t("listings.vehicleDetails")}
                     </h2> */}

              <div className="space-y-6">
                {/* Essential Details */}
                <div className=" bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.essentialDetails")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.make")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.make}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.model")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.model}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.year")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.year}
                      </p>
                    </div>
                    {listing.details.vehicles.mileage && (
  <div className="space-y-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {t("listings.fields.mileage")}
    </p>
    <p className="font-medium text-gray-900 dark:text-white">
      {listing.details.vehicles.mileage} {t("listings.fields.mileage")}
    </p>
  </div>
)}
                    {listing.details.vehicles.fuelType && (
  <div className="space-y-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {t("listings.fields.fuelType")}
    </p>
    <p className="font-medium text-gray-900 dark:text-white">
      {t(`listings.fields.fuelTypes.${listing.details.vehicles.fuelType}`)}
    </p>
  </div>
)}
                    {listing.details.vehicles.transmission && (
  <div className="space-y-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {t("listings.fields.transmission")}
    </p>
    <p className="font-medium text-gray-900 dark:text-white">
      {t(`listings.fields.transmissionTypes.${listing.details.vehicles.transmission}`)}
    </p>
  </div>
)}
                  </div>
                </div>

                {/* Appearance */}
                <div className=" bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.appearance")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listing.details.vehicles.color && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.exteriorColor")}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                            style={{
                              backgroundColor: listing.details.vehicles.color,
                            }}
                          />
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.color}
                          </p>
                        </div>
                      </div>
                    )}
                    {listing.details.vehicles.interiorColor && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.interiorColor")}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                            style={{
                              backgroundColor:
                                listing.details.vehicles.interiorColor,
                            }}
                          />
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.interiorColor}
                          </p>
                        </div>
                      </div>
                    )}
                    {listing.details.vehicles.condition && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.condition")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t(`listings.fields.conditions.${listing.details.vehicles.condition}`)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Vehicle Details */}
                <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.additionalDetails")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listing.details.vehicles.warranty !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.warranty")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.warranty}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.serviceHistory && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.serviceHistory")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.serviceHistory ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.numberOfOwners !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.numberOfOwners")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.numberOfOwners}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.registrationStatus && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.registrationStatus")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.registrationStatus}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.vin && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.vin")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.vin}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.engineNumber && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.engineNumber")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.engineNumber}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.accidentFree && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.accidentFree")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.accidentFree ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.importStatus && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.importStatus")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.importStatus}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.registrationExpiry && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.registrationExpiry")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(listing.details.vehicles.registrationExpiry).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.insuranceType && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.insuranceType")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.insuranceType}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.upholsteryMaterial && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.upholsteryMaterial")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.upholsteryMaterial}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.tireCondition && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.tireCondition")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.tireCondition}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.technicalDetails")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listing.details.vehicles.engine && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.engine")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.engine}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.horsepower !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.horsepower")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.horsepower} HP
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.torque !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.torque")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.torque} Nm
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white dark:bg-gray-800 shadow-sm p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.features")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Safety Features */}
                    {listing.details.vehicles.blindSpotMonitor && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.blindSpotMonitor")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.laneAssist && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.laneAssist")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.adaptiveCruiseControl && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.adaptiveCruiseControl")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {/* Camera Features */}
                    {listing.details.vehicles.rearCamera && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.rearCamera")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.camera360 && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.camera360")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.parkingSensors && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.parkingSensors")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {/* Climate Features */}
                    {listing.details.vehicles.climateControl && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.climateControl")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.heatedSeats && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.heatedSeats")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.ventilatedSeats && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.ventilatedSeats")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {/* Entertainment Features */}
                    {listing.details.vehicles.bluetooth && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.bluetooth")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.appleCarPlay && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.appleCarPlay")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.androidAuto && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.androidAuto")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.premiumSound && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.premiumSound")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.wirelessCharging && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.wirelessCharging")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {/* Other Features */}
                    {listing.details.vehicles.keylessEntry && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.keylessEntry")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.sunroof && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.sunroof")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.spareKey && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.spareKey")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                    {listing.details.vehicles.remoteStart && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.remoteStart")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t("common.yes")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                {listing.details.vehicles.features &&
                  listing.details.vehicles.features.length > 0 && (
                    <div className=" bg-white dark:bg-gray-800 shadow-sm p-6 rounded-xl space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t("listings.features")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.details.vehicles.features.map(
                          (feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200"
                            >
                              {feature}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Real Estate Details */}
          {isRealEstate && listing?.details?.realEstate && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t("listings.propertyDetails")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("listings.propertyType")}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t(
                      `listings.propertyTypes.${listing?.details?.realEstate?.propertyType.toLowerCase()}`,
                    )}
                  </p>
                </div>
                {listing?.details?.realEstate?.size && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.size")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.size} m²
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bedrooms && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.bedrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bedrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bathrooms && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.bathrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bathrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.yearBuilt && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.yearBuilt")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.yearBuilt}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.condition && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.condition")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(
                        `listings.conditions.${listing.details.realEstate.condition?.toLowerCase() || ""}`,
                      )}
                    </p>
                  </div>
                )}
              </div>

              {listing?.details?.realEstate?.features &&
                listing?.details?.realEstate?.features?.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("listings.features")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.details.realEstate.features.map(
                        (feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200"
                          >
                            {feature}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t("listings.description")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Contact Section */}
          {!isOwner && (
            <div className="mt-6">
              {!showContactForm ? (
                <button
                  onClick={handleContactSeller}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t("listings.contactSeller")}
                </button>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("messages.enterMessage")}
                    className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                    >
                      {isSending ? t("common.sending") : t("messages.send")}
                    </button>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
