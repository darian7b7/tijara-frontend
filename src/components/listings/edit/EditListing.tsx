import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Listing, Location, ListingUpdateInput } from "@/types/listings";
import { ListingStatus } from "@/types/enums";
import { listingsAPI } from "@/api/listings.api";
import FormField from "@/components/listings/create/common/FormField";
import { Button } from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import ListingCard from "@/components/listings/details/ListingCard";
import { useAuth } from "@/contexts/AuthContext";

interface EditFormData {
  title: string;
  description: string;
  price: number;
  location: Location;
  details?: {
    vehicles?: Record<string, any>;
    realEstate?: Record<string, any>;
  };
}

const EditListing: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    title: "",
    description: "",
    price: 0,
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    details: {
      vehicles: {},
      realEstate: {},
    },
  });

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
            setListing(response.data);
            // Parse the location string into components
            const locationParts = response.data.location.split(", ");
            const [city = "", state = "", country = ""] = locationParts;
            
            setFormData({
              title: response.data.title,
              description: response.data.description,
              price: response.data.price,
              location: {
                address: response.data.location,
                city,
                state,
                country,
                postalCode: "",
              },
              details: response.data.details,
            });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !listing) return;

    try {
      setSaving(true);
      const updateData: ListingUpdateInput = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: listing.category,
        location: formData.location.city,
        details: formData.details,
        status: listing.status,
      };

      const formDataObj = new FormData();
      
      if (listing.images) {
        formDataObj.append('existingImages', JSON.stringify(listing.images));
      }

      Object.entries(updateData).forEach(([key, value]) => {
        formDataObj.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });

      const response = await listingsAPI.updateListing(id, formDataObj);
      if (response.success) {
        toast.success(t("listings.updateSuccess"));
        navigate("/profile/listings");
      } else {
        const errorMessage = response.error || t("listings.updateFailed");
        console.error("Update failed:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error updating listing:", error);
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.error 
        || error.message 
        || t("listings.updateFailed");
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await listingsAPI.deleteListing(id);
      if (response.success) {
        toast.success(t("listings.deleteSuccess"));
        navigate("/profile/listings");
      } else {
        toast.error(t("listings.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error(t("listings.deleteFailed"));
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">{t("listings.notFound")}</h2>
      </div>
    );
  }

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
            onDelete={handleDelete}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <FormField
              label={t("listings.title")}
              name="title"
              type="text"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value as string })}
              required
            />

            <FormField
              label={t("listings.description")}
              name="description"
              type="textarea"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value as string })}
              required
            />

            <FormField
              label={t("listings.price")}
              name="price"
              type="number"
              value={formData.price.toString()}
              onChange={(value) => setFormData({
                ...formData,
                price: parseFloat(value as string) || 0,
              })}
              required
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("listings.location")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t("listings.city")}
                  name="city"
                  type="text"
                  value={formData.location.city}
                  onChange={(value) => setFormData({
                    ...formData,
                    location: { ...formData.location, city: value as string },
                  })}
                  required
                />

                <FormField
                  label={t("listings.state")}
                  name="state"
                  type="text"
                  value={formData.location.state}
                  onChange={(value) => setFormData({
                    ...formData,
                    location: { ...formData.location, state: value as string },
                  })}
                  required
                />

                <FormField
                  label={t("listings.country")}
                  name="country"
                  type="text"
                  value={formData.location.country}
                  onChange={(value) => setFormData({
                    ...formData,
                    location: { ...formData.location, country: value as string },
                  })}
                  required
                />
              </div>
            </div>
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
