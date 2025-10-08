// ============================================
// TodosTable.tsx (Updated)
// ============================================
/*eslint-disable @typescript-eslint/no-explicit-any*/

'use client';

import { useState } from "react";
import { SortableTableHeader } from "./SortableTableHeader";

interface ToDo {
  custom_department?: string;
  name: string;
  status?: string;
  priority?: string;
  date?: string;
  allocated_to?: string;
  description?: string;
  reference_type?: string;
  reference_name?: string;
  custom_job_id?: string;
  creation?: string;
  modified?: string;
  doctype?: string;
  custom_date_assigned?: string;
  custom_job_title?: string;
}

interface TodosTableProps {
  todos: ToDo[];
  onViewTodo: (todo: ToDo) => void;
  onEditTodo: (todo: ToDo) => void;
}

type SortField = 'date' | 'aging' | 'title' | 'company' | 'location' | 'vacancies' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export const TodosTable = ({ todos, onViewTodo }: TodosTableProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const columns = [
    { field: 'date' as const, label: 'Date Assigned' },
    { field: 'aging' as const, label: 'Aging (Days)', align: 'center' as const },
    { field: 'company' as const, label: 'Company' },
    { field: 'title' as const, label: 'Job Title' },
    { field: 'location' as const, label: 'Location' },
    { field: 'vacancies' as const, label: 'Vacancies', align: 'center' as const },
    { field: 'status' as const, label: 'Status' },
  ];

  // Sorting logic based on selected column
  const sortedTodos = [...todos].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'date':
      case 'aging':
        aValue = a.custom_date_assigned ? new Date(a.custom_date_assigned).getTime() : 0;
        bValue = b.custom_date_assigned ? new Date(b.custom_date_assigned).getTime() : 0;
        break;
      case 'title':
        aValue = a.custom_job_title || '';
        bValue = b.custom_job_title || '';
        break;
      case 'company':
        aValue = extractCompany(a.description);
        bValue = extractCompany(b.description);
        break;
      case 'location':
        aValue = extractLocation(a.description);
        bValue = extractLocation(b.description);
        break;
      case 'vacancies':
        aValue = extractVacancies(a.description);
        bValue = extractVacancies(b.description);
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const extractCompany = (description?: string) => {
    const match = description?.match(/Company:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'No company found';
  };

  const extractLocation = (description?: string) => {
    const match = description?.match(/Location:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'No location found';
  };

  const extractVacancies = (description?: string) => {
    const match = description?.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  const calculateAging = (dateAssigned?: string) => {
    if (!dateAssigned) return 'Not set';
    const assigned = new Date(dateAssigned);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRowClick = (todo: ToDo, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    onViewTodo(todo);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-lg border-2 border-blue-100 max-w-full">
      <table className="min-w-full divide-y divide-blue-100">
        <SortableTableHeader
          columns={columns}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <tbody className="divide-y divide-blue-50 text-md sm:text-md">
          {sortedTodos.length > 0 ? (
            sortedTodos.map((todo, index) => (
              <tr
                key={todo.name}
                className={`cursor-pointer transition-all ${index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-white'}`}
                onClick={(e) => handleRowClick(todo, e)}
              >
                {/* Date Assigned */}
                <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                  {todo.custom_date_assigned
                    ? new Date(todo.custom_date_assigned).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : <span className="text-gray-400">Not set</span>}
                </td>
                {/* Aging - Centered */}
                <td className="px-2 sm:px-4 py-4 text-center">{calculateAging(todo.custom_date_assigned)}</td>
                {/* Company */}
                <td className="px-2 sm:px-4 py-4 capitalize">{extractCompany(todo.description)}</td>
                {/* Job Title */}
                <td className="px-2 sm:px-4 py-4 capitalize">{todo.custom_job_title || 'N/A'}</td>
                {/* Location */}
                <td className="px-2 sm:px-4 py-4 capitalize">{extractLocation(todo.description)}</td>
                {/* Vacancies - Centered */}
                <td className="px-2 sm:px-4 py-4 text-center">{extractVacancies(todo.description) || 'N/A'}</td>
                {/* Status */}
                <td className="px-2 sm:px-4 py-4">{todo.status || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">No jobs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};