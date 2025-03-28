import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MessagesAPI } from "@/api/messaging.api";
import { Listing, ListingCategory, VehicleDetails } from "@/types/listings";
import type { ListingMessageInput } from "@/types/messaging";
import { toast } from "react-toastify";
import { listingsAPI } from "@/api/listings.api";

interface ListingDetailsProps {
  listing: Listing;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [showContactForm, setShowContactForm] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Please login to send messages");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      const messageInput: ListingMessageInput = {
        listingId: listing.id,
        content: message.trim(),
        recipientId: listing.userId,
      };

      await MessagesAPI.sendMessage(messageInput);
      toast.success("Message sent successfully");
      setShowContactForm(false);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await listingsAPI.deleteListing(listing.id);
      toast.success("Listing deleted successfully");
      navigate("/listings");
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  if (!listing) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const isVehicle = listing.category.mainCategory === ListingCategory.VEHICLES;
  const vehicleDetails = isVehicle
    ? (listing.details?.vehicles as VehicleDetails)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {listing.title}
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                ${listing.price.toLocaleString()}
              </p>
            </div>
            {user && user.id === listing.userId && (
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(`/listings/${id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{listing.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Location</h2>
                <div>
                  {listing.location.address}, {listing.location.city}
                </div>
              </div>

              {isVehicle && vehicleDetails && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Vehicle Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Basic Info
                      </h3>
                      <dl className="mt-2 space-y-2">
                        <div>
                          <dt className="text-gray-500">Make</dt>
                          <dd className="font-medium">{vehicleDetails.make}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Model</dt>
                          <dd className="font-medium">
                            {vehicleDetails.model}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Year</dt>
                          <dd className="font-medium">{vehicleDetails.year}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Mileage</dt>
                          <dd className="font-medium">
                            {vehicleDetails.mileage} km
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Specifications
                      </h3>
                      <dl className="mt-2 space-y-2">
                        <div>
                          <dt className="text-gray-500">Fuel Type</dt>
                          <dd className="font-medium">
                            {vehicleDetails.fuelType}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Transmission</dt>
                          <dd className="font-medium">
                            {vehicleDetails.transmissionType}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Condition</dt>
                          <dd className="font-medium">
                            {vehicleDetails.condition}
                          </dd>
                        </div>
                        {vehicleDetails.color && (
                          <div>
                            <dt className="text-gray-500">Color</dt>
                            <dd className="font-medium">
                              {vehicleDetails.color}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    {vehicleDetails.features &&
                      vehicleDetails.features.length > 0 && (
                        <div className="col-span-2">
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Features
                          </h3>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {vehicleDetails.features.map(
                              (feature: string, index: number) => (
                                <li key={index}>{feature}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {!user || user.id !== listing.userId ? (
                <div className="mt-8">
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Contact Seller
                  </button>

                  {showContactForm && (
                    <div className="mt-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isSending}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
                      >
                        {isSending ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4">
                {listing.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
