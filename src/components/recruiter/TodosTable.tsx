// // ============================================
// // TodosTable.tsx (Updated)
// // ============================================
// /*eslint-disable @typescript-eslint/no-explicit-any*/

// 'use client';

// import { useState } from "react";
// import { SortableTableHeader } from "./SortableTableHeader";

// interface ToDo {
//   custom_department?: string;
//   name: string;
//   status?: string;
//   priority?: string;
//   date?: string;
//   allocated_to?: string;
//   description?: string;
//   reference_type?: string;
//   reference_name?: string;
//   custom_job_id?: string;
//   creation?: string;
//   modified?: string;
//   doctype?: string;
//   custom_date_assigned?: string;
//   custom_job_title?: string;
// }

// interface TodosTableProps {
//   todos: ToDo[];
//   onViewTodo: (todo: ToDo) => void;
//   onEditTodo: (todo: ToDo) => void;
// }

// type SortField = 'date' | 'aging' | 'title' | 'company' | 'location' | 'vacancies' | 'status';
// type SortDirection = 'asc' | 'desc' | null;

// export const TodosTable = ({ todos, onViewTodo }: TodosTableProps) => {
//   const [sortField, setSortField] = useState<SortField | null>(null);
//   const [sortDirection, setSortDirection] = useState<SortDirection>(null);

//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       if (sortDirection === 'asc') setSortDirection('desc');
//       else if (sortDirection === 'desc') {
//         setSortDirection(null);
//         setSortField(null);
//       } else setSortDirection('asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   const extractCompany = (description?: string) => {
//     const match = description?.match(/Company:\s*([^\n]+)/i);
//     return match ? match[1].trim() : 'No company found';
//   };

//   const extractLocation = (description?: string) => {
//     const match = description?.match(/Location:\s*([^\n]+)/i);
//     return match ? match[1].trim() : 'No location found';
//   };

//   const extractVacancies = (description?: string) => {
//     const match = description?.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
//     return match ? parseInt(match[1]) : 0;
//   };

//   const calculateAging = (dateAssigned?: string) => {
//     if (!dateAssigned) return 'Not set';
//     const assigned = new Date(dateAssigned);
//     const now = new Date();
//     const diffDays = Math.floor((now.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };
//   const columns = [
//     { field: 'date' as const, label: 'Date ' },
//     { field: 'aging' as const, label: 'Aging (Days)', align: 'center' as const },
//     { field: 'company' as const, label: 'Company Name' , sortable: false },
//     { field: 'title' as const, label: 'Job Title',sortable: false },
//     { field: 'location' as const, label: 'Location' },
//     { field: 'vacancies' as const, label: 'Vacancies', align: 'center' as const },
//     { field: 'status' as const, label: 'Status' ,sortable: false },
//   ];

//   // Sorting logic based on selected column
//   const sortedTodos = [...todos].sort((a, b) => {
//     if (!sortField || !sortDirection) return 0;
//     let aValue: any;
//     let bValue: any;

//     switch (sortField) {
//       case 'date':
//       case 'aging':
//         aValue = a.custom_date_assigned ? new Date(a.custom_date_assigned).getTime() : 0;
//         bValue = b.custom_date_assigned ? new Date(b.custom_date_assigned).getTime() : 0;
//         break;
//       case 'title':
//         aValue = a.custom_job_title || '';
//         bValue = b.custom_job_title || '';
//         break;
//       case 'company':
//         aValue = extractCompany(a.description);
//         bValue = extractCompany(b.description);
//         break;
//       case 'location':
//         aValue = extractLocation(a.description);
//         bValue = extractLocation(b.description);
//         break;
//       case 'vacancies':
//         aValue = extractVacancies(a.description);
//         bValue = extractVacancies(b.description);
//         break;
//       case 'status':
//         aValue = a.status || '';
//         bValue = b.status || '';
//         break;
//     }
//     if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
//     if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
//     return 0;
//   });



