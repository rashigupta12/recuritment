// ============================================
// LeadsTable.tsx (Updated)
// ============================================
'use client'
import React, { useState, useCallback, memo, useMemo } from "react";
import { EditIcon, UsersIcon } from "lucide-react";
import { SortableTableHeader } from "../recruiter/SortableTableHeader";
import { formatToIndianCurrency } from "../Leads/helper";


// Lead type definition
interface Lead {
  id?: string;
  name?: string;
  company_name?: string;
  website?: string;
  custom_full_name?: string;
  lead_name?: string;
  custom_email_address?: string;
  custom_offerings?: string;
  custom_average_salary?: string | number;
  custom_estimated_hiring_?: string | number;
  custom_fee?: string | number;
  custom_fixed_charges?: string | number;
  custom_deal_value?: string | number;
  creation?: string;
  custom_stage?: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onCreateContract: (lead: Lead) => Promise<void>;
}

type SortField = "company" | "contact" | "offering" | "salary" | "vacancies" | "fee" | "dealValue" | "createdOn";
type AllFields = SortField | "actions";
type SortDirection = "asc" | "desc" | null;


export const LeadsTable = ({
  leads,
  onViewLead,
  onEditLead,
  onCreateContract,
}: LeadsTableProps) => {
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: AllFields) => {
    if (field === 'actions') return;
    
    if (sortField === field) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else setSortDirection("asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const columns = useMemo(() => {
    const cols: Array<{ field: AllFields; label: string; sortable?: boolean }> = [
      { field: 'company', label: 'Company' , sortable: false },
      { field: 'contact', label: 'Contact' },
      { field: 'offering', label: 'Offering' },
      { field: 'salary', label: 'Salary (LPA)' },
      { field: 'vacancies', label: 'No. Of Vac' },
      { field: 'fee', label: 'Fee (%/K)' },
      { field: 'dealValue', label: 'Deal Value(L)' },
      { field: 'createdOn', label: 'Created On'  },
      { field: 'actions', label: 'Actions', sortable: false },
    ];
    return cols;
  }, []);

  const sortedLeads = useMemo(() => {
    if (!sortField || !sortDirection) return leads;

    return [...leads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'company':
          aValue = (a.company_name || '').toLowerCase();
          bValue = (b.company_name || '').toLowerCase();
          break;
        case 'contact':
          aValue = (a.custom_full_name || a.lead_name || '').toLowerCase();
          bValue = (b.custom_full_name || b.lead_name || '').toLowerCase();
          break;
        case 'offering':
          aValue = (a.custom_offerings || '').toLowerCase();
          bValue = (b.custom_offerings || '').toLowerCase();
          break;
        case 'salary':
          aValue = Number(a.custom_average_salary) || 0;
          bValue = Number(b.custom_average_salary) || 0;
          break;
        case 'vacancies':
          aValue = Number(a.custom_estimated_hiring_) || 0;
          bValue = Number(b.custom_estimated_hiring_) || 0;
          break;
        case 'fee':
          aValue = Number(a.custom_fee || a.custom_fixed_charges) || 0;
          bValue = Number(b.custom_fee || b.custom_fixed_charges) || 0;
          break;
        case 'dealValue':
          aValue = Number(a.custom_deal_value) || 0;
          bValue = Number(b.custom_deal_value) || 0;
          break;
        case 'createdOn':
          aValue = a.creation ? new Date(a.creation).getTime() : 0;
          bValue = b.creation ? new Date(b.creation).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [leads, sortField, sortDirection]);

  const handleCreateContract = useCallback(
    async (lead: Lead) => {
      if (loadingLeadId !== null) return;
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <SortableTableHeader
            columns={columns}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            className="bg-blue-500 text-white"
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeads.map((lead, index) => (
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
  });

  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { date: formattedDate, time: formattedTime };
};

const LeadsTableRow = memo(
  ({ lead, onView, onEdit, onCreateContract, isLoading }: LeadsTableRowProps) => {
    const canCreateContract =
      lead.custom_stage === "Contract" ||
      lead.custom_stage === "Onboarded" ||
      lead.custom_stage === "Follow-Up / Relationship Management";

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
          {lead.website && (
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
          )}
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
                className={`flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-md transition-colors whitespace-nowrap ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
              <div className="w-4 h-4" />
            )}
          </div>
        </td>
      </tr>
    );
  }
);

LeadsTableRow.displayName = "LeadsTableRow";