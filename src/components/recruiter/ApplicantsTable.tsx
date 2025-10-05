/* eslint-disable @typescript-eslint/no-explicit-any */

import { JobApplicant } from '../../app/(dashboard)/dashboard/recruiter/viewapplicant/page';
import { Trash } from "lucide-react";

interface ApplicantsTableProps {
  applicants: JobApplicant[];
  showStatus?:boolean;
  showCheckboxes?: boolean; // New prop to control checkbox visibility
  selectedApplicants?: string[]; // Optional for when checkboxes are shown
  onSelectApplicant?: (name: string) => void; // Optional for when checkboxes are shown
  onDeleteApplicant?: (applicant: JobApplicant) => void;
  showDeleteButton?: boolean;
}

export function ApplicantsTable({
  applicants,
  showCheckboxes = false,
  showStatus=false,
  selectedApplicants = [],
  onSelectApplicant,
onDeleteApplicant,
  showDeleteButton = false,
}: ApplicantsTableProps) {
  // Debug: Log applicant names and emails to check for duplicates
  // console.log(
  //   'Applicants in table:',
  //   applicants.map((a) => ({ name: a.name, email_id: a.email_id }))
  // );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border  rounded-lg">
        <thead>
          <tr className="bg-primary rounded-sm text-white uppercase text-sm font-bold leading-normal">
            {showCheckboxes && (
              <th className="py-3 px-6 text-left">Select</th>
            )}
            <th className="py-3 px-6 text-left">Job designation</th>
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Phone</th>
            {/* <th className="py-3 px-6 text-left">Job Title</th> */}
            <th className="py-3 px-6 text-left">Status</th>
            {/* <th className="py-3 px-6 text-left">Education</th> */}
             {showDeleteButton && <th className="py-3 px-6 text-left">Action</th>}
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
           {applicants.map((applicant, index) => {
            const canDelete = ['tagged', 'open'].includes(applicant.status?.toLowerCase() || '');
            
            return (
              <tr key={applicant.name || `applicant-${index}`} className="border-b border-gray-200 hover:bg-gray-100">
                {showCheckboxes && (
                  <td className="py-3 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.includes(applicant.name)}
                      onChange={() => onSelectApplicant?.(applicant.name)}
                      className="h-4 w-4"
                      disabled={!applicant.name}
                    />
                  </td>
                )}
                <td className="py-3 px-6 text-left">{applicant.designation || 'N/A'}</td>
                <td className="py-3 px-6 text-left">{applicant.applicant_name || 'N/A'}</td>
                <td className="py-3 px-6 text-left">{applicant.email_id || 'N/A'}</td>
                <td className="py-3 px-6 text-left">{applicant.phone_number || 'N/A'}</td>
                <td className="py-3 px-6 text-left">{applicant.status || 'N/A'}</td>
                {showDeleteButton && (
                  <td className="py-3 px-6 text-left">
                    <button
                      onClick={() => onDeleteApplicant?.(applicant)}
                      disabled={!canDelete}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        canDelete
                          ? '  text-white cursor-pointer'
                          : 'hidden'
                      }`}
                      title={canDelete ? 'Delete applicant' : 'Can only delete applicants with Tagged or Open status'}
                    >
                     <Trash className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800" />
      </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}