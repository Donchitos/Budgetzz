import React from 'react';
import Input from '../../components/Input';

export interface ReportFilters {
  searchTerm: string;
  categories: string[];
}

interface AdvancedFilterControlsProps {
  availableCategories: string[];
  filters: ReportFilters;
  onFilterChange: (newFilters: ReportFilters) => void;
}

const AdvancedFilterControls: React.FC<AdvancedFilterControlsProps> = ({
  availableCategories,
  filters,
  onFilterChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchTerm: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategories = Array.from(e.target.selectedOptions, (option) => option.value);
    onFilterChange({ ...filters, categories: selectedCategories });
  };

  return (
    <div className="flex items-center gap-5 mb-5">
      <div>
        <label htmlFor="search-input" className="mr-2">Search Description:</label>
        <Input
          id="search-input"
          type="text"
          placeholder="e.g., Coffee"
          value={filters.searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div>
        <label htmlFor="category-select" className="mr-2">Filter by Category:</label>
        <select
          id="category-select"
          multiple
          value={filters.categories}
          onChange={handleCategoryChange}
          className="min-w-[200px] min-h-[80px]"
        >
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AdvancedFilterControls;