import React, { useState, useEffect } from "react";
import type { Category } from "@/components/listings/types/listings";
import { FiltersAPI } from "@/components/listings/api/listings.api";

interface CategoryFilterProps {
  onCategorySelect?: (category: Category) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  onCategorySelect,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const fetchCategories = async (): Promise<void> => {
    try {
      const categories = await FiltersAPI.getAllCategories();
      setCategories(categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
  };

  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategorySelect(category)}
          className={`category-item ${selectedCategory?.id === category.id ? "selected" : ""}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
