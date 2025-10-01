/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { frappeAPI } from '@/lib/api/frappeClient';
import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable';
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

export default function ViewApplicantPage() {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>([]); // New state for filtered applicants
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search query
  const [statusFilter, setStatusFilter] = useState<string>('all'); // State for status filter
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
        console.log('getAllApplicants response:', result.data);

        if (!result.data || result.data.length === 0) {
          setApplicants([]);
          setFilteredApplicants([]);
          return;
        }

        // Fetch details for each applicant
        const detailedApplicants: JobApplicant[] = [];
        const usedNames = new Set<string>();
        for (const applicant of result.data) {
          if (!applicant.name) {
            console.warn('Skipping applicant with missing name:', applicant);
            continue;
          }
          // Ensure unique name
          let uniqueName = applicant.name;
          let suffix = 1;
          while (usedNames.has(uniqueName)) {
            uniqueName = `${applicant.name}-${suffix}`;
            suffix++;
          }
          usedNames.add(uniqueName);

          try {
            const detailResponse = await frappeAPI.getApplicantBYId(applicant.name);
            const detail: ApplicantDetailResponse = detailResponse;
            console.log(`Details for ${applicant.name}:`, detail.data);
            detailedApplicants.push({
              ...detail.data,
              name: uniqueName, // Use unique name to avoid duplicates
            });
          } catch (detailErr: any) {
            console.error(`Error fetching details for ${applicant.name}:`, detailErr);
            if (detailErr?.exc_type === 'DoesNotExistError' || detailErr.response?.status === 404) {
              console.warn(`Applicant ${applicant.name} not found in Frappe database`);
              detailedApplicants.push({
                ...applicant,
                name: uniqueName, // Use unique name
                applicant_name: applicant.applicant_name || 'N/A',
                status: applicant.status || 'N/A',
              });
            } else {
              detailedApplicants.push({
                ...applicant,
                name: uniqueName, // Use unique name
                applicant_name: 'Error fetching details',
              });
            }
          }
        }

        // Check for duplicate names
        const nameCounts = detailedApplicants.reduce((acc, curr) => {
          acc[curr.name] = (acc[curr.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('Name counts:', nameCounts);
        if (Object.values(nameCounts).some((count) => count > 1)) {
          console.error('Duplicate names detected:', nameCounts);
        }

        setApplicants(detailedApplicants);
        setFilteredApplicants(detailedApplicants); // Initialize filtered applicants
      } catch (err: any) {
        console.error('Fetch error:', err);
        let errorMessage = 'An error occurred while fetching applicants.';
        if (err.message.includes('Session expired') || err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = 'Session expired. Please log in again.';
          setIsAuthenticated(false);
          router.push('/login');
        } else if (err.response?.status === 404 || err?.exc_type === 'DoesNotExistError') {
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

  // Handle search and status filter
  useEffect(() => {
    let filtered = applicants;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (applicant) =>
          applicant.applicant_name?.toLowerCase().includes(query) ||
          applicant.email_id?.toLowerCase().includes(query) ||
          applicant.job_title?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (applicant) => applicant.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredApplicants(filtered);
  }, [applicants, searchQuery, statusFilter]);

  // Handle checkbox selection
  const handleSelectApplicant = (name: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(name)
        ? prev.filter((id) => id !== name)
        : [...prev, name]
    );
  };

  // Handle opening the confirmation modal
  const handleChangeStatus = () => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select at least one applicant.');
      return;
    }
    setIsModalOpen(true);
    setSelectedStatus(''); // Reset status in modal
    setModalError(null);
  };

  // Handle confirming the status change
  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) {
      setModalError('Please select a status.');
      return;
    }
    if (!userEmail) {
      toast.error('User email not found. Please log in again.');
      setIsAuthenticated(false);
      setIsModalOpen(false);
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
      const usedNames = new Set<string>();
      for (const applicant of result.data) {
        if (!applicant.name) {
          console.warn('Skipping applicant with missing name:', applicant);
          continue;
        }
        // Ensure unique name
        let uniqueName = applicant.name;
        let suffix = 1;
        while (usedNames.has(uniqueName)) {
          uniqueName = `${applicant.name}-${suffix}`;
          suffix++;
        }
        usedNames.add(uniqueName);

        try {
          const detailResponse = await frappeAPI.getApplicantBYId(applicant.name);
          const detail: ApplicantDetailResponse = detailResponse;
          console.log(`Details for ${applicant.name} (refresh):`, detail.data);
          detailedApplicants.push({
            ...detail.data,
            name: uniqueName, // Use unique name
          });
        } catch (detailErr: any) {
          console.error(`Error fetching details for ${applicant.name}:`, detailErr);
          if (detailErr?.exc_type === 'DoesNotExistError' || detailErr.response?.status === 404) {
            console.warn(`Applicant ${applicant.name} not found in Frappe database`);
            detailedApplicants.push({
              ...applicant,
              name: uniqueName, // Use unique name
              applicant_name: applicant.applicant_name || 'N/A',
              status: applicant.status || 'N/A',
            });
          } else {
            detailedApplicants.push({
              ...applicant,
              name: uniqueName, // Use unique name
              applicant_name: 'Error fetching details',
            });
          }
        }
      }

      // Check for duplicate names after refresh
      const nameCounts = detailedApplicants.reduce((acc, curr) => {
        acc[curr.name] = (acc[curr.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Name counts after refresh:', nameCounts);
      if (Object.values(nameCounts).some((count) => count > 1)) {
        console.error('Duplicate names detected after refresh:', nameCounts);
      }

      setApplicants(detailedApplicants);
      setFilteredApplicants(detailedApplicants); // Reset filtered applicants
      setSelectedApplicants([]);
      setSelectedStatus('');
      setIsModalOpen(false); // Close the modal

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
      setIsModalOpen(false); // Close the modal on error
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStatus('');
    setModalError(null);
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
          <h1 className="text-3xl font-bold text-gray-800">Job Applicants</h1>
          <div className="flex items-center gap-4">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="all">All</option>
                <option value="Open">Open</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Assessment Stage">Assessment Stage</option>
                <option value="Interview Stage">Interview Stage</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                onClick={handleChangeStatus}
                disabled={selectedApplicants.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
              >
                Update Status
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
        {filteredApplicants.length === 0 ? (
          <p className="text-center text-gray-600">No applicants found.</p>
        ) : (
          <ApplicantsTable
            applicants={filteredApplicants}
            selectedApplicants={selectedApplicants}
            onSelectApplicant={handleSelectApplicant}
            showCheckboxes={true}
            showStatus={true}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mb-4">
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
                <option value="Shortlisted">Shortlisted</option>
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
                    {/* <span>{applicant?.job_title || 'N/A'}</span> */}
                    <span>{applicant?.email_id}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
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