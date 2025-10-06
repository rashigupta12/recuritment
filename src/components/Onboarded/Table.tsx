'use client'
import React, { useState, useCallback, memo } from "react";
import { Lead } from "@/stores/leadStore";
import { EditIcon, UsersIcon } from "lucide-react";
import { formatToIndianCurrency } from "../Leads/helper";

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onCreateContract: (lead: Lead) => Promise<void>; // async prop for contract creation
}

export const LeadsTable = ({
  leads,
  onViewLead,
  onEditLead,
  onCreateContract,
}: LeadsTableProps) => {
  // Track loading state for each lead's "Create Requirement" button
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);

  // Wrap the create contract handler with loading state and debounce
  const handleCreateContract = useCallback(
    async (lead: Lead) => {
      if (loadingLeadId !== null) return; // prevent if already loading
      setLoadingLeadId(lead.id || "");
      try {
        await onCreateContract(lead);
      } finally {
        setLoadingLeadId(null);
      }
    },
    [loadingLeadId, onCreateContract]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full bg-blue-500">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Offering
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Salary<br/>(LPA)
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              No. Of<br/>vac
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Fee<br/>(%/K)
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Deal<br/> Value(L)
            </th>
            <th className="px-4 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Created On
            </th>
            <th className="px-6 py-3 text-left text-md font-medium text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead, index) => (
            <LeadsTableRow
              key={lead.id || lead.name || index}
              lead={lead}
              onView={() => onViewLead(lead)}
              onEdit={() => onEditLead(lead)}
              onCreateContract={() => handleCreateContract(lead)}
              isLoading={loadingLeadId === lead.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};


interface LeadsTableRowProps {
  lead: Lead;
  onView: () => void;
  onEdit: () => void;
  onCreateContract: () => void;
  isLoading: boolean;
}
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
const LeadsTableRow = memo(
  ({ lead, onView, onEdit, onCreateContract, isLoading }: LeadsTableRowProps) => {
    // Check if lead is eligible for contract creation
    const canCreateContract =
      lead.custom_stage === "Contract" ||
      lead.custom_stage === "Onboarded" ||
      lead.custom_stage === "Follow-Up / Relationship Management";

    // Check if lead can be edited
    const canEdit =
      lead.custom_stage !== "Contract" &&
      lead.custom_stage !== "Onboarded" &&
      lead.custom_stage !== "Follow-Up / Relationship Management";

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2 max-w-[230px]">
          <div className="text-md text-gray-900 break-all whitespace-normal">
            {lead.company_name || "-"}
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
            <div>
              <div className="text-md font-medium text-gray-900 capitalize">
                {lead.custom_full_name || lead.lead_name || "-"}
              </div>
              <div className="text-xs text-gray-500 normal-case">
                {lead.custom_email_address || "-"}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-2">
          <div className="text-md text-gray-900">
            {/* Use your helper formatTextWithLines if needed */}
            {lead.custom_offerings || "-"}
          </div>
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          {lead.custom_average_salary ? (
            <div className="text-md text-gray-900">
              {formatToIndianCurrency(Number(lead.custom_average_salary))}
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          {lead.custom_estimated_hiring_ ? (
            <div className="text-md text-gray-900 flex items-center">
              <UsersIcon className="h-3 w-3 mr-1 text-gray-900" />
              {lead.custom_estimated_hiring_}
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          {lead.custom_fee ? (
            <div className="text-md text-gray-900 flex items-center">{lead.custom_fee}%</div>
          ) : lead.custom_fixed_charges ? (
            <div className="text-md text-gray-900 flex items-center">{(Number(lead.custom_fixed_charges) / 1000).toFixed(0)}K</div>
          ) : (
            "-"
          )}
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          {lead.custom_deal_value ? (
            <div className="text-md text-gray-900">
              {formatToIndianCurrency(Number(lead.custom_deal_value))}
            </div>
          ) : (
            "-"
          )}
        </td>
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
          <div className="flex items-center gap-2">
            {canCreateContract && (
              <button
                onClick={onCreateContract}
                className={`flex items-center gap-1 bg-primary text-white px-2 py-1 rounded text-md transition-colors whitespace-nowrap hover:bg-secondary ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Create Staffing Plan"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Create "}
              </button>
            )}
            {canEdit ? (
              <button
                onClick={onEdit}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                title="Edit Lead"
              >
                <EditIcon className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-4 h-4" /> // Spacer
            )}
          </div>
        </td>
      </tr>
    );
  }
);

export default LeadsTableRow;
