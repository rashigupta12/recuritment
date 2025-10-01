

// components/todos/TodoDetailModal.tsx
'use client';

import { frappeAPI } from "@/lib/api/frappeClient";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

  // Get priority badge color
  const getPriorityColor = (priority: string = '') => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700';
      case 'medium':
        return 'bg-orange-50 text-orange-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-50 text-blue-700';
      case 'closed':
        return 'bg-gray-50 text-gray-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Not Found</h3>
          <p className="text-gray-600 mb-4">The requested task could not be loaded.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-200 px-12 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Task Details</h1>
            <p className="text-sm text-gray-500">Complete information about the assigned task</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">
        <div className="grid grid-cols-3 gap-16">
          {/* Left Column - Task Overview & Description */}
          <div className="col-span-2 space-y-12">
            {/* Task Overview Section */}
            <div>
              <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-6">
                Task Overview
              </h2>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Task ID</div>
                  <div className="text-sm text-gray-900 font-mono">{todo.name}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Job ID</div>
                  <div className="text-sm text-gray-900 font-mono">
                    {todo.custom_job_id || 'Not assigned'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Status</div>
                  <div className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${getStatusColor(todo.status)}`}>
                    {todo.status || 'Unknown'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Priority</div>
                  <div className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(todo.priority)}`}>
                    {todo.priority || 'Not Set'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Due Date</div>
                  <div className="text-sm text-gray-900">
                    {todo.date ? new Date(todo.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not set'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Assigned By</div>
                  <div className="text-sm text-gray-900">
                    {todo.assigned_by_full_name || todo.assigned_by || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Task Description Section */}
            <div>
              <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-6">
                Task Description
              </h2>
              
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {todo.description || 'No description provided for this task.'}
              </div>
            </div>
          </div>

          {/* Right Column - Reference & System Info */}
          <div className="space-y-12">
            {/* Reference Information */}
            {(todo.reference_type || todo.reference_name) && (
              <div>
                <h2 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-6">
                  Reference Information
                </h2>
                
                <div className="space-y-6">
                  {todo.reference_type && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Reference Type</div>
                      <div className="text-sm text-gray-900">{todo.reference_type}</div>
                    </div>
                  )}
                  
                  {todo.reference_name && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Reference Name</div>
                      <div className="text-sm text-gray-900 font-mono break-all">
                        {todo.reference_name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Information */}
            <div>
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-6">
                System Information
              </h2>
              
              <div className="space-y-6">
                {todo.creation && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1.5">Created On</div>
                    <div className="text-sm text-gray-900">
                      {new Date(todo.creation).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
                
                {todo.modified && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1.5">Last Modified</div>
                    <div className="text-sm text-gray-900">
                      {new Date(todo.modified).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-6">
                Actions
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    console.log('Edit todo:', todo);
                    // Add edit functionality here
                  }}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Task
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}