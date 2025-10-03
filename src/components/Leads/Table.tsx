// components/Leads/LeadsTable.tsx
import { Lead } from "@/stores/leadStore";
import { EditIcon, Eye, Factory, IndianRupee, UsersIcon } from "lucide-react";
import { formatToIndianCurrency } from "./helper";

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}

export const LeadsTable = ({
  leads,
  onViewLead,
  onEditLead,
}: LeadsTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact Info.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company Info.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stage
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Offering
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Salary/Hiring
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fee
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal Value
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created On
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead, index) => (
            <LeadsTableRow
              key={lead.name || lead.id || index}
              lead={lead}
              onView={() => onViewLead(lead)}
              onEdit={() => onEditLead(lead)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// components/Leads/LeadsTableRow.tsx
interface LeadsTableRowProps {
  lead: Lead;
  onView: () => void;
  onEdit: () => void;
}

// Helper function to split and format text with line breaks
const formatTextWithLines = (text: string | null | undefined) => {
  if (!text) return <span>-</span>;

  // Split by spaces, hyphens, and slashes
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

const formatDateAndTime = (dateString?: string) => {
  if (!dateString) return { date: "-", time: "-" };
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // dd/mm/yyyy

  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24h format
  }); // hh:mm

  return { date: formattedDate, time: formattedTime };
};

const LeadsTableRow = ({ lead, onView, onEdit }: LeadsTableRowProps) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <div className="">
            <div className="text-sm font-medium text-gray-900">
              {lead.custom_full_name || lead.lead_name || "-"}
            </div>
            <div className="text-xs text-gray-500 normal-case">
              {lead.custom_email_address || "-"}
            </div>
            {/* <div className="text-xs text-gray-500">
              {lead.custom_phone_number || "-"}
            </div> */}
          </div>
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-900">{lead.company_name || "-"}</div>

        <a
          href={
            lead.website?.startsWith("http")
              ? lead.website
              : `https://${lead.website}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline normal-case p-0 m-0 pt-10"
        >
          {lead.website}
        </a>

        {/* <div className="text-xs text-gray-500 flex items-center">
          <Factory className="h-3 w-3 mr-1 text-gray-400" />
          {lead.industry || "-"}
        </div> */}
      </td>
      <td className="px-4 py-2">
        <div className="text-sm text-gray-900">
          {formatTextWithLines(lead.custom_stage)}
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="text-sm text-gray-900">
          {formatTextWithLines(lead.custom_offerings)}
        </div>
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        {lead.custom_average_salary && lead.custom_estimated_hiring_ ? (
          <>
            <div className="text-sm text-gray-900 flex items-center">
              {/* <IndianRupee className="h-3 w-3 text-gray-900" /> */}
              {lead.custom_average_salary
                ? formatToIndianCurrency(Number(lead.custom_average_salary))
                : "-"}
            </div>

            <div className="text-sm text-gray-900 flex items-center">
              <UsersIcon className="h-3 w-3 mr-1 text-gray-900" />
              {lead.custom_estimated_hiring_ || "-"}
            </div>
          </>
        ) : (
          "-"
        )}
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        {lead.custom_fee ? (
          <div className="text-sm text-gray-900 flex items-center">
            {lead.custom_fee}%
          </div>
        ) : (
          <div className="text-sm text-gray-900 flex items-center">
            {formatToIndianCurrency(Number(lead.custom_fixed_charges))}
          </div>
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {lead.custom_deal_value ? (
          <div className="text-sm text-gray-900 flex items-center">
            {/* <IndianRupee className="h-3 w-3 text-gray-900" /> */}
            {formatToIndianCurrency(Number(lead.custom_deal_value))}
          </div>
        ) : (
          "-"
        )}
      </td>

      <td className="px-4 py-2">
        <div className="text-sm text-gray-900">
          {formatTextWithLines(lead.custom_lead_owner_name)}
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
        {(() => {
          const { date, time } = formatDateAndTime(lead.creation);
          return (
            <div className="flex flex-col leading-tight">
              <span>{date}</span>
              <span className="text-xs text-gray-500">{time}</span>
            </div>
          );
        })()}
      </td>

      <td className="px-6 py-2 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {lead.custom_stage !== "Onboarded" &&
          lead.custom_stage !== "Follow-Up / Relationship Management" ? (
            <EditIcon
              className="text-green-500 h-5 w-5 cursor-pointer hover:text-green-600 transition-colors"
              onClick={onEdit}
            />
          ) : (
            <div className="h-5 w-5"></div> // optional placeholder to keep spacing
          )}

          <Eye
            className="h-5 w-5 text-blue-400 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onView}
          />
        </div>
      </td>
    </tr>
  );
};
