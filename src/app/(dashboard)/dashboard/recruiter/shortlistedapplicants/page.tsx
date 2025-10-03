/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { frappeAPI } from '@/lib/api/frappeClient';
import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable'; // Adjust path if needed
import { Search, User, Award, X } from 'lucide-react';

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
          (applicant.applicant_name?.toLowerCase().includes(query) || false) ||
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

      // Use frappeAPI.createbulkAssessment to create the assessment
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

  // Helper function for status colors (needed for the updated modal UI)
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'assessment stage':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hired':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md min-h-0 shadow-2xl transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h2 id="status-modal-title" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Confirm Status Change
              </h2>
              <button
                onClick={handleCloseStatusModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <X className="h-3 w-3" />
                <p className="text-xs">{modalError}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Select New Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Select status"
              >
                <option value="" disabled>Select a status...</option>
                <option value="Open">Open</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Assessment Stage">Assessment Stage</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
                <option value="Hired">Hired</option>
              </select>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 font-medium mb-2 text-sm">Selected Applicants ({selectedApplicants.length})</p>
              <div className="space-y-2">
                {selectedApplicants.map((name) => {
                  const applicant = applicants.find((a) => a.name === name);
                  return (
                    <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{applicant?.applicant_name || name}</p>
                          <p className="text-xs text-gray-500">{applicant?.email_id}</p>
                        </div>
                      </div>
                      {selectedStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStatus)}`}>
                          {selectedStatus}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleCloseStatusModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={!selectedStatus}
                className="px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                aria-label="Confirm status change"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}