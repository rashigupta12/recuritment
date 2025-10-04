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
    custom_job_title?:string;
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

    // Extract company name from description
    const extractCompany = (description?: string) => {
      if (!description) return 'Not specified';
      const match = description.match(/Company:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Not specified';
    };

    // Extract industry from description
    const extractIndustry = (description?: string) => {
      if (!description) return 'Not specified';
      const match = description.match(/Industry:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Not specified';
    };

    // Extract location from description
    const extractLocation = (description?: string) => {
      if (!description) return 'Not specified';
      const match = description.match(/Location:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Not specified';
    };

    // Extract designation from description
    const extractDesignation = (description?: string) => {
      if (!description) return 'Not specified';
      const plain = description.replace(/<[^>]+>/g, '').trim();
      const match = plain.match(/Designation:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Not specified';
    };

    // Extract department from description
    // const extractDepartment = (description?: string) => {
    //   if (!description) return 'Not specified';
    //   const match = description.match(/Department:\s*([^\n]+)/i);
    //   return match ? match[1].trim() : 'Not specified';
    // };

    // Extract position title from description
    const extractPositionTitle = (description?: string) => {
      if (!description) return 'Not specified';
      const match = description.match(/Position Title:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Not specified';
    };

    // Extract team from description
    

    // Extract number of vacancies from description
    const extractVacancies = (description?: string) => {
      if (!description) return 'Not specified';
      const match = description.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
      return match ? `${match[1]} vacancy${parseInt(match[1]) > 1 ? 's' : ''}` : 'Not specified';
    };

    // Calculate days ago
    const calculateDaysAgo = (date?: string) => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
                {/* Task Information - 80% width */}
                <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200" style={{flex: '0 0 75%'}}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Task Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Job Title</span>
                      <span className="text-sm text-slate-900">{todo.custom_job_title}</span>
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

                {/* Company Information - 20% width */}
                <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200" style={{flex: '0 0 23%'}}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">Company Name</span>
                      <span className="text-sm text-slate-900 truncate">{extractCompany(todo.description)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">Industry</span>
                      <span className="text-sm text-slate-900 truncate ml-2">{extractIndustry(todo.description)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">Location</span>
                      <span className="text-sm text-slate-900 truncate ml-2">{extractLocation(todo.description)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">No. of Vacancies</span>
                      <span className="text-sm text-slate-900 truncate ml-2">{extractVacancies(todo.description)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row - Job Description and Position Details */}
              <div className="flex flex-row gap-6">
                {/* Job Description - 80% width */}
                <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200" style={{flex: '0 0 75%'}}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Description</h2>
                  
                  <div className="space-y-6">
                    {(() => {
                      if (!todo.description) {
                        return (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                              <FileText className="text-slate-400" size={20} />
                            </div>
                            <p className="text-slate-500 italic">No description provided for this task.</p>
                          </div>
                        );
                      }

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

                      const content = filteredLines.join('\n').trim();
                      
                      if (!content) {
                        return (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                              <FileText className="text-slate-400" size={20} />
                            </div>
                            <p className="text-slate-500 italic">No description provided for this task.</p>
                          </div>
                        );
                      }

                      const sections = content.split('\n\n');
                      
                      return (
                        <div className="space-y-6">
                          {sections.map((section, idx) => {
                            const sectionLines = section.split('\n');
                            const heading = sectionLines[0];
                            const items = sectionLines.slice(1);
                            const isList = items.some(line => line.trim().startsWith('•') || line.trim().startsWith('-'));

                            return (
                              <div key={idx} className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <h3 className="font-semibold text-slate-900 mb-4 text-base md:text-lg leading-tight">
      {heading}
    </h3>
    {isList ? (
      <ul className="space-y-3 pl-5">
        {items.filter(item => item.trim()).map((item, i) => (
          <li key={i} className="text-slate-600 text-sm md:text-base flex items-start gap-3 leading-relaxed">
            <span className="inline-block w-2 h-2 mt-2 bg-blue-600 rounded-full shrink-0"></span>
            <span className="flex-1">{item.replace(/^[•\-]\s*/, '').trim()}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-slate-600 text-sm md:text-base leading-relaxed">
        {items.join(' ').trim()}
      </p>
    )}
  </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Position Details - 20% width */}
                {/* <div className="flex-1 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 h-120" style={{flex: '0 0 23%'}}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Position Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col ">
                      <span className="text-sm font-bold text-slate-700">Designation</span>
                      <span className="text-sm text-slate-900">{extractDesignation(todo.description)}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">Department</span>
                      <span className="text-sm text-slate-900">{extractDepartment(todo.description)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Team</span>
                      <span className="text-sm text-slate-900">{extractTeam(todo.description)}</span>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }