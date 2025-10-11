/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { frappeAPI } from "@/lib/api/frappeClient";
import { ApplicantsTable } from "@/components/recruiter/ApplicantsTable";
import EmailSendingPopup from "./EmailSendingPopup";
import { Award, User, X, Search, AlertCircle, CheckCircle } from "lucide-react";

interface JobApplicant {
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
  custom_offered_salary?: string;
  custom_target_start_date?: string;
}

interface Props {
  jobId: string;
  job_title?: string;
  ownerEmail: string;
  todoData?: any;
  refreshTrigger?: number;
  onRefresh?: () => void;
  jobTitle?: string;
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

interface UpdateData {
  status: string;
  custom_offered_salary?: string;
  custom_target_start_date?: string;
}

export default function TaggedApplicants({
  jobId,
  job_title,
  ownerEmail,
  todoData,
  refreshTrigger,
  onRefresh,
}: Props) {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicants, setSelectedApplicants] = useState<JobApplicant[]>([]);
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState<boolean>(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false); // New state for Offer modal
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [assessmentSuccess, setAssessmentSuccess] = useState<string | null>(null);
  const [testLink, setTestLink] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState<boolean>(false);
  const [downgradeInfo, setDowngradeInfo] = useState<{ from: string; to: string } | null>(null);
  const [offeredSalary, setOfferedSalary] = useState<string>("");
  const [targetStartDate, setTargetStartDate] = useState<string>("");
  const router = useRouter();
  const [expiryDate, setExpiryDate] = useState<string>("");

  console.log(job_title)

  // Auto-dismiss error messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (modalError) {
      const timer = setTimeout(() => setModalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [modalError]);

