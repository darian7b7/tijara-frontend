import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useSavedListings } from '../../context/SavedListingsContext';

const SavedListingsButton = () => {
  const { savedCount } = useSavedListings();
  
  return (
    <Link 
      to="/saved-listings" 
      className="relative p-2 text-gray-600 hover:text-gray-800"
      title="Saved Listings"
    >
      <FaHeart className="text-xl" />
      {savedCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {savedCount}
        </span>
      )}
    </Link>
  );
};

export default SavedListingsButton;
