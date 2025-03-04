import React, { useEffect, useState } from 'react';
import { FaCar, FaHome } from 'react-icons/fa';

const CategorySwitcher = ({ selectedCategory, onCategoryChange }) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ${
        isSticky
          ? 'fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md'
          : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onCategoryChange('real-estate')}
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
            onClick={() => onCategoryChange('vehicles')}
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
    </div>
  );
};

export default CategorySwitcher; 
