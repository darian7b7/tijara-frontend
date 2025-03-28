import React, { createContext, useContext, useState, useCallback } from "react";
import { listingsAPI } from "@/api/listings.api";
import type { Listing, ListingParams, PaginatedData } from "@/types";

interface ListingsContextType {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  hasMore: boolean;
  fetchListings: (params?: ListingParams) => Promise<void>;
  clearListings: () => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(
  undefined,
);

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchListings = useCallback(async (params?: ListingParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsAPI.getAll(params);

      if (params?.page === 1) {
        setListings(response.items);
      } else {
        setListings((prev) => [...prev, ...response.items]);
      }

      setTotalItems(response.total);
      setCurrentPage(params?.page || 1);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearListings = useCallback(() => {
    setListings([]);
    setTotalItems(0);
    setCurrentPage(1);
    setHasMore(false);
    setError(null);
  }, []);

  return (
    <ListingsContext.Provider
      value={{
        listings,
        loading,
        error,
        totalItems,
        currentPage,
        hasMore,
        fetchListings,
        clearListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (context === undefined) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return context;
}
