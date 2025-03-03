import React from 'react';
import { FaMotorcycle } from 'react-icons/fa';

const MotorcycleDetails = ({ details, onChange }) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold flex items-center">
        <FaMotorcycle className="mr-2 text-red-500" /> Motorcycle Details
      </h2>

      {/* Make */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
        <input
          type="text"
          value={details.make || ''}
          onChange={(e) => onChange('make', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
        <input
          type="text"
          value={details.model || ''}
          onChange={(e) => onChange('model', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Engine Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Engine Size (cc)</label>
        <input
          type="number"
          value={details.engineSize || ''}
          onChange={(e) => onChange('engineSize', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
        <select
          value={details.fuelType || ''}
          onChange={(e) => onChange('fuelType', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select Fuel Type</option>
          {["Petrol", "Electric"].map((fuel) => (
            <option key={fuel} value={fuel}>{fuel}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MotorcycleDetails;
