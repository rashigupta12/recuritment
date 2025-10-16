/*eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { formatToIndianCurrency } from "../Leads/helper";
import { SortableTableHeader } from "../recruiter/SortableTableHeader";

// Lead type definition
interface Lead {
  custom_currency?: string;
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
  custom_expected_close_date?: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onCreateContract: (lead: Lead) => Promise<void>;
  isRestrictedUser: boolean;
}

type SortField = "company" | "contact" | "offering" | "salary" | "vacancies" | "fee" | "dealValue" | "createdOn" | "stage";
type AllFields = SortField;
type SortDirection = "asc" | "desc" | null;

export const LeadsTable = ({
  leads,
  onViewLead,
  onEditLead,
  onCreateContract,
  isRestrictedUser,
}: LeadsTableProps) => {
  const router = useRouter();
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: AllFields) => {
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
    const baseColumns: Array<{ field: AllFields; label: string; sortable?: boolean }> = [
      { field: "createdOn", label: "Created On", sortable: true },
      { field: "company", label: "Company Name", sortable: true },
      { field: "contact", label: "Contact", sortable: false },
      { field: "stage", label: "Stage", sortable: false },
      { field: "offering", label: "Offering", sortable: false },
      { field: "salary", label: "AVG.SAL (LPA)", sortable: false },
      { field: "vacancies", label: "No. Of Vac", sortable: false },
      { field: "fee", label: "Fee (%/K)", sortable: false },
      { field: "dealValue", label: "Deal Value(L)", sortable: false },
    ];

    return isRestrictedUser
      ? baseColumns.filter(
          (col) => col.field !== "fee" && col.field !== "dealValue"
        )
      : baseColumns;
  }, [isRestrictedUser]);

  const sortedLeads = useMemo(() => {
    if (!sortField || !sortDirection) return leads;

    return [...leads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "company":
          aValue = (a.company_name || "").toLowerCase();
          bValue = (b.company_name || "").toLowerCase();
          break;
        case "contact":
          aValue = (a.custom_full_name || a.lead_name || "").toLowerCase();
          bValue = (b.custom_full_name || b.lead_name || "").toLowerCase();
          break;
        case "offering":
          aValue = (a.custom_offerings || "").toLowerCase();
          bValue = (b.custom_offerings || "").toLowerCase();
          break;
        case "salary":
          aValue = Number(a.custom_average_salary) || 0;
          bValue = Number(b.custom_average_salary) || 0;
          break;
        case "vacancies":
          aValue = Number(a.custom_estimated_hiring_) || 0;
          bValue = Number(b.custom_estimated_hiring_) || 0;
          break;
        case "fee":
          aValue = Number(a.custom_fee || a.custom_fixed_charges) || 0;
          bValue = Number(b.custom_fee || b.custom_fixed_charges) || 0;
          break;
        case "dealValue":
          aValue = Number(a.custom_deal_value) || 0;
          bValue = Number(b.custom_deal_value) || 0;
          break;
        case "createdOn":
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

  const handleRowClick = useCallback(
    (lead: Lead) => {
      // Create a minimal staffing item from lead data
      const newItem = {
        currency: lead.custom_currency || "INR",
        designation: "",
        vacancies: Number(lead.custom_estimated_hiring_) || 0,
        estimated_cost_per_position: Number(lead.custom_average_salary) || 0,
        number_of_positions: 1,
        min_experience_reqyrs: 0,
        job_description: "",
        attachmentsoptional: "",
        assign_to: "",
        location: "",
        employment_type: "",
      };

      // Create form data to prefill
      const prefillData = {
        name: `Staffing Plan - ${lead.custom_full_name || lead.lead_name || ""}`,
        custom_lead: lead.name || "",
        from_date: new Date().toISOString().split("T")[0],
        to_date:
          lead.custom_expected_close_date ||
          new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        custom_assign_to: "",
        assigned_to_full_name: "",
        staffing_details: [newItem],
      };

      // Store in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("prefillStaffingData", JSON.stringify(prefillData));
      }

      // Navigate to create requirements page
      router.push(
        `/dashboard/recruiter/contract/create?leadId=${lead.name}`
      );
    },
    [router]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-4">
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
                onRowClick={() => handleRowClick(lead)}
                isLoading={loadingLeadId === lead.id}
                isRestrictedUser={isRestrictedUser}
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
  onRowClick: () => void;
  isLoading: boolean;
  isRestrictedUser: boolean;
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

export const getStageAbbreviation = (stage: string | null | undefined): string => {
  if (!stage) return "-";
  
  const clean = stage.replace(/[^a-zA-Z\s]/g, "").trim();
  const words = clean.split(/\s+/);
  
  if (words.length === 1) {
    return words[0].slice(0, 2);
  }
  
  return words.map((w) => w.charAt(0)).join("");
};

const LeadsTableRow = memo(
  ({ lead,  onRowClick, isRestrictedUser }: LeadsTableRowProps) => {
    return (
      <tr 
        onClick={onRowClick}
        className="hover:bg-blue-50 transition-colors cursor-pointer"
      >
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
              onClick={(e) => e.stopPropagation()}
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
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
              {formatToIndianCurrency(Number(lead.custom_average_salary), lead.custom_currency || "")}
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
        {!isRestrictedUser && (
          <>
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
                  {formatToIndianCurrency(Number(lead.custom_deal_value), lead.custom_currency || "")}
                </div>
              ) : (
                "-"
              )}
            </td>
          </>
        )}
      </tr>
    );
  }
);

LeadsTableRow.displayName = "LeadsTableRow";