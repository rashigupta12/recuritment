/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { frappeAPI } from '@/lib/api/frappeClient';
import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable';
import { Search, Filter, Download, RefreshCw, Users, CheckSquare } from 'lucide-react';

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
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const router = useRouter();

  const fetchApplicantsData = async (email: string) => {
    const response = await frappeAPI.getAllApplicants(email);
    const result: ApiResponse = response;
    console.log('getAllApplicants response:', result.data);

    if (!result.data || result.data.length === 0) {
      return [];
    }

    const detailedApplicants: JobApplicant[] = [];
    const usedNames = new Set<string>();
    
    for (const applicant of result.data) {
      if (!applicant.name) {
        console.warn('Skipping applicant with missing name:', applicant);
        continue;
      }
      
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
        detailedApplicants.push({
          ...detail.data,
          name: uniqueName,
        });
      } catch (detailErr: any) {
        console.error(`Error fetching details for ${applicant.name}:`, detailErr);
        if (detailErr?.exc_type === 'DoesNotExistError' || detailErr.response?.status === 404) {
          detailedApplicants.push({
            ...applicant,
            name: uniqueName,
            applicant_name: applicant.applicant_name || 'N/A',
            status: applicant.status || 'N/A',
          });
        } else {
          detailedApplicants.push({
            ...applicant,
            name: uniqueName,
            applicant_name: 'Error fetching details',
          });
        }
      }
    }

    return detailedApplicants;
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
        setFilteredApplicants(detailedApplicants);
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

  // Filter applicants based on search and status
  useEffect(() => {
    let filtered = [...applicants];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (applicant) =>
          applicant.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.email_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.designation?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((applicant) => applicant.status === statusFilter);
    }

    setFilteredApplicants(filtered);
  }, [searchQuery, statusFilter, applicants]);

  const handleSelectApplicant = (name: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]
    );
  };

  const handleRefresh = async () => {
    if (!userEmail) return;
    
    try {
      setIsRefreshing(true);
      const detailedApplicants = await fetchApplicantsData(userEmail);
      setApplicants(detailedApplicants);
      setFilteredApplicants(detailedApplicants);
      toast.success('Applicants list refreshed');
    } catch (err: any) {
      console.error('Refresh error:', err);
      toast.error('Failed to refresh applicants list');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleChangeStatus = async () => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select at least one applicant.');
      return;
    }
    if (!selectedStatus) {
      toast.error('Please select a status.');
      return;
    }
    if (!userEmail) {
      toast.error('User email not found. Please log in again.');
      setIsAuthenticated(false);
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
      setFilteredApplicants(detailedApplicants);
      setSelectedApplicants([]);
      setSelectedStatus('');

      if (failedUpdates.length > 0) {
        toast.warning(
          `Status updated for some applicants. Failed for: ${failedUpdates.join(', ')}.`
        );
      } else {
        toast.success('Applicant statuses updated successfully.');
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
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          {/* <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="h-10 w-10 text-blue-600" />
                Job Applicants
              </h1>
              <p className="text-gray-600">Manage and track all your job applicants</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

         
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
                  <p className="text-3xl font-bold text-gray-900">{applicants.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Selected</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedApplicants.length}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Shortlisted</p>
                  <p className="text-3xl font-bold text-gray-900">{statusCounts['Shortlisted'] || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Filter className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hired</p>
                  <p className="text-3xl font-bold text-gray-900">{statusCounts['Hired'] || 0}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Download className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div> */}

          {/* Filters and Actions Bar */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2"> */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
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

                {/* Bulk Action */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
                    disabled={selectedApplicants.length === 0}
                  >
                    <option value="">Change Status</option>
                    <option value="open">Open</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Assessment Stage">Assessment Stage</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Closed">Closed</option>
                  </select>
                  
                  <button
                    onClick={handleChangeStatus}
                    disabled={selectedApplicants.length === 0 || !selectedStatus}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Count Badge */}
            {/* {selectedApplicants.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedApplicants.length} applicant{selectedApplicants.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedApplicants([])}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear selection
                </button>
              </div>
            )} */}
          </div>
        </div>

        {/* Error Message */}
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

        {/* Table Section */}
        {filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No applicants found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results'
                : 'No applicants have been added yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Applicants List ({filteredApplicants.length})
              </h2>
            </div> */}
            <ApplicantsTable
              applicants={filteredApplicants}
              selectedApplicants={selectedApplicants}
              onSelectApplicant={handleSelectApplicant}
            />
          </div>
        )}
      </div>
    // </div>
  );
}

