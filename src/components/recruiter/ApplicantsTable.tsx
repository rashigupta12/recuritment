/* eslint-disable @typescript-eslint/no-explicit-any */

import { JobApplicant } from '../../app/(dashboard)/dashboard/recruiter/viewapplicant/page';

interface ApplicantsTableProps {
  applicants: JobApplicant[];
  selectedApplicants: string[];
  onSelectApplicant: (name: string) => void;
}

export function ApplicantsTable({
  applicants,
  selectedApplicants,
  onSelectApplicant,
}: ApplicantsTableProps) {
  // Debug: Log applicant names and emails to check for duplicates
  console.log(
    'Applicants in table:',
    applicants.map((a) => ({ name: a.name, email_id: a.email_id }))
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Select</th>
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Phone</th>
            <th className="py-3 px-6 text-left">Job Title</th>
            <th className="py-3 px-6 text-left">Status</th>
            {/* <th className="py-3 px-6 text-left">Education</th> */}
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {applicants.map((applicant, index) => (
            <tr
              key={applicant.name || `applicant-${index}`} // Fallback to index if name is missing
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left">
                <input
                  type="checkbox"
                  checked={selectedApplicants.includes(applicant.name)}
                  onChange={() => onSelectApplicant(applicant.name)}
                  className="h-4 w-4"
                  disabled={!applicant.name}
                />
              </td>
              <td className="py-3 px-6 text-left">{applicant.applicant_name || 'N/A'}</td>
              <td className="py-3 px-6 text-left">{applicant.email_id || 'N/A'}</td>
              <td className="py-3 px-6 text-left">{applicant.phone_number || 'N/A'}</td>
              <td className="py-3 px-6 text-left">{applicant.job_title || 'N/A'}</td>
              <td className="py-3 px-6 text-left">{applicant.status || 'N/A'}</td>
              {/* <td className="py-3 px-6 text-left">
                {applicant.custom_education && applicant.custom_education.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {applicant.custom_education.map((edu, index) => (
                      <li key={index}>
                        {edu.degree} in {edu.specialization}, {edu.institution} ({edu.year_of_passing}, {edu.percentagecgpa}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  'N/A'
                )}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}