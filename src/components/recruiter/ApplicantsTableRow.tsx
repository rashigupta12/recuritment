import { EditIcon, Eye } from 'lucide-react';

export interface JobApplicant {
  name: string;
  applicant_name?: string;
  email_id?: string;
  phone_number?: string;
  country?: string;
  job_title?: string;
  designation?: string;
  status?: string;
  resume_attachment?: string;
  custom_experience?: Array<{
    company_name: string;
    designation: string;
    start_date: string;
    end_date: string;
    current_company: number;
  }>;
  custom_education?: Array<{
    degree: string;
    specialization: string;
    institution: string;
    year_of_passing: number;
    percentagecgpa: number;
  }>;
}

interface ApplicantsTableRowProps {
  applicant: JobApplicant;
  onView: () => void;
  onEdit: () => void;
}

// Helper function to split and format text with line breaks
const formatTextWithLines = (text: string | null | undefined) => {
  if (!text) return <span>-</span>;

  const words = text
    .split(/[\-/]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return (
    <div className="flex flex-col gap-0.5">
      {words.map((word, index) => (
        <span key={index} className="leading-tight">
          {word}
        </span>
      ))}
    </div>
  );
};

export const ApplicantsTableRow = ({
  applicant,
  onView,
  onEdit,
}: ApplicantsTableRowProps) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {applicant.applicant_name || '-'}
            </div>
            <div className="text-xs text-gray-500 normal-case">
              {applicant.email_id || applicant.name || '-'}
            </div>
            <div className="text-xs text-gray-500">
              {applicant.phone_number || '-'}
            </div>
            <div className="text-xs text-gray-500">
              {applicant.country || '-'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatTextWithLines(applicant.job_title)}
        </div>
        <div className="text-xs text-gray-500">
          {formatTextWithLines(applicant.designation)}
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="text-sm text-gray-900">
          {formatTextWithLines(applicant.status)}
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {applicant.resume_attachment ? (
          <a
            href={`${process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL}${applicant.resume_attachment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Resume
          </a>
        ) : (
          '-'
        )}
      </td>
      <td className="px-4 py-2">
        {applicant.custom_experience?.length ? (
          <ul className="list-disc list-inside text-sm text-gray-900">
            {applicant.custom_experience.map((exp, i) => (
              <li key={i}>
                {exp.designation} at {exp.company_name} (
                {exp.start_date} - {exp.end_date || 'Present'})
              </li>
            ))}
          </ul>
        ) : (
          '-'
        )}
      </td>
      <td className="px-4 py-2">
        {applicant.custom_education?.length ? (
          <ul className="list-disc list-inside text-sm text-gray-900">
            {applicant.custom_education.map((edu, i) => (
              <li key={i}>
                {edu.degree} in {edu.specialization}, {edu.institution} (
                {edu.year_of_passing}, {edu.percentagecgpa})
              </li>
            ))}
          </ul>
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <EditIcon
            className="text-green-500 h-5 w-5 cursor-pointer hover:text-green-600 transition-colors"
            onClick={onEdit}
          />
          <Eye
            className="text-blue-400 h-5 w-5 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onView}
          />
        </div>
      </td>
    </tr>
  );
};