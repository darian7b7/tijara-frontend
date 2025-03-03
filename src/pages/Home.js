import React, { useState, useEffect } from 'react'; 
import { FaCar, FaHome, FaArrowRight } from 'react-icons/fa';
import ListingCard from '../components/listings/common/ListingCard';
import SearchBar from '../components/common/SearchBar';
import api from "../config/axios.config";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  // Persist category selection
  const [selectedCategory, setSelectedCategory] = useState(
    localStorage.getItem('selectedCategory') || 'vehicles'
  );
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingListings, setTrendingListings] = useState([]);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sorting & Basic Filters
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsTransitioning(true);
      setError(null);
      setLoading(true);
      
      try {
        // Fetch listings based on category and sorting
        const listingsResponse = await api.get('/api/listings', {
          params: {
            mainCategory: selectedCategory,
            limit: 8,
            sort: sortBy
          }
        });
    
        console.log("Listings API Response:", listingsResponse.data); // Debugging
    
        // Check if listings exist before applying filters
        const fetchedListings = listingsResponse.data?.listings || []; // Ensure it's an array
    
        const filteredListings = fetchedListings.filter(
          listing => listing.mainCategory === selectedCategory
        );
    
        // Apply price filter
        const finalListings = maxPrice
          ? filteredListings.filter(listing => listing.price <= maxPrice)
          : filteredListings;
    
        setListings(finalListings);
    
        // Fetch trending listings
        const trendingResponse = await api.get('/api/listings/trending', {
          params: {
            mainCategory: selectedCategory,
            sort: 'trending',
            limit: 4
          }
        });
    
        console.log("Trending API Response:", trendingResponse.data); // Debugging
    
        const fetchedTrending = trendingResponse.data?.listings || [];
        setTrendingListings(fetchedTrending);
    
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    };
    

    fetchData();
  }, [selectedCategory, sortBy, maxPrice]);

  useEffect(() => {
    const fetchTrendingListings = async () => {
      try {
        const response = await api.get('/api/listings/trending');
        setTrendingListings(response.data);
      } catch (error) {
        console.error('Error fetching trending listings:', error);
      }
    };
    fetchTrendingListings();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    localStorage.setItem('selectedCategory', category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              {t('find_perfect')} {selectedCategory === 'vehicles' ? t('vehicle') : t('property')}
            </h1>
            <p className="text-blue-100 text-xl mb-8">
              {selectedCategory === 'vehicles' 
                ? t('discover_vehicle')
                : t('discover_property')}
            </p>
            
            {/* Category Toggle */}
            <div className="inline-flex rounded-lg bg-blue-700/30 p-1 backdrop-blur-sm mb-8">
              <button
                onClick={() => handleCategoryChange('vehicles')}
                className={`flex items-center px-6 py-3 rounded-md transition-all duration-300 ${
                  selectedCategory === 'vehicles'
                    ? 'bg-white text-blue-700'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FaCar className="mr-2" />
                {t('vehicles')}
              </button>
              <button
                onClick={() => handleCategoryChange('real-estate')}
                className={`flex items-center px-6 py-3 rounded-md transition-all duration-300 ${
                  selectedCategory === 'real-estate'
                    ? 'bg-white text-blue-700'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FaHome className="mr-2" />
                {t('real_estate')}
              </button>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <SearchBar category={selectedCategory} />
            </div>
          </div>
        </div>
      </div>

      {/* Basic Filters & Sorting */}
      <div className="max-w-7xl mx-auto px-4 py-6 bg-white shadow-md rounded-lg flex flex-wrap items-center justify-between">
        {/* Sort by Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="font-medium">{t('sort_by')}:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="newest">{t('newest')}</option>
            <option value="lowest-price">{t('price_low_to_high')}</option>
            <option value="highest-price">{t('price_high_to_low')}</option>
          </select>
        </div>

        {/* Max Price Filter */}
        <div className="flex items-center space-x-3">
          <label className="font-medium">{t('max_price')}:</label>
          <input
            type="number"
            placeholder={t('enter_max_price')}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-2 border rounded-lg w-32"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4 mt-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {t('error_loading_listings')}: {error}
          </div>
        </div>
      )}

      {/* Featured Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCategory === 'vehicles' ? t('featured_vehicles') : t('featured_properties')}
          </h2>
          <a href="/listings" className="flex items-center text-blue-600 hover:text-blue-700">
            {t('view_all')} <FaArrowRight className="ml-2" />
          </a>
        </div>
        
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-72 shadow-sm" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {listings.map(listing => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No {selectedCategory === 'vehicles' ? t('vehicles') : t('properties')} found
            </div>
          )}
        </div>
      </div>

      {/* Trending Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('trending_listings')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
