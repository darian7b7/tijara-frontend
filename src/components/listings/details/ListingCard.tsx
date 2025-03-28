import React from "react";
import { Link } from "react-router-dom";
import type { Listing, Location } from "@/types/listings";
import { formatPrice, formatDate } from "@/utils/format";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedListings } from "@/context/SavedListingsContext";

interface ListingCardProps {
  listing: Listing;
  showFavoriteButton?: boolean;
  showSaveButton?: boolean;
  showActions?: boolean;
  onEdit?: (listing: Listing) => void;
  onDelete?: (listingId: string) => void | Promise<void>;
}

interface FavoritesHook {
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

interface SavedListingsHook {
  savedListings: string[];
  toggleSaved: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  showFavoriteButton = true,
  showSaveButton = true,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const { favorites, toggleFavorite } =
    useFavorites() as unknown as FavoritesHook;
  const { savedListings, toggleSaved } =
    useSavedListings() as unknown as SavedListingsHook;

  const isFavorite = favorites.includes(listing.id);
  const isSaved = savedListings.includes(listing.id);
  const location = listing.location as Location;

  const mainImage =
    listing.images && listing.images.length > 0 ? listing.images[0] : undefined;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="relative h-48">
          {mainImage ? (
            <img
              src={mainImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          {showFavoriteButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(listing.id);
              }}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-500" />
              )}
            </button>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
          <p className="text-gray-600 mb-2">{formatPrice(listing.price)}</p>
          <p className="text-sm text-gray-500">
            {location.city}, {location.country}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Listed on {formatDate(new Date(listing.createdAt))}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4 space-y-2">
        {showSaveButton && (
          <button
            onClick={() => toggleSaved(listing.id)}
            className={`w-full py-2 px-4 rounded ${
              isSaved
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            } hover:bg-opacity-80 transition-colors`}
          >
            {isSaved ? "Saved" : "Save for Later"}
          </button>
        )}
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(listing)}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(listing.id)}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
