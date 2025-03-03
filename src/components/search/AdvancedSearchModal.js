import React, { useState } from 'react';

const AdvancedSearchModal = ({ category, onClose }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    priceRange: '',
    color: '',
    fuelType: '',
    transmission: '',
    yearMin: '',
    yearMax: '',
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    console.log("Applying Advanced Filters:", filters);
    onClose(); // Close modal after search
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">
          {category === 'vehicles' ? "Advanced Vehicle Search" : "Advanced Real Estate Search"}
        </h2>

        {/* Keyword Search */}
        <input
          type="text"
          placeholder="Search by keyword..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3"
        />

        {/* Price Range */}
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.priceRange.min || ''}
            onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
            className="w-1/2 px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.priceRange.max || ''}
            onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
            className="w-1/2 px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Category-Specific Filters */}
        {category === 'vehicles' && (
          <>
            <select
              value={filters.color || ''}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-3"
            >
              <option value="">Select Color</option>
              {["White", "Black", "Silver", "Red", "Blue", "Green"].map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>

            <select
              value={filters.fuelType || ''}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-3"
            >
              <option value="">Select Fuel Type</option>
              {["Petrol", "Diesel", "Electric", "Hybrid"].map((fuel) => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>

            <select
              value={filters.transmission || ''}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-3"
            >
              <option value="">Select Transmission</option>
              {["Automatic", "Manual", "CVT"].map((trans) => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </select>
          </>
        )}

        {category === 'real-estate' && (
          <>
            <select
              value={filters.yearMin || ''}
              onChange={(e) => handleFilterChange('yearMin', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-3"
            >
              <option value="">Select Min Year</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.yearMax || ''}
              onChange={(e) => handleFilterChange('yearMax', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-3"
            >
              <option value="">Select Max Year</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </>
        )}

        {/* Search & Close Buttons */}
        <div className="flex justify-between mt-4">
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded-lg" 
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg" 
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
