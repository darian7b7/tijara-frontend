import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { listingsAPI } from "@/api/listings.api";
import type { Listing, ListingsResponseType } from "@/types";
import ListingCard from "@/components/listings/details/ListingCard";
import { toast } from "react-toastify";

export const MyListings: React.FC = () => {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getUserListings({ page });

      if (response.data && response.success) {
        const data = response.data;
        setListings((prev) =>
          page === 1 ? data.listings : [...prev, ...data.listings],
        );
        setHasMore(data.hasMore);
        setTotal(data.total);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch listings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const handleDelete = async (listingId: string) => {
    try {
      const response = await listingsAPI.deleteListing(listingId);
      if (response.success) {
        setListings((prev) => prev.filter((listing) => listing.id !== listingId));
        setTotal((prev) => prev - 1);
        toast.success(t("listings.deleted"));
      } else {
        throw new Error(response.error || "Failed to delete listing");
      }
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete listing";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && listings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        {t("listings.no_listings")}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {t("listings.my_listings")} ({total})
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onDelete={() => handleDelete(listing.id!)}
            editable
            deletable
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("common.load_more")}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyListings;
