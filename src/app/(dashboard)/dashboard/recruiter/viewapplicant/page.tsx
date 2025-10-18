/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { frappeAPI } from "@/lib/api/frappeClient";
// import { ApplicantsTable } from "@/components/recruiter/ApplicantsTable";
import {
  Search,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  Calendar,
  AlertCircle,
  Award,
  Building2,
  Download,
} from "lucide-react";
import { TodosHeader } from "@/components/recruiter/Header";
import Pagination from "@/components/comman/Pagination";
import { ApplicantsTable } from "@/components/recruiter/CandidateTrackerTable";

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
    data: JobApplicant[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
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
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplicant | null>(null);
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

  const fetchApplicantsData = async (email: string, limitStart = 0, limitPageLength = itemsPerPage): Promise<{ data: JobApplicant[], total: number }> => {
    try {
      const response = await frappeAPI.getAllApplicants(email, limitStart, limitPageLength);
      const result: ApiResponse = response;
      console.log("All applicants with full details:", result.message);
      return {
        data: result.message.data || [],
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

      // Calculate correct offset
      const offset = (currentPage - 1) * itemsPerPage;
      const { data, total } = await fetchApplicantsData(email, offset, itemsPerPage);
      
      // IMPORTANT: Replace data, don't append
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
      setSelectedApplicants([]); // Clear selections on page change
    } catch (err: any) {
      // ... error handling
    } finally {
      setLoading(false);
    }
  };

  checkAuthAndFetchApplicants();
}, [router, statusParam, currentPage]); // currentPage dependency is important

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
    if (!userEmail) return;
    try {
      const { data, total } = await fetchApplicantsData(userEmail, (currentPage - 1) * itemsPerPage, itemsPerPage);
      setApplicants(data);
      setTotalCount(total);
    } catch (err) {
      console.error("Refresh error:", err);
      toast.error("Failed to refresh applicants.");
    }
  };

  const uniqueJobTitles = Array.from(new Set(applicants.map((applicant) => applicant.designation).filter(Boolean) as string[]));
  const uniqueClients = Array.from(new Set(applicants.map((applicant) => applicant.custom_company_name).filter(Boolean) as string[]));
  const uniqueStatus = [
    "Tagged",
    "Shortlisted",
    "Assessment",
    "Interview",
    "Interview Reject",
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

  const handleChangeStatus = () => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one applicant.");
      return;
    }
    setIsModalOpen(true);
    setSelectedStatus("");
    setModalError(null);
  };

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

  const handleOpenDetailsModal = (applicant: JobApplicant) => {
    setSelectedApplicant(applicant);
  };

  const handleCloseDetailsModal = () => {
    setSelectedApplicant(null);
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
          <>
            <ApplicantsTable
              applicants={filteredApplicants}
              selectedApplicants={selectedApplicants}
              onSelectApplicant={handleSelectApplicant}
              onViewDetails={handleOpenDetailsModal}
              showCheckboxes={false}
              showStatus={true}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / itemsPerPage)}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {selectedApplicant && (
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
                      {selectedApplicant.applicant_name || "N/A"}
                    </h3>
                    <p className="text-gray-600">
                      {selectedApplicant.job_title || selectedApplicant.designation || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                      selectedApplicant.status
                    )}`}
                  >
                    {selectedApplicant.status || "N/A"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{selectedApplicant.email_id || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">{selectedApplicant.phone_number || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Country</p>
                    <p className="text-gray-900">{selectedApplicant.country || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Resume</p>
                    {selectedApplicant.resume_attachment ? (
                      <a
                        href={`https://recruiter.gennextit.com${selectedApplicant.resume_attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View Resume
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">No resume attached</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                  Experience
                </h4>
                {selectedApplicant.custom_experience && selectedApplicant.custom_experience.length > 0 ? (
                  <div className="space-y-3">
                    {selectedApplicant.custom_experience.map((exp, index) => (
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
                        <div className="flex items-center gap-2 text-sm text-gray-500">
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