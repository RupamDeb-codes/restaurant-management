import React from 'react';
import { OrderStatus } from './OrderCard';

interface FilterTabsProps {
  activeFilter: 'All' | OrderStatus;
  onFilterChange: (filter: 'All' | OrderStatus) => void;
  orderCounts: Record<'All' | OrderStatus, number>;
}

const filterOptions: ('All' | OrderStatus)[] = ['All', 'Placed', 'Preparing', 'Ready', 'Delivered'];

export function FilterTabs({ activeFilter, onFilterChange, orderCounts }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map(filter => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            activeFilter === filter
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filter} ({orderCounts[filter]})
        </button>
      ))}
    </div>
  );
}