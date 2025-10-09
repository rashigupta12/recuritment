/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// components/recruiter/EmailSendingPopup.tsx
'use client';

import { useEffect, useState } from 'react';

interface EmailSendingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    selectedApplicants: any[];
    currentUserEmail: string;
    jobId: string;
    onEmailSent: () => void;
    jobTitle: string;
}

export default function EmailSendingPopup({
    isOpen,
    onClose,
    selectedApplicants,
    currentUserEmail,
    jobId,
    onEmailSent,
    jobTitle,
}: EmailSendingPopupProps) {
    const [clientEmail, setClientEmail] = useState('');
    const [subject, setSubject] = useState(`Applicants for Job Title ${jobTitle}`);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🧠 Helper function to extract name from email and return the default message
    function getDefaultTemplate(applicants: any[], jobId: string, clientEmail?: string): string {
        // Extract first name from client email
        let clientName = 'Client';
        if (clientEmail) {
        const localPart = clientEmail.split('@')[0];
        // Split by common separators and pick the first part
        let firstName = localPart.split(/[.\-_]/)[0];
        // Remove any trailing numbers
        firstName = firstName.replace(/\d+$/, '');
        // Capitalize first letter
        if (firstName) {
            clientName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        }
    }


        return `Dear ${clientName},
I am pleased to share with you ${applicants.length} candidate ${
            applicants.length === 1 ? 'profile' : 'profiles'
        } for the position ${jobTitle}.

Candidate Summary:
${applicants
    .map(
        (applicant, index) =>
            `${index + 1}. ${applicant.applicant_name || 'N/A'} - ${applicant.designation || 'N/A'}`
    )
    .join('\n')}

Please find their resume attached with this email.
We trust that the shared ${
            applicants.length === 1 ? 'candidate' : 'candidates'
        } have the skills and experience that align with your requirements.

Best regards,
${process.env.NEXT_PUBLIC_COMPANY_NAME || ''}`;
    }

    // 🪄 Update message dynamically when email changes
    useEffect(() => {
        setMessage(getDefaultTemplate(selectedApplicants, jobId, clientEmail));
    }, [clientEmail, selectedApplicants, jobId]);

    const handleSendEmail = async () => {
        if (!clientEmail.trim()) {
            setError('Please enter client email address');
            return;
        }

        if (!clientEmail.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setSending(true);
        setError(null);

        try {
            const emailData = {
                from_email: currentUserEmail,
                to_email: clientEmail,
                subject: subject,
                message: message,
                job_id: jobId,
                applicants: selectedApplicants.map((applicant) => ({
                    name: applicant.name,
                    applicant_name: applicant.applicant_name,
                    email_id: applicant.email_id,
                    designation: applicant.designation,
                    resume_attachment: applicant.resume_attachment,
                })),
            };

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send email');
            }

            setClientEmail('');
            setSubject(`Applicants for Job Title ${jobTitle}`);
            setMessage(getDefaultTemplate(selectedApplicants, jobId));

            onEmailSent();
            onClose();
        } catch (err: any) {
            console.error('❌ Error sending email:', err);
            setError(err.message || 'Failed to send email. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Send Applicants to Client
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={sending}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
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
                        Sending {selectedApplicants.length} applicant(s) for job: {jobId}
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
                        <p className="text-xs text-gray-500 mt-1">
                            Emails are sent through company SMTP server
                        </p>
                    </div>

                    {/* To Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Email *
                        </label>
                        <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="Enter client email address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={sending}
                        />
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={sending}
                        />
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                            disabled={sending}
                        />
                    </div>

                    {/* Selected Applicants */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selected Applicants ({selectedApplicants.length})
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-24 overflow-y-auto">
                            {selectedApplicants.map((applicant, index) => (
                                <div
                                    key={applicant.name || index}
                                    className="flex items-center justify-between py-1"
                                >
                                    <span className="text-sm text-gray-700">
                                        {index + 1}. {applicant.applicant_name || 'N/A'} -{' '}
                                        {applicant.designation || 'N/A'}
                                    </span>
                                    {applicant.resume_attachment && (
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap ml-2">
                                            📎 Resume
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
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
                            disabled={sending || !clientEmail}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {sending ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </div>
                            ) : (
                                'Send Email'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
