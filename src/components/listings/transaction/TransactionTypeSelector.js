import React from 'react';

const TransactionTypeSelector = ({ options, selectedType, onSelect }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold">Select Transaction Type</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {options.map((option) => (
          <div
            key={option}
            className={`p-3 border rounded-lg cursor-pointer ${selectedType === option ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTypeSelector;
