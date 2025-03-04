import React, { useEffect } from "react";
import VehicleDetails from "./vehicles/VehicleDetails";
import MotorcycleDetails from "./vehicles/MotorcycleDetails";
import RealEstateDetails from "./realestate/RealEstateDetails";
import LandDetails from "./realestate/LandDetails";

const AdvancedDetails = ({ category, subcategory, details, onChange, updateFormData, errors = {} }) => {
  if (!category) return null;

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">Advanced {category === "vehicles" ? "Vehicle" : "Property"} Details</h2>

      {/* Render VehicleDetails only for vehicles category */}
      {category === "vehicles" && (
        <VehicleDetails 
          details={details} 
          subcategory={subcategory} 
          onChange={onChange} 
        />
      )}

      {/* Other categories can render their respective components */}
      {category === "real-estate" && (
        <>
          {subcategory === "Land" && <LandDetails details={details} onChange={onChange} />}
          {subcategory !== "Land" && <RealEstateDetails details={details} subcategory={subcategory} onChange={onChange} />}
        </>
      )}

      {/* Message for unsupported categories */}
      {!["vehicles", "real-estate"].includes(category) && (
        <p className="text-gray-500 italic">No advanced details available for this category</p>
      )}
    </div>
  );
};

export default AdvancedDetails;
