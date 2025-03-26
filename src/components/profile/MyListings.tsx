import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { listingsAPI } from "@/components/listings/api/listings.api";
import type { Listing } from "@/types";
import ListingCard from "@/components/listings/details/ListingCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-toastify";

export const MyListings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const fetchListings = async (page = 1) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await listingsAPI.getUserListings({
        limit: 12,
        page,
      });

      if (page === 1) {
        setListings(response.items || []);
      } else {
        setListings((prev) => [...prev, ...(response.items || [])]);
      }

      setHasMore(response.hasMore || false);
      setTotalItems(response.totalItems || 0);
      setCurrentPage(page);
      setError(null);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError(t("profile.fetch_error"));
      toast.error(t("profile.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchListings(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchListings(1);
  }, [user]);

  const handleEditListing = (listing: Listing) => {
    window.location.href = `/listings/${listing.id}/edit`;
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm(t("profile.confirm_delete"))) {
      return;
    }

    try {
      await listingsAPI.deleteListing(listingId);
      toast.success(t("profile.listing_deleted"));
      fetchListings(1); // Refresh the listings
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error(t("profile.delete_error"));
    }
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("profile.my_listings")} ({totalItems})
        </h3>
      </div>

      {error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {t("profile.no_listings")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showActions={true}
                onEdit={handleEditListing}
                onDelete={handleDeleteListing}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? t("profile.loading_more") : t("profile.load_more")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
