

// // components/todos/TodoDetailModal.tsx
// 'use client';

// import { frappeAPI } from "@/lib/api/frappeClient";
// import { useState, useEffect } from "react";
// import { X } from "lucide-react";

// interface ToDo {
//   name: string;
//   status?: string;
//   priority?: string;
//   date?: string;
//   allocated_to?: string;
//   description?: string;
//   reference_type?: string;
//   reference_name?: string;
//   custom_job_id?: string;
//   assigned_by?: string;
//   assigned_by_full_name?: string;
//   creation?: string;
//   modified?: string;
//   doctype?: string;
// }

// interface TodoDetailModalProps {
//   todoId: any;
//   onClose: () => void;
// }

// export const TodoDetailModal = ({ todoId, onClose }: TodoDetailModalProps) => {
//   const [todo, setTodo] = useState<ToDo | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTodoDetails = async () => {
//       try {
//         setLoading(true);
//         const todoDetails = await frappeAPI.getTodoBYId(todoId);
//         setTodo(todoDetails.data);
//       } catch (error) {
//         console.error('Error fetching todo details:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (todoId) {
//       fetchTodoDetails();
//     }
//   }, [todoId]);

//   // Get priority badge color
//   const getPriorityColor = (priority: string = '') => {
//     switch (priority.toLowerCase()) {
//       case 'high':
//         return 'bg-red-50  rounded-xl text-red-700';
//       case 'medium':
//         return 'bg-orange-50 rounded-xl  text-orange-700';
//       case 'low':
//         return 'bg-green-50 rounded-xl text-green-700';
//       default:
//         return 'bg-gray-50 rounded-xl text-gray-700';
//     }
//   };

//   const getStatusColor = (status: string = '') => {
//     switch (status.toLowerCase()) {
//       case 'open':
//         return 'bg-blue-50 rounded-xl text-blue-700';
//       case 'closed':
//         return 'bg-gray-50 rounded-xl text-gray-700';
//       case 'cancelled':
//         return 'bg-red-50 rounded-xl text-red-700';
//       default:
//         return 'bg-gray-50 rounded-xl text-gray-700';
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading task details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!todo) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center max-w-md">
//           <div className="text-red-500 text-4xl mb-4">⚠️</div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Not Found</h3>
//           <p className="text-gray-600 mb-4">The requested task could not be loaded.</p>
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white overflow-auto">
//       {/* Header */}
//       {/* <div className="border-b border-gray-200 px-12 py-6">
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900 mb-1">Task Details</h1>
//              <div className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${getStatusColor(todo.status)}`}>
//                     {todo.status || 'Unknown'}
//                   </div>
//             <p className="text-sm text-gray-500">Complete information about the assigned task</p>
//           </div>
//           <button 
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>
//       </div> */}
// <div className="border-b border-gray-200 px-12 py-6">
//   <div className="flex items-center justify-between">
//     <div className="flex items-center space-x-4">
//       <h1 className="text-2xl font-semibold text-gray-900">Task Details</h1>
//       <div className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${getStatusColor(todo.status)}`}>
//         {todo.status || 'Unknown'}
//       </div>
//        <div className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(todo.priority)}`}>
//                     {todo.priority || 'Not Set'}
//                   </div>
//     </div>
//     <button 
//       onClick={onClose}
//       className="text-gray-400 hover:text-gray-600 transition-colors"
//     >
//       <X size={20} />
//     </button>
//   </div>
//   <p className="text-sm text-gray-500 mt-2">Complete information about the assigned task</p>
// </div>

//       {/* Content */}
//       <div className="px-12 py-8">
//         <div className="grid grid-cols-3 gap-16">
//           {/* Left Column - Task Overview & Description */}
//           <div className="col-span-2 space-y-12">
//             {/* Task Overview Section */}
//             <div>
//               <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-6">
//                 Task Overview
//               </h2>
              
//               <div className="grid grid-cols-4 gap-x-12 ">
//                 <div>
//                   <div className="text-xs text-gray-500 mb-1.5">Task ID</div>
//                   <div className="text-sm text-gray-900 font-mono">{todo.name}</div>
//                 </div>
                
//                 <div>
//                   <div className="text-xs text-gray-500 mb-1.5">Job ID</div>
//                   <div className="text-sm text-gray-900 font-mono">
//                     {todo.custom_job_id || 'Not assigned'}
//                   </div>
//                 </div>
                
//                 {/* <div>
//                   <div className="text-xs text-gray-500 mb-1.5">Status</div>
//                   <div className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${getStatusColor(todo.status)}`}>
//                     {todo.status || 'Unknown'}
//                   </div>
//                 </div> */}
                
//                 {/* <div>
//                   <div className="text-xs text-gray-500 mb-1.5">Priority</div>
//                   <div className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(todo.priority)}`}>
//                     {todo.priority || 'Not Set'}
//                   </div>
//                 </div>
//                  */}
//                 <div>
//                   <div className="text-xs text-gray-500 mb-1.5">Due Date</div>
//                   <div className="text-sm text-gray-900">
//                     {todo.date ? new Date(todo.date).toLocaleDateString('en-IN', {
//                       weekday: 'long',
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric'
//                     }) : 'Not set'}
//                   </div>
//                 </div>
                
