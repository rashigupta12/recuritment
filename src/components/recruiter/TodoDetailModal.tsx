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

  const getPriorityColor = (priority: string = '') => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'closed':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Task Details</h2>
            <p className="text-sm text-slate-500 mt-1">ID: {todo.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(todo.status)}`}>
                  {todo.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                  {todo.priority || 'Not Set'}
                </span>
              </div>
              {todo.custom_job_id && (
                <div className="flex items-center gap-2 ml-auto">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Job: {todo.custom_job_id}</span>
                </div>
              )}
            </div>

            {/* Task Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Description</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {todo.description || 'No description provided for this task.'}
                </p>
              </div>
            </div>

            {/* Key Information Grid */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Key Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Due Date</label>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{formatDate(todo.date)}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Assigned By</label>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {todo.assigned_by_full_name || todo.assigned_by || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reference Information */}
            {(todo.reference_type || todo.reference_name) && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Reference</h3>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      {todo.reference_type && (
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{todo.reference_type}</p>
                      )}
                      {todo.reference_name && (
                        <p className="text-sm font-medium text-slate-900">{todo.reference_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">System Information</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                {todo.creation && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Created</span>
                    <span className="font-medium text-slate-900">{formatDateTime(todo.creation)}</span>
                  </div>
                )}
                {todo.modified && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Last Modified</span>
                    <span className="font-medium text-slate-900">{formatDateTime(todo.modified)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              console.log('Edit todo:', todo);
              onClose();
            }}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow transition-all duration-200"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
}