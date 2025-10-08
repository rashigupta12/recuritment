// ============================================
// SortableTableHeader.tsx
// ============================================
import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface Column<T extends string> {
  field: T;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string; // Add width property
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
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getJustifyClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  };

  return (
    <thead className={`${className} sticky top-0 z-10`}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.field}
            scope="col"
            className={`px-2 sm:px-3 py-3 text-sm sm:text-base capitalize text-white font-semibold ${
              getAlignmentClass(column.align)
            } ${column.sortable !== false ? 'cursor-pointer select-none transition-colors' : ''}`}
            onClick={() => column.sortable !== false && onSort(column.field)}
            style={column.width ? {
              width: column.width,
              minWidth: column.width,
              maxWidth: column.width
            } : undefined}
          >
            <div className={`inline-flex items-center gap-1 ${getJustifyClass(column.align)}`}>
              <span>{column.label}</span>
              {column.sortable !== false && (
                <ArrowUpDown
                  className={`w-4 h-4 flex-shrink-0 transition-all ${
                    sortField === column.field
                      ? 'text-white opacity-100'
                      : 'text-white opacity-60'
                  }`}
                  style={{
                    transform:
                      sortField === column.field && sortDirection === 'desc'
                        ? 'rotate(180deg)'
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