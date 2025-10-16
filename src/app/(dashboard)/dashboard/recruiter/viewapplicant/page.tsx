/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Pagination from "@/components/comman/Pagination";
import { ApplicantsTable } from "@/components/recruiter/CandidateTrackerTable";
import { TodosHeader } from "@/components/recruiter/Header";
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  Award,
  Briefcase,
  Building2,
  Calendar,
  User,
  X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface JobApplicant {
  name: string;
  applicant_name?: string;
  email_id?: string;
  phone_number?: string;
  country?: string;
  job_title?: string;
  designation?: string;
  status?: string;
  custom_company_name?: string;
  resume_attachment?: string;
  custom_experience?: Array<{
    company_name: string;
    designation: string;
    start_date: string;
    end_date: string;
    current_company: number;
  }>;
}

interface ApiResponse {
  message: {
    data: Array<{
      applicant_name: string;
      email_id: string;
      phone_number: string;
      country: string;
      applications: Array<{
        job_title: string;
        designation: string;
        status: string;
        custom_company_name: string;
        resume_attachment?: string;
        custom_experience?: Array<{
          company_name: string;
          designation: string;
          start_date: string;
          end_date: string;
          current_company: number;
        }>;
        creation: string;
        owner: string;
      }>;
    }>;
    total: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
}
interface SessionData {
  authenticated: boolean;
  user?: {
    email: string;
  };
}

interface FilterState {
  departments: string[];
  assignedBy: string[];
  clients: string[];
  locations: string[];
  jobTitles: string[];
  status: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
  vacancies: 'all' | 'single' | 'multiple';
}

export default function ViewApplicantPage() {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApplicantGroup, setSelectedApplicantGroup] = useState<JobApplicant[] | null>(null);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState<boolean>(false);
  const [downgradeInfo, setDowngradeInfo] = useState<{ from: string; to: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    clients: [],
    locations: [],
    jobTitles: [],
    status: [],
    dateRange: 'all',
    vacancies: 'all',
  });
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "all";
  const router = useRouter();

const fetchApplicantsData = async (
  email: string,
  limitStart = 0,
  limitPageLength = itemsPerPage
): Promise<{ data: JobApplicant[]; total: number }> => {
  try {
    const response = await frappeAPI.getAllApplicants(email, limitStart, limitPageLength);
    const result: ApiResponse = response;
    console.log("API response:", result.message);
    
    // Transform the nested structure to flat array
    const flattenedData = transformApplicantsData(result.message.data || []);
    
    return {
      data: flattenedData,
      total: result.message.total || 0,
    };
  } catch (error) {
    console.error("Error fetching applicants:", error);
    throw error;
  }
};

  // Export applicants to CSV
  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Country",
      "Job Title",
      "Designation",
      "Status",
      "Company",
      "Resume",
      "Experience",
    ];
    const rows = filteredApplicants.map((applicant) => [
      applicant.applicant_name || applicant.name || "N/A",
      applicant.email_id || "N/A",
      applicant.phone_number || "N/A",
      applicant.country || "N/A",
      applicant.job_title || "N/A",
      applicant.designation || "N/A",
      applicant.status || "N/A",
      applicant.custom_company_name || "N/A",
      applicant.resume_attachment
        ? `https://recruiter.gennextit.com${applicant.resume_attachment}`
        : "N/A",
      applicant.custom_experience
        ? applicant.custom_experience
            .map(
              (exp) =>
                `${exp.company_name} (${exp.designation}, ${exp.start_date} - ${
                  exp.current_company ? "Present" : exp.end_date
                })`
            )
            .join("; ")
        : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "applicants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Applicants exported successfully.");
    return Promise.resolve();
  };


  
