/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowUpDown, Eye, Trash } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import { JobApplicant } from '../../app/(dashboard)/dashboard/recruiter/viewapplicant/page';
import { SortableTableHeader } from "./SortableTableHeader";

interface ApplicantsTableProps {
  applicants: JobApplicant[];
  showStatus?: boolean;
  showCheckboxes?: boolean;
  selectedApplicants?: string[];
  onSelectApplicant?: (name: string) => void;
  onDeleteApplicant?: (applicant: JobApplicant) => void;
  showDeleteButton?: boolean;
  onViewDetails?: (applicants: JobApplicant[]) => void;
}

type SortField = "name" | "email" | "job_title" | "status" | "designation";
type AllFields = SortField | "select" | "phone" | "company" | "actions";
type SortDirection = "asc" | "desc" | null;

interface GroupedApplicant {
  representative: JobApplicant;
  group: JobApplicant[];
  isMultiple: boolean;
  designations: string;
  clients: string;
  statuses: string;
}

interface TooltipProps {
  isVisible: boolean;
  content: React.ReactNode;
  position: { top: number; left: number };
}

function TooltipPortal({ isVisible, content, position }: TooltipProps) {
  if (!isVisible) return null;
  
  return createPortal(
    <div
      className="fixed bg-white shadow-lg rounded-md p-3 z-[9999] min-w-max border border-gray-200 pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {content}
    </div>,
    document.body
  );
}