//   const handleRowClick = (todo: ToDo, event: React.MouseEvent) => {
//     if ((event.target as HTMLElement).closest('button')) return;
//     onViewTodo(todo);
//   };

//   return (
//     <div className="overflow-x-auto bg-white rounded-lg shadow-lg border-2 border-blue-100 max-w-full">
//       <table className="min-w-full divide-y divide-blue-100">
//         <SortableTableHeader
//           columns={columns}
//           sortField={sortField}
//           sortDirection={sortDirection}
//           onSort={handleSort}
//         />
//         <tbody className="divide-y divide-blue-50 text-md md:text-md">
//           {sortedTodos.length > 0 ? (
//             sortedTodos.map((todo, index) => (
//               <tr
//                 key={todo.name}
//                 className={`cursor-pointer transition-all ${index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-white'}`}
//                 onClick={(e) => handleRowClick(todo, e)}
//               >
//                 {/* Date Assigned */}
//                 <td className="px-2 md:px-4 py-4 whitespace-nowrap">
//                   {todo.custom_date_assigned
//                     ? new Date(todo.custom_date_assigned).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
//                     : <span className="text-gray-400">Not set</span>}
//                 </td>
//                 {/* Aging - Centered */}
//                 <td className="px-2 md:px-4 py-4 text-center">{calculateAging(todo.custom_date_assigned)}</td>
//                 {/* Company */}
//                 <td className="px-2 md:px-4 py-4 capitalize">{extractCompany(todo.description)}</td>
//                 {/* Job Title */}
//                 <td className="px-2 md:px-4 py-4 capitalize">{todo.custom_job_title || 'N/A'}</td>
//                 {/* Location */}
//                 <td className="px-2 md:px-4 py-4 capitalize">{extractLocation(todo.description)}</td>
//                 {/* Vacancies - Centered */}
//                 <td className="px-2 md:px-4 py-4 text-center">{extractVacancies(todo.description) || 'N/A'}</td>
//                 {/* Status */}
//                 <td className="px-2 md:px-4 py-4">{todo.status || 'N/A'}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={7} className="text-center py-4 text-gray-500">No jobs found</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

/*eslint-disable @typescript-eslint/no-explicit-any*/

import { useState } from "react";
import { ChevronUp, ChevronDown, Eye, Edit2, Share2, PinIcon, Clock, MapPin, User, Users, Building, Phone } from "lucide-react";
import { showToast } from "../Requirements/Management";

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

type SortField = 'date' | 'company' | 'title';
type SortDirection = 'asc' | 'desc' | null;

const SortableHeader = ({ label, field, sortField, sortDirection, onSort }: any) => {
  const isActive = sortField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-white font-medium hover:text-blue-100 transition-colors"
    >
      {label}
      <div className="flex flex-col">
        <ChevronUp
          size={12}
          className={isActive && sortDirection === 'asc' ? 'text-white' : 'text-blue-300'}
        />
        <ChevronDown
          size={12}
          className={isActive && sortDirection === 'desc' ? 'text-white' : 'text-blue-300'}
          style={{ marginTop: '-4px' }}
        />
      </div>
    </button>
  );
};

