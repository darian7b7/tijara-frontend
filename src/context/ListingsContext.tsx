import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import type { Listing } from "@/components/listings/types/listings.ts";
import { listingsAPI } from "@/components/listings/api/listings.api";

interface ListingsContextType {
  listings: Listing[];
  userListings: Listing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  fetchUserListings: () => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  refetchListings: () => Promise<void>;
}

interface ListingsProviderProps {
  children: ReactNode;
}

const ListingsContext = createContext<ListingsContextType | null>(null);

export const ListingsProvider = ({ children }: ListingsProviderProps) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listingsAPI.getAll();
      setListings(response.items || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError("Failed to fetch listings");
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserListings = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      const response = await listingsAPI.getUserListings();
      setUserListings(response.items || []);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      setError("Failed to fetch user listings");
      setUserListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await listingsAPI.deleteListing(id);
      // Update both listings and userListings
      setListings((prev) => prev.filter((listing) => listing.id !== id));
      setUserListings((prev) => prev.filter((listing) => listing.id !== id));
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw error; // Let the component handle the error
    }
  };

  const refetchListings = async () => {
    await Promise.all([
      fetchListings(),
      user?.id ? fetchUserListings() : Promise.resolve(),
    ]);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserListings();
    } else {
      setUserListings([]); // Clear user listings when logged out
    }
  }, [user]);

  return (
    <ListingsContext.Provider
      value={{
        listings,
        userListings,
        isLoading,
        error,
        fetchListings,
        fetchUserListings,
        deleteListing,
        refetchListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return context;
};
