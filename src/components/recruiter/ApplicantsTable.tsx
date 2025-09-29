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
  // Reverse the applicants array to show newest first
  const sortedApplicants = [...applicants].reverse();

  return (
    <div className="bg-white rounded-lg border border-gray-200 ">
      <table className="w-full table-fixed">
        <thead className="bg-gray-300 text-gray-600">
          <tr>
            <th className="w-1/4 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Applicant Info
            </th>
            <th className="w-1/5 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Job Details
            </th>
            <th className="w-1/6 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            <th className="w-1/5 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Education
            </th>
            <th className="w-1/5 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Experience
            </th>
            <th className="w-1/6 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Resume
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedApplicants.map((applicant) => (
            <ApplicantsTableRow
              key={applicant.name}
              applicant={applicant}
              onView={() => onViewApplicant(applicant)}
              onEdit={() => onEditApplicant(applicant)}
            />
          ))}
        </tbody>
      </table>
      {sortedApplicants.length === 0 && (
        <div className="py-4 text-center text-gray-500 text-sm">
          No applicants found.
        </div>
      )}
    </div>
  );
};