export function ApplicantsTable({
  applicants,
  showCheckboxes = false,
  showStatus = false,
  selectedApplicants = [],
  onSelectApplicant,
  onDeleteApplicant,
  showDeleteButton = false,
  onViewDetails,
}: ApplicantsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null);

  const handleSort = (field: AllFields) => {
    if (field === 'select' || field === 'phone' || field === 'company' || field === 'actions') return;
    
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
    const cols: Array<{ field: AllFields; label: string; sortable?: boolean; align?: 'left' | 'center' | 'right'; width?: string }> = [];

    if (showCheckboxes) {
      cols.push({ field: 'select', label: 'Select', sortable: false, align: 'center' });
    }

    cols.push(
      { field: 'name', label: 'Name', sortable: true, align: 'left' },
      { field: 'email', label: 'Email', sortable: true, align: 'left' },
      { field: 'phone', label: 'Phone', sortable: false, align: 'left' },
      { field: 'designation', label: 'Job Designation', sortable: true, align: 'left' },
      { field: 'company', label: 'Client', sortable: false, align: 'left' }
    );

    if (showStatus) {
      cols.push({ field: 'status', label: 'Status', sortable: true, align: 'left' });
    }

    if (showDeleteButton || onViewDetails) {
      cols.push({ field: 'actions', label: 'Actions', sortable: false, align: 'center' });
    }

    return cols;
  }, [showCheckboxes, showStatus, showDeleteButton, onViewDetails]);

  const groupedApplicants = useMemo(() => {
    const groups = new Map<string, JobApplicant[]>();
    applicants.forEach((applicant) => {
      const email = applicant.email_id?.toLowerCase() || '';
      if (!groups.has(email)) {
        groups.set(email, []);
      }
      groups.get(email)!.push(applicant);
    });

    return Array.from(groups.values()).map((group) => {
      const representative = group[0];
      const isMultiple = group.length > 1;
      const designations = group.map((a) => a.designation || 'N/A').join(', ');
      const clients = group.map((a) => a.custom_company_name || 'N/A').join(', ');
      const statuses = group.map((a) => a.status || 'N/A').join(', ');

      return { representative, group, isMultiple, designations, clients, statuses };
    });
  }, [applicants]);

  const sortedApplicants = [...groupedApplicants].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: any, bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.representative.applicant_name?.toLowerCase() || "";
        bValue = b.representative.applicant_name?.toLowerCase() || "";
        break;
      case "email":
        aValue = a.representative.email_id?.toLowerCase() || "";
        bValue = b.representative.email_id?.toLowerCase() || "";
        break;
      case "status":
        aValue = a.representative.status?.toLowerCase() || "";
        bValue = b.representative.status?.toLowerCase() || "";
        break;
      case "designation":
        aValue = a.representative.designation?.toLowerCase() || "";
        bValue = b.representative.designation?.toLowerCase() || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleMouseEnter = (e: React.MouseEvent, content: React.ReactNode) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
    setTooltipContent(content);
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg border border-blue-100 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-md sm:text-md font-medium">
            <SortableTableHeader
              columns={columns}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              className="bg-blue-500 text-white"
            />
            <tbody className="divide-y divide-gray-100">
              {sortedApplicants.map((grouped, index) => {
                const { representative, group, isMultiple, designations, clients, statuses } = grouped;
                const canDelete = ['tagged', 'open'].includes(representative.status?.toLowerCase() || '');
                
                return (
                  <tr
                    key={representative.email_id || `grouped-${index}`}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } hover:bg-blue-100 transition duration-100`}
                    
                    
                  >
                    {showCheckboxes && (
                      <td className="px-2 sm:px-4 py-4">
                        <GroupedCheckbox
                          group={group}
                          selectedApplicants={selectedApplicants}
                          onToggle={onSelectApplicant}
                        />
                      </td>
                    )}
                    <td 
                      className="px-2 sm:px-4 py-4 font-semibold text-md text-blue-900 truncate"
                    >
                      {representative.applicant_name
                        ? representative.applicant_name
                            .toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())
                        : "N/A"}
                     
                    </td>
                    <td className="px-2 sm:px-4 py-4 truncate">
                      {representative.email_id || "N/A"}
                    </td>
                    <td className="px-2 sm:px-4 py-4 truncate">
                      {representative.phone_number || "N/A"}
                    </td>
                   <td className="px-2 sm:px-4 py-4 truncate capitalize">
  {isMultiple ? `${group.length}` : representative.designation || 'N/A'}
</td>

  
<td className="px-2 sm:px-4 py-4 truncate capitalize">
  {isMultiple ? ` ${group.length}` : representative.custom_company_name || 'N/A'}
</td>
                   {showStatus && (
  <td className="px-2 sm:px-4 py-4 truncate font-medium text-blue-700">
    {isMultiple ? ` ${group.length}` : representative.status || "N/A"}
  </td>
)}
                    {(showDeleteButton || onViewDetails) && (
                      <td className="px-2 sm:px-4 py-4">
                        <div className="flex items-center gap-2">
                          {onViewDetails && (
                            <button
                              onClick={() => onViewDetails(group)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              aria-label={`View details for ${representative.applicant_name}`}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                          )}
                          {showDeleteButton && (
                            <button
                              onClick={() => onDeleteApplicant?.(representative)}
                              disabled={!canDelete || isMultiple}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-all ${
                                canDelete && !isMultiple
                                  ? 'text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer'
                                  : 'hidden'
                              }`}
                              title={canDelete ? 'Delete applicant' : 'Can only delete applicants with Tagged or Open status'}
                              aria-label={`Delete ${representative.applicant_name}`}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedApplicants.length === 0 && (
          <div className="text-center py-10 text-blue-600 text-sm bg-blue-50">
            <p>No applicants found</p>
            <p className="text-blue-400 text-xs mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      <TooltipPortal 
        isVisible={tooltipVisible} 
        content={tooltipContent} 
        position={tooltipPos} 
      />
    </>
  );
}

interface GroupedCheckboxProps {
  group: JobApplicant[];
  selectedApplicants: string[];
  onToggle?: (name: string) => void;
}

function GroupedCheckbox({ group, selectedApplicants, onToggle }: GroupedCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  const allSelected = group.every((a) => selectedApplicants.includes(a.name));
  const someSelected = group.some((a) => selectedApplicants.includes(a.name));

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.checked = allSelected;
      checkboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [allSelected, someSelected]);

  const handleChange = () => {
    const targetSelected = !allSelected;
    group.forEach((a) => {
      const current = selectedApplicants.includes(a.name);
      if (current !== targetSelected) {
        onToggle?.(a.name);
      }
    });
  };

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      onChange={handleChange}
      className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 border-gray-300 rounded"
      disabled={group.some((a) => !a.name)}
    />
  );
}