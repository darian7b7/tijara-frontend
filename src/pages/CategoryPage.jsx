import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { categories } from '@/components/listings/data/categories';
import ListingGrid from '@/components/listings/common/ListingGrid';
import VehicleFilters from '@/components/filters/VehicleFilters';
import PropertyFilters from '@/components/filters/PropertyFilters';
import api from '@/config/axios.config';

const CategoryPage = () => {
  const { t, i18n } = useTranslation();
  const { categoryId } = useParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    // ... other filter states based on category
  });

  const category = categories[categoryId];

  const handleSearch = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/listings/${categoryId}?${queryParams}`);
      setListings(response.data);
    } catch (err) {
      setError(t('error_loading_listings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [categoryId]);

  const renderFilters = () => {
    switch (categoryId) {
      case 'vehicles':
        return (
          <VehicleFilters
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            isRTL={isRTL}
          />
        );
      case 'real-estate':
        return (
          <PropertyFilters
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            isRTL={isRTL}
          />
        );
      default:
        return null;
    }
  };

  const isRTL = i18n.language === 'ar';

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">{t('category_not_found')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-xl p-8 mb-8">
        <div className={`flex items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className={`text-3xl ${category.iconColor}`}>{category.icon}</span>
          <h1 className={`text-3xl md:text-4xl font-bold text-white ${isRTL ? 'mr-4' : 'ml-4'}`}>
            {t(category.labelKey)}
          </h1>
        </div>
        <p className={`text-blue-100 text-lg ${isRTL ? 'text-right' : 'text-left'}`}>
          {t(category.descriptionKey)}
        </p>
      </div>

      {renderFilters()}

      {error ? (
        <div className="text-center py-12">
          <h3 className="text-xl text-red-600">{error}</h3>
        </div>
      ) : (
        <ListingGrid listings={listings} loading={loading} isRTL={isRTL} />
      )}
    </div>
  );
};

export default CategoryPage;
