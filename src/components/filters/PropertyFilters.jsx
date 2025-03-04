import React from "react";
import useFilters from "@/hooks/useFilters";

const PropertyFilters = ({ onSearch }) => {
    const { filters, updateFilter, resetFilters } = useFilters("property");

    return (
        <div>
            <h3>Property Filters</h3>

            {/* Search */}
            <input
                type="text"
                placeholder="Search properties..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
            />

            {/* Property Type */}
            <select onChange={(e) => updateFilter("propertyType", e.target.value)} value={filters.propertyType}>
                <option value="">All Types</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
            </select>

            {/* Reset Filters */}
            <button onClick={resetFilters}>Reset</button>
        </div>
    );
};

export default PropertyFilters;
