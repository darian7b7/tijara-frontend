import { useState, useEffect } from "react";
import { listingsAPI } from "@/components/listings/api/listings.api";
import type {
  Listing,
  ListingParams,
} from "@/components/listings/types/listings.ts";
import { toast } from "@/components/ui/toast";

interface UseListingsResult {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshListings: () => Promise<void>;
  saveListing: (listingId: string) => Promise<void>;
  unsaveListing: (listingId: string) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
}

interface ExtendedListingParams extends ListingParams {
  initialLimit?: number;
}

export function useListings(params?: ExtendedListingParams): UseListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchListings = async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsAPI.getAll({
        ...params,
        page: pageNum,
        limit: params?.initialLimit || params?.limit || 10,
      });

      if (!response.items) {
        throw new Error("No listings data received");
      }

      setListings((prev) =>
        append ? [...prev, ...response.items] : response.items,
      );
      setHasMore(response.hasMore);
      setPage(response.page);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch listings";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    await fetchListings(page + 1, true);
  };

  const refresh = async () => {
    await fetchListings(1, false);
  };

  // Alias for refresh to maintain compatibility
  const refreshListings = refresh;

  const saveListing = async (listingId: string) => {
    try {
      await listingsAPI.saveListing(listingId);
      toast({
        description: "Listing saved successfully",
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save listing";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const unsaveListing = async (listingId: string) => {
    try {
      await listingsAPI.unsaveListing(listingId);
      toast({
        description: "Listing removed from saved",
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove listing";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      await listingsAPI.deleteListing(listingId);
      setListings((prev) =>
        prev.filter((listing) => listing._id !== listingId),
      );
      toast({
        description: "Listing deleted successfully",
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete listing";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    refresh();
  }, [JSON.stringify(params)]);

  return {
    listings,
    loading,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    refreshListings,
    saveListing,
    unsaveListing,
    deleteListing,
  };
}
