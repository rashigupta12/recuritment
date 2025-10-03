/* eslint-disable @typescript-eslint/no-explicit-any */
import { JobApplicant } from '../../app/(dashboard)/dashboard/recruiter/viewapplicant/page';

interface ApplicantsTableProps {
  applicants: JobApplicant[];
  showStatus?: boolean;
  showCheckboxes?: boolean;
  selectedApplicants?: string[];
  onSelectApplicant?: (name: string) => void;
  onRowClick?: (applicant: JobApplicant) => void; // New prop for row click
}

export function ApplicantsTable({
  applicants,
  showCheckboxes = false,
  showStatus = false,
  selectedApplicants = [],
  onSelectApplicant,
  onRowClick,
}: ApplicantsTableProps) {
  console.log(
    'Applicants in table:',
    applicants.map((a) => ({ name: a.name, email_id: a.email_id }))
  );

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-xl shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold tracking-wide">
            {showCheckboxes && (
              <th className="py-4 px-6 text-left">Select</th>
            )}
            <th className="py-4 px-6 text-left">Job Title</th>
            <th className="py-4 px-6 text-left">Name</th>
            <th className="py-4 px-6 text-left">Email</th>
            <th className="py-4 px-6 text-left">Phone</th>
            {showStatus && (
              <th className="py-4 px-6 text-left">Status</th>
            )}
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {applicants.map((applicant, index) => (
            <tr
              key={applicant.name || `applicant-${index}`}
              onClick={() => onRowClick?.(applicant)}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {showCheckboxes && (
                <td className="py-4 px-6 text-left">
                  <input
                    type="checkbox"
                    checked={selectedApplicants.includes(applicant.name)}
                    onChange={() => onSelectApplicant?.(applicant.name)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                    disabled={!applicant.name}
                  />
                </td>
              )}
              <td className="py-4 px-6 text-left">{applicant.job_title || 'N/A'}</td>
              <td className="py-4 px-6 text-left">{applicant.applicant_name || 'N/A'}</td>
              <td className="py-4 px-6 text-left">{applicant.email_id || 'N/A'}</td>
              <td className="py-4 px-6 text-left">{applicant.phone_number || 'N/A'}</td>
              {showStatus && (
                <td className="py-4 px-6 text-left">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
                    {applicant.status || 'N/A'}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}