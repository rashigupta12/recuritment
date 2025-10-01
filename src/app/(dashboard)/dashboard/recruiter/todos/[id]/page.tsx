'use client';

import { TodoDetailModal } from "@/components/recruiter/TodoDetailModal";
import ApplicantForm from "@/components/recruiter/ApplicantForm";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { frappeAPI } from "@/lib/api/frappeClient";
import TaggedApplicants from "@/components/recruiter/TaggedApplicants";
import MultipleApplicantsForm from "@/components/recruiter/MultipleApplicantsForm";

interface TodoData {
  name: string;
  custom_job_id?: string;
  description?: string;
  owner_email: string;
}

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const todoId = params.id as string;
  const [activeTab, setActiveTab] = useState<'details' | 'applicants' | 'resume'>('details');
  const [jobId, setJobId] = useState<string>('');
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ New state for refresh

  const handleClose = () => {
    router.back();
  };

  // ✅ New function to trigger refresh
  const handleFormSubmitSuccess = () => {
    console.log('🔄 Refreshing applicants list...');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchTodoDetails = async () => {
      try {
        setLoading(true);
        const todoDetails = await frappeAPI.getTodoBYId(todoId);
        const todo = todoDetails.data;

        setTodoData(todo);
        if (todo.custom_job_id) {
          setJobId(todo.custom_job_id);
        } else {
          console.warn('No job ID found for this todo');
          setJobId('');
        }
      } catch (error) {
        console.error('Error fetching todo details:', error);
        setJobId('');
      } finally {
        setLoading(false);
      }
    };

    if (todoId) {
      fetchTodoDetails();
    }
  }, [todoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4 py-3">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${activeTab === 'details'
                  ? "bg-blue-100 text-primary border border-primary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Task Details
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${activeTab === 'applicants'
                  ? "bg-blue-100 text-primary border border-primary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Tagged Applicants
            </button>
            {/* <button
              onClick={() => setActiveTab('resume')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${activeTab === 'resume'
                  ? "bg-blue-100 text-primary border border-primary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Resume Application
            </button> */}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'details' && (
          <TodoDetailModal
            todoId={todoId}
            onClose={handleClose}
          />
        )}

        {activeTab === 'applicants' && (
          <div className="space-y-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-4"></h1>
            {jobId && todoData ? (
              <>
                <MultipleApplicantsForm
                  initialJobId={jobId}
                  onFormSubmitSuccess={handleFormSubmitSuccess} // ✅ Pass callback
                />
                <TaggedApplicants
                  jobId={jobId}
                  ownerEmail={todoData.owner_email || 'recruiter@gennextit.com'}
                  todoData={todoData}
                  refreshTrigger={refreshTrigger} // ✅ Pass refresh trigger
                />
              </>
            ) : (
              <p className="text-red-500">
                Loading todo details or job ID not found.
              </p>
            )}
          </div>
        )}

        {activeTab === 'resume' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Job Application Form</h1>
              <p className="text-gray-600 mt-2">
                Applying for Job ID:
                {jobId ? (
                  <span className="font-semibold text-blue-600 ml-2">{jobId}</span>
                ) : (
                  <span className="text-red-500 ml-2">Job ID not available</span>
                )}
              </p>
            </div>

            {jobId ? (
              <ApplicantForm
                initialJobId={jobId}
                todoData={todoData}
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800">
                  Job ID not available for this task. Please check the task details.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}