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
    <div className="bg-white rounded-lg border border-gray-200">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="w-1/4 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Applicant Info
            </th>
            <th className="w-1/5 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Job Details
            </th>
            <th className="w-1/6 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            <th className="w-1/6 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Resume
            </th>
            <th className="w-1/5 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Experience
            </th>
            <th className="w-1/5 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Education
            </th>
           
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
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
      {applicants.length === 0 && (
        <div className="py-4 text-center text-gray-500 text-sm">
          No applicants found.
        </div>
      )}
    </div>
  );
};