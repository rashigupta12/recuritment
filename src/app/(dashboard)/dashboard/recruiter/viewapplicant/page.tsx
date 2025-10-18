/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { frappeAPI } from "@/lib/api/frappeClient";
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
  Building2,
  Award,
} from "lucide-react";
import { TodosHeader } from "@/components/recruiter/Header";
import Pagination from "@/components/comman/Pagination";
import { ApplicantsTable } from "@/components/recruiter/CandidateTrackerTable";
import { useAuth } from "@/contexts/AuthContext";

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

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = [
  "Tagged", "Shortlisted", "Assessment", "Interview", 
  "Interview Reject", "Offered", "Offer Drop", "Joined"
];

interface FilterState {
  jobTitles: string[];
  clients: string[];
  status: string[];
}

export default function ViewApplicantPage() {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplicant | null>(null);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState<boolean>(false);
  const [downgradeInfo, setDowngradeInfo] = useState<{ from: string; to: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "all";

  const [filters, setFilters] = useState<FilterState>({
    jobTitles: [],
    clients: [],
    status: [],
  });

  // Fetch applicants data
  const fetchApplicants = async (page: number = 1): Promise<void> => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await frappeAPI.getAllApplicants(user.email, offset, ITEMS_PER_PAGE);
      const result = response.message;
      
      setApplicants(result.data || []);
      setTotalCount(result.total || 0);
      
      // Apply initial status filter if provided in URL
      let filtered = result.data || [];
      if (statusParam && statusParam.toLowerCase() !== "all") {
        filtered = filtered.filter((applicant: JobApplicant) => 
          applicant.status?.toLowerCase() === statusParam.toLowerCase()
        );
        setFilters(prev => ({ ...prev, status: [statusParam] }));
      }
      
      setFilteredApplicants(filtered);
      setSelectedApplicants([]);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Failed to fetch applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = applicants;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((applicant: JobApplicant) =>
        applicant.applicant_name?.toLowerCase().includes(query) ||
        applicant.email_id?.toLowerCase().includes(query) ||
        applicant.job_title?.toLowerCase().includes(query) ||
        applicant.designation?.toLowerCase().includes(query)
      );
    }

    // Job title filter
    if (filters.jobTitles.length > 0) {
      filtered = filtered.filter((applicant: JobApplicant) =>
        applicant.designation && filters.jobTitles.includes(applicant.designation)
      );
    }

    // Client filter
    if (filters.clients.length > 0) {
      filtered = filtered.filter((applicant: JobApplicant) =>
        applicant.custom_company_name && filters.clients.includes(applicant.custom_company_name)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((applicant: JobApplicant) =>
        applicant.status && filters.status.includes(applicant.status)
      );
    }

    setFilteredApplicants(filtered);
  }, [applicants, searchQuery, filters]);

  // Initial data load
  useEffect(() => {
    fetchApplicants(currentPage);
  }, [user?.email, statusParam, currentPage]);

  // Export to CSV
  const handleExport = async (): Promise<void> => {
    const headers = [
      "Name", "Email", "Phone", "Country", "Job Title", 
      "Designation", "Status", "Company", "Resume", "Experience"
    ];
    
    const rows = filteredApplicants.map((applicant: JobApplicant) => [
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
        ? applicant.custom_experience.map((exp: any) =>
            `${exp.company_name} (${exp.designation}, ${exp.start_date} - ${
              exp.current_company ? "Present" : exp.end_date
            })`
          ).join("; ")
        : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map((cell: any) => `"${cell.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "applicants.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Applicants exported successfully.");
  };

  const handleFilterChange = (newFilters: any): void => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRefresh = async (): Promise<void> => {
    setSearchQuery("");
    setFilters({ jobTitles: [], clients: [], status: [] });
    setCurrentPage(1);
    await fetchApplicants(1);
  };

  const handleSelectApplicant = (name: string): void => {
    setSelectedApplicants(prev =>
      prev.includes(name) ? prev.filter(id => id !== name) : [...prev, name]
    );
  };

  const handleChangeStatus = (): void => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one applicant.");
      return;
    }
    setIsModalOpen(true);
    setSelectedStatus("");
    setShowDowngradeWarning(false);
  };

  const getStatusLevel = (status: string): number => {
    const statusLevels: { [key: string]: number } = {
      open: 0, tagged: 1, shortlisted: 2, assessment: 3,
      interview: 4, "interview reject": -1, offered: 5,
      "offer drop": -1, joined: 6
    };
    return statusLevels[status.toLowerCase()] ?? 0;
  };

  const isStatusDowngrade = (currentStatus: string, newStatus: string): boolean => {
    const currentLevel = getStatusLevel(currentStatus);
    const newLevel = getStatusLevel(newStatus);
    if (currentLevel === -1 || newLevel === -1) return false;
    return newLevel < currentLevel;
  };

  const handleConfirmStatusChange = async (): Promise<void> => {
    if (!selectedStatus || !user?.email) {
      toast.error("Please select a status and ensure you're logged in.");
      return;
    }

    try {
      setLoading(true);
      const failedUpdates: string[] = [];

      for (const name of selectedApplicants) {
        try {
          await frappeAPI.updateApplicantStatus(name, { status: selectedStatus });
        } catch (err) {
          console.error(`Failed to update ${name}:`, err);
          failedUpdates.push(name);
        }
      }

      await fetchApplicants(currentPage);

      setSelectedApplicants([]);
      setSelectedStatus("");
      setIsModalOpen(false);
      setShowDowngradeWarning(false);

      if (failedUpdates.length > 0) {
        toast.warning(`Status updated for some applicants. Failed for: ${failedUpdates.join(", ")}`);
      } else {
        toast.success("Applicant status updated successfully.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update applicant statuses.");
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeRequest = (): void => {
    if (!selectedStatus) return;

    const applicantDetails = applicants.filter((applicant: JobApplicant) =>
      selectedApplicants.includes(applicant.name)
    );
    
    const downgrades = applicantDetails.filter((applicant: JobApplicant) =>
      applicant.status && isStatusDowngrade(applicant.status, selectedStatus)
    );

    if (downgrades.length > 0) {
      setDowngradeInfo({
        from: downgrades[0].status || "",
        to: selectedStatus,
      });
      setShowDowngradeWarning(true);
    } else {
      handleConfirmStatusChange();
    }
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedStatus("");
    setShowDowngradeWarning(false);
    setDowngradeInfo(null);
  };

  const getStatusColor = (status?: string): string => {
    const colors: { [key: string]: string } = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      tagged: "bg-purple-100 text-purple-800 border-purple-200",
      shortlisted: "bg-purple-100 text-purple-800 border-purple-200",
      assessment: "bg-yellow-100 text-yellow-800 border-yellow-200",
      interview: "bg-orange-100 text-orange-800 border-orange-200",
      offered: "bg-green-100 text-green-800 border-green-200",
      "interview reject": "bg-red-100 text-red-800 border-red-200",
      "offer drop": "bg-red-100 text-red-800 border-red-200",
      joined: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[status?.toLowerCase() || ""] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get unique values for filters
  const uniqueJobTitles = [...new Set(applicants.map((a: JobApplicant) => a.designation).filter(Boolean) as string[])];
  const uniqueClients = [...new Set(applicants.map((a: JobApplicant) => a.custom_company_name).filter(Boolean) as string[])];

  const filterConfig = [
    {
      id: "clients",
      title: "Client",
      options: uniqueClients,
      searchKey: "clients",
      icon: Building2,
    },
    {
      id: "jobTitles",
      title: "Job Designation",
      options: uniqueJobTitles,
      searchKey: "jobTitles",
      icon: Briefcase,
    },
    {
      id: "status",
      title: "Status",
      options: STATUS_OPTIONS,
      searchKey: "status",
      type: "radio" as const,
      icon: Award,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <TodosHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          totalJobs={totalCount}
          filteredJobs={filteredApplicants.length}
          uniqueJobTitles={uniqueJobTitles}
          uniqueClients={uniqueClients}
          uniqueStatus={STATUS_OPTIONS}
          onFilterChange={handleFilterChange}
          onexportcsv={handleExport}
          filterConfig={filterConfig}
          title="Applicants"
        />

        <ApplicantsTable
          applicants={filteredApplicants}
          selectedApplicants={selectedApplicants}
          onSelectApplicant={handleSelectApplicant}
          onViewDetails={setSelectedApplicant}
          showCheckboxes={true}
          showStatus={true}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
          totalCount={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

        {/* Status Change Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Change Status</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {showDowngradeWarning && downgradeInfo && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-yellow-700 text-sm">
                    Downgrading from <strong>{downgradeInfo.from}</strong> to <strong>{downgradeInfo.to}</strong>
                  </p>
                </div>
              )}

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              >
                <option value="">Select status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={showDowngradeWarning ? handleConfirmStatusChange : handleStatusChangeRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showDowngradeWarning ? "Confirm" : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applicant Details Modal */}
        {selectedApplicant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Applicant Details</h3>
                <button 
                  onClick={() => setSelectedApplicant(null)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{selectedApplicant.applicant_name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedApplicant.email_id || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedApplicant.phone_number || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-semibold">{selectedApplicant.country || "N/A"}</p>
                  </div>
                </div>
              </div>

              {selectedApplicant.custom_experience && selectedApplicant.custom_experience.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </h4>
                  <div className="space-y-3">
                    {selectedApplicant.custom_experience.map((exp: any, index: number) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{exp.company_name}</h5>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            exp.current_company 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {exp.current_company ? "Current" : "Past"}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-1">{exp.designation}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exp.start_date} - {exp.current_company ? "Present" : exp.end_date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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