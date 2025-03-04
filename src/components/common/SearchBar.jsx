import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const SearchBar = ({ category }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (location) params.append('location', location);
    params.append('category', category);
    
    navigate(`/search?${params.toString()}`);
  };

  const placeholder = category === 'vehicles' 
    ? 'Search cars, motorcycles, boats...'
    : 'Search apartments, houses, land...';

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
      <div className="flex-1 relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 focus:ring-0 text-gray-700"
        />
      </div>
      <div className="relative md:w-64">
        <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 focus:ring-0 text-gray-700"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar; 
