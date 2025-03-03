import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const CategorySelector = ({ selectedCategory, onCategorySelect, errors }) => {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'vehicles',
      title: t('vehicles'),
      icon: '🚗',
      description: t('vehicles_description')
    },
    {
      id: 'realEstate',
      title: t('real_estate'),
      icon: '🏠',
      description: t('real_estate_description')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedCategory === category.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-4xl mb-3">{category.icon}</div>
          <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
          <p className="text-gray-600">{category.description}</p>
        </motion.button>
      ))}
      {errors?.category && (
        <p className="text-red-500 text-sm col-span-full text-center">
          {errors.category}
        </p>
      )}
    </div>
  );
};

export default CategorySelector;
