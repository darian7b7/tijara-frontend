import React, { useMemo } from "react";
import { clsx } from "clsx";
import type {
  Listing,
  ListingCategory,
  ListingWithRelations,
} from "@/types/shared";
import type { BaseComponentProps } from "@/types/common";
import { useListings } from "@/components/listings/hooks/useListings";
import { useAuth } from "@/context/AuthContext";
import { useSavedListings } from "@/context/SavedListingsContext";
import ListingDetails from "@/components/listings/manage/ListingDetails";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/utils/numberUtils";
import { categoryFields } from "@/components/listings/data/listingsData"; // if filtering by category

export type ListingViewType = "grid" | "list" | "card" | "saved" | "compact";

export interface ListingComponentProps extends BaseComponentProps {
  viewType?: ListingViewType;
  listings: ListingWithRelations[];
  gridColumns?: 2 | 3 | 4;
  category?: ListingCategory;
  showActions?: boolean;
  showPrice?: boolean;
  showDate?: boolean;
  showLocation?: boolean;
  onEdit?: (listing: ListingWithRelations) => void;
  onDelete?: (listingId: string) => void;
  onSave?: (listing: ListingWithRelations) => void;
  onListingClick?: (listing: ListingWithRelations) => void;
}

export const ListingComponent: React.FC<ListingComponentProps> = ({
  viewType = "grid",
  listings: propListings,
  className,
  gridColumns = 4,
  category,
  showActions = true,
  showPrice = true,
  showDate = true,
  showLocation = true,
  onEdit,
  onDelete,
  onSave,
  onListingClick,
}) => {
  const { user } = useAuth();
  const { listings: hookListings, isLoading, error } = useListings();
  const { savedListings, addToSaved, removeFromSaved, isSaved } =
    useSavedListings();

  const listings = useMemo(
    () => propListings || (viewType === "saved" ? savedListings : hookListings),
    [propListings, viewType, savedListings, hookListings],
  );

  const filteredListings = useMemo(
    () =>
      category
        ? listings.filter((listing) => listing.category === category)
        : listings,
    [category, listings],
  );

  const gridStyles = useMemo(() => {
    const baseClass = "grid gap-6";
    const columnClasses = {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    };
    return clsx(baseClass, columnClasses[gridColumns]);
  }, [gridColumns]);

  const handleSave = (listing: ListingWithRelations) => {
    const isCurrentlySaved = isSaved(listing.id);
    if (isCurrentlySaved) {
      removeFromSaved(listing.id);
    } else {
      addToSaved(listing);
    }
    onSave?.(listing);
  };

  const handleListingClick = (listing: ListingWithRelations) => {
    onListingClick?.(listing);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!filteredListings.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No listings found
      </div>
    );
  }

  const ListingCard: React.FC<{ listing: ListingWithRelations }> = ({ listing }) => (
    <div
      key={listing.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-w-16 aspect-h-9">
        <img
          src={listing.images[0] || "/placeholder.png"}
          alt={listing.title}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {listing.title}
        </h3>
        {showPrice && (
          <p className="text-xl font-bold text-blue-600 mb-2">
            ${listing.price.toLocaleString()}
          </p>
        )}
        {showLocation && (
          <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
        )}
        {showDate && (
          <p className="text-xs text-gray-500">
            {new Date(listing.createdAt).toLocaleDateString()}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex justify-end space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(listing)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(listing.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Delete
              </button>
            )}
            {onSave && (
              <button
                onClick={() => onSave(listing)}
                className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md"
              >
                Save
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return viewType === "grid" ? (
    <div className={clsx(gridStyles, className)}>
      {filteredListings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  ) : (
    <div className={clsx("space-y-4", className)}>
      {filteredListings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingComponent;
