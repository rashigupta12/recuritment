/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { frappeAPI } from "@/lib/api/frappeClient";
import { useState, useEffect } from "react";
import { X, Calendar, User, Briefcase, Building2, Users, FileText, PlusCircleIcon, Plus } from "lucide-react";

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
  custom_job_desc?: string;
}

interface TodoDetailModalProps {
  todoId: any;
  onClose: () => void;
  setActiveTab: (tab: 'details' | 'applicants' | 'resume') => void;
  onOpenApplicantForm?: () => void; // ✅ New prop
}

export const TodoDetailModal = ({ 
  todoId, 
  onClose, 
  setActiveTab,
  onOpenApplicantForm 
}: TodoDetailModalProps) => {
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

  const extractCompany = (description?: string) => {
    if (!description) return 'Not specified';
    const match = description.match(/Company:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Not specified';
  };

  const extractIndustry = (description?: string) => {
    if (!description) return 'Not specified';
    const match = description.match(/Industry:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Not specified';
  };

  const extractLocation = (description?: string) => {
    if (!description) return 'Not specified';
    const match = description.match(/Location:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Not specified';
  };

  const extractDesignation = (description?: string) => {
    if (!description) return 'Not specified';
    const plain = description.replace(/<[^>]+>/g, '').trim();
    const match = plain.match(/Designation:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Not specified';
  };

  const extractPositionTitle = (description?: string) => {
    if (!description) return 'Not specified';
    const match = description.match(/Position Title:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Not specified';
  };

  const extractBudget = (description?: string) => {
    if (!description) return 'Not specified';
    const match = description.match(/Cost Per Position:\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Not specified';
  };

  const extractVacancies = (description?: string): string => {
    if (!description) return 'Not specified';
    const match = description.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
    if (match) {
      const count = parseInt(match[1], 10);
      return `${count}`;
    }
    return 'Not specified';
  };

  const calculateDaysAgo = (date?: string): string => {
    if (!date) return 'Not set';
    const assignedDate = new Date(date);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - assignedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

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

  // ✅ Updated handler to open form directly
  const handleTagApplicants = () => {
    if (onOpenApplicantForm) {
      onOpenApplicantForm(); // Opens the form sheet
    } else {
      setActiveTab('applicants'); // Fallback to just switching tabs
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-5" style={{ flex: '0 0 70%' }}>
      <div className="w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-3 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 capitalize">{extractDesignation(todo.description)}</h1>
                 
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3.5 py-1.5 text-lg font-semibold rounded-lg border `}>
                  Budget: {extractBudget(todo.description)} LPA
                </span>
                {/* ✅ Updated button handler */}
                <button
                  onClick={handleTagApplicants}
                  className="p-2 flex text-red-600 border-red-600 border hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200 ml-2"
                >
                  <Plus size={22} />Tag Applicants
                </button>

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
             
              <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200" style={{ flex: '0 0 65%' }}>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">JOB DESCRIPTION</h2>

<div
  className="prose max-w-none text-slate-800"
  dangerouslySetInnerHTML={{
    __html:
      todo.custom_job_desc
        ?.split(/•\s*/g)
        .filter(Boolean)
        .map((line) => `<p>• ${line.trim()}</p>`)
        .join('') || '',
  }}
/>

              </div>
              {/* Company Information - 23% width */}
              <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200" style={{ flex: '0 0 30%' }}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 capitalize">COMPANY INFORMATION</h2>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Company Name</span>
                    <span className="text-sm text-slate-900 truncate">{extractCompany(todo.description)}</span>
                  </div>

                  {/* <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Industry</span>
                    <span className="text-sm text-slate-900 truncate">{extractIndustry(todo.description)}</span>
                  </div> */}

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

            {/* Middle Row - Job Description */}
            <div className="flex flex-row gap-6">
              {/* Job Description - 100% width */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}