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
  // custom_education?: Array<{
  //   degree: string;
  //   specialization: string;
  //   institution: string;
  //   year_of_passing: number;
  //   percentagecgpa: number;
  // }>;
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

  // const fetchApplicantsData = async (email: string) => {
  //   const response = await frappeAPI.getAllApplicants(email);
  //   const result: ApiResponse = response;
  //   console.log('getAllApplicants response:', result.data);

  //       if (!result.data || result.data.length === 0) {
  //         setApplicants([]);
  //         setFilteredApplicants([]);
  //         return;
  //       }

  //   const detailedApplicants: JobApplicant[] = [];
  //   const usedNames = new Set<string>();
    
  //   for (const applicant of result.data) {
  //     if (!applicant.name) {
  //       console.warn('Skipping applicant with missing name:', applicant);
  //       continue;
  //     }
      
  //     let uniqueName = applicant.name;
  //     let suffix = 1;
  //     while (usedNames.has(uniqueName)) {
  //       uniqueName = `${applicant.name}-${suffix}`;
  //       suffix++;
  //     }
  //     usedNames.add(uniqueName);

  //     try {
  //       const detailResponse = await frappeAPI.getApplicantBYId(applicant.name);
  //       const detail: ApplicantDetailResponse = detailResponse;
  //       detailedApplicants.push({
  //         ...detail.data,
  //         name: uniqueName,
  //       });
  //     } catch (detailErr: any) {
  //       console.error(`Error fetching details for ${applicant.name}:`, detailErr);
  //       if (detailErr?.exc_type === 'DoesNotExistError' || detailErr.response?.status === 404) {
  //         detailedApplicants.push({
  //           ...applicant,
  //           name: uniqueName,
  //           applicant_name: applicant.applicant_name || 'N/A',
  //           status: applicant.status || 'N/A',
  //         });
  //       } else {
  //         detailedApplicants.push({
  //           ...applicant,
  //           name: uniqueName,
  //           applicant_name: 'Error fetching details',
  //         });
  //       }
  //     }
  //   }

  //   return detailedApplicants;
  // };
// ✅ Better: Parallel API calls
// const fetchApplicantsData = async (email: string) => {
//   const response = await frappeAPI.getAllApplicants(email);
//   const result: ApiResponse = response;

//   // Create all promises at once
//   const detailPromises = result.data.map(applicant => 
//     frappeAPI.getApplicantBYId(applicant.name).catch(error => {
//       console.error(`Error fetching ${applicant.name}:`, error);
//       return { data: applicant }; // Fallback to basic data
//     })
//   );

//   // Execute all in parallel
//   const detailResults = await Promise.all(detailPromises);
//   return detailResults.map(result => result.data);
// };


