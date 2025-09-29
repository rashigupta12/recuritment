// components/todos/TodoDetailModal.tsx
'use client';

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
  todo: ToDo | null;
  onClose: () => void;
}

export const TodoDetailModal = ({ todo, onClose }: TodoDetailModalProps) => {
  if (!todo) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Task ID</label>
                <p className="mt-1 text-sm text-gray-900">{todo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Job ID</label>
                <p className="mt-1 text-sm text-gray-900">{todo.custom_job_id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(todo.status)}`}>
                    {todo.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                    {todo.priority || 'Not Set'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Due Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {todo.date ? new Date(todo.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Assigned By</label>
                <p className="mt-1 text-sm text-gray-900">
                  {todo.assigned_by_full_name || todo.assigned_by || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Reference Information */}
          {(todo.reference_type || todo.reference_name) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reference Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todo.reference_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Type</label>
                    <p className="mt-1 text-sm text-gray-900">{todo.reference_type}</p>
                  </div>
                )}
                {todo.reference_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Name</label>
                    <p className="mt-1 text-sm text-gray-900">{todo.reference_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {todo.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todo.creation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Created On</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(todo.creation).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
              {todo.modified && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Modified</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(todo.modified).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              // You can add edit functionality here
              console.log('Edit todo:', todo);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};