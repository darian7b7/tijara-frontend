import React, { useState } from "react";
import { ListingCategory } from "@/types/listings";

interface CategoryFilterProps {
  onCategorySelect?: (category: ListingCategory) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  onCategorySelect,
}) => {
  const categories = [ListingCategory.VEHICLES, ListingCategory.REAL_ESTATE];
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(
    null,
  );

  const handleCategorySelect = (category: ListingCategory) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
  };

  const getCategoryDisplayName = (category: ListingCategory): string => {
    return category.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategorySelect(category)}
          className={`category-item ${selectedCategory === category ? "selected" : ""}`}
        >
          {getCategoryDisplayName(category)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
