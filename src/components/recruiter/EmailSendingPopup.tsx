/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// components/recruiter/EmailSendingPopup.tsx
"use client";

import { Delete } from "lucide-react";
import { useEffect, useState } from "react";

interface EditableApplicant {
  position: string;
  candidateName: string;
  contactNo: string;
  email: string;
  currentCompany: string;
  experience: string;
  currentCTC: string;
  expCTC: string;
  noticePeriod: string;
  currentLocation: string;
  qualification: string;
  resume_attachment?: string;
  resumeLink: string;
}

interface EmailSendingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicants: any[];
  currentUserEmail: string;
  jobId: string;
  onEmailSent: () => void;
  jobTitle: string;
  user: { username: string } | null;
}

export default function EmailSendingPopup({
  isOpen,
  onClose,
  selectedApplicants,
  currentUserEmail,
  jobId,
  onEmailSent,
  jobTitle,
  user,
}: EmailSendingPopupProps) {
  console.log("selected applicants ", selectedApplicants);

  const [clientEmail, setClientEmail] = useState("");
  const [ccEmails, setCcEmails] = useState("");
  const [bccEmails, setBccEmails] = useState("");
  const [subject, setSubject] = useState(`Applicants for ${jobTitle}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editableApplicants, setEditableApplicants] = useState<EditableApplicant[]>([]);

  // Helper function to extract experience from custom_experience array
  const extractExperience = (applicant: any): string => {
    if (applicant.custom_experience && applicant.custom_experience.length > 0) {
      const exp = applicant.custom_experience[0];
      return exp.company_name || "";
    }
    return "";
  };

  // Helper function to extract qualification from custom_education array
  const extractQualification = (applicant: any): string => {
    if (applicant.custom_education && applicant.custom_education.length > 0) {
      const edu = applicant.custom_education[0];
      return edu.degree || "";
    }
    return "";
  };

  // Initialize editable applicants when selectedApplicants changes
  useEffect(() => {
    const mappedApplicants: EditableApplicant[] = selectedApplicants.map((applicant) => ({
      position: applicant.designation || "",
      candidateName: applicant.applicant_name || "",
      contactNo: applicant.phone_number || "",
      email: applicant.email_id || "",
      currentCompany: applicant.custom_company_name || extractExperience(applicant),
      experience: "",
      currentCTC: "",
      expCTC: "",
      noticePeriod: "",
      currentLocation: applicant.country || "",
      qualification: extractQualification(applicant),
      resume_attachment: applicant.resume_attachment,
      resumeLink: applicant.resume_attachment
        ? `${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}${applicant.resume_attachment}`
        : "",
    }));
    setEditableApplicants(mappedApplicants);
  }, [selectedApplicants]);

  // Helper function to validate email addresses
  const validateEmails = (emails: string): string[] => {
    if (!emails.trim()) return [];
    const emailArray = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);
    const invalidEmails = emailArray.filter(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    return invalidEmails.length > 0 ? [] : emailArray;
  };

  // Helper function to convert newlines to <br/> for HTML rendering
  const convertNewlinesToBreaks = (text: string): string => {
    return text.replace(/\n/g, "<br/>");
  };

  // Generate HTML table for the email and preview
  const generateEmailTable = (): string => {
    if (editableApplicants.length === 0) return "";

    return `
<div style="overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%;">
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; min-width: 600px; font-family: Arial, sans-serif; font-size: 12px;">
    <thead>
      <tr style="background-color: #b4c7e7;">
        <th style="text-align: left;">Position</th>
        <th style="text-align: left;">Candidate Name</th>
        <th style="text-align: left;">Contact No</th>
        <th style="text-align: left;">Email</th>
        <th style="text-align: left;">Current company</th>
        <th style="text-align: left;">Experience</th>
        <th style="text-align: left;">Current CTC</th>
        <th style="text-align: left;">Exp CTC</th>
        <th style="text-align: left;">Notice period</th>
        <th style="text-align: left;">Current Location</th>
        <th style="text-align: left;">Qualification</th>
      </tr>
    </thead>
    <tbody>
      ${editableApplicants
        .map(
          (applicant, index) => `
      <tr style="background-color: ${index % 2 === 0 ? "#ffffff" : "#f5f5f5"};">
        <td style="padding: 8px;">${applicant.position || "-"}</td>
        <td style="padding: 8px;">${applicant.candidateName || "-"}</td>
        <td style="padding: 8px;">${applicant.contactNo || "-"}</td>
        <td style="padding: 8px;">${applicant.email || "-"}</td>
        <td style="padding: 8px;">${applicant.currentCompany || "-"}</td>
        <td style="padding: 8px;">${applicant.experience || "-"}</td>
        <td style="padding: 8px;">${applicant.currentCTC || "-"}</td>
        <td style="padding: 8px;">${applicant.expCTC || "-"}</td>
        <td style="padding: 8px;">${applicant.noticePeriod || "-"}</td>
        <td style="padding: 8px;">${applicant.currentLocation || "-"}</td>
        <td style="padding: 8px;">${applicant.qualification || "-"}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</div>
    `.trim();
  };

  // Generate the default email template (without table or <br/> tags)
  const getDefaultTemplate = (clientEmail?: string): string => {
    let clientName = "Client";
    if (clientEmail) {
      const localPart = clientEmail.split("@")[0];
      let firstName = localPart.split(/[.\-_]/)[0];
      firstName = firstName.replace(/\d+$/, "");
      if (firstName) {
        clientName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      }
    }

    return `Hi ${clientName},

Please find the attached profiles for ${jobTitle}.

Best regards,
${process.env.NEXT_PUBLIC_COMPANY_NAME || ""}`;
  };

  // Update message when component mounts or clientEmail changes
  useEffect(() => {
    setMessage(getDefaultTemplate(clientEmail));
  }, [clientEmail, jobTitle]);

  // Update message when editableApplicants changes (to ensure table updates in preview)
  useEffect(() => {
    const defaultMessage = getDefaultTemplate(clientEmail);
    if (message === "" || message === defaultMessage) {
      setMessage(defaultMessage);
    }
  }, [editableApplicants, clientEmail]);

  // Helper function to insert table before "Best regards"
  const insertTableBeforeFooter = (message: string, table: string): string => {
    const footerMarker = "Best regards,";
    const footerIndex = message.indexOf(footerMarker);
    if (footerIndex === -1) {
      // If no "Best regards" is found, append table at the end with spacing
      return `${convertNewlinesToBreaks(message)}<br/>${table}`;
    }
    // Insert table before "Best regards" with spacing
    return `${convertNewlinesToBreaks(message.substring(0, footerIndex))}<br/>${table}<br/>${convertNewlinesToBreaks(
      message.substring(footerIndex)
    )}`;
  };

  // Handle table cell edit
  const handleCellEdit = (index: number, field: keyof EditableApplicant, value: string) => {
    const updated = [...editableApplicants];
    updated[index] = { ...updated[index], [field]: value };
    setEditableApplicants(updated);
  };

  // Handle delete row
  const handleDeleteRow = (index: number) => {
    const updated = editableApplicants.filter((_, i) => i !== index);
    setEditableApplicants(updated);
  };

  const handleSendEmail = async () => {
    if (!clientEmail.trim()) {
      setError("Please enter at least one recipient email address");
      return;
    }

    // Validate email addresses
    const toEmailsArray = validateEmails(clientEmail);
    const ccEmailsArray = validateEmails(ccEmails);
    const bccEmailsArray = validateEmails(bccEmails);

    if (
      toEmailsArray.length === 0 &&
      ccEmailsArray.length === 0 &&
      bccEmailsArray.length === 0
    ) {
      setError("Please enter at least one valid email address in To, CC, or BCC");
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Insert table before "Best regards" in the email message
      const emailMessage = insertTableBeforeFooter(message, generateEmailTable());

      const emailData = {
        from_email: currentUserEmail,
        to_email: toEmailsArray.join(","),
        cc: ccEmailsArray.join(","),
        bcc: bccEmailsArray.join(","),
        subject: subject,
        message: emailMessage,
        job_id: jobId,
        username: currentUserEmail,
        applicants: selectedApplicants.map((applicant, index) => ({
          name: applicant.name,
          applicant_name: editableApplicants[index]?.candidateName || applicant.applicant_name,
          email_id: editableApplicants[index]?.email || applicant.email_id,
          designation: editableApplicants[index]?.position || applicant.designation,
          resume_attachment: applicant.resume_attachment,
        })),
      };

      const response = await fetch("/api/send-email", {
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

      setClientEmail("");
      setCcEmails("");
      setBccEmails("");
      setSubject(`Applicants for ${jobTitle}`);
      setMessage(getDefaultTemplate());

      onEmailSent();
      onClose();
    } catch (err: any) {
      console.error("❌ Error sending email:", err);
      setError(err.message || "Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Send Applicants to Client</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={sending}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Sending {editableApplicants.length} applicant(s) for job: {jobTitle}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* From Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Email (Company)
            </label>
            <input
              type="email"
              value={`${process.env.NEXT_PUBLIC_COMPANY_NAME} <${currentUserEmail}>`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
            />
          </div>

          {/* To Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Email *</label>
            <input
              type="text"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Enter recipient email addresses (comma-separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={sending}
            />
          </div>

          {/* CC and BCC in one row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
              <input
                type="text"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
                placeholder="CC emails (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={sending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
              <input
                type="text"
                value={bccEmails}
                onChange={(e) => setBccEmails(e.target.value)}
                placeholder="BCC emails (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={sending}
              />
            </div>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={sending}
            />
          </div>

          {/* Editable Content Area with Table */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Details (Editable)
            </label>

            {/* Editable Table */}
            <div className="border border-gray-300 rounded-lg overflow-x-auto mb-4">
              <table className="w-full text-xs">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-2 py-2 text-left border-b">Position</th>
                    <th className="px-2 py-2 text-left border-b">Candidate Name</th>
                    <th className="px-2 py-2 text-left border-b">Contact No</th>
                    <th className="px-2 py-2 text-left border-b">Email</th>
                    <th className="px-2 py-2 text-left border-b">Current Company</th>
                    <th className="px-2 py-2 text-left border-b">Experience</th>
                    <th className="px-2 py-2 text-left border-b">Current CTC</th>
                    <th className="px-2 py-2 text-left border-b">Exp CTC</th>
                    <th className="px-2 py-2 text-left border-b">Notice Period</th>
                    <th className="px-2 py-2 text-left border-b">Location</th>
                    <th className="px-2 py-2 text-left border-b">Qualification</th>
                    <th className="px-2 py-2 text-left border-b">Resume</th>
                    <th className="px-2 py-2 text-left border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {editableApplicants.map((applicant, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.position}
                          onChange={(e) => handleCellEdit(index, "position", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.candidateName}
                          onChange={(e) => handleCellEdit(index, "candidateName", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.contactNo}
                          onChange={(e) => handleCellEdit(index, "contactNo", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.email}
                          onChange={(e) => handleCellEdit(index, "email", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.currentCompany}
                          onChange={(e) => handleCellEdit(index, "currentCompany", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.experience}
                          onChange={(e) => handleCellEdit(index, "experience", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.currentCTC}
                          onChange={(e) => handleCellEdit(index, "currentCTC", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.expCTC}
                          onChange={(e) => handleCellEdit(index, "expCTC", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.noticePeriod}
                          onChange={(e) => handleCellEdit(index, "noticePeriod", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.currentLocation}
                          onChange={(e) => handleCellEdit(index, "currentLocation", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        <input
                          type="text"
                          value={applicant.qualification}
                          onChange={(e) => handleCellEdit(index, "qualification", e.target.value)}
                          className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                          disabled={sending}
                        />
                      </td>
                      <td className="px-2 py-1 border-b">
                        {applicant.resumeLink ? (
                          <a
                            href={applicant.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-xs"
                          >
                            View Resume
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-2 py-1 border-b">
                        <button
                          onClick={() => handleDeleteRow(index)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          disabled={sending}
                        >
                          <Delete className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Editable Message Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidate Details (Editable)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={sending}
                placeholder="Compose your email message here..."
              />
              <p className="text-xs text-gray-500 mt-2">
                ✏️ Edit the table above to update candidate details. You can also edit the email content in the textarea above. The candidate table will be included in the email before the "Best regards" line.
              </p>
            </div>
          </div>

          {/* Message Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Preview</label>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs overflow-x-auto min-h-32"
              dangerouslySetInnerHTML={{ __html: insertTableBeforeFooter(message, generateEmailTable()) }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending || (!clientEmail && !ccEmails && !bccEmails) || editableApplicants.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send Email"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}