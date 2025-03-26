import { useState, useEffect } from 'react';
import { Listing } from '@/types/listings';
import { listingsAPI } from '@/api/listings.api';

interface SavedListingsResponse {
  success: boolean;
  data: {
    items: Listing[];
    total: number;
    page: number;
    limit: number;
  };
  status: number;
}

export function useSavedListings() {
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedListings = async () => {
      try {
        setIsLoading(true);
        const response = await listingsAPI.getSavedListings() as SavedListingsResponse;
        if (response.data?.items) {
          setSavedListings(response.data.items);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch saved listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedListings();
  }, []);

  return { savedListings, isLoading, error };
}
