/* eslint-disable @typescript-eslint/no-explicit-any */
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  X,
  AlertCircle,
  CheckCircle,
  BuildingIcon,
  BriefcaseIcon,
  UserIcon,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Attachment } from "@/lib/mail/mailer3";

// JobApplicant interface
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
  custom_interview_status?: string;
  custom_interview_round?: string;
  custom_interview_panel_name?: string;
  custom_schedule_date?: string;
  custom_company_name?: string;
}

// InterviewScheduleData interface
interface InterviewScheduleData {
  schedule_date: string;
  interview_round: string;
  interview_panel_name?: string;
  mode_of_interview: "Virtual" | "In Person";
  from_time?: string;
  custom_link?: string;
  custom_remarks?: string;
  custom_interviewers?: string;
}

// InterviewDetailsModalProps interface
interface InterviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: JobApplicant;
  jobId: string;
  onStatusUpdate: () => void;
  currentUserEmail?: string;
}

// Function to generate an ICS file for a calendar event
function generateICSFile(
  formData: InterviewScheduleData,
  applicant: JobApplicant,
  jobId: string
): string {
  const startDateTime = new Date(`${formData.schedule_date}T${formData.from_time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30-minute duration
  const jobTitle = applicant.designation || applicant.job_title || "Interview";
  const companyName = applicant.custom_company_name || "HevHire";
  const eventTitle = `Interview: ${jobTitle} at ${companyName}`;
  const eventDescription =
    formData.custom_remarks || "Please join the interview on time.";
  const location =
    formData.mode_of_interview === "Virtual" ? formData.custom_link : "In Person";
  const organizerEmail = process.env.COMPANY_EMAIL || "no-reply@hevhire.com";
  const attendeeEmail = applicant.email_id || "";

  // Format dates to ICS format (YYYYMMDDTHHMMSS)
  const formatICSDate = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return (
      date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  };

  // IST Timezone definition
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HevHire//Interview Scheduler//EN",
    "METHOD:REQUEST", // Added to indicate a calendar invite request
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@hevhire.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART;TZID=Asia/Kolkata:${formatICSDate(startDateTime)}`,
    `DTEND;TZID=Asia/Kolkata:${formatICSDate(endDateTime)}`,
    `SUMMARY:${eventTitle}`,
    `DESCRIPTION:${eventDescription.replace(/\n/g, "\\n")}`, // Escape newlines
    `LOCATION:${location || "N/A"}`,
    `ORGANIZER;CN=HevHire:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${
      applicant.applicant_name || "Candidate"
    };ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${attendeeEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // Log ICS content for debugging
  console.log("Generated ICS content:", icsContent);

  // Convert to base64 for attachment
  return Buffer.from(icsContent).toString("base64");
}

export const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  isOpen,
  onClose,
  applicant,
  jobId,
  onStatusUpdate,
  currentUserEmail,
}) => {
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [interviewStatuses, setInterviewStatuses] = useState<{
    [key: string]: string;
  }>({});
  const [formData, setFormData] = useState<InterviewScheduleData>({
    schedule_date: "",
    interview_round: "",
    interview_panel_name: "aditya@hevhire.com",
    mode_of_interview: "Virtual",
    from_time: "17:00",
    custom_link: "",
    custom_remarks: "this is remarks field",
    custom_interviewers: "",
  });
  const [emailInputs, setEmailInputs] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [localError, setLocalError] = useState<string | null>(
    "Please fill in all required fields (Schedule Date, Interview Round, Mode, Time, Link)"
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  const hasInterviews = scheduledInterviews.length > 0;
  const latestInterview = hasInterviews
    ? scheduledInterviews[scheduledInterviews.length - 1]
    : null;

  // Check if latest interview is cleared
  const getInterviewStatus = (interview: any) => {
    const status = interview.status || "";
    return status.toLowerCase();
  };

  const isLatestInterviewCleared =
    latestInterview && getInterviewStatus(latestInterview) === "cleared";

  const canCreateNewInterview = !hasInterviews || isLatestInterviewCleared;
  const showCreateInterviewForm = canCreateNewInterview && showCreateForm;

  useEffect(() => {
    if (isOpen && applicant) {
      fetchScheduledInterviews();
      setShowCreateForm(false);
      setFormData({
        schedule_date: "",
        interview_round: "",
        interview_panel_name: "aditya@hevhire.com",
        mode_of_interview: "Virtual",
        from_time: "17:00",
        custom_link: "",
        custom_remarks: "this is remarks field",
        custom_interviewers: "",
      });
      setEmailInputs([""]);
      setLocalError(
        "Please fill in all required fields (Schedule Date, Interview Round, Mode, Time, Link)"
      );
    }
  }, [isOpen, applicant]);

  const fetchScheduledInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const response = await frappeAPI.getInterviewsByApplicant(applicant.name);
      const interviews = response.data || [];
      setScheduledInterviews(interviews);

      const initialStatuses = interviews.reduce(
        (acc: { [key: string]: string }, interview: any) => {
          acc[interview.name] = interview.status || "";
          return acc;
        },
        {}
      );
      setInterviewStatuses(initialStatuses);
    } catch (err) {
      console.error("Error fetching scheduled interviews:", err);
      setScheduledInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  };

const sendInterviewEmail = async () => {
    if (!applicant.email_id) {
      console.error("No email address provided for the applicant");
      toast.error("No email address provided for the applicant");
      return;
    }

    setIsSendingEmail(true);
    try {
      const candidateName = applicant.applicant_name || "Candidate";
      const firstName = candidateName.split(" ")[0];
      const jobTitle = applicant.designation || applicant.job_title || "N/A";
      const companyName = applicant.custom_company_name || "Our Company";
      const locationMode =
        formData.mode_of_interview === "Virtual"
          ? `${formData.mode_of_interview} (${formData.custom_link})`
          : `${formData.mode_of_interview}${
              formData.custom_interviewers
                ? ` (Interviewers: ${formData.custom_interviewers})`
                : ""
            }`;

      // Generate ICS file
      const icsContent = generateICSFile(formData, applicant, jobId);

      const emailData = {
        from_email: "no-reply@hevhire.com",
        to_email: applicant.email_id,
        cc: formData.custom_interviewers
          ? formData.custom_interviewers
              .split(",")
              .map((email) => email.trim())
              .filter((email) => email)
              : undefined,
        subject: `Interview Invitation – ${jobTitle} at ${companyName}`,
        message: `Hi ${firstName},

We are pleased to invite you to an interview for the ${jobTitle} position at ${companyName}.
Location/Mode: ${locationMode}
Date & Time: ${new Date(formData.schedule_date).toLocaleDateString(
          "en-IN",
          {
            dateStyle: "medium",
          }
        )} at ${formData.from_time} (IST)
Duration: 30 mins
Agenda:
1) Introduction & overview
2) Technical / HR discussion
3) Q&A
Instructions:
1) Please join on time.
2) Ensure your device/camera/microphone is working if it's a virtual interview.
3) Keep your resume and any supporting documents handy.

