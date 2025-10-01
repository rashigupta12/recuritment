/* eslint-disable @typescript-eslint/no-explicit-any */
import { JobApplicant } from '../../app/(dashboard)/dashboard/recruiter/viewapplicant/page';

interface ShortlistedApplicantsTableRowProps {
  applicant: JobApplicant;
}

// Helper function to split and format text with line breaks
const formatTextWithLines = (text: string | null | undefined) => {
  if (!text) return <span className="text-gray-400">-</span>;

  const words = text
    .split(/[\-/]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return (
    <div className="flex flex-col gap-0.5">
      {words.map((word, index) => (
        <span key={index} className="truncate max-w-[120px] text-xs" title={word}>
          {word}
        </span>
      ))}
    </div>
  );
};

// Helper function to get status badge color
const getStatusColor = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'accepted':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ApplicantsTableRow = ({
  applicant,
}: ShortlistedApplicantsTableRowProps) => {
  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Prevent navigation if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.closest('a')) {
      return;
    }
    console.log('Row clicked for applicant:', applicant.name);
   
  };

  return (
    <tr
      className="md:table-row flex flex-col gap-2 p-3 border-b md:border-b-0 bg-white md:bg-transparent hover:bg-gray-50 cursor-pointer"
      onClick={handleRowClick}
      role="button"
      aria-label={`View applicant ${applicant.applicant_name || applicant.name}`}
    >
      <td className="md:table-cell px-3 py-2 flex flex-col gap-0.5">
        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={applicant.applicant_name}>
          {applicant.applicant_name || '-'}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[120px]" title={applicant.email_id || applicant.name}>
          {applicant.email_id || applicant.name || '-'}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[120px]" title={applicant.phone_number}>
          {applicant.phone_number || '-'}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[120px]" title={applicant.country}>
          {applicant.country || '-'}
        </div>
      </td>
      <td className="md:table-cell px-3 py-2 flex flex-col gap-0.5">
        <div className="text-xs text-gray-900 line-clamp-2 max-w-[120px]" title={applicant.job_title}>
          {applicant.job_title || '-'}
        </div>
        <div className="text-xs text-gray-500">
          {formatTextWithLines(applicant.designation)}
        </div>
      </td>
      <td className="md:table-cell px-3 py-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}
        >
          {formatTextWithLines(applicant.status)}
        </span>
      </td>
      <td className="md:table-cell px-3 py-2">
        {applicant.custom_experience?.length ? (
          <ul className="list-none text-xs text-gray-900 space-y-0.5">
            {applicant.custom_experience.map((exp: any, i: number) => (
              <li key={i} title={`${exp.designation} at ${exp.company_name}`}>
                {exp.designation} at {exp.company_name} ({exp.start_date} - {exp.end_date || 'Present'})
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      {/* <td className="md:table-cell px-3 py-2">
      {/* <td className="md:table-cell px-3 py-2">
        {applicant.custom_education?.length ? (
          <ul className="list-none text-xs text-gray-900 space-y-0.5">
            {applicant.custom_education.map((edu: any, i: number) => (
              <li key={i} title={`${edu.degree}, ${edu.institution}`}>
                {edu.degree}, {edu.institution} ({edu.year_of_passing})
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td> */}
      <td className="md:table-cell px-3 py-2">
        {applicant.resume_attachment ? (
          <a
            href={`${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}${applicant.resume_attachment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs"
            onClick={(e) => e.stopPropagation()}
            aria-label="View resume"
          >
            View Resume
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td> */}
      
    </tr>
  );
};