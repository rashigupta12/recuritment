/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { frappeAPI } from "@/lib/api/frappeClient";
import { useState, useEffect } from "react";
import { X, Calendar, User, Briefcase, Building2, Users, FileText } from "lucide-react";

interface ToDo {
  name: string;
  status?: string;
  priority?: string;
  date?: string;
  allocated_to?: string;
  description?: string;
  custom_job_id?: string;
  custom_job_title?: string;
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

  console.log(todo)

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
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-blue-50/20"></div>
            </div>
            <p className="text-slate-700 font-medium">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <X className="text-red-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Task Not Found</h3>
            <p className="text-slate-600 text-center">The requested task could not be loaded. Please try again.</p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      <div className="w-full mx-auto p-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">Task Details</h1>
                <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(todo.status)} bg-white`}>
                  {todo.status || 'Unknown'}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Task Details</h1>
                  <p className="text-slate-600 text-sm mt-0.5">Comprehensive overview of the task, company, and job description.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(todo.status)}`}>
                  {todo.status || 'In Progress'}
                </span>
                <span className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border ${getPriorityColor(todo.priority)}`}>
                  {todo.priority || 'High'} Priority
                </span>
                
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all duration-200 ml-2"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Top Row - Task Information and Company Information */}
            <div className="flex flex-row gap-6 mb-6">
              {/* Task Information - 75% width */}
              <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200" style={{flex: '0 0 75%'}}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Task Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Job Title</span>
                    <span className="text-sm text-slate-900">{todo.custom_job_title || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Assigned Date</span>
                    <span className="text-sm text-slate-900">
                      {calculateDaysAgo(todo.date)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Assigned By</span>
                    <span className="text-sm text-slate-900 truncate ml-2">
                      {todo.assigned_by_full_name || todo.assigned_by || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Information - 23% width */}
              <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200" style={{flex: '0 0 23%'}}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
                
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Company Name</span>
                    <span className="text-sm text-slate-900 truncate">{extractCompany(todo.description)}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Industry</span>
                    <span className="text-sm text-slate-900 truncate">{extractIndustry(todo.description)}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Location</span>
                    <span className="text-sm text-slate-900 truncate">{extractLocation(todo.description)}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">No. of Vacancies</span>
                    <span className="text-sm text-slate-900 truncate">{extractVacancies(todo.description)}</span>
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Left Column (Company + Position Details) */}
    <div className="prose prose-sm max-w-none">
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
        {(() => {
          if (!todo.description) return "No description provided for this task.";

          const lines = todo.description.split("\n");
          const excludeKeywords = [
            "Staffing Plan Assignment",
            "Staffing Plan:",
            "Plan Duration:",
            "Vacancies:",
            "Current Count:",
            "Current Openings:",
            "All Assignments for This Position:",
          ];

          // Remove excluded lines
          const filteredLines = lines.filter(
            (line) => !excludeKeywords.some((keyword) => line.includes(keyword))
          );

          // Find Job Description line
          const jobDescIndex = filteredLines.findIndex((line) =>
            line.trim().startsWith("• Job Description:")
          );

          // Left column: everything BEFORE "• Job Description:"
          const leftColumn =
            jobDescIndex > -1
              ? filteredLines.slice(0, jobDescIndex)
              : filteredLines;

          return leftColumn.join("\n") || "No details provided.";
        })()}
      </div>
    </div>

    {/* Right Column (Job Description only) */}
    <div className="prose prose-sm max-w-none">
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
        {(() => {
          if (!todo.description) return "No description provided for this task.";

          const lines = todo.description.split("\n");
          const excludeKeywords = [
            "Staffing Plan Assignment",
            "Staffing Plan:",
            "Plan Duration:",
            "Vacancies:",
            "Current Count:",
            "Current Openings:",
            "All Assignments for This Position:",
          ];

          const filteredLines = lines.filter(
            (line) => !excludeKeywords.some((keyword) => line.includes(keyword))
          );

          const jobDescIndex = filteredLines.findIndex((line) =>
            line.trim().startsWith("• Job Description:")
          );

          // Right column: everything FROM "• Job Description:" onwards
          const rightColumn =
            jobDescIndex > -1 ? filteredLines.slice(jobDescIndex) : [];

          return rightColumn.join("\n") || "No job description provided.";
        })()}
      </div>
    </div>
  </div>
</div>


        </div>
      </div>
      </div>
    );
  }