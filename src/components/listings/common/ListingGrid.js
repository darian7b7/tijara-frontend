import React from 'react';
import ListingCard from './ListingCard';

const ListingGrid = ({ listings, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg h-72 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-600 dark:text-gray-400">
          No listings found
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing._id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingGrid; 