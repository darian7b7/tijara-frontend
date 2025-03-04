import React from 'react';
import { FaCar, FaHome } from 'react-icons/fa';

const CategoryToggle = ({ selectedCategory, onToggle }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 inline-flex">
        <button
          onClick={() => onToggle('real-estate')}
          className={`flex items-center px-6 py-3 rounded-lg transition-all ${
            selectedCategory === 'real-estate'
              ? 'bg-green-500 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaHome className="mr-2" />
          <span className="font-medium">Real Estate</span>
        </button>
        <button
          onClick={() => onToggle('vehicles')}
          className={`flex items-center px-6 py-3 rounded-lg transition-all ${
            selectedCategory === 'vehicles'
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaCar className="mr-2" />
          <span className="font-medium">Vehicles</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryToggle; 
