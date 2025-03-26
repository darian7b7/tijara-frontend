import React, { useState, useCallback, useEffect } from "react";
import { FavoritesContext } from "./FavoritesContext";
import { useAuth } from "../contexts/AuthContext";
import { listingsApi } from "../services/listingsApi";

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await listingsApi.getFavorites();
      setFavorites(response.favorites);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      // Set empty favorites but don't break the app
      setFavorites([]);
      setError("Failed to load favorites. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = useCallback(
    async (itemId: string, itemType: Favorite["itemType"]) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        const response = await listingsApi.addFavorite({ itemId, itemType });
        setFavorites((prev) => [...prev, response.favorite]);
        return true;
      } catch (err) {
        console.error("Error adding favorite:", err);
        setError("Failed to add to favorites. Please try again.");
        return false;
      }
    },
    [isAuthenticated],
  );

  const removeFavorite = useCallback(
    async (itemId: string) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await listingsApi.removeFavorite(itemId);
        setFavorites((prev) => prev.filter((fav) => fav.itemId !== itemId));
        return true;
      } catch (err) {
        console.error("Error removing favorite:", err);
        setError("Failed to remove from favorites. Please try again.");
        return false;
      }
    },
    [isAuthenticated],
  );

  const checkIsFavorite = useCallback(
    (itemId: string) => {
      return favorites.some((fav) => fav.itemId === itemId);
    },
    [favorites],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        addFavorite,
        removeFavorite,
        checkIsFavorite,
        refresh: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
