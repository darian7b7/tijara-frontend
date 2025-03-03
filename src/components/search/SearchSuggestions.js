import React from 'react';
import { FaSearch, FaHistory } from 'react-icons/fa';

const SearchSuggestions = ({ suggestions, recentSearches, onSelect }) => {
  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 mt-1 rounded-lg shadow-lg border z-50">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="p-2 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
          {recentSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => onSelect(search)}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FaHistory className="text-gray-400 mr-2" />
              <span>{search}</span>
            </button>
          ))}
        </div>
      )}

      {/* Auto Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Suggestions</h3>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FaSearch className="text-gray-400 mr-2" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions; 