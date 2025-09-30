/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { frappeAPI } from '@/lib/api/frappeClient';
import { ShortlistedApplicantsTable } from '@/components/recruiter/ShortlistedApplicantsTable';
export interface JobApplicant {
  name: string;
  applicant_name?: string;
  email_id?: string;
  phone_number?: string;
  country?: string;
  job_title?: string;
  designation?: string;
  status?: string;
  resume_attachment?: string;
  custom_experience?: Array<{
    company_name: string;
    designation: string;
    start_date: string;
    end_date: string;
    current_company: number;
  }>;
  custom_education?: Array<{
    degree: string;
    specialization: string;
    institution: string;
    year_of_passing: number;
    percentagecgpa: number;
  }>;
}

interface ApiResponse {
  data: JobApplicant[];
}

interface ApplicantDetailResponse {
  data: JobApplicant;
}

interface AssessmentResponse {
  message?: {
    status?: string;
    created_assessments?: string[];
    name?: string;
  };
  name?: string;
  data?: {
    name?: string;
    id?: string;
  };
}

export default function ViewApplicantPage() {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [assessmentSuccess, setAssessmentSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [scheduledOn, setScheduledOn] = useState<string>('');
  const [fromTime, setFromTime] = useState<string>('');
  const [toTime, setToTime] = useState<string>('');
  const [assessmentLink, setAssessmentLink] = useState<string>('');
  const [assessmentRound, setAssessmentRound] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchApplicants = async () => {
      try {
        setLoading(true);

        // Check user session
        const session = await frappeAPI.checkSession();
        if (!session.authenticated || !session.user?.email) {
          setError('Please log in to view applicants.');
          setIsAuthenticated(false);
          router.push('/login');
          return;
        }

        setIsAuthenticated(true);
        const email = session.user.email;

        // Fetch list of applicants
        const response = await frappeAPI.getAllApplicants(email);
        const result: ApiResponse = response;

        if (!result.data || result.data.length === 0) {
          setApplicants([]);
          return;
        }

        // Fetch details for each applicant and filter for shortlisted status
        const detailedApplicants: JobApplicant[] = [];
        for (const applicant of result.data) {
          try {
            const detailResponse = await frappeAPI.getApplicantBYId(applicant.name);
            const detail: ApplicantDetailResponse = detailResponse;
            // Only include applicants with status "shortlisted" (case-insensitive)
            if (detail.data.status?.toLowerCase() === 'shortlisted') {
              detailedApplicants.push(detail.data);
            }
          } catch (detailErr: any) {
            console.error(`Error fetching details for ${applicant.name}:`, detailErr);
            if (applicant.status?.toLowerCase() === 'shortlisted') {
              detailedApplicants.push({
                ...applicant,
                applicant_name: 'Error fetching details',
              });
            }
          }
        }

        setApplicants(detailedApplicants);
      } catch (err: any) {
        console.error('Fetch error:', err);
        let errorMessage = 'An error occurred while fetching applicants.';
        if (err.message.includes('Session expired') || err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = 'Session expired. Please log in again.';
          setIsAuthenticated(false);
          router.push('/login');
        } else if (err.response?.status === 404) {
          errorMessage = 'Job Applicant resource not found. Please verify the API endpoint or contact support.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchApplicants();
  }, [router]);

  // Handlers for view and edit actions


  // Handler for checkbox changes
  const handleCheckboxChange = (applicantId: string) => {
    setSelectedApplicants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(applicantId)) {
        newSet.delete(applicantId);
      } else {
        newSet.add(applicantId);
      }
      return newSet;
    });
  };

  // Handler for select all
  const handleSelectAll = () => {
    if (selectedApplicants.size === applicants.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(applicants.map((applicant) => applicant.name)));
    }
  };

  // Handler to open the modal
  const handleOpenModal = () => {
    if (selectedApplicants.size === 0) {
      setAssessmentError('Please select at least one applicant to start the assessment.');
      setAssessmentSuccess(null);
      return;
    }
    setIsModalOpen(true);
    setModalError(null);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setScheduledOn('2025-09-29');
    setFromTime('');
    setToTime('');
    setAssessmentLink('');
    setAssessmentRound('');
    setModalError(null);
  };

  // Handler for starting assessment
  const handleStartAssessment = async () => {
    if (!scheduledOn || !fromTime || !toTime || !assessmentLink || !assessmentRound) {
      setModalError('Please fill in all assessment details.');
      return;
    }

    // Validate time: from_time should be before to_time
    const fromTimeDate = new Date(`2025-09-29T${fromTime}`);
    const toTimeDate = new Date(`2025-09-29T${toTime}`);
    if (fromTimeDate >= toTimeDate) {
      setModalError('From time must be earlier than to time.');
      return;
    }

    try {
      setAssessmentError(null);
      setAssessmentSuccess(null);

      // Prepare the payload for the Assessment API
      const payload = {
        applicants: Array.from(selectedApplicants),
        scheduled_on: scheduledOn,
        from_time: fromTime,
        to_time: toTime,
        assessment_link: assessmentLink,
        assessment_round: assessmentRound,
      };

      // Use frappeAPI.createbulkAssemnet to create the assessment
      const response = await frappeAPI.createbulkAssemnet(payload);

      console.log('API Response:', response);

      if (!response) {
        throw new Error('No response received from the API.');
      }

      // Handle different possible response structures
      let assessmentIds: string;
      if (response.message?.created_assessments && Array.isArray(response.message.created_assessments)) {
        // Handle { message: { status: "success", created_assessments: string[] } }
        assessmentIds = response.message.created_assessments.join(', ');
      } else if (response.message?.name) {
        // Fallback: { message: { name: string } }
        assessmentIds = response.message.name;
      } else if (response.name) {
        // Fallback: { name: string }
        assessmentIds = response.name;
      } else if (response.data && (response.data.name || response.data.id)) {
        // Fallback: { data: { name: string } } or { data: { id: string } }
        assessmentIds = response.data.name || response.data.id;
      } else {
        throw new Error('Invalid response structure: Missing assessment ID(s).');
      }

      setAssessmentSuccess(`Assessment(s) created successfully with ID(s): ${assessmentIds}`);
      toast.success(`Assessment(s) created successfully with ID(s): ${assessmentIds}`);

      // Close the modal
      setIsModalOpen(false);

      // Clear selected applicants and form fields
      setSelectedApplicants(new Set());
      setScheduledOn('2025-09-29');
      setFromTime('');
      setToTime('');
      setAssessmentLink('');
      setAssessmentRound('');
    } catch (err: any) {
      console.error('Assessment creation error:', {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        rawResponse: err.response,
      });
      let errorMessage = 'Failed to create assessment. Please try again or contact support.';
      if (err.message.includes('Missing assessment ID')) {
        errorMessage = 'Invalid response from API: Missing assessment ID(s). Please contact support.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Assessment API endpoint not found. Please verify the Frappe method or contact support.';
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Unauthorized access. Please log in again.';
        router.push('/login');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setAssessmentError(errorMessage);
      toast.error(errorMessage);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-red-600">
          Please log in to view applicants.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Shortlisted Job Applicants
          </h1>
          <button
            onClick={handleOpenModal}
            disabled={selectedApplicants.size === 0}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              selectedApplicants.size === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Create Assessment
          </button>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            <p>{error}</p>
            {error.includes('not found') && (
              <p className="mt-2 text-sm">
                Possible issues:
                <ul className="list-disc list-inside">
                  <li>Verify the Frappe API base URL in your environment variables.</li>
                  <li>Ensure the Job Applicant resource exists in your Frappe system.</li>
                  <li>Contact your system administrator for API access details.</li>
                </ul>
              </p>
            )}
          </div>
        )}
        {assessmentError && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            <p>{assessmentError}</p>
          </div>
        )}
        {assessmentSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            <p>{assessmentSuccess}</p>
          </div>
        )}
        {applicants.length === 0 ? (
          <p className="text-center text-gray-600">No shortlisted applicants found.</p>
        ) : (
          <ShortlistedApplicantsTable
            applicants={applicants}
           
            selectedApplicants={selectedApplicants}
            onCheckboxChange={handleCheckboxChange}
            onSelectAll={handleSelectAll}
          />
        )}
      </div>

      {/* Modal for assessment details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mb-4">Assessment Details</h2>
            {modalError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-center">
                <p>{modalError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <label>Date of assessment</label>
              <input
                type="date"
                value={scheduledOn}
                onChange={(e) => setScheduledOn(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scheduled Date"
                required
                min="2025-09-29"
              />
              <label>Start Time</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From Time"
                required
              />
              <label>End Time</label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To Time"
                required
              />
              <input
                type="url"
                value={assessmentLink}
                onChange={(e) => setAssessmentLink(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assessment Link"
                required
              />
              <input
                type="text"
                value={assessmentRound}
                onChange={(e) => setAssessmentRound(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assessment Round"
                required
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAssessment}
                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}