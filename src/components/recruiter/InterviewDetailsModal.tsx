import { frappeAPI } from "@/lib/api/frappeClient";
import { X, AlertCircle, CheckCircle, BuildingIcon, BriefcaseIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "sonner";
import { JobApplicant } from "@/app/(dashboard)/dashboard/recruiter/viewapplicant/page";

// Move the UpdateData interface here since it's used in this component
interface UpdateData {
  status: string;
  custom_offered_salary?: string;
  custom_target_start_date?: string;
  custom_interview_status?: string;
  custom_interview_round?: string;
  custom_interview_panel_name?: string;
  custom_schedule_date?: string;
}

interface InterviewScheduleData {
  schedule_date: string;
  interview_round: string;
  interview_panel_name?: string;
  mode_of_interview: 'Virtual' | 'In Person';
}

interface InterviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: JobApplicant;
  jobId: string;
  onStatusUpdate: () => void;
}

export const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  isOpen,
  onClose,
  applicant,
  jobId,
  onStatusUpdate,
}) => {
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [interviewStatuses, setInterviewStatuses] = useState<{ [key: string]: string }>({});
  
  // State for new interview form
  const [formData, setFormData] = useState<InterviewScheduleData>({
    schedule_date: '',
    interview_round: '',
    interview_panel_name: '',
    mode_of_interview: 'Virtual',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Check if at least one interview exists
  const hasInterviews = scheduledInterviews.length > 0;
  // Show create interview form if no interviews or status is Cleared (case-insensitive)
  const showCreateInterviewForm = !hasInterviews || (applicant.custom_interview_status || '').trim().toLowerCase() === "cleared";

  useEffect(() => {
    if (isOpen && applicant) {
      console.log("Applicant data:", applicant);
      console.log("Applicant status:", applicant.custom_interview_status);
      console.log("Show create form:", showCreateInterviewForm);
      fetchScheduledInterviews();
    }
  }, [isOpen, applicant]);

  // Add this useEffect to log when the form should show
  useEffect(() => {
    console.log("Applicant interview status:", applicant.custom_interview_status);
    console.log("Has interviews:", hasInterviews);
    console.log("Show create form:", showCreateInterviewForm);
  }, [applicant.custom_interview_status, hasInterviews, showCreateInterviewForm]);

  const fetchScheduledInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const response = await frappeAPI.getInterviewsByApplicant(applicant.name);
      console.log("Interview API Response:", response);
      
      const interviews = response.data || [];
      setScheduledInterviews(interviews);
      
      // Initialize status state for each interview from API response
      const initialStatuses = interviews.reduce((acc: { [key: string]: string }, interview: any) => {
        acc[interview.name] = interview.status || ''; // This will now get the status from API
        return acc;
      }, {});
      setInterviewStatuses(initialStatuses);
      console.log("Scheduled interviews with status:", interviews);
    } catch (err) {
      console.error("Error fetching scheduled interviews:", err);
      setScheduledInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  };

  if (!isOpen) return null;

  const handleUpdateInterviewStatus = async (interviewName: string) => {
    const newStatus = interviewStatuses[interviewName];
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update interview status via PUT request
      await frappeAPI.updateInterviewStatus(interviewName, { status: newStatus });
      
      // Update applicant status
      const updateData: UpdateData = {
        status: "Interview",
        custom_interview_status: newStatus,
      };
      await frappeAPI.updateApplicantStatus(applicant.name, updateData);
      
      toast.success("Interview status updated successfully!");
      
      // Refresh both interviews and applicant data
      await fetchScheduledInterviews();
      
      // Trigger parent component refresh to get updated applicant data
      onStatusUpdate();
      
    } catch (err: any) {
      console.error("Error updating interview status:", err);
      toast.error("Failed to update interview status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInterview = async () => {
    if (!formData.schedule_date || !formData.interview_round || !formData.mode_of_interview) {
      setLocalError("Please fill in all required fields (Schedule Date, Interview Round, Mode)");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.schedule_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setLocalError("Schedule date cannot be in the past");
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      const interviewPayload = {
        job_applicant: applicant.name,
        job_title: jobId,
        scheduled_on: formData.schedule_date,
        interview_round: formData.interview_round,
        interview_panel_name: formData.interview_panel_name || "",
        mode_of_interview: formData.mode_of_interview,
        status: "Scheduled",
      };

      await frappeAPI.createInterview(interviewPayload);
      console.log(`Interview created for ${applicant.name}`);

      // Update applicant status
      const updateData: UpdateData = {
        status: "Interview",
        custom_schedule_date: formData.schedule_date,
        custom_interview_round: formData.interview_round,
        custom_interview_panel_name: formData.interview_panel_name || "",
        custom_mode_of_interview: formData.mode_of_interview,
      };

      await frappeAPI.updateApplicantStatus(applicant.name, updateData);
      console.log(`Status updated for ${applicant.name}`);

      toast.success("Interview scheduled successfully!");
      setFormData({
        schedule_date: '',
        interview_round: '',
        interview_panel_name: '',
        mode_of_interview: 'Virtual',
      });
      fetchScheduledInterviews(); // Refresh interviews
      onStatusUpdate();
    } catch (err: any) {
      console.error("Interview scheduling error:", err);
      const errorMessage = err.message || "Failed to schedule interview";
      setLocalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      schedule_date: '',
      interview_round: '',
      interview_panel_name: '',
      mode_of_interview: 'Virtual',
    });
    setLocalError(null);
    setInterviewStatuses({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Applicant Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-wrap items-center gap-4 text-md text-gray-700">
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Applicant:</span>
              <span>{applicant.applicant_name}</span>
            </div>
            
            <div className="w-px h-4 bg-blue-200"></div>
            
            <div className="flex items-center gap-1">
              <BriefcaseIcon className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Job:</span>
              <span>{applicant.designation}</span>
            </div>
            
            <div className="w-px h-4 bg-blue-200"></div>
            
            <div className="flex items-center gap-1">
              <BuildingIcon className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Client:</span>
              <span>{applicant.custom_company_name}</span>
            </div>
          </div>
        </div>

        {/* Already Scheduled Interviews Section */}
 {!loadingInterviews && scheduledInterviews.length > 0 && (
  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center gap-2 mb-3">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <h3 className="font-semibold text-green-900">Scheduled Interviews</h3>
    </div>
    <div className="space-y-3">
      {scheduledInterviews.map((interview) => (
        <div key={interview.name} className="p-3 bg-white border border-green-100 rounded-lg">
          {/* All fields in 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold text-gray-600 text-sm">Round :</span>
              <span className="text-sm">{interview.interview_round || 'N/A'}</span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold text-gray-600 text-sm">Date :</span>
              <span className="text-sm">{interview.scheduled_on || 'N/A'}</span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold text-gray-600 text-sm">Panel :</span>
              <span className="text-sm">{interview.interview_panel_name || 'N/A'}</span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold text-gray-600 text-sm">Mode :</span>
              <span className="text-sm">{interview.mode_of_interview || 'N/A'}</span>
            </div>
            
            {/* Status display in first column */}
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold text-gray-600 text-sm">Status :</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                interviewStatuses[interview.name] === 'Cleared' ? 'bg-green-100 text-green-800' :
                interviewStatuses[interview.name] === 'Rejected' ? 'bg-red-100 text-red-800' :
                interviewStatuses[interview.name] === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                interviewStatuses[interview.name] === 'Pending' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {interviewStatuses[interview.name] || 'Not Set'}
              </span>
            </div>
            
            {/* Status controls in second column */}
            <div className="flex flex-row items-center gap-2">
              <select
                value={interviewStatuses[interview.name] || ''}
                onChange={(e) => setInterviewStatuses({ ...interviewStatuses, [interview.name]: e.target.value })}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                disabled={isSubmitting}
              >
                <option value="">Update status...</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Cleared">Cleared</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                onClick={() => handleUpdateInterviewStatus(interview.name)}
                disabled={isSubmitting || !interviewStatuses[interview.name]}
                className="px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {loadingInterviews && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading scheduled interviews...</p>
          </div>
        )}

        {!loadingInterviews && scheduledInterviews.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">No scheduled interviews yet</p>
          </div>
        )}

        {/* Create New Interview Section */}
        {showCreateInterviewForm && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {/* <h3 className="font-semibold text-gray-900 mb-4">Create New Interview</h3> */}
            
            {/* Error Message */}
            {localError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{localError}</p>
              </div>
            )}

            {/* New Interview Form Fields */}
            <div className="space-y-4">
               {/* Mode of Interview */}
              {/* Mode of Interview */}
  <div>
    <label className="block text-gray-700 font-semibold mb-2 text-md">
      Mode of Interview <span className="text-red-500">*</span>
    </label>
    <div className="flex gap-4">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="mode_of_interview"
          value="Virtual"
          checked={formData.mode_of_interview === 'Virtual'}
          onChange={(e) => setFormData({ ...formData, mode_of_interview: e.target.value as 'Virtual' | 'In Person' })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300"
          required
          disabled={isSubmitting}
        />
        <span className="text-md text-gray-700">Virtual</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="mode_of_interview"
          value="In Person"
          checked={formData.mode_of_interview === 'In Person'}
          onChange={(e) => setFormData({ ...formData, mode_of_interview: e.target.value as 'Virtual' | 'In Person' })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300"
          required
          disabled={isSubmitting}
        />
        <span className="text-md text-gray-700">In Person</span>
      </label>
    </div>
  </div>
              {/* Schedule Date */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Schedule Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.schedule_date}
                  onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Interview Round */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Interview Round <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.interview_round}
                  onChange={(e) => setFormData({ ...formData, interview_round: e.target.value })}
                  placeholder="e.g., Round 1, Technical, HR"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Interview Panel Name (Optional) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Interview Panel Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.interview_panel_name || ''}
                  onChange={(e) => setFormData({ ...formData, interview_panel_name: e.target.value })}
                  placeholder="e.g., John Doe, Jane Smith"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                  disabled={isSubmitting}
                />
              </div>

             
            </div>
          </div>
        )}

        {/* Info message when create interview form is not shown */}
        {!loadingInterviews && hasInterviews && (applicant.custom_interview_status || '').trim().toLowerCase() !== "cleared" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              New interviews can only be scheduled when the applicant's status is Cleared.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium text-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            Close
          </button>
          {showCreateInterviewForm && (
            <button
              onClick={handleCreateInterview}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-white bg-blue-600 hover:bg-green-700 rounded-lg transition-all font-medium text-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Create interview"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating...
                </>
              ) : (
                'Create Interview'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};