  useEffect(() => {
    if (assessmentError) {
      const timer = setTimeout(() => setAssessmentError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [assessmentError]);

  useEffect(() => {
    if (assessmentSuccess) {
      const timer = setTimeout(() => setAssessmentSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [assessmentSuccess]);

  // Handle applicant selection
  const handleSelectApplicant = (name: string) => {
    setSelectedApplicants((prev) => {
      const applicant = applicants.find((app) => app.name === name);
      if (prev.find((app) => app.name === name)) {
        return prev.filter((app) => app.name !== name);
      } else if (applicant) {
        return [...prev, applicant];
      }
      return prev;
    });
  };

  // Helper function to get status hierarchy level
  const getStatusLevel = (status: string): number => {
    const statusLevels: { [key: string]: number } = {
      open: 0,
      tagged: 1,
      shortlisted: 2,
      assessment: 3,
      interview: 4,
      "interview reject": -1,
      offered: 5,
      "offer drop": -1,
      joined: 6,
    };
    return statusLevels[status.toLowerCase()] ?? 0;
  };

  // Helper function to check if it's a downgrade
  const isStatusDowngrade = (currentStatus: string, newStatus: string): boolean => {
    const currentLevel = getStatusLevel(currentStatus);
    const newLevel = getStatusLevel(newStatus);
    if (currentLevel === -1 || newLevel === -1) return false;
    return newLevel < currentLevel;
  };

  const handleDeleteApplicant = async (applicant: JobApplicant) => {
    const canDelete = ["tagged", "open"].includes(applicant.status?.toLowerCase() || "");
    if (!canDelete) {
      toast.error('Can only delete applicants with "Tagged" or "Open" status');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${applicant.applicant_name || applicant.name}?`)) {
      return;
    }
    try {
      setLoading(true);
      await frappeAPI.deleteApplicant(applicant.name);
      toast.success(`${applicant.applicant_name || applicant.name} deleted successfully`);
      setSelectedApplicants((prev) => prev.filter((app) => app.name !== applicant.name));
      setRefreshKey((prev) => prev + 1);
      if (onRefresh) onRefresh();
      toast.success(`${applicant.applicant_name || applicant.name} deleted successfully`);
    } catch (err: any) {
      console.error("Delete error:", err);
      let errorMessage = "Failed to delete applicant";
      if (err.response?.status === 404) {
        errorMessage = "Applicant not found";
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to delete this applicant";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants([...applicants]);
    }
  };

  useEffect(() => {
    let filtered = applicants;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (applicant) =>
          applicant.applicant_name?.toLowerCase().includes(query) ||
          applicant.email_id?.toLowerCase().includes(query) ||
          applicant.job_title?.toLowerCase().includes(query)
      );
    }
    setFilteredApplicants(filtered);
  }, [applicants, searchQuery]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!jobId || !ownerEmail) {
        console.log("❌ Missing required data:", { jobId, ownerEmail });
        setLoading(false);
        setError("Job ID or owner email not provided");
        return;
      }
      try {
        setLoading(true);
        console.log("🔄 Fetching applicants - refreshTrigger:", refreshTrigger);
        const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
        const applicantNames = response.data || [];
        if (applicantNames.length === 0) {
          setApplicants([]);
          setFilteredApplicants([]);
          setLoading(false);
          return;
        }
        const applicantsPromises = applicantNames.map(async (applicant: any) => {
          try {
            const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
            return applicantDetail.data;
          } catch (err) {
            console.error(`Error fetching details for ${applicant.name}:`, err);
            return null;
          }
        });
        const applicantsData = await Promise.all(applicantsPromises);
        const validApplicants = applicantsData.filter((applicant) => applicant !== null);
        setApplicants(validApplicants);
        setFilteredApplicants(validApplicants);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error in fetchApplicants:", err);
        setError("Failed to fetch applicants. Please try again later.");
        setApplicants([]);
        setFilteredApplicants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId, ownerEmail, refreshTrigger]);

  const handleOpenStatusModal = () => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one applicant.");
      return;
    }
    setIsStatusModalOpen(true);
    setSelectedStatus("");
    setModalError(null);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedStatus("");
    setModalError(null);
  };

  const handleCloseAssessmentModal = () => {
    setIsAssessmentModalOpen(false);
    setTestLink("");
    setExpiryDate("");
    setModalError(null);
  };

  const handleCloseOfferModal = () => {
    setIsOfferModalOpen(false);
    setOfferedSalary("");
    setTargetStartDate("");
    setModalError(null);
  };

  const handleStatusChangeRequest = () => {
    if (!selectedStatus) {
      setModalError("Please select a status.");
      return;
    }
    if (selectedStatus === "Assessment") {
      const allShortlisted = selectedApplicants.every(
        (applicant) => applicant.status?.toLowerCase() === "shortlisted"
      );
      if (!allShortlisted) {
        setModalError('Assessment can only be created for applicants with "Shortlisted" status.');
        return;
      }
      setIsStatusModalOpen(false);
      setIsAssessmentModalOpen(true);
      return;
    }
    if (selectedStatus === "Offered") {
      setIsStatusModalOpen(false);
      setIsOfferModalOpen(true); // Open Offer Details Modal
      return;
    }
    const downgrades = selectedApplicants.filter(
      (applicant) => applicant.status && isStatusDowngrade(applicant.status, selectedStatus)
    );
    if (downgrades.length > 0) {
      const firstDowngrade = downgrades[0];
      setDowngradeInfo({ from: firstDowngrade.status || "", to: selectedStatus });
      setShowDowngradeWarning(true);
    } else {
      handleConfirmStatusChange();
    }
  };

  const handleConfirmOfferDetails = async () => {
    if (!offeredSalary.trim() || !targetStartDate.trim()) {
      setModalError("Please fill offered salary and target start date.");
      return;
    }
    try {
      setLoading(true);
      const failedUpdates: string[] = [];
      for (const applicant of selectedApplicants) {
        const name = applicant.name;
        if (!name) {
          console.warn("Skipping update: name is undefined or empty");
          failedUpdates.push("Unknown (missing name)");
          continue;
        }
        try {
          const updateData: UpdateData = {
            status: "Offered",
            custom_offered_salary: offeredSalary,
            custom_target_start_date: targetStartDate,
          };
          await frappeAPI.updateApplicantStatus(name, updateData);
        } catch (err: any) {
          console.error(`Failed to update status for ${name}:`, err);
          if (err?.exc_type === "DoesNotExistError" || err.response?.status === 404) {
            failedUpdates.push(name);
          } else {
            throw err;
          }
        }
      }
      const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
      const applicantNames = response.data || [];
      const applicantsPromises = applicantNames.map(async (applicant: any) => {
        try {
          const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
          return applicantDetail.data;
        } catch (err) {
          console.error(`Error fetching details for ${applicant.name}:`, err);
          return { name: applicant.name, email_id: applicant.email_id || "Not available" };
        }
      });
      const applicantsData = await Promise.all(applicantsPromises);
      setApplicants(applicantsData.filter((applicant) => applicant !== null));
      setFilteredApplicants(applicantsData.filter((applicant) => applicant !== null));
      setSelectedApplicants([]);
      setOfferedSalary("");
      setTargetStartDate("");
      setIsOfferModalOpen(false);
      setRefreshKey((prev) => prev + 1);
      if (failedUpdates.length > 0) {
        toast.warning(
          `Status updated for some applicants. Failed for: ${failedUpdates.join(", ")}. Applicant records may not exist or the endpoint may be incorrect.`
        );
      } else {
        toast.success("Applicant status updated successfully.");
      }
    } catch (err: any) {
      console.error("Status update error:", err);
      let errorMessage = "Failed to update applicant statuses.";
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Session expired or insufficient permissions. Please try again.";
        router.push("/login");
      } else if (err.response?.status === 404 || err?.exc_type === "DoesNotExistError") {
        errorMessage = "Job Applicant resource not found. Please verify the API endpoint or contact support.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      setIsOfferModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    if (!expiryDate || !testLink) {
      setModalError("Please fill in all assessment details (Expiry Date and Test Link).");
      return;
    }
    try {
      setAssessmentError(null);
      setAssessmentSuccess(null);
      const currentDate = new Date().toISOString().split("T")[0];
      const payload = {
        applicants: selectedApplicants.map((app) => app.name),
        scheduled_on: currentDate,
        custom_expiry_date: expiryDate,
        assessment_link: testLink,
      };
      const response = await frappeAPI.createbulkAssessment(payload);
      console.log("API Response:", response);
      if (!response) {
        throw new Error("No response received from the API.");
      }
      let assessmentIds: string;
      if (response.message?.created_assessments && Array.isArray(response.message.created_assessments)) {
        assessmentIds = response.message.created_assessments.join(", ");
      } else if (response.message?.name) {
        assessmentIds = response.message.name;
      } else if (response.name) {
        assessmentIds = response.name;
      } else if (response.data && (response.data.name || response.data.id)) {
        assessmentIds = response.data.name || response.data.id;
      } else {
        throw new Error("Invalid response structure: Missing assessment ID(s).");
      }
      const statusUpdatePromises = selectedApplicants.map(async (applicant) => {
        try {
          await frappeAPI.updateApplicantStatus(applicant.name, { status: "Assessment" });
          console.log(`✅ Status updated to "Assessment" for ${applicant.name}`);
        } catch (err: any) {
          console.error(`❌ Failed to update status for ${applicant.name}:`, err);
          throw new Error(`Failed to update status for ${applicant.applicant_name || applicant.name}`);
        }
      });
      await Promise.all(statusUpdatePromises);
      const refreshResponse: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
      const applicantNames = refreshResponse.data || [];
      const applicantsPromises = applicantNames.map(async (applicant: any) => {
        try {
          const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
          return applicantDetail.data;
        } catch (err) {
          console.error(`Error fetching details for ${applicant.name}:`, err);
          return { name: applicant.name, email_id: applicant.email_id || "Not available" };
        }
      });
      const applicantsData = await Promise.all(applicantsPromises);
      setApplicants(applicantsData.filter((applicant) => applicant !== null));
      setFilteredApplicants(applicantsData.filter((applicant) => applicant !== null));
      setAssessmentSuccess(
        `Assessment(s) created successfully with ID(s): ${assessmentIds}. Applicant status updated to "Assessment".`
      );
      toast.success(`Assessment created and status updated to "Assessment Stage" successfully!`);
      setIsAssessmentModalOpen(false);
      setSelectedApplicants([]);
      setTestLink("");
      setExpiryDate("");
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      console.error("Assessment creation error:", {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        rawResponse: err.response,
      });
      let errorMessage = "Failed to create assessment. Please try again or contact support.";
      if (err.message.includes("Missing assessment ID")) {
        errorMessage = "Invalid response from API: Missing assessment ID(s). Please contact support.";
      } else if (err.message.includes("Failed to update status")) {
        errorMessage = `Assessment created but ${err.message}. Please update status manually.`;
      } else if (err.response?.status === 404) {
        errorMessage = "Assessment API endpoint not found. Please verify the Frappe method or contact support.";
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Unauthorized access. Please log in again.";
        router.push("/login");
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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shortlisted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "assessment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hired":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) {
      setModalError("Please select a status.");
      return;
    }
    if (!ownerEmail) {
      toast.error("Owner email not found. Please try again.");
      setIsStatusModalOpen(false);
      return;
    }
    try {
      setLoading(true);
      console.log("Selected applicants for status update:", selectedApplicants);
      const failedUpdates: string[] = [];
      for (const applicant of selectedApplicants) {
        const name = applicant.name;
        if (!name) {
          console.warn("Skipping update: name is undefined or empty");
          failedUpdates.push("Unknown (missing name)");
          continue;
        }
        try {
          console.log(`Sending PUT request to update status for ${name} to ${selectedStatus}`);
          const updateData: UpdateData = { status: selectedStatus };
          await frappeAPI.updateApplicantStatus(name, updateData);
        } catch (err: any) {
          console.error(`Failed to update status for ${name}:`, err);
          if (err?.exc_type === "DoesNotExistError" || err.response?.status === 404) {
            failedUpdates.push(name);
          } else {
            throw err;
          }
        }
      }
      const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
      const applicantNames = response.data || [];
      const applicantsPromises = applicantNames.map(async (applicant: any) => {
        try {
          const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
          return applicantDetail.data;
        } catch (err) {
          console.error(`Error fetching details for ${applicant.name}:`, err);
          return { name: applicant.name, email_id: applicant.email_id || "Not available" };
        }
      });
      const applicantsData = await Promise.all(applicantsPromises);
      setApplicants(applicantsData.filter((applicant) => applicant !== null));
      setFilteredApplicants(applicantsData.filter((applicant) => applicant !== null));
      setSelectedApplicants([]);
      setSelectedStatus("");
      setIsStatusModalOpen(false);
      setRefreshKey((prev) => prev + 1);
      if (failedUpdates.length > 0) {
        toast.warning(
          `Status updated for some applicants. Failed for: ${failedUpdates.join(", ")}. Applicant records may not exist or the endpoint may be incorrect.`
        );
      } else {
        toast.success("Applicant status updated successfully.");
      }
    } catch (err: any) {
      console.error("Status update error:", err);
      let errorMessage = "Failed to update applicant statuses.";
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Session expired or insufficient permissions. Please try again.";
        router.push("/login");
      } else if (err.response?.status === 404 || err?.exc_type === "DoesNotExistError") {
        errorMessage = "Job Applicant resource not found. Please verify the API endpoint or contact support.";
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
      <div className="flex justify-center items-center py-8 bg-gray-50 min-h-[200px] rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 font-medium text-lg">Loading applicants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 font-semibold text-lg">Error</p>
        </div>
        <p className="text-red-600 text-md mt-2">{error}</p>
      </div>
    );
  }

  if (!applicants.length) {
    return (
      <div className="bg-yellow-50 border pt-4 border-yellow-200 rounded-lg p-6 text-center shadow-sm">
        <p className="text-yellow-800 font-semibold text-lg">No applicants found for this job.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-xl pt-100 p-8 pt-4 max-w-7xl mx-auto">
      <div className="relative flex flex-row items-center gap-4 sm:flex-col sm:items-start">
        <div className="flex justify-between items-center gap-80 w-full justsm:w-auto mb-4">
          <h2 className="text-2xl font-bold text-gray-900">All Applicants</h2>
          <div className="flex gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-md bg-gray-50 hover:bg-white"
              />
            </div>
            {selectedApplicants.length > 0 && (
              <div className="flex justify-between gap-3 items-center flex-nowrap">
                <button
                  onClick={() => setShowEmailPopup(true)}
                  className="px-3 py-3 text-white bg-green-600 rounded-lg text-md font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap w-[120px]"
                >
                  📧 Send ({selectedApplicants.length})
                </button>
                <button
                  onClick={handleOpenStatusModal}
                  className="px-2 py-3 text-white bg-blue-700 rounded-lg text-md font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap w-[160px]"
                >
                  Update Status ({selectedApplicants.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-red-800 font-semibold text-md">Error</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}
      {assessmentError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-red-800 font-semibold text-lg">Assessment Error</p>
            <p className="text-red-600 text-md mt-1">{assessmentError}</p>
          </div>
        </div>
      )}
      {assessmentSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-green-800 font-semibold text-lg">Success</p>
            <p className="text-green-600 text-md mt-1">{assessmentSuccess}</p>
          </div>
        </div>
      )}

      <ApplicantsTable
        applicants={filteredApplicants}
        showCheckboxes={true}
        selectedApplicants={selectedApplicants.map((app) => app.name)}
        onSelectApplicant={handleSelectApplicant}
        showStatus={true}
        showDeleteButton={true}
        onDeleteApplicant={handleDeleteApplicant}
      />

    

      {showEmailPopup && (
        <EmailSendingPopup
          isOpen={showEmailPopup}
          onClose={() => setShowEmailPopup(false)}
          selectedApplicants={selectedApplicants}
          currentUserEmail={ownerEmail}
          jobId={jobId}
          jobTitle={job_title || ""}
          onEmailSent={() => {
            setSelectedApplicants([]);
            setShowEmailPopup(false);
            toast.success("Email sent successfully!");
          }}
        />
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && (
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
                onClick={handleCloseStatusModal}
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
                {selectedApplicants.map((applicant) => (
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
                        <p className="text-sm text-gray-500">{applicant.email_id}</p>
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
                onClick={handleCloseStatusModal}
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

      {/* Assessment Modal */}
      {isAssessmentModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-modal-title"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2
                id="assessment-modal-title"
                className="text-xl font-bold text-gray-900 flex items-center gap-2"
              >
                Create Assessment
              </h2>
              <button
                onClick={handleCloseAssessmentModal}
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-md"
                  required
                />
              </div>
              <div>
                <input
                  type="url"
                  value={testLink}
                  onChange={(e) => setTestLink(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-md"
                  placeholder="Test Link"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={handleCloseAssessmentModal}
                className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-md"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAssessment}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                aria-label="Confirm assessment creation"
              >
                Create Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Details Modal */}
      {isOfferModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-modal-title"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2
                id="offer-modal-title"
                className="text-xl font-bold text-gray-900 flex items-center gap-2"
              >
                <Award className="h-6 w-6 text-blue-600" />
                Enter Offer Details
              </h2>
              <button
                onClick={handleCloseOfferModal}
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Offered Salary
                </label>
                <input
                  type="text"
                  value={offeredSalary}
                  onChange={(e) => setOfferedSalary(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-md"
                  placeholder="Enter offered salary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Target Start Date
                </label>
                <input
                  type="date"
                  value={targetStartDate}
                  onChange={(e) => setTargetStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={handleCloseOfferModal}
                className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-md"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOfferDetails}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                aria-label="Confirm offer details"
              >
                Confirm Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Warning Modal */}
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
    </div>
  );
}