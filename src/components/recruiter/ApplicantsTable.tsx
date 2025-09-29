import { EditIcon, Eye } from 'lucide-react';
import { ApplicantsTableRow, JobApplicant } from './ApplicantsTableRow';

interface ApplicantsTableProps {
  applicants: JobApplicant[];
  onViewApplicant: (applicant: JobApplicant) => void;
  onEditApplicant: (applicant: JobApplicant) => void;
}

export const ApplicantsTable = ({
  applicants,
  onViewApplicant,
  onEditApplicant,
}: ApplicantsTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applicant Info
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job Details
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resume
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Experience
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Education
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applicants.map((applicant) => (
            <ApplicantsTableRow
              key={applicant.name}
              applicant={applicant}
              onView={() => onViewApplicant(applicant)}
              onEdit={() => onEditApplicant(applicant)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};