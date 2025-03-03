import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../config/axios.config';

const SavedListingsContext = createContext();

export const useSavedListings = () => useContext(SavedListingsContext);

export const SavedListingsProvider = ({ children }) => {
  const [savedListings, setSavedListings] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSavedListings();
    } else {
      setSavedListings([]);
    }
  }, [user]);

  const fetchSavedListings = async () => {
    try {
      const response = await api.get('/api/listings/saved');  
      console.log("Fetched Saved Listings:", response.data);
      setSavedListings(Array.isArray(response.data) ? response.data : response.data.listings || []);
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    }
  };
  
  const toggleSaved = async (listingId) => {
    try {
      const response = await api.post(`/api/listings/${listingId}/toggle-save`);  
      const data = response.data;
      
      if (data.saved) {
        setSavedListings(prev => [...prev, data.listing]);
      } else {
        setSavedListings(prev => prev.filter(listing => listing._id !== listingId));
      }
      
      return data.saved;
    } catch (error) {
      console.error('Error toggling saved listing:', error);
      return false;
    }
  };

  const removeSavedListing = async (listingId) => {
    try {
      const response = await api.post(`/api/listings/${listingId}/toggle-save`);  
      
      if (response.status === 200) {
        setSavedListings(prev => prev.filter(listing => listing._id !== listingId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing saved listing:', error);
      return false;
    }
  };

  const value = {
    savedListings,
    savedCount: savedListings.length,
    toggleSaved,
    removeSavedListing
  };

  return (
    <SavedListingsContext.Provider value={value}>
      {children}
    </SavedListingsContext.Provider>
  );
};
