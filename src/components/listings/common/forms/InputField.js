import React from 'react';

const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg border"
    />
  </div>
);

export default InputField;
