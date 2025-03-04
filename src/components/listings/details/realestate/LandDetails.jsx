import React from 'react';
import { FaTree } from 'react-icons/fa';

const LandDetails = ({ details, onChange }) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold flex items-center">
        <FaTree className="mr-2 text-green-500" /> Land Details
      </h2>

      {/* Land Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (m²)</label>
        <input
          type="number"
          value={details.size || ''}
          onChange={(e) => onChange('size', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Land Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Land Type</label>
        <select
          value={details.landType || ''}
          onChange={(e) => onChange('landType', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select Type</option>
          {["Agricultural", "Commercial", "Residential", "Industrial"].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Accessibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility</label>
        <select
          value={details.accessibility || ''}
          onChange={(e) => onChange('accessibility', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select Accessibility</option>
          {["Road Access", "Waterfront", "Remote"].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LandDetails;
