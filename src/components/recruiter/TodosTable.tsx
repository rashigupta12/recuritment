/*eslint-disable @typescript-eslint/no-explicit-any*/

'use client';

import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

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

  const extractCompany = (description?: string) => {
    const match = description?.match(/Company:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'No company found';
  };

  const extractVacancies = (description?: string) => {
    const match = description?.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  const extractLocation = (description?: string) => {
    const match = description?.match(/Location:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'No location found';
  };

  const calculateAging = (dateAssigned?: string) => {
    if (!dateAssigned) return 'Not set';
    const assigned = new Date(dateAssigned);
    const now = new Date();
    const diffTime = now.getTime() - assigned.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    return diffDays === 1 ? '1 ' : `${diffDays} `;
  };

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
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRowClick = (todo: ToDo, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    onViewTodo(todo);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      scope="col"
      className="px-6 py-4 text-left text-md font-heading text-white uppercase tracking-wide cursor-pointer transition-all select-none group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown
          className={`w-4 h-4 transition-all  ${sortField === field
              ? 'text-white opacity-100 scale-110'
              : 'text-white opacity-60 group-hover:opacity-100'
            }`}
          style={{
            transform:
              sortField === field && sortDirection === 'desc'
                ? 'rotate(180deg) scale(1.1)'
                : 'rotate(0deg)',
          }}
        />
      </div>
    </th>
  );

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden border-2 border-blue-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-blue-100">
          <thead className="bg-blue-500 text-red-900">
            <tr>
              <SortableHeader field="date">Date Assigned</SortableHeader>
              <SortableHeader field="aging">Aging(In Days)</SortableHeader>
              <SortableHeader field="company">Company</SortableHeader>

              <SortableHeader field="title">Job Title</SortableHeader>
              <SortableHeader field="location">Location</SortableHeader>
              <SortableHeader field="vacancies">Open Vacancies</SortableHeader>
               <SortableHeader field="status">Status</SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-50">
            {sortedTodos.map((todo, index) => (
              <tr
                key={todo.name}
                className={`${index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-white'
                  } 
                transition-all duration-200 ease-in-out cursor-pointer group 
                border-l-4 border-transparent`}
                onClick={(e) => handleRowClick(todo, e)}
              >
                {/* Date Assigned */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-900">
                    {todo.custom_date_assigned
                      ? new Date(todo.custom_date_assigned).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                      : <span className="text-gray-400">Not set</span>}
                  </div>
                </td>

                {/* Aging */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-900">
                    {calculateAging(todo.custom_date_assigned)}
                  </div>
                </td>

                {/* Job Title */}


                {/* Company */}
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-blue-900  transition-colors">
                    {extractCompany(todo.description)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                    {todo.custom_job_title || 'N/A'}
                  </div>
                </td>
                {/* Location */}
                <td className="px-6 py-4">
                  <div className="text-sm text-blue-900">
                    {extractLocation(todo.description)}
                  </div>
                </td>

                {/* Vacancies */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-3 py-1 text-blue-900 text-sm font-bold">
                    {extractVacancies(todo.description) || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-3 py-1 text-blue-900 text-sm font-bold">
                    {todo.status || 'N/A'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedTodos.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="text-blue-400 text-6xl mb-4">📋</div>
          <p className="text-blue-600 text-lg font-semibold">No jobs found</p>
          <p className="text-blue-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};
