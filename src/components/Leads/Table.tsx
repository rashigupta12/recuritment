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
        <thead className="bg-blue-500 font-bold">
          <tr>
            <th className="px-4 py-3 text-left text-md   text-white uppercase tracking-wider">
              Company 
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Contact 
            </th>
            
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Stage
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Offering
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Salary<br/>(LPA)
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              No. Of<br/>
              vac
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Fee<br/>(%/K)
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Deal<br/> Value(L)
            </th>
            {/* <th className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
              Owner
            </th> */}
            <th className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
              Created On
            </th>

            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
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
// helper function
const formatCompanyName = (name: string) => {
  if (!name) return "-";
  const trimmed = name.trim();

  // if short, return as is
  if (trimmed.length <= 30) return trimmed;

  // find nearest space before 30th character
  const splitIndex = trimmed.lastIndexOf(" ", 30);
  if (splitIndex === -1) return trimmed; // no space found, skip splitting

  return `${trimmed.slice(0, splitIndex)}\n${trimmed.slice(splitIndex + 1)}`;
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
       <td className="px-4 py-2 max-w-[230px]">
  <div className="text-md text-gray-900 break-all whitespace-normal">
    {formatCompanyName(lead.company_name) || "-"}
  </div>

  <a
    href={
      lead.website?.startsWith("http")
        ? lead.website
        : `https://${lead.website}`
    }
    target="_blank"
    rel="noopener noreferrer"
    className="text-md text-blue-500 hover:underline normal-case p-0 m-0 pt-10"
  >
    {lead.website}
  </a>
</td>
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <div className="">
            <div className="text-md font-medium text-gray-900 capitalize">
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
     
    <td className="px-4 py-2">
        <div className="text-md text-gray-900 uppercase ">
          {lead.custom_stage
      ? (() => {
          // remove special characters like /, -, etc.
          const clean = lead.custom_stage.replace(/[^a-zA-Z\s]/g, "").trim();
          const words = clean.split(/\s+/);
          if (words.length === 1) {
            // single word → take first two letters
            return words[0].slice(0, 2);
          }
          // multiple words → take first letter of each
          return words.map((w) => w.charAt(0)).join("");
        })()
      : "-"}
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="text-md text-gray-900">
          {formatTextWithLines(lead.custom_offerings)}
        </div>
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        {lead.custom_average_salary && lead.custom_estimated_hiring_ ? (
          <>
            <div className="text-md text-gray-900 flex items-center">
              {/* <IndianRupee className="h-3 w-3 text-gray-900" /> */}
              {lead.custom_average_salary
                ? formatToIndianCurrency(Number(lead.custom_average_salary))
                : "-"}
            </div>

            
          </>
        ) : (
          "-"
        )}
      </td>

  <td className="px-4 py-2 whitespace-nowrap">
        {lead.custom_estimated_hiring_ ? (
          <>
           <div className="text-md text-gray-900 flex items-center">
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
          <div className="text-md text-gray-900 flex items-center">
            {lead.custom_fee}%
          </div>
        ) : (
          <div className="text-md text-gray-900 flex items-center">
           {lead.custom_fixed_charges
        ? `${(Number(lead.custom_fixed_charges) / 1000).toFixed(0)}K`
        : "-"}
          </div>
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {lead.custom_deal_value ? (
          <div className="text-md text-gray-900 flex items-center">
            {/* <IndianRupee className="h-3 w-3 text-gray-900" /> */}
            {formatToIndianCurrency(Number(lead.custom_deal_value))}
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* <td className="px-4 py-2">
        <div className="text-sm text-gray-900">
          {formatTextWithLines(lead.custom_lead_owner_name)}
        </div>
      </td> */}
      <td className="px-4 py-2 whitespace-nowrap text-md text-gray-900">
        {(() => {
          const { date, time } = formatDateAndTime(lead.creation);
          return (
            <div className="flex flex-col leading-tight">
              <span>{date}</span>
              <span className="text-md text-gray-500">{time}</span>
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
