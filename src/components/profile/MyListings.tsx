import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ListingResponse, Listing } from "@/types/listings";
import apiClient from "@/api/apiClient";
import ListingCard from "@/components/listings/details/ListingCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ListingsResponse } from "@/types";

const MyListings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchListings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await apiClient.get<ListingsResponse>('/listings/my', {
        params: {
          page,
          limit
        }
      });
      
      if (page === 1) {
        setListings(response.data.listings);
      } else {
        setListings(prev => [...prev, ...response.data.listings]);
      }
      setHasMore(response.data.listings.length === limit);
      setError(null);
    } catch (err) {
      setError(t('errors.failedToFetchListings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, user]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  };

  const handleEditListing = (listing: Listing) => {
    window.location.href = `/listings/${listing.id}/edit`;
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm(t("profile.confirm_delete"))) {
      return;
    }

    try {
      await apiClient.delete(`/listings/${listingId}`);
      toast.success(t("profile.listing_deleted"));
      fetchListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error(t("profile.delete_error"));
    }
  };

  if (loading && page === 1) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('profile.myListings')} ({listings.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      {loading && <div className="text-center">{t('common.loading')}</div>}
      {!loading && hasMore && (
        <button
          onClick={loadMore}
          className="w-full py-2 text-center text-blue-600 hover:text-blue-800"
        >
          {t('common.loadMore')}
        </button>
      )}
      {!loading && !hasMore && listings.length === 0 && (
        <div className="text-center text-gray-500">
          {t('profile.noListings')}
        </div>
      )}
    </div>
  );
};

export default MyListings;
