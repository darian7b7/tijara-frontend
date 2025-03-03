import { FaCar, FaHome } from 'react-icons/fa';

export const categories = {
  'vehicles': {
    icon: <FaCar />,
    label: 'Vehicles',
    description: 'Cars, motorcycles, and other vehicles',
    subcategories: {
      'Cars': ['Sedan', 'SUV', 'Luxury', 'Electric'],
      'Motorcycles': ['Sport', 'Cruiser', 'Off-road'],
      'Trucks': ['Pickup', 'Commercial', 'Heavy-duty'],
      'Electric Vehicles': ['Cars', 'Motorcycles', 'Scooters']
    }
  },
  'real-estate': {
    icon: <FaHome />,
    label: 'Real Estate',
    description: 'Properties for sale and rent',
    subcategories: {
      'Residential': ['House', 'Apartment', 'Villa', 'Studio'],
      'Commercial': ['Office', 'Retail', 'Warehouse'],
      'Land': ['Residential', 'Commercial', 'Agricultural'],
      'Short-Term': ['Vacation Homes', 'Shared Spaces']
    }
  }
};

export const getSubcategories = (category) => {
  return categories[category]?.subcategories || {};
};

export const getAllCategories = () => {
  return Object.keys(categories);
};
