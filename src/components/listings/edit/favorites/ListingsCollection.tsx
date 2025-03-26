import React, { useEffect, useState } from "react";
import { useFavorites } from "@/hooks";
import { useSavedListings } from "@/context/SavedListingsContext";
import ListingCard from "@/components/listings/details/ListingCard";
import type { Listing } from "@/types";
import { listingsAPI } from "@/components/listings/api/listings.api";

interface ListingsCollectionProps {
  type: "favorites" | "saved";
}

const ListingsCollection: React.FC<ListingsCollectionProps> = ({ type }) => {
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { savedListings } = useSavedListings();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (type === "favorites" && !favorites.length) {
        setListings([]);
        setLoadingListings(false);
        return;
      }

      if (type === "saved" && !savedListings.length) {
        setListings([]);
        setLoadingListings(false);
        return;
      }

      try {
        const response =
          type === "favorites"
            ? await listingsAPI.getListingsByIds(favorites)
            : { success: true, data: savedListings };

        if (response.success && response.data) {
          setListings(response.data);
        }
      } catch (error) {
        console.error(`Error fetching ${type} listings:`, error);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, [favorites, savedListings, type]);

  if (favoritesLoading || loadingListings) {
    return <div className="text-center py-4">Loading {type} listings...</div>;
  }

  if (!listings.length) {
    return (
      <div className="text-center py-4 text-gray-600">
        {type === "favorites"
          ? "You haven't saved any listings to your favorites yet."
          : "No saved listings found."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing._id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingsCollection;
