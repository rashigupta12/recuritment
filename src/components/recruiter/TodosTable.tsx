'use client';

import {  LucideEdit } from "lucide-react";

interface ToDo {
  name: string;
  status?: string;
  priority?: string;
  date?: string;
  allocated_to?: string;
  description?: string;
  reference_type?: string;
  reference_name?: string;
  custom_job_id?: string;
  assigned_by?: string;
  assigned_by_full_name?: string;
  creation?: string;
  modified?: string;
  doctype?: string;
  custom_date_assigned?:string;
  custom_job_title?:string;
}

interface TodosTableProps {
  todos: ToDo[];
  onViewTodo: (todo: ToDo) => void;
  onEditTodo: (todo: ToDo) => void;
}

export const TodosTable = ({ todos, onViewTodo }: TodosTableProps) => {
  // const router = useRouter(); // Initialize useRouter for navigation

  // Get priority badge color
  const getPriorityColor = (priority: string = '') => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRowClick = (todo: ToDo, event: React.MouseEvent) => {
    // Prevent the click event from bubbling up when clicking the edit button
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    onViewTodo(todo);
  };

  // const handleCreateApplicant = (todo: ToDo) => {
  //   if (todo.custom_job_id) {
  //     router.push(`/dashboard/recruiter/applicants?jobId=${encodeURIComponent(todo.custom_job_id)}`);
  //   } else {
  //     alert('No Job ID available for this task');
  //   }
  // };

  return (
    console.log(todos),
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Assigned
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. of Vacancies 
              </th>
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th> */}
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th> */}

              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {todos.map((todo) => (
              <tr
                key={todo.name}
                className="hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
                onClick={(e) => handleRowClick(todo, e)}
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="px-0 py-4 whitespace-nowrap text-sm text-gray-500">
                      {todo.custom_date_assigned ? new Date(todo.custom_date_assigned).toLocaleDateString('en-IN') : 'Not set'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {todo.custom_job_title || 'N/A'}
                </td>
                {/* <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {todo.description || 'No description available'}
                    </div>
                  </div>
                </td> */}
                
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900">
                      {
                        (() => {
                          // Regex to capture "Company: <name>"
                          const match = todo.description?.match(/Company:\s*([^\n]+)/i);
                          return match ? match[1].trim() : 'No company found';
                        })()
                      }
                    </div>
                  </div>
                </td>

<td className="px-6 py-4">
  <div className="max-w-xs">
    <div className="text-sm font-medium text-gray-900">
      {
        (() => {
          // Regex to capture "Designation: <value>"
          const plain = todo.description?.replace(/<[^>]+>/g, '').trim(); // remove HTML tags
          const match = plain?.match(/Designation:\s*([^\n]+)/i);
          return match ? match[1].trim() : 'No designation found';
        })()
      }
    </div>
  </div>
</td>

                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                    {todo.priority || 'Not Set'}
                  </span>
                </td> */}
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(todo.status)}`}>
                    {todo.status || 'Unknown'}
                  </span>
                </td> */}
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {todo.date ? new Date(todo.date).toLocaleDateString('en-IN') : 'Not set'}
                </td> */}
<td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900">
                      {
                        (() => {
                          const match = todo.description?.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
                          return match ? `${match[1]}` : 'No allocated positions';
                        })()
                      }
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {todo.assigned_by_full_name || todo.assigned_by || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      // onClick={() => handleCreateApplicant(todo)}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <LucideEdit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};