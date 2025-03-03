import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

const ListingCard = ({ listing }) => {
  const {
    _id,
    title,
    price,
    images,
    createdAt,
    seller,
    mainCategory,
    details,
    location
  } = listing;

  const renderDetails = () => {
    if (mainCategory === 'vehicles') {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>{details.make} {details.model} ({details.year})</p>
          <p>{details.mileage?.toLocaleString()} km • {details.fuelType}</p>
        </div>
      );
    } else if (mainCategory === 'real-estate') {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>{details.propertyType} • {details.size}m²</p>
          <p>{details.bedrooms} beds • {details.bathrooms} baths</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <Link to={`/listings/${_id}`}>
        <div className="relative aspect-w-4 aspect-h-3">
          <img
            src={images[0]}
            alt={title}
            className="object-cover w-full h-48"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/listings/${_id}`}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 hover:text-blue-500">
            {title}
          </h3>
        </Link>

        {renderDetails()}

        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="text-xl font-bold text-blue-500">
              ${price.toLocaleString()}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{location}</p>
          </div>
          <div className="flex items-center space-x-2">
            <img
              src={seller.profilePicture}
              alt={seller.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {seller.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;