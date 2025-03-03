import React from 'react';

const SelectDropdown = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select value={value} onChange={onChange} className="w-full px-4 py-3 rounded-lg border">
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default SelectDropdown;
