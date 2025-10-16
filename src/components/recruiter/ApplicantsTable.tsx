/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Eye, Trash } from "lucide-react";
import { useMemo, useState } from "react";
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
  onViewDetails?: (applicant: JobApplicant) => void;
  onInterviewRowClick?: (applicant: JobApplicant) => void;
}

type SortField = "name" | "email" | "job_title" | "status" | "designation";
type AllFields = SortField | "select" | "phone" | "company" | "actions";
type SortDirection = "asc" | "desc" | null;

export function ApplicantsTable({
  applicants,
  showCheckboxes = false,
  showStatus = false,
  selectedApplicants = [],
  onSelectApplicant,
  onDeleteApplicant,
  showDeleteButton = false,
  onViewDetails,
  onInterviewRowClick, 
}: ApplicantsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: AllFields) => {
    // Only handle sorting for sortable fields
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

  const handleRowClick = (applicant: JobApplicant) => {
    if (applicant.status?.toLowerCase() === "interview") {
      onInterviewRowClick?.(applicant);
    }
  };

  const columns = useMemo(() => {
    const cols: Array<{ field: AllFields; label: string; sortable?: boolean; align?: 'left' | 'center' | 'right'; width?: string }> = [];

    if (showCheckboxes) {
      cols.push({ field: 'select', label: 'Select', sortable: false, align: 'center' });
    }

    cols.push(
      { field: 'name', label: 'Name', sortable: true, align: 'left' },
      { field: 'email', label: 'Email', sortable: true, align: 'center' },
      { field: 'phone', label: 'Phone', sortable: false, align: 'left' },
      { field: 'designation', label: 'Job Designation', sortable: true, align: 'left' },
      { field: 'company', label: 'Client', sortable: false, align: 'center' }
    );

    if (showStatus) {
      cols.push({ field: 'status', label: 'Status', sortable: true, align: 'left' });
    }

    if (showDeleteButton || onViewDetails) {
      cols.push({ field: 'actions', label: 'Actions', sortable: false, align: 'center' });
    }

    return cols;
  }, [showCheckboxes, showStatus, showDeleteButton, onViewDetails]);

  const sortedApplicants = [...applicants].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: any, bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.applicant_name?.toLowerCase() || "";
        bValue = b.applicant_name?.toLowerCase() || "";
        break;
      case "email":
        aValue = a.email_id?.toLowerCase() || "";
        bValue = b.email_id?.toLowerCase() || "";
        break;
      case "status":
        aValue = a.status?.toLowerCase() || "";
        bValue = b.status?.toLowerCase() || "";
        break;
      case "designation":
        aValue = a.designation?.toLowerCase() || "";
        bValue = b.designation?.toLowerCase() || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
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
            {sortedApplicants.map((applicant, index) => {
              const canDelete = ['tagged', 'open'].includes(applicant.status?.toLowerCase() || '');
              
              return (
                <tr
                  key={applicant.name || `applicant-${index}`}
                  onClick={() => handleRowClick(applicant)}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-blue-50"
                  } hover:bg-blue-100 transition duration-100 cursor-pointer`}
                >
                  {showCheckboxes && (
                    <td className="px-2 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedApplicants.includes(applicant.name)}
                        onChange={() => onSelectApplicant?.(applicant.name)}
                        className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                        disabled={!applicant.name}
                      />
                    </td>
                  )}
                  <td className="px-2 sm:px-4 py-4 font-semibold text-md text-blue-900 truncate">
                    {applicant.applicant_name
                      ? applicant.applicant_name
                          .toLowerCase()
                          .replace(/\b\w/g, (char) => char.toUpperCase())
                      : "N/A"}
                  </td>
                  <td className="px-2 sm:px-4 py-4 truncate">
                    {applicant.email_id || "N/A"}
                  </td>
                  <td className="px-2 sm:px-4 py-4 truncate">
                    {applicant.phone_number || "N/A"}
                  </td>
                  <td className="px-2 sm:px-4 py-4 truncate capitalize">
                    {applicant.designation || 'N/A'}
                  </td>
       <td className="px-2 sm:px-4 py-4 break-words whitespace-normal max-w-xs">
  {applicant.custom_company_name || 'N/A'}
</td>

                  {showStatus && (
                    <td className="px-2 sm:px-4 py-4 truncate font-medium text-blue-700">
                      {applicant.status || "N/A"}
                    </td>
                  )}
                  {(showDeleteButton || onViewDetails) && (
                    <td className="px-2 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(applicant)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label={`View details for ${applicant.applicant_name}`}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                        )}
                        {showDeleteButton && (
                          <button
                            onClick={() => onDeleteApplicant?.(applicant)}
                            disabled={!canDelete}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-all ${
                              canDelete
                                ? 'text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer'
                                : 'hidden'
                            }`}
                            title={canDelete ? 'Delete applicant' : 'Can only delete applicants with Tagged or Open status'}
                            aria-label={`Delete ${applicant.applicant_name}`}
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
  );
}