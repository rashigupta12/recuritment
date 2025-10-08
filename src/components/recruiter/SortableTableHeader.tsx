// ============================================
// SortableTableHeader.tsx
// ============================================
import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface Column<T extends string> {
  field: T;
  label: string;
  sortable?: boolean;
}

interface SortableTableHeaderProps<T extends string> {
  columns: Column<T>[];
  sortField: T | null;
  sortDirection: 'asc' | 'desc' | null;
  onSort: (field: T) => void;
  className?: string;
}

export function SortableTableHeader<T extends string>({
  columns,
  sortField,
  sortDirection,
  onSort,
  className = 'bg-blue-500 text-white'
}: SortableTableHeaderProps<T>) {
  return (
    <thead className={className}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.field}
            scope="col"
            className={`px-2 sm:px-4 py-4 text-lg sm:text-md uppercase text-white text-left font-medium ${
              column.sortable !== false ? 'cursor-pointer select-none' : ''
            }`}
            onClick={() => column.sortable !== false && onSort(column.field)}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              {column.label}
              {column.sortable !== false && (
                <ArrowUpDown
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-all ${
                    sortField === column.field
                      ? 'text-white opacity-100 scale-110'
                      : 'text-white opacity-60 group-hover:opacity-100'
                  }`}
                  style={{
                    transform:
                      sortField === column.field && sortDirection === 'desc'
                        ? 'rotate(180deg) scale(1.1)'
                        : 'rotate(0deg)',
                  }}
                />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}