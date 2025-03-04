import { useState, useEffect } from "react";
import api from "../config/axios.config";

const useFilters = (category) => {
    const [filters, setFilters] = useState({
        searchTerm: "",
        minPrice: "",
        maxPrice: "",
        propertyType: "",
        bedrooms: "",
        minArea: "",
        maxArea: "",
        status: "",
        features: [],
        make: "",
        model: "",
        yearMin: "",
        yearMax: "",
        condition: "",
        transmission: ""
    });

    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (category) {
            fetchFiltersData(category);
        }
    }, [category]);

    const fetchFiltersData = async (category) => {
        try {
            setLoading(true);
            const response = await api.get(`/filters?category=${category}`);
            setFilteredResults(response.data);
        } catch (error) {
            console.error("Error fetching filters:", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: "",
            minPrice: "",
            maxPrice: "",
            propertyType: "",
            bedrooms: "",
            minArea: "",
            maxArea: "",
            status: "",
            features: [],
            make: "",
            model: "",
            yearMin: "",
            yearMax: "",
            condition: "",
            transmission: ""
        });
    };

    return {
        filters,
        updateFilter,
        resetFilters,
        filteredResults,
        loading,
        error
    };
};

export default useFilters;
