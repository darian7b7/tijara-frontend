import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { APIResponse } from "@/types";
import { favoritesAPI } from "@/api/listings.api";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

export interface FavoritesContextType {
  favorites: string[];
  isLoading: boolean;
  addFavorite: (itemId: string) => Promise<APIResponse<void>>;
  removeFavorite: (itemId: string) => Promise<APIResponse<void>>;
  isFavorite: (itemId: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | null>(
  null,
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await favoritesAPI.getFavorites();
      if (response.success && response.data) {
        setFavorites(response.data.items.map((fav) => fav.itemId));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const retryRequest = async (fn: () => Promise<any>, retries: number = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
      }
    }
  };

  const addFavorite = useCallback(
    async (itemId: string): Promise<APIResponse<void>> => {
      if (!user) {
        toast.error("Please log in to add favorites");
        return {
          success: false,
          error: "Authentication required",
          status: 401,
          data: undefined,
        };
      }

      try {
        const response = await retryRequest(() =>
          favoritesAPI.addToFavorites(itemId),
        );
        if (response.success) {
          setFavorites((prev) => [...prev, itemId]);
          toast.success("Added to favorites");
        }
        return response;
      } catch (error: any) {
        const errorMessage = error.error || "Failed to add favorite";
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          status: error.status || 500,
          data: undefined,
        };
      }
    },
    [user],
  );

  const removeFavorite = useCallback(
    async (itemId: string): Promise<APIResponse<void>> => {
      if (!user) {
        toast.error("Please log in to manage favorites");
        return {
          success: false,
          error: "Authentication required",
          status: 401,
          data: undefined,
        };
      }

      try {
        const response = await retryRequest(() =>
          favoritesAPI.removeFromFavorites(itemId),
        );
        if (response.success) {
          setFavorites((prev) => prev.filter((id) => id !== itemId));
          toast.success("Removed from favorites");
        }
        return response;
      } catch (error: any) {
        const errorMessage = error.error || "Failed to remove favorite";
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          status: error.status || 500,
          data: undefined,
        };
      }
    },
    [user],
  );

  const isFavorite = useCallback(
    (itemId: string): boolean => {
      return favorites.includes(itemId);
    },
    [favorites],
  );

  const value = {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
