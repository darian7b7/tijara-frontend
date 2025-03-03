import React, { useEffect, useState } from 'react';
import { useSavedListings } from '../../context/SavedListingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const SavedListings = () => {
  const { savedListings, removeSavedListing } = useSavedListings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Array.isArray(savedListings)) {
      setLoading(false);
    }
  }, [savedListings]);

  console.log("Saved Listings:", savedListings); // Debugging

  if (loading) {
    return (
      <LoadingContainer>
        <p>Loading saved listings...</p>
      </LoadingContainer>
    );
  }

  if (!Array.isArray(savedListings)) {
    return (
      <ErrorContainer>
        <p>Error: Unable to load saved listings.</p>
      </ErrorContainer>
    );
  }

  return (
    <SavedListingsContainer>
      <h1>Saved Listings</h1>
      {savedListings.length === 0 ? (
        <EmptyState>
          <p>You haven't saved any listings yet.</p>
          <Link to="/">Browse Listings</Link>
        </EmptyState>
      ) : (
        <ListingsGrid>
          <AnimatePresence>
            {savedListings.map((listing) => (
              <motion.div
                key={listing._id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <ListingCard>
                  <Link to={`/listings/${listing._id}`}>
                    <ListingImage
                      src={listing.images?.[0] || '/placeholder.jpg'}
                      alt={listing.title || 'No Title'}
                    />
                    <ListingInfo>
                      <h3>{listing.title || 'Untitled Listing'}</h3>
                      <p>${listing.price?.toLocaleString() || 'N/A'}</p>
                    </ListingInfo>
                  </Link>
                  <RemoveButton
                    onClick={() => removeSavedListing(listing._id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTrash />
                  </RemoveButton>
                </ListingCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </ListingsGrid>
      )}
    </SavedListingsContainer>
  );
};

// Styled Components
const SavedListingsContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  h1 {
    margin-bottom: 2rem;
    color: #333;
  }
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const ListingCard = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
  }
  a {
    text-decoration: none;
    color: inherit;
  }
`;

const ListingImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ListingInfo = styled.div`
  padding: 1rem;
  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }
  p {
    margin: 0.5rem 0 0;
    color: #666;
  }
`;

const RemoveButton = styled(motion.button)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff4444;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  p {
    color: #666;
    margin-bottom: 1rem;
  }
  a {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.2s;
    &:hover {
      background: #0056b3;
    }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: red;
`;

export default SavedListings;
