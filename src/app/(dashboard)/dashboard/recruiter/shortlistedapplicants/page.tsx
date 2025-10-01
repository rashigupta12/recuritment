/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { frappeAPI } from '@/lib/api/frappeClient';
import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable'; // Adjust path if needed
import { Search } from 'lucide-react';

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

export default function ShortlistedApplicantsPage() {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [assessmentSuccess, setAssessmentSuccess] = useState<string | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [scheduledOn, setScheduledOn] = useState<string>('');
  const [fromTime, setFromTime] = useState<string>('');
  const [toTime, setToTime] = useState<string>('');
  const [assessmentLink, setAssessmentLink] = useState<string>('');
  const [assessmentRound, setAssessmentRound] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        setUserEmail(email);

        // Fetch list of applicants
        const response = await frappeAPI.getAllApplicants(email);
        const result: ApiResponse = response;

        if (!result.data || result.data.length === 0) {
          setApplicants([]);
          setFilteredApplicants([]);
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
        setFilteredApplicants(detailedApplicants);
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

  // Handle search filter
  useEffect(() => {
    let filtered = applicants;

    // Apply search filter by job_title and applicant_name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (applicant) =>
          (applicant.job_title?.toLowerCase().includes(query) || false) ||
          (applicant.applicant_name?.toLowerCase().includes(query) || false)||
          (applicant.email_id?.toLowerCase().includes(query) || false)
      );
    }

    setFilteredApplicants(filtered);
  }, [applicants, searchQuery]);

  // Handler for checkbox changes
  const handleCheckboxChange = (applicantId: string) => {
    setSelectedApplicants((prev) => {
      const newSelected = [...prev];
      const index = newSelected.indexOf(applicantId);
      if (index > -1) {
        newSelected.splice(index, 1);
      } else {
        newSelected.push(applicantId);
      }
      return newSelected;
    });
  };

  // Handler for select all
  const handleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicants.map((applicant) => applicant.name));
    }
  };

  // Handler to open the assessment modal
  const handleOpenAssessmentModal = () => {
    if (selectedApplicants.length === 0) {
      setAssessmentError('Please select at least one applicant to start the assessment.');
      setAssessmentSuccess(null);
      return;
    }
    setIsAssessmentModalOpen(true);
    setModalError(null);
  };

  // Handler to close the assessment modal
  const handleCloseAssessmentModal = () => {
    setIsAssessmentModalOpen(false);
    setScheduledOn('');
    setFromTime('');
    setToTime('');
    setAssessmentLink('');
    setAssessmentRound('');
    setModalError(null);
  };

  // Handler to open the status update modal
  const handleOpenStatusModal = () => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select at least one applicant.');
      return;
    }
    setIsStatusModalOpen(true);
    setSelectedStatus('');
    setModalError(null);
  };

  // Handler to close the status modal
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedStatus('');
    setModalError(null);
  };

  // Handler for starting assessment
  const handleStartAssessment = async () => {
    if (!scheduledOn || !fromTime || !toTime || !assessmentLink || !assessmentRound) {
      setModalError('Please fill in all assessment details.');
      return;
    }

    // Validate time: from_time should be before to_time
    const fromTimeDate = new Date(`${fromTime}`);
    const toTimeDate = new Date(`${toTime}`);
    if (fromTimeDate >= toTimeDate) {
      setModalError('From time must be earlier than to time.');
      return;
    }

    try {
      setAssessmentError(null);
      setAssessmentSuccess(null);

      // Prepare the payload for the Assessment API
      const payload = {
        applicants: selectedApplicants,
        scheduled_on: scheduledOn,
        from_time: fromTime,
        to_time: toTime,
        assessment_link: assessmentLink,
        assessment_round: assessmentRound,
      };

      // Use frappeAPI.createbulkAssemnet to create the assessment
      const response = await frappeAPI.createbulkAssessment(payload);

      console.log('API Response:', response);

      if (!response) {
        throw new Error('No response received from the API.');
      }

      // Handle different possible response structures
      let assessmentIds: string;
      if (response.message?.created_assessments && Array.isArray(response.message.created_assessments)) {
        assessmentIds = response.message.created_assessments.join(', ');
      } else if (response.message?.name) {
        assessmentIds = response.message.name;
      } else if (response.name) {
        assessmentIds = response.name;
      } else if (response.data && (response.data.name || response.data.id)) {
        assessmentIds = response.data.name || response.data.id;
      } else {
        throw new Error('Invalid response structure: Missing assessment ID(s).');
      }

      setAssessmentSuccess(`Assessment(s) created successfully with ID(s): ${assessmentIds}`);
      toast.success(`Assessment(s) created successfully with ID(s): ${assessmentIds}`);

      // Close the modal
      setIsAssessmentModalOpen(false);

      // Clear selected applicants and form fields
      setSelectedApplicants([]);
      setScheduledOn('');
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
      setIsAssessmentModalOpen(false);
    }
  };

  // Handler for confirming status change
  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) {
      setModalError('Please select a status.');
      return;
    }
    if (!userEmail) {
      toast.error('User email not found. Please log in again.');
      setIsAuthenticated(false);
      setIsStatusModalOpen(false);
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      console.log('Selected applicants for status update:', selectedApplicants);
      const failedUpdates: string[] = [];
      for (const name of selectedApplicants) {
        if (!name) {
          console.warn('Skipping update: name is undefined or empty');
          failedUpdates.push('Unknown (missing name)');
          continue;
        }
        try {
          console.log(`Sending PUT request to update status for ${name} to ${selectedStatus}`);
          await frappeAPI.updateApplicantStatus(name, { status: selectedStatus });
        } catch (err: any) {
          console.error(`Failed to update status for ${name}:`, err);
          if (err?.exc_type === 'DoesNotExistError' || err.response?.status === 404) {
            failedUpdates.push(name);
          } else {
            throw err; // Rethrow other errors
          }
        }
      }

      // Refresh applicants list
      const response = await frappeAPI.getAllApplicants(userEmail);
      const result: ApiResponse = response;
      console.log('getAllApplicants refresh response:', result.data);
      const detailedApplicants: JobApplicant[] = [];
      for (const applicant of result.data) {
        try {
          const detailResponse = await frappeAPI.getApplicantBYId(applicant.name);
          const detail: ApplicantDetailResponse = detailResponse;
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
      setFilteredApplicants(detailedApplicants);
      setSelectedApplicants([]);
      setSelectedStatus('');
      setIsStatusModalOpen(false);

      if (failedUpdates.length > 0) {
        toast.warning(
          `Status updated for some applicants. Failed for: ${failedUpdates.join(', ')}. Applicant records may not exist or the endpoint may be incorrect.`
        );
      } else {
        toast.success('Applicant status updated successfully.');
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      let errorMessage = 'Failed to update applicant statuses.';
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Session expired or insufficient permissions. Please log in again.';
        setIsAuthenticated(false);
        router.push('/login');
      } else if (err.response?.status === 404 || err?.exc_type === 'DoesNotExistError') {
        errorMessage = 'Job Applicant resource not found. Please verify the API endpoint or contact support.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      setIsStatusModalOpen(false);
    } finally {
      setLoading(false);
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
          <div className="flex items-center gap-4">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  selectedApplicants.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleOpenStatusModal}
                disabled={selectedApplicants.length === 0}
              >
                Update Status
              </button>
              <button
                onClick={handleOpenAssessmentModal}
                disabled={selectedApplicants.length === 0}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  selectedApplicants.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Create Assessment
              </button>
            </div>
          </div>
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
        {filteredApplicants.length === 0 ? (
          <p className="text-center text-gray-600">No shortlisted applicants found.</p>
        ) : (
          <ApplicantsTable
            applicants={filteredApplicants}
            selectedApplicants={selectedApplicants}
            onSelectApplicant={handleCheckboxChange}
            showCheckboxes={true}
            showStatus={false}
          />
        )}
      </div>

      {/* Assessment Modal */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="assessment-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 id="assessment-modal-title" className="text-2xl font-bold text-gray-800 mb-4">Assessment Details</h2>
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
                onClick={handleCloseAssessmentModal}
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

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 id="status-modal-title" className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Status Change
            </h2>
            {modalError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-center">
                <p>{modalError}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Select New Status</label>
              <select
                className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Open">Open</option>
                <option value="Assessment Stage">Assessment Stage</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
                <option value="Hired">Hired</option>
              </select>
            </div>
            <p className="text-gray-600 mb-4">
              {selectedStatus
                ? `You are about to change the status of the following applicants to ${selectedStatus}:`
                : 'Selected Applicants:'}
            </p>
            <ul className="list-disc list-inside mb-4">
              {selectedApplicants.map((name) => {
                const applicant = applicants.find((a) => a.name === name);
                return (
                  <li key={name} className="text-gray-600 flex justify-between">
                    <span>{applicant?.applicant_name || name}</span>
                    <span>{applicant?.email_id}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseStatusModal}
                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
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