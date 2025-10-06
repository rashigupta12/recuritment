// components/Leads/LeadsTable.tsx
import { Lead } from "@/stores/leadStore";
import {
  EditIcon,
  Factory,
  IndianRupee,
  UsersIcon
} from "lucide-react";
import { formatToIndianCurrency } from "../Leads/helper";

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onCreateContract: (lead: Lead) => void; // New prop for contract creation
}

export const LeadsTable = ({
  leads,
  onViewLead,
  onEditLead,
  onCreateContract,
}: LeadsTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full bg-blue-500">
        <thead className="">
          <tr>
            
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Company Info.
            </th>
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Contact Info.
            </th>
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Stage
            </th>
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Offering
            </th>
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Salary/Hiring
            </th>
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Fee
            </th>
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Deal Value
            </th>
            {/* <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Owner
            </th> */}
            <th className="px-4 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
              Created On
            </th>
            <th className="px-6 py-3 text-left text-md  font-bold text-white uppercase tracking-wider">
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
              onCreateContract={() => onCreateContract(lead)}
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
  onCreateContract: () => void;
}
const formatCompanyName = (name: string) => {
  if (!name) return "-";
  const trimmed = name.trim();
  if (trimmed.length <= 30) return trimmed;
  return `${trimmed.slice(0, 30)}\n${trimmed.slice(30)}`;
};
// Helper function to split and format text with line breaks
const formatTextWithLines = (text: string | null | undefined) => {
  if (!text) return <span>-</span>;
  
  const words = text.split(/[\-/]+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  
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
// helper function


  return { date: formattedDate, time: formattedTime };
};

const LeadsTableRow = ({ 
  lead, 
  onView, 
  onEdit, 
  onCreateContract 
}: LeadsTableRowProps) => {
  // Check if lead is eligible for contract creation
  const canCreateContract = lead.custom_stage === "Contract" || 
                           lead.custom_stage === "Onboarded" ||
                           lead.custom_stage === "Follow-Up / Relationship Management";

  // Check if lead can be edited
  const canEdit = lead.custom_stage !== "Contract" &&
                  lead.custom_stage !== "Onboarded" &&
                  lead.custom_stage !== "Follow-Up / Relationship Management";

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
        <div className="text-sm text-gray-900">{formatCompanyName(lead.company_name) || "-"}</div>
        <div className="text-md text-gray-900">{lead.company_name || "-"}</div>

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

        {/* <div className="text-xs text-gray-500 flex items-center">
          <Factory className="h-3 w-3 mr-1 text-gray-400" />
          {lead.industry || "-"}
        </div> */}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <div className="">
            <div className="text-md font-medium text-gray-900">
              {lead.custom_full_name || lead.lead_name || "-"}
            </div>
            <div className="text-md text-gray-500 normal-case">
              {lead.custom_email_address || "-"}
            </div>
            {/* <div className="text-xs text-gray-500">
              {lead.custom_phone_number || "-"}
            </div> */}
          </div>
        </div>
      </td>
      
     <td className="px-4 py-2">
        <div className="text-sm text-gray-900 uppercase ">
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
            {lead.custom_fee }%
          </div>
        ) : (
          <div className="text-md text-gray-900 flex items-center">
            {formatToIndianCurrency(Number(lead.custom_fixed_charges))}
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
        <div className="text-md text-gray-900">
          {formatTextWithLines(lead.custom_lead_owner_name)}
        </div>
      </td> */}

          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
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
        <div className="flex items-center gap-2">
          {/* Contract Button - Show for eligible leads */}
          {canCreateContract && (
            <button
              onClick={onCreateContract}
              className="flex items-center gap-1 bg-primary hover:bg-secondary text-white px-2 py-1 rounded text-xs transition-colors whitespace-nowrap"
              title="Create Staffing Plan"
            >
              {/* <FileText className="h-3 w-3" /> */}
              <span>Create Requirement</span>
            </button>
          )}

          {/* Edit Button */}
          {canEdit ? (
            <button
              onClick={onEdit}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="Edit Lead"
            >
              <EditIcon className="h-4 w-4" />
            </button>
          ) : (
            <div className="w-4 h-4"></div> // Spacer for consistent alignment
          )}

          {/* View Button */}
          {/* <button
            onClick={onView}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="View Lead Details"
          >
            <Eye className="h-4 w-4" />
          </button> */}
        </div>
      </td>
    </tr>
  );
};