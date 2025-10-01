'use client';

import { TodoDetailModal } from "@/components/recruiter/TodoDetailModal";
import ApplicantForm from "@/components/recruiter/ApplicantForm";
// import TaggedApplicants from "@/components/recruiter/TaggedApplicants"; // 👈 add this import
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { frappeAPI } from "@/lib/api/frappeClient";
import TaggedApplicants from "@/components/recruiter/TaggedApplicants";

interface TodoData {
  name: string;
  custom_job_id?: string;
  description?: string;
  owner_email: string;
  // other todo fields
}

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const todoId = params.id as string;
  const [activeTab, setActiveTab] = useState<'details' | 'applicants' | 'resume'>('details');
  const [jobId, setJobId] = useState<string>('');
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    router.back();
  };

  // Fetch todo details
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Task Details
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applicants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tagged Applicants
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resume'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resume Application
            </button>
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

        {/* {activeTab === 'applicants' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tagged Applicants</h1>
            {jobId ? (
              // <TaggedApplicants jobId={jobId} />

              // tagged applicants component को यहाँ uncomment करें जब available हो
              <TaggedApplicants jobId={jobId} ownerEmail={todoData?.owner_email|| 'recruiter@gennextit.com'} />
            ) : (
              <p className="text-red-500">No job ID found, cannot fetch applicants.</p>
            )}
          </div>
        )} */}
{activeTab === 'applicants' && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Tagged Applicants</h1>
    {jobId && todoData ? (
      <TaggedApplicants
        jobId={jobId}
        ownerEmail={todoData.owner_email } // safe now
      />
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