//                 <div>
//                   <div className="text-xs text-gray-500 mb-1.5">Assigned By</div>
//                   <div className="text-sm text-gray-900">
//                     {todo.assigned_by_full_name || todo.assigned_by || 'Not specified'}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Task Description Section */}
//             <div>
//               <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-6">
//                 Task Description
//               </h2>
              
//               {/* <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
//                 {todo.description || 'No description provided for this task.'}
//               </div> */}
//               <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
//   {(() => {
//     if (!todo.description) return 'No description provided for this task.';

//     const lines = todo.description.split('\n');
//     const excludeKeywords = [
//       'Staffing Plan Assignment',
//       'Staffing Plan:',
//       'Plan Duration:',
//       'Vacancies:',
//       'Current Count:',
//       'Current Openings:',
//       'All Assignments for This Position:'
//     ];

//     const filteredLines = lines.filter(line => {
//       // Remove lines that contain any of the keywords
//       return !excludeKeywords.some(keyword => line.includes(keyword));
//     });

//     return filteredLines.join('\n');
//   })()}
// </div>



//             </div>
//           </div>

//           {/* Right Column - Reference & System Info */}
//           {/* <div className="space-y-12">
//             {(todo.reference_type || todo.reference_name) && (
//               <div>
//                 <h2 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-6">
//                   Reference Information
//                 </h2>
                
//                 <div className="space-y-6">
//                   {todo.reference_type && (
//                     <div>
//                       <div className="text-xs text-gray-500 mb-1.5">Reference Type</div>
//                       <div className="text-sm text-gray-900">{todo.reference_type}</div>
//                     </div>
//                   )}
                  
//                   {todo.reference_name && (
//                     <div>
//                       <div className="text-xs text-gray-500 mb-1.5">Reference Name</div>
//                       <div className="text-sm text-gray-900 font-mono break-all">
//                         {todo.reference_name}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             <div>
//               <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-6">
//                 System Information
//               </h2>
              
//               <div className="space-y-6">
//                 {todo.creation && (
//                   <div>
//                     <div className="text-xs text-gray-500 mb-1.5">Created On</div>
//                     <div className="text-sm text-gray-900">
//                       {new Date(todo.creation).toLocaleString('en-IN')}
//                     </div>
//                   </div>
//                 )}
                
//                 {todo.modified && (
//                   <div>
//                     <div className="text-xs text-gray-500 mb-1.5">Last Modified</div>
//                     <div className="text-sm text-gray-900">
//                       {new Date(todo.modified).toLocaleString('en-IN')}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div>
//               <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-6">
//                 Actions
//               </h2>
              
//               <div className="space-y-3">
//                 <button
//                   onClick={() => {
//                     console.log('Edit todo:', todo);
//                   }}
//                   className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Edit Task
//                 </button>
//                 <button
//                   onClick={onClose}
//                   className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Back to Tasks
//                 </button>
//               </div>
//             </div>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// }


// components/todos/TodoDetailModal.tsx
'use client';

import { frappeAPI } from "@/lib/api/frappeClient";
import { useState, useEffect } from "react";
import { X, Calendar, User, Briefcase } from "lucide-react";

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
}

interface TodoDetailModalProps {
  todoId: any;
  onClose: () => void;
}

export const TodoDetailModal = ({ todoId, onClose }: TodoDetailModalProps) => {
  const [todo, setTodo] = useState<ToDo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodoDetails = async () => {
      try {
        setLoading(true);
        const todoDetails = await frappeAPI.getTodoBYId(todoId);
        setTodo(todoDetails.data);
      } catch (error) {
        console.error('Error fetching todo details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (todoId) {
      fetchTodoDetails();
    }
  }, [todoId]);

  const getPriorityColor = (priority: string = '') => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Not Found</h3>
          <p className="text-gray-600 mb-6">The requested task could not be loaded.</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">Task Details</h1>
                <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(todo.status)} bg-white`}>
                  {todo.status || 'Unknown'}
                </div>
                <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(todo.priority)} bg-white`}>
                  {todo.priority || 'Not Set'} Priority
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Task Overview */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Task ID</div>
                <div className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md">
                  {todo.name}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job ID</div>
                <div className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <Briefcase size={14} className="text-gray-400" />
                  {todo.custom_job_id || 'Not assigned'}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</div>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  {todo.date ? new Date(todo.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Not set'}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned By</div>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="truncate">{todo.assigned_by_full_name || todo.assigned_by || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b border-green-100">
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-wide">
              Task Description
            </h2>
          </div>
          
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                {(() => {
                  if (!todo.description) return 'No description provided for this task.';

                  const lines = todo.description.split('\n');
                  const excludeKeywords = [
                    'Staffing Plan Assignment',
                    'Staffing Plan:',
                    'Plan Duration:',
                    'Vacancies:',
                    'Current Count:',
                    'Current Openings:',
                    'All Assignments for This Position:'
                  ];

                  const filteredLines = lines.filter(line => {
                    return !excludeKeywords.some(keyword => line.includes(keyword));
                  });

                  return filteredLines.join('\n') || 'No description provided for this task.';
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}