Please open the attached calendar invite (interview.ics) and accept it to reserve the time slot in your calendar.

We look forward to speaking with you!

Regards,
${process.env.NEXT_PUBLIC_COMPANY_NAME || "HEVHire Team"}`,
        job_id: jobId,
        username: currentUserEmail,
        applicants: [
          {
            name: applicant.name,
            applicant_name: applicant.applicant_name,
            email_id: applicant.email_id,
            designation: jobTitle,
            resume_attachment: applicant.resume_attachment,
          },
        ],
        // Add attachments array directly to emailData
        attachments: [
          {
            filename: `interview_${applicant.name}_${formData.schedule_date}.ics`,
            content: icsContent,
            contentType: "text/calendar; method=REQUEST",
            disposition: "attachment",
            contentId: undefined,
          },
        ],
      };

      console.log("Sending email with ICS attachment:", {
        to: applicant.email_id,
        subject: emailData.subject,
        attachmentCount: 1,
        attachmentName: `interview_${applicant.name}_${formData.schedule_date}.ics`,
      });

      const response = await fetch("/api/mails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      console.log("Email sent successfully:", result);
      toast.success("Interview invitation email sent successfully!");
    } catch (error: any) {
      console.error("Error sending interview email:", error);
      toast.error(`Failed to send interview email: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const [interviewRounds, setInterviewRounds] = useState<
    Array<{ name: string }>
  >([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInterviewRounds();
    }
  }, [isOpen]);

  const fetchInterviewRounds = async () => {
    setLoadingRounds(true);
    try {
      const response = await frappeAPI.getInterviewRounds();
      const roundsData = Array.isArray(response.data) ? response.data : [];
      setInterviewRounds(roundsData);
      console.log("Fetched interview rounds:", roundsData);
    } catch (err) {
      console.error("Error fetching interview rounds:", err);
      setInterviewRounds([]);
      toast.error("Failed to load interview rounds");
    } finally {
      setLoadingRounds(false);
    }
  };

  const handleUpdateInterviewStatus = async (interviewName: string) => {
    const newStatus = interviewStatuses[interviewName];
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await frappeAPI.updateInterviewStatus(interviewName, {
        status: newStatus,
      });

      const updateData = {
        status: "Interview",
        custom_interview_status: newStatus,
      };
      await frappeAPI.updateApplicantStatus(applicant.name, updateData);

      toast.success("Interview status updated successfully!");
      await fetchScheduledInterviews();
      onStatusUpdate();
    } catch (err: any) {
      console.error("Error updating interview status:", err);
      toast.error("Failed to update interview status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDateDDMMYYYY = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmailInputs = [...emailInputs];
    newEmailInputs[index] = value;
    setEmailInputs(newEmailInputs);
    setFormData({
      ...formData,
      custom_interviewers: newEmailInputs
        .filter((email) => email.trim())
        .join(","),
    });
  };

  const addEmailInput = () => {
    setEmailInputs([...emailInputs, ""]);
  };

  const removeEmailInput = (index: number) => {
    const newEmailInputs = emailInputs.filter((_, i) => i !== index);
    setEmailInputs(newEmailInputs);
    setFormData({
      ...formData,
      custom_interviewers: newEmailInputs
        .filter((email) => email.trim())
        .join(","),
    });
  };

  const handleCreateInterview = async () => {
    if (
      !formData.schedule_date ||
      !formData.interview_round ||
      !formData.mode_of_interview ||
      !formData.from_time ||
      (formData.mode_of_interview === "Virtual" && !formData.custom_link)
    ) {
      setLocalError(
        "Please fill in all required fields (Schedule Date, Interview Round, Mode, Time" +
          (formData.mode_of_interview === "Virtual" ? ", Link" : "") +
          ")"
      );
      return;
    }

    const selectedDate = new Date(formData.schedule_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setLocalError("Schedule date cannot be in the past");
      return;
    }

    if (scheduledInterviews.length > 0) {
      const selectedDateTruncated = new Date(formData.schedule_date);
      selectedDateTruncated.setHours(0, 0, 0, 0);
      const conflictingInterview = scheduledInterviews.find((interview) => {
        const interviewDate = new Date(interview.scheduled_on);
        interviewDate.setHours(0, 0, 0, 0);
        return (
          selectedDateTruncated.getTime() === interviewDate.getTime() &&
          formData.from_time === interview.from_time
        );
      });

      if (conflictingInterview) {
        setLocalError(
          "Cannot schedule a new interview at the same time as another interview on the same day"
        );
        return;
      }
    }

    if (formData.mode_of_interview === "Virtual") {
      try {
        new URL(formData.custom_link!);
      } catch {
        setLocalError("Please enter a valid URL for the interview link");
        return;
      }
    }

    if (formData.custom_interviewers) {
      const emails = formData.custom_interviewers
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter((email) => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        setLocalError(`Invalid email address(es): ${invalidEmails.join(", ")}`);
        return;
      }
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      const interviewPayload = {
        job_applicant: applicant.name,
        job_title: jobId,
        scheduled_on: formData.schedule_date,
        interview_round: formData.interview_round,
        from_time: formData.from_time,
        custom_mode_: formData.mode_of_interview,
        custom_link:
          formData.mode_of_interview === "Virtual"
            ? formData.custom_link
            : undefined,
        custom_remarks: formData.custom_remarks,
        custom_interviewers:
          formData.mode_of_interview === "In Person"
            ? formData.custom_interviewers
            : undefined,
        status: "Scheduled",
      };

      await frappeAPI.createInterview(interviewPayload);

      const updateData = {
        status: "Interview",
        custom_schedule_date: formData.schedule_date,
        custom_interview_round: formData.interview_round,
        custom_mode_of_interview: formData.mode_of_interview,
        custom_remarks: formData.custom_remarks,
        custom_interviewers:
          formData.mode_of_interview === "In Person"
            ? formData.custom_interviewers
            : undefined,
      };

      await frappeAPI.updateApplicantStatus(applicant.name, updateData);

      await sendInterviewEmail();

      toast.success("Interview scheduled successfully!");

      setFormData({
        schedule_date: "",
        interview_round: "",
        interview_panel_name: "",
        mode_of_interview: "Virtual",
        from_time: "",
        custom_link: "",
        custom_remarks: "",
        custom_interviewers: "",
      });
      setEmailInputs([""]);
      setShowCreateForm(false);
      fetchScheduledInterviews();
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
      schedule_date: "",
      interview_round: "",
      interview_panel_name: "",
      mode_of_interview: "Virtual",
      from_time: "",
      custom_link: "",
      custom_remarks: "",
      custom_interviewers: "",
    });
    setEmailInputs([""]);
    setLocalError(null);
    setInterviewStatuses({});
    setShowCreateForm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting || isSendingEmail || isUpdatingStatus}
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
              <span className="capitalize">
                {applicant.applicant_name
                  ? applicant.applicant_name
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())
                  : applicant.name
                      ?.toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
              </span>
            </div>
            <div className="w-px h-4 bg-blue-200"></div>
            <div className="flex items-center gap-1">
              <BriefcaseIcon className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Job:</span>
              <span>{applicant.designation || applicant.job_title || "N/A"}</span>
            </div>
            <div className="w-px h-4 bg-blue-200"></div>
            <div className="flex items-center gap-1">
              <BuildingIcon className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Client:</span>
              <span>{applicant.custom_company_name || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Scheduled Interviews Section */}
        {!loadingInterviews && scheduledInterviews.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Scheduled Interviews</h3>
            </div>
            <div className="space-y-3">
              {scheduledInterviews.map((interview) => (
                <div
                  key={interview.name}
                  className="p-3 bg-white border border-green-100 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-row items-center gap-2">
                      <span className="font-semibold text-gray-600 text-sm">Round:</span>
                      <span className="text-sm">{interview.interview_round || "N/A"}</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <span className="font-semibold text-gray-600 text-sm">Date:</span>
                      <span className="text-sm">{formatDateDDMMYYYY(interview.scheduled_on) || "N/A"}</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <span className="font-semibold text-gray-600 text-sm">Time:</span>
                      <span className="text-sm">{interview.from_time}</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <span className="font-semibold text-gray-600 text-sm">Mode:</span>
                      <span className="text-sm">{interview.custom_mode_ || "N/A"}</span>
                    </div>
                    {interview.custom_mode_ === "Virtual" && (
                      <div className="flex flex-row items-center gap-2 col-span-2">
                        <span className="font-semibold text-gray-600 text-sm">Link:</span>
                        <a
                          href={interview.custom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {interview.custom_link || "N/A"}
                        </a>
                      </div>
                    )}
                    {interview.custom_mode_ === "In Person" &&
                      interview.custom_interviewers && (
                        <div className="flex flex-row items-center gap-2 col-span-2">
                          <span className="font-semibold text-gray-600 text-sm">
                            Interviewers:
                          </span>
                          <span className="text-sm">
                            {interview.custom_interviewers || "N/A"}
                          </span>
                        </div>
                      )}
                    <div className="flex flex-row items-center gap-2">
                      <span className="font-semibold text-gray-600 text-sm">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === "Cleared"
                            ? "bg-green-100 text-green-800"
                            : interview.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : interview.status === "Under Review"
                            ? "bg-yellow-100 text-yellow-800"
                            : interview.status === "Pending"
                            ? "bg-blue-100 text-blue-800"
                            : interview.status === "Scheduled"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {interview.status || "Not Set"}
                      </span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <select
                        value={interviewStatuses[interview.name] || ""}
                        onChange={(e) =>
                          setInterviewStatuses({
                            ...interviewStatuses,
                            [interview.name]: e.target.value,
                          })
                        }
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                        disabled={isSubmitting || interview.status?.toLowerCase() === "cleared"}
                      >
                        <option value="">Update status...</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Cleared">Cleared</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      {interview.status?.toLowerCase() !== "cleared" && (
                        <button
                          onClick={() => handleUpdateInterviewStatus(interview.name)}
                          disabled={isSubmitting || !interviewStatuses[interview.name]}
                          className="px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                          {isSubmitting ? "Updating..." : "Update"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert when latest interview is not cleared */}
        {hasInterviews && !isLatestInterviewCleared && !showCreateForm && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                The latest interview must be marked as &quot;Cleared&quot; before scheduling a new interview.
              </p>
            </div>
          </div>
        )}

        {/* Success message when latest interview is cleared */}
        {hasInterviews && isLatestInterviewCleared && !showCreateForm && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-green-800">
                  Latest interview cleared! You can now schedule the next round.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={isUpdatingStatus}
                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Schedule
              </button>
            </div>
          </div>
        )}

        {/* Show create button when no interviews exist */}
        {!hasInterviews && !loadingInterviews && !showCreateForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-blue-800">
                  No interviews scheduled yet. Start by creating the first interview.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Interview
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loadingInterviews && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading scheduled interviews...</p>
          </div>
        )}

        {/* Create New Interview Form */}
        {showCreateInterviewForm && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {hasInterviews ? "Schedule Next Round" : "Create New Interview"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({
                    schedule_date: "",
                    interview_round: "",
                    interview_panel_name: "",
                    mode_of_interview: "Virtual",
                    from_time: "",
                    custom_link: "",
                    custom_remarks: "",
                    custom_interviewers: "",
                  });
                  setEmailInputs([""]);
                  setLocalError(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {localError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{localError}</p>
              </div>
            )}

            <div className="space-y-4">
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
                      checked={formData.mode_of_interview === "Virtual"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mode_of_interview: e.target.value as "Virtual" | "In Person",
                          custom_link: e.target.value === "Virtual" ? formData.custom_link : "",
                          custom_interviewers: e.target.value === "In Person" ? formData.custom_interviewers : "",
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300"
                      required
                      disabled={isSubmitting || isSendingEmail}
                    />
                    <span className="text-md text-gray-700">Virtual</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode_of_interview"
                      value="In Person"
                      checked={formData.mode_of_interview === "In Person"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mode_of_interview: e.target.value as "Virtual" | "In Person",
                          custom_link: e.target.value === "Virtual" ? formData.custom_link : "",
                          custom_interviewers: e.target.value === "In Person" ? formData.custom_interviewers : "",
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300"
                      required
                      disabled={isSubmitting || isSendingEmail}
                    />
                    <span className="text-md text-gray-700">In Person</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Schedule Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.schedule_date}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                  min={
                    latestInterview
                      ? new Date(latestInterview.scheduled_on).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  required
                  disabled={isSubmitting || isSendingEmail}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  From Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.from_time}
                  onChange={(e) =>
                    setFormData({ ...formData, from_time: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                  required
                  disabled={isSubmitting || isSendingEmail}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Interview Round <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.interview_round}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_round: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                  required
                  disabled={isSubmitting || isSendingEmail || loadingRounds}
                >
                  <option value="">Select Interview Round</option>
                  {interviewRounds.map((round) => {
                    const isRoundUsed = scheduledInterviews.some(
                      (interview) => interview.interview_round === round.name
                    );
                    return (
                      <option
                        key={round.name}
                        value={round.name}
                        disabled={isRoundUsed}
                      >
                        {round.name}
                      </option>
                    );
                  })}
                </select>
                {loadingRounds && (
                  <p className="text-xs text-gray-500 mt-1">Loading rounds...</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-md">
                  Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.custom_remarks || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, custom_remarks: e.target.value })
                  }
                  placeholder="Enter any remarks about the interview"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                  rows={4}
                  disabled={isSubmitting || isSendingEmail}
                />
              </div>

              {formData.mode_of_interview === "Virtual" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-md">
                    Interview Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.custom_link || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, custom_link: e.target.value })
                    }
                    onBlur={(e) => {
                      let value = e.target.value.trim();
                      if (value && !/^https?:\/\//i.test(value)) {
                        value = "https://" + value;
                      }
                      setFormData({ ...formData, custom_link: value });
                    }}
                    placeholder="e.g., https://meet.example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                    required
                    disabled={isSubmitting || isSendingEmail}
                  />
                </div>
              )}

              {formData.mode_of_interview === "In Person" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-md">
                    Interviewers <span className="text-gray-400 font-normal">
                      (Optional, add email addresses)
                    </span>
                  </label>
                  {emailInputs.map((email, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        placeholder="e.g., interviewer@example.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-md transition-all"
                        disabled={isSubmitting || isSendingEmail}
                      />
                      {emailInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailInput(index)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          disabled={isSubmitting || isSendingEmail}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {index === emailInputs.length - 1 && (
                        <button
                          type="button"
                          onClick={addEmailInput}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          disabled={isSubmitting || isSendingEmail}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isSubmitting || isSendingEmail}
            className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium text-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            Close
          </button>
          {showCreateInterviewForm && (
            <button
              onClick={handleCreateInterview}
              disabled={isSubmitting || isSendingEmail}
              className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all font-medium text-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Create interview"
            >
              {isSubmitting || isSendingEmail ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating...
                </>
              ) : (
                "Create Interview"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};