const transformApplicantsData = (apiResponse: any[]): JobApplicant[] => {
  const flattened: JobApplicant[] = [];
  
  apiResponse.forEach((applicant: any) => {
    if (applicant.applications && applicant.applications.length > 0) {
      // Create a row for each application
      applicant.applications.forEach((app: any, index: number) => {
        flattened.push({
          name: `${applicant.email_id}_${index}`, // Unique identifier
          applicant_name: applicant.applicant_name,
          email_id: applicant.email_id,
          phone_number: applicant.phone_number,
          country: applicant.country,
          job_title: app.job_title,
          designation: app.designation,
          status: app.status,
          custom_company_name: app.custom_company_name,
          resume_attachment: app.resume_attachment || "",
          custom_experience: [],
        });
      });
    } else {
      // Applicant with no applications (shouldn't happen but handle it)
      flattened.push({
        name: applicant.email_id,
        applicant_name: applicant.applicant_name,
        email_id: applicant.email_id,
        phone_number: applicant.phone_number,
        country: applicant.country,
        job_title: "",
        designation: "",
        status: "",
        custom_company_name: "",
        resume_attachment: "",
        custom_experience: [],
      });
    }
  });
  
  return flattened;
};
  useEffect(() => {
    const checkAuthAndFetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);

        const session: SessionData = await frappeAPI.checkSession();
        if (!session.authenticated || !session.user?.email) {
          setError("Please log in to view applicants.");
          setIsAuthenticated(false);
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
        const email = session.user.email;
        setUserEmail(email);

        const { data, total } = await fetchApplicantsData(email, (currentPage - 1) * itemsPerPage, itemsPerPage);
        setApplicants(data);
        setTotalCount(total);

        let filtered = data;
        if (statusParam && statusParam.toLowerCase() !== "all") {
          filtered = data.filter((applicant) =>
            applicant.status?.toLowerCase() === statusParam.toLowerCase()
          );
          setFilters((prev) => ({ ...prev, status: [statusParam] }));
        }
        setFilteredApplicants(filtered);
      } catch (err: any) {
        console.error("Fetch error:", err);
        let errorMessage = "An error occurred while fetching applicants.";
        if (err.message?.includes("Session expired") || err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = "Session expired. Please log in again.";
          setIsAuthenticated(false);
          router.push("/login");
        } else if (err.response?.status === 404 || err?.exc_type === "DoesNotExistError") {
          errorMessage = "Job Applicant resource not found. Please verify the API endpoint or contact support.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setApplicants([]);
        setFilteredApplicants([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchApplicants();
  }, [router, statusParam, currentPage]);

useEffect(() => {
  let filtered = applicants;
  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (applicant) =>
        applicant.applicant_name?.toLowerCase().includes(query) ||
        applicant.email_id?.toLowerCase().includes(query) ||
        applicant.job_title?.toLowerCase().includes(query) ||
        applicant.designation?.toLowerCase().includes(query)
    );
  }
  // Job titles filter
  if (filters.jobTitles.length > 0) {
    filtered = filtered.filter((applicant) =>
      applicant.designation && filters.jobTitles.includes(applicant.designation)
    );
  }
  // Clients filter
  if (filters.clients.length > 0) {
    filtered = filtered.filter((applicant) =>
      applicant.custom_company_name && filters.clients.includes(applicant.custom_company_name)
    );
  }
  // Status filter
  if (filters.status.length > 0) {
    filtered = filtered.filter((applicant) =>
      applicant.status && filters.status.includes(applicant.status)
    );
  }
  setFilteredApplicants(filtered);
}, [applicants, searchQuery, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

const handleRefresh = async () => {
  console.log("clicked");
  if (!userEmail) return;
  try {
    setLoading(true); // Set loading to true during refresh
    const { data, total } = await fetchApplicantsData(userEmail, 0, itemsPerPage);
    console.log("Refreshed data:", data);
    setApplicants([...data]); // Create new array reference
    setTotalCount(total);
    setCurrentPage(1); // Reset to first page
    setSelectedApplicants([]); // Clear selected applicants
    setFilters({
      departments: [],
      assignedBy: [],
      clients: [],
      locations: [],
      jobTitles: [],
      status: statusParam && statusParam.toLowerCase() !== "all" ? [statusParam] : [],
      dateRange: 'all',
      vacancies: 'all',
    }); // Reset filters
    setSearchQuery(""); // Clear search query
    toast.success("Table refreshed successfully."); // Confirm refresh
  } catch (err) {
    console.error("Refresh error:", err);
    toast.error("Failed to refresh applicants.");
  } finally {
    setLoading(false); // Reset loading state
  }
};

  const uniqueJobTitles = Array.from(new Set(applicants.map((applicant) => applicant.designation).filter(Boolean) as string[]));
  const uniqueClients = Array.from(new Set(applicants.map((applicant) => applicant.custom_company_name).filter(Boolean) as string[]));
  const uniqueStatus = [
    "Tagged",
    "Shortlisted",
    "Assessment",
    "Interview to be scheduled",
    "Interview",
    "Offered",
    "Offer Drop",
    "Joined",
  ];

  const filterConfig = [
    {
      id: 'clients',
      title: 'Client',
      icon: Building2,
      options: uniqueClients,
      searchKey: 'clients',
      showInitialOptions: false,
    },
    {
      id: 'jobTitles',
      title: 'Job Designation',
      icon: Briefcase,
      options: uniqueJobTitles,
      searchKey: 'jobTitles',
      showInitialOptions: false,
    },
    {
      id: 'status',
      title: 'Status',
      icon: Award,
      options: uniqueStatus,
      type: 'radio'as const,
      searchKey: 'status',
      alwaysShowOptions: true,
      showInitialOptions: true,
    },
  ];

  const handleSelectApplicant = (name: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]
    );
  };

  // const handleChangeStatus = () => {
  //   if (selectedApplicants.length === 0) {
  //     toast.error("Please select at least one applicant.");
  //     return;
  //   }
  //   setIsModalOpen(true);
  //   setSelectedStatus("");
  //   setModalError(null);
  // };

  const getStatusLevel = (status: string): number => {
    const statusLevels: { [key: string]: number } = {
      "open": 0,
      "tagged": 1,
      "shortlisted": 2,
      "assessment": 3,
      "interview": 4,
      "interview reject": -1,
      "offered": 5,
      "offer drop": -1,
      "joined": 6,
    };
    return statusLevels[status.toLowerCase()] ?? 0;
  };

  const isStatusDowngrade = (currentStatus: string, newStatus: string): boolean => {
    const currentLevel = getStatusLevel(currentStatus);
    const newLevel = getStatusLevel(newStatus);
    
    if (currentLevel === -1 || newLevel === -1) return false;
    
    return newLevel < currentLevel;
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) {
      setModalError("Please select a status.");
      return;
    }
    if (!userEmail) {
      toast.error("User email not found. Please log in again.");
      setIsAuthenticated(false);
      setIsModalOpen(false);
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const failedUpdates: string[] = [];

      for (const name of selectedApplicants) {
        if (!name) {
          failedUpdates.push("Unknown (missing name)");
          continue;
        }
        try {
          await frappeAPI.updateApplicantStatus(name, { status: selectedStatus });
        } catch (err: any) {
          console.error(`Failed to update status for ${name}:`, err);
          if (err?.exc_type === "DoesNotExistError" || err.response?.status === 404) {
            failedUpdates.push(name);
          } else {
            throw err;
          }
        }
      }

      const { data, total } = await fetchApplicantsData(userEmail, (currentPage - 1) * itemsPerPage, itemsPerPage);
      setApplicants(data);
      setTotalCount(total);
      setSelectedApplicants([]);
      setSelectedStatus("");
      setIsModalOpen(false);

      if (failedUpdates.length > 0) {
        toast.warning(
          `Status updated for some applicants. Failed for: ${failedUpdates.join(", ")}.`
        );
      } else {
        toast.success("Applicant status updated successfully.");
      }
    } catch (err: any) {
      console.error("Status update error:", err);
      let errorMessage = "Failed to update applicant statuses.";
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Session expired or insufficient permissions. Please log in again.";
        setIsAuthenticated(false);
        router.push("/login");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeRequest = () => {
    if (!selectedStatus) {
      setModalError("Please select a status.");
      return;
    }
    
    const applicantDetails = applicants.filter((applicant) => selectedApplicants.includes(applicant.name));
    const downgrades = applicantDetails.filter((applicant) =>
      applicant.status && isStatusDowngrade(applicant.status, selectedStatus)
    );
    
    if (downgrades.length > 0) {
      const firstDowngrade = downgrades[0];
      setDowngradeInfo({
        from: firstDowngrade.status || "",
        to: selectedStatus,
      });
      setShowDowngradeWarning(true);
    } else {
      handleConfirmStatusChange();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStatus("");
    setModalError(null);
  };

  const handleOpenDetailsModal = (applicants: JobApplicant[]) => {
    setSelectedApplicantGroup(applicants);
  };

  const handleCloseDetailsModal = () => {
    setSelectedApplicantGroup(null);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "tagged":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "shortlisted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "assessment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "interview":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "offered":
        return "bg-green-100 text-green-800 border-green-200";
      case "interview reject":
        return "bg-red-100 text-red-800 border-red-200";
      case "offer drop":
        return "bg-red-100 text-red-800 border-red-200";
      case "joined":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full">
        <div className="flex justify-between items-center gap-3 mb-4">
          <TodosHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            totalJobs={totalCount}
            filteredJobs={filteredApplicants.length}
            uniqueJobTitles={uniqueJobTitles}
            uniqueClients={uniqueClients}
            uniqueStatus={uniqueStatus}
            onFilterChange={handleFilterChange}
            onexportcsv={handleExport}
            filterConfig={filterConfig}
            title="Applicants"
          />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-700 mb-3">{error}</p>
                {error.includes("not found") && (
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
        {filteredApplicants.length === 0 && filters.status.length > 0 && (
  <div className="text-center py-12">
    <p className="text-gray-600 text-lg">No applicants for this status.</p>
  </div>
)}
{filteredApplicants.length === 0 && filters.status.length === 0 && applicants.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-600 text-lg">No applicants found.</p>
  </div>
) : filteredApplicants.length === 0 && filters.status.length === 0 && applicants.length > 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-600 text-lg">No applicants match your filters.</p>
  </div>
) : (
  <div className="relative">
    {/* Loading Overlay */}
    {loading && (
      <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Refreshing table...</p>
        </div>
      </div>
    )}
    <ApplicantsTable
      key={Date.now()} // Force re-render on refresh
      applicants={filteredApplicants}
      selectedApplicants={selectedApplicants}
      onSelectApplicant={handleSelectApplicant}
      onViewDetails={handleOpenDetailsModal}
      // showCheckboxes={true}
      showStatus={true}
    />
    <Pagination
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / itemsPerPage)}
      totalCount={totalCount}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
    />
    
  </div>
)}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h2
                  id="status-modal-title"
                  className="text-xl font-bold text-gray-900 flex items-center gap-2"
                >
                  <Award className="h-6 w-6 text-blue-600" />
                  Confirm Status Change
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-md">{modalError}</p>
                </div>
              )}
              <div className="mb-4 text-md">
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Select New Status
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-md"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Select status"
                >
                  <option value="" disabled className="text-gray-500 text-md">
                    Select a status...
                  </option>
                  <option value="Tagged" className="text-md">Tagged</option>
                  <option value="Shortlisted" className="text-md">Shortlisted</option>
                  <option value="Assessment" className="text-md">Assessment</option>
                  <option value="Interview" className="text-md">Interview</option>
                  <option value="Interview Reject" className="text-md">Interview Reject</option>
                  <option value="Offered" className="text-md">Offered</option>
                  <option value="Offer Drop" className="text-md">Offer Drop</option>
                  <option value="Joined" className="text-md">Joined</option>
                </select>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 font-medium mb-2 text-md">
                  Selected Applicants ({selectedApplicants.length})
                </p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {applicants
                    .filter((applicant) => selectedApplicants.includes(applicant.name))
                    .map((applicant) => (
                      <div
                        key={applicant.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-md">
                              {applicant.applicant_name || applicant.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {applicant.email_id}
                            </p>
                          </div>
                        </div>
                        {selectedStatus && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStatus)}`}
                          >
                            {selectedStatus}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-md"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChangeRequest}
                  disabled={!selectedStatus}
                  className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-md"
                  aria-label="Confirm status change"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        )}
        {showDowngradeWarning && downgradeInfo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  Warning: Status Downgrade
                </h2>
                <button
                  onClick={() => {
                    setShowDowngradeWarning(false);
                    setDowngradeInfo(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 font-semibold mb-2">
                    You are moving applicant(s) from a higher stage to a lower stage:
                  </p>
                  <div className="flex items-center justify-center gap-3 my-3">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {downgradeInfo.from}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full font-medium">
                      {downgradeInfo.to}
                    </span>
                  </div>
                  <p className="text-gray-700 text-md mt-3">
                    This action will move {selectedApplicants.length} applicant(s) backwards in the hiring process.
                  </p>
                </div>
                <p className="text-gray-600 font-medium text-md">
                  Are you sure you want to proceed?
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDowngradeWarning(false);
                    setDowngradeInfo(null);
                  }}
                  className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm text-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDowngradeWarning(false);
                    setDowngradeInfo(null);
                    handleConfirmStatusChange();
                  }}
                  className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all font-medium shadow-md text-md"
                >
                  Yes, Proceed
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedApplicantGroup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-modal-title"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 id="details-modal-title" className="text-2xl font-bold text-gray-900">
                  Applicant Profile
                </h2>
                <button
                  onClick={handleCloseDetailsModal}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {selectedApplicantGroup[0].applicant_name || "N/A"}
                    </h3>
                    {/* <p className="text-gray-600">
                      {selectedApplicantGroup[0].job_title || selectedApplicantGroup[0].designation || "N/A"}
                    </p> */}

<p className="text-gray-900 text-md">
  {selectedApplicantGroup[0].email_id || "N/A"} |{" "}
  {selectedApplicantGroup[0].phone_number || "N/A"} |{" "}
  {selectedApplicantGroup[0].country || "N/A"}
</p>




                  </div>
                  {/* <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                      selectedApplicantGroup[0].status
                    )}`}
                  >
                    {selectedApplicantGroup[0].status || "N/A"}
                  </span> */}
                </div>
              </div>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{selectedApplicantGroup[0].email_id || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">{selectedApplicantGroup[0].phone_number || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Country</p>
                    <p className="text-gray-900">{selectedApplicantGroup[0].country || "N/A"}</p>
                  </div>
                </div>
              </div> */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  Applications
                </h4>
                {selectedApplicantGroup.length > 0 ? (
                  <div className="space-y-3">
                    {selectedApplicantGroup.map((app, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                          <h5 className="text-md font-semibold text-gray-900">{app.custom_company_name || "N/A"}</h5>
                          <span
                            className={`px-2 py-1 rounded-full text-md font-medium ${getStatusColor(app.status)}`}
                          >
                            {app.status || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                        <p className="text-gray-700 mb-2">Designation: {app.designation || "N/A"}</p>
                          <div className="flex items-center gap-2 text-md text-gray-500">
                          {app.resume_attachment ? (
                            <a
                              href={`https://recruiter.gennextit.com${app.resume_attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              View Resume
                            </a>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                        </div>
                        {/* <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FileText className="h-4 w-4" />
                          <span>Resume: </span>
                          {app.resume_attachment ? (
                            <a
                              href={`https://recruiter.gennextit.com${app.resume_attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              View Resume
                            </a>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div> */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-500">No application information available</p>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                  Experience
                </h4>
                {selectedApplicantGroup[0].custom_experience && selectedApplicantGroup[0].custom_experience.length > 0 ? (
                  <div className="space-y-3">
                    {selectedApplicantGroup[0].custom_experience.map((exp, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                          <h5 className="text-md font-semibold text-gray-900">{exp.company_name}</h5>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              exp.current_company
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {exp.current_company ? "Current" : "Past"}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{exp.designation}</p>
                        <div className="flex items-center gap-2 text-md text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {exp.start_date} - {exp.current_company ? "Present" : exp.end_date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-500">No experience information available</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseDetailsModal}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}