export default function TodosTable({ todos, onViewTodo, onEditTodo }: TodosTableProps) {
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

  const extractContactName = (description?: string) => {
    const match = description?.match(/Contact Name:\s*([^\n]+)/i);
    return match ? match[1].trim() : '-';
  };

  const extractContactPhone = (description?: string) => {
    const match = description?.match(/Contact Phone:\s*([^\n]+)/i);
    return match ? match[1].trim() : '-';
  };

  const extractContactEmail = (description?: string) => {
    const match = description?.match(/Contact Email:\s*([^\n]+)/i);
    return match ? match[1].trim() : '-';
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
    if (!dateAssigned) return 0;
    const assigned = new Date(dateAssigned);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'date':
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
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRowClick = (todo: ToDo, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    if (todo.status?.toLowerCase() === 'cancelled') {
      showToast.error("This job is cancelled ");
      return;
    }
    onViewTodo(todo);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg">
        <div className="grid grid-cols-11 gap-4 items-center text-md">
          <div className="col-span-1">
            <SortableHeader
              label="Date"
              field="date"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>
          <div className="col-span-1 text-center">
            <span className="text-white font-medium">Aging(Days)</span>
          </div>
          <div className="col-span-3">
            <SortableHeader
              label="Company & Contact"
              field="company"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>
          <div className="col-span-2">
            <SortableHeader
              label="Position Details"
              field="title"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>
          <div className="col-span-2">
            <span className="text-white font-medium">Location & Experience</span>
          </div>

          <div className="col-span-1 text-center">
            <span className="text-white font-medium">Vacancies</span>
          </div>
          <div className="col-span-1 text-center">
            <span className="text-white font-medium">Status</span>
          </div>

        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100">
        {sortedTodos.length > 0 ? (
          sortedTodos.map((todo, index) => {
            const aging = calculateAging(todo.custom_date_assigned);
            const vacancies = extractVacancies(todo.description);
            const contactName = extractContactName(todo.description);
            const contactPhone = extractContactPhone(todo.description);
            const contactEmail = extractContactEmail(todo.description);

            return (
              <div
                key={todo.name}
                className="px-3 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={(e) => handleRowClick(todo, e)}
              >
                <div className="grid grid-cols-11 gap-4 items-start">
                  {/* Date Column */}
                  <div className="col-span-1">
                    <div className="text-md font-medium text-gray-900">
                      {todo.custom_date_assigned
                        ? new Date(todo.custom_date_assigned).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                        : '-'}
                    </div>

                  </div>
                  {/* Aging Column */}
                  <div className="col-span-1 text-center">
                    <div className="text-md font-medium text-gray-900">
                      {aging}
                    </div>
                  </div>
                  {/* Company & Contact Column */}
                  <div className="col-span-3">
                    <div className="flex-1 items-start gap-2">
                      {/* Left Icon */}

                      {/* Info Block */}
                 
                        {/* Company Name
                      <div className="flex items-center gap-2 font-semibold text-gray-900 text-md leading-tight">
  <Building className="w-4 h-4  flex-shrink-0 just" />
  <span>{extractCompany(todo.description)}</span>
</div> */}
<div className="flex items-start gap-2 font-semibold text-gray-900 text-md">
  <Building className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
  <span className="block">
    {extractCompany(todo.description)}
  </span>
</div>


                        {/* Contact Name */}
                        <div className="flex items-center text-sm text-gray-500 mt-0.5 leading-snug">
                          <User className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="truncate">{contactName}</span>
                        </div>

                        {/* Contact Phone */}
                        <div className="flex items-center text-xs text-gray-500 mt-0.5 leading-snug">
                          <Phone className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="truncate">{contactPhone}</span>
                        </div>
                    </div>
                  </div>


                  {/* Position Details Column */}
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900 text-md">
                      {todo.custom_job_title || 'N/A'}
                    </div>
                  </div>

                  {/* Location & Experience Column */}
                  <div className="col-span-2">
                    <div className="flex items-start gap-1 text-md text-gray-600">

                      <MapPin className="w-4 h-4 " />
                      <span>{extractLocation(todo.description)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-md text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>0+ years</span>
                    </div>
                  </div>



                  {/* Vacancies Column */}
                  <div className="col-span-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-md font-semibold text-green-600">{vacancies}</span>
                    </div>
                  </div>
                  {/* Aging Column */}
                  <div className="col-span-1 text-center">
                    <div className="text-md mr-0 font-medium text-gray-900">
                      {todo.status}
                    </div>
                  </div>
                  {/* Action Column */}
                  {/* <div className="col-span-1 flex items-start justify-end gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewTodo(todo);
                      }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTodo(todo);
                      }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Share2 size={16} className="text-blue-600" />
                    </button>
                  </div> */}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            No jobs found
          </div>
        )}
      </div>
    </div>
  );
}