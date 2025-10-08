// ============================================
// LeadsTable (Second Version - with Stage column)
// ============================================
/*eslint-disable @typescript-eslint/no-explicit-any */
import { Lead } from "@/stores/leadStore";
import { EditIcon, Eye, UsersIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { SortableTableHeader } from "../recruiter/SortableTableHeader";
import { formatToIndianCurrency } from "./helper";


interface LeadsTableV2Props {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}

type LeadsV2SortField = "company" | "contact" | "stage" | "offering" | "salary" | "vacancies" | "fee" | "dealValue" | "createdOn";
type LeadsV2AllFields = LeadsV2SortField | "actions";
type LeadsV2SortDirection = "asc" | "desc" | null;


export const LeadsTable = ({
  leads,
  onViewLead,
  onEditLead,
}: LeadsTableV2Props) => {
  const [sortField, setSortField] = useState<LeadsV2SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<LeadsV2SortDirection>(null);

  const handleSort = (field: LeadsV2AllFields) => {
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
    const cols: Array<{ field: LeadsV2AllFields; label: string; sortable?: boolean }> = [
      { field: 'company', label: 'Company',sortable: false },
      { field: 'contact', label: 'Contact',sortable: false },
      { field: 'stage', label: 'Stage',sortable: false },
      { field: 'offering', label: 'Offering',sortable: false },
      { field: 'salary', label: 'AVG.SAL (LPA)',sortable: false },
      { field: 'vacancies', label: 'No. Of Vac',sortable: false },
      { field: 'fee', label: 'Fee (%/K)',sortable: false },
      { field: 'dealValue', label: 'Deal Value(L)',sortable: false },
      { field: 'createdOn', label: 'Created On',sortable: false },
      { field: 'actions', label: 'Actions', sortable: false },
    ];
    return cols;
  }, []);

  const sortedLeads = useMemo(() => {
    const filteredLeads = leads.filter(
      (lead) => lead.custom_stage?.toLowerCase() !== "onboarded"
    );

    if (!sortField || !sortDirection) return filteredLeads;

    return [...filteredLeads].sort((a, b) => {
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
        case 'stage':
          aValue = (a.custom_stage || '').toLowerCase();
          bValue = (b.custom_stage || '').toLowerCase();
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
              <LeadsTableRowV2
                key={lead.name || lead.id || index}
                lead={lead}
                onView={() => onViewLead(lead)}
                onEdit={() => onEditLead(lead)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface LeadsTableRowV2Props {
  lead: Lead;
  onView: () => void;
  onEdit: () => void;
}

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

const formatCompanyNameV2 = (name: string) => {
  if (!name) return "-";
  const trimmed = name.trim();

  if (trimmed.length <= 30) return trimmed;

  const splitIndex = trimmed.lastIndexOf(" ", 30);
  if (splitIndex === -1) return trimmed;

  return `${trimmed.slice(0, splitIndex)}\n${trimmed.slice(splitIndex + 1)}`;
};

const formatDateAndTimeV2 = (dateString?: string) => {
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

// Helper function to format stage abbreviation
const getStageAbbreviation = (stage: string | null | undefined): string => {
  if (!stage) return "-";
  
  const clean = stage.replace(/[^a-zA-Z\s]/g, "").trim();
  const words = clean.split(/\s+/);
  
  if (words.length === 1) {
    return words[0].slice(0, 2);
  }
  
  return words.map((w) => w.charAt(0)).join("");
};

const LeadsTableRowV2 = ({ lead, onView, onEdit }: LeadsTableRowV2Props) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 max-w-[230px]">
        <div className="text-md text-gray-900 break-all whitespace-normal">
          {formatCompanyNameV2(lead.company_name || '') || "-"}
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
        <div className="relative group">
          <div className="text-md text-gray-900 uppercase cursor-default">
            {getStageAbbreviation(lead.custom_stage)}
          </div>
          {lead.custom_stage && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {lead.custom_stage}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="text-md text-gray-900">
          {formatTextWithLines(lead.custom_offerings)}
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {lead.custom_average_salary ? (
          <div className="text-md text-gray-900 flex items-center">
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
            {formatToIndianCurrency(Number(lead.custom_deal_value))}
          </div>
        ) : (
          "-"
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-md text-gray-900">
        {(() => {
          const { date, time } = formatDateAndTimeV2(lead.creation);
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
            <div className="h-5 w-5"></div>
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