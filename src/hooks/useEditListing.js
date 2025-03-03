import { useState, useEffect } from "react";
import api from "../config/axios.config";

const useEditListing = (listingId) => {
    const [listingData, setListingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (listingId) {
            fetchListingDetails();
        }
    }, [listingId]);

    const fetchListingDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/listings/${listingId}`);
            setListingData(response.data);
        } catch (error) {
            console.error("Error fetching listing details:", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const updateListing = async (updatedData) => {
        try {
            setLoading(true);
            const response = await axios.put(`/listings/${listingId}`, updatedData);
            setListingData(response.data);
        } catch (error) {
            console.error("Error updating listing:", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        listingData,
        updateListing,
        loading,
        error,
    };
};

export default useEditListing;
