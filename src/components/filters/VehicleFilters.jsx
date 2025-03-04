import React from "react";
import useFilters from "@/hooks/useFilters";

const VehicleFilters = ({ onChange }) => {
    const { filters, updateFilter, resetFilters } = useFilters("vehicle");

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vehicle Filters</h3>

            {/* Make */}
            <select onChange={(e) => updateFilter("make", e.target.value)} value={filters.make}>
                <option value="">All Makes</option>
                <option value="Toyota">Toyota</option>
                <option value="BMW">BMW</option>
            </select>

            {/* Model */}
            <select onChange={(e) => updateFilter("model", e.target.value)} value={filters.model}>
                <option value="">All Models</option>
                <option value="Corolla">Corolla</option>
                <option value="Camry">Camry</option>
            </select>

            {/* Reset Filters */}
            <button onClick={resetFilters}>Reset</button>
        </div>
    );
};

export default VehicleFilters;