const fetchApplicantsData = async (email: string) => {
  const response = await frappeAPI.getAllApplicants(email);
  const result: ApiResponse = response;
  console.log('All applicants with full details:', result.data);
  
  // All data is already here - no need for individual detail calls!
  return result.data || [];
};
  useEffect(() => {
    const checkAuthAndFetchApplicants = async () => {
      try {
        setLoading(true);

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

        const detailedApplicants = await fetchApplicantsData(email);
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
      prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]
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
      const failedUpdates: string[] = [];
      
      for (const name of selectedApplicants) {
        if (!name) {
          failedUpdates.push('Unknown (missing name)');
          continue;
        }
        try {
          await frappeAPI.updateApplicantStatus(name, { status: selectedStatus });
        } catch (err: any) {
          console.error(`Failed to update status for ${name}:`, err);
          if (err?.exc_type === 'DoesNotExistError' || err.response?.status === 404) {
            failedUpdates.push(name);
          } else {
            throw err;
          }
        }
      }

      const detailedApplicants = await fetchApplicantsData(userEmail);
      setApplicants(detailedApplicants);
      setFilteredApplicants(detailedApplicants); // Reset filtered applicants
      setSelectedApplicants([]);
      setSelectedStatus('');
      setIsModalOpen(false); // Close the modal

      if (failedUpdates.length > 0) {
        toast.warning(
          `Status updated for some applicants. Failed for: ${failedUpdates.join(', ')}.`
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view applicants.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'assessment stage':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusCounts = applicants.reduce((acc, curr) => {
    const status = curr.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Applicants</h1>
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
<<<<<<< HEAD
                <option value="" disabled>Select status...</option>
                <option value="all">All Status</option>
=======
                <option value="all">All</option>
>>>>>>> rashi2.0
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
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-700 mb-3">{error}</p>
                {error.includes('not found') && (
                  <div className="mt-3 text-sm text-red-600">
                    <p className="font-medium mb-2">Possible issues:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Verify the Frappe API base URL in your environment variables</li>
                      <li>Ensure the Job Applicant resource exists in your Frappe system</li>
                      <li>Contact your system administrator for API access details</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
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
<<<<<<< HEAD
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md min-h-0 shadow-2xl transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Confirm Status Change
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
=======
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Status Change
            </h2>
>>>>>>> rashi2.0
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
<<<<<<< HEAD
                 <option value="" disabled>Select a status...</option>
=======
                <option value="">Select Status</option>
>>>>>>> rashi2.0
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
<<<<<<< HEAD
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
          <div className="bg-white rounded-2xl p-4 w-full max-w-xl min-h-0 shadow-2xl transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h2 id="details-modal-title" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Applicant Profile
              </h2>
              <button
                onClick={handleCloseDetailsModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 mb-4 border border-blue-100 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{selectedApplicant.applicant_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedApplicant.job_title || selectedApplicant.designation || 'N/A'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedApplicant.status)} border shadow-sm`}>
                  {selectedApplicant.status || 'N/A'}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{selectedApplicant.email_id || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{selectedApplicant.phone_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Country</p>
                  <p className="text-sm text-gray-900">{selectedApplicant.country || 'N/A'}</p>
                </div>
              </div>
             <div className="p-2 flex gap-10 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
  <div className="flex items-center gap-2 mb-1">
    <FileText className="h-4 w-4 text-gray-500" />
    <h4 className="text-sm font-semibold text-gray-700">Resume</h4>
  </div>
  {selectedApplicant?.resume_attachment ? (
    <a
      href={
        selectedApplicant.resume_attachment.startsWith('http')
          ? selectedApplicant.resume_attachment
          : `https://recruiter.gennextit.com/files/${selectedApplicant.resume_attachment.replace(/^\/files\//, '')}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all text-xs font-medium shadow-md"
    >
      View
    </a>
  ) : (
    <p className="text-gray-500 text-xs italic">No resume attached</p>
  )}
</div>
            </div>

            {/* Experience Section */}
            <div className="mb-4">
              <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-gray-600" />
                Experience
              </h4>
              {selectedApplicant.custom_experience && selectedApplicant.custom_experience.length > 0 ? (
                <div className="space-y-2">
                  {selectedApplicant.custom_experience.slice(0, 1).map((exp, index) => ( // Limit to 1 for narrower width
                    <div key={index} className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-sm font-semibold text-gray-900">{exp.company_name}</h5>
                        <span className={`px-1 py-1 rounded-full text-xs font-medium ${
                          exp.current_company ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        } shadow-sm`}>
                          {exp.current_company ? 'Current' : 'Past'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{exp.designation}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* {selectedApplicant.custom_experience.length > 1 && (
                    <p className="text-xs text-gray-500">+{selectedApplicant.custom_experience.length - 1} more...</p>
                  )} */}
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-center shadow-sm">
                  <p className="text-gray-500 text-xs italic">No experience available</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={handleCloseDetailsModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-1 text-sm"
                aria-label="Close"
              >
                
                Close
=======
                Confirm
>>>>>>> rashi2.0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

