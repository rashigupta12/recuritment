/* eslint-disable @typescript-eslint/no-explicit-any */

import { JobApplicant } from '../../app/(dashboard)/dashboard/recruiter/shortlistedapplicants/page';
import { ApplicantsTableRow } from './ApplicantsTableRow';
import { ShortlistedApplicantsTableRow } from './ShortlistedApplicantsTableRow';
interface ApplicantsTableProps {
  applicants: JobApplicant[];
  
  selectedApplicants: Set<string>;
  onCheckboxChange: (applicantId: string) => void;
  onSelectAll: () => void;
}

export const ShortlistedApplicantsTable = ({
  applicants,
  
  selectedApplicants,
  onCheckboxChange,
  onSelectAll,
}: ApplicantsTableProps) => {
  // Reverse the applicants array to show newest first
  const sortedApplicants = [...applicants].reverse();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <table className="w-full table-fixed">
        <thead className="bg-gray-300 text-gray-600">
          <tr>
            <th className="w-1/12 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedApplicants.size === applicants.length && applicants.length > 0}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelectAll();
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
                aria-label="Select all applicants"
              />
            </th>
            <th className="w-1/4 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Applicant Info
            </th>
            <th className="w-1/5 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Job Details
            </th>
            <th className="w-1/6 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            {/* <th className="w-1/5 px-3 py-4 text-left text-xs font-medium uppercase tracking-wider">
              Education
            </th> */}
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
            <ShortlistedApplicantsTableRow
              key={applicant.name}
              applicant={applicant}
              
              isSelected={selectedApplicants.has(applicant.name)}
              onCheckboxChange={() => onCheckboxChange(applicant.name)}
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



