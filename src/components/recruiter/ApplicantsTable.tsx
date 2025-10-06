/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { JobApplicant } from "../../app/(dashboard)/dashboard/recruiter/viewapplicant/page";

interface ApplicantsTableProps {
  applicants: JobApplicant[];
  selectedApplicants: string[];
  onSelectApplicant: (name: string) => void;
  showCheckboxes: boolean;
  showStatus: boolean;
  onRowClick?: (applicant: JobApplicant) => void; // Optional onRowClick prop
}

type SortField = "name" | "email" | "job_title" | "status";
type SortDirection = "asc" | "desc" | null;

export const ApplicantsTable = ({
  applicants,
  selectedApplicants,
  onSelectApplicant,
  showCheckboxes,
  showStatus,
  onRowClick, // Add onRowClick to props
}: ApplicantsTableProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
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
      case "job_title":
        aValue = a.job_title?.toLowerCase() || "";
        bValue = b.job_title?.toLowerCase() || "";
        break;
      case "status":
        aValue = a.status?.toLowerCase() || "";
        bValue = b.status?.toLowerCase() || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-2 sm:px-4 py-4 text-left text-xs sm:text-sm font-semibold cursor-pointer select-none group"
    >
      <div className="flex items-center gap-1 sm:gap-2">
        {children}
        <ArrowUpDown
          className={`w-3 h-3 sm:w-4 sm:h-4 transition-all ${
            sortField === field
              ? "text-white scale-110"
              : "text-white opacity-60 group-hover:opacity-100"
          }`}
          style={{
            transform:
              sortField === field && sortDirection === "desc"
                ? "rotate(180deg) scale(1.1)"
                : "rotate(0deg)",
          }}
        />
      </div>
    </th>
  );

  return (
    <div className="bg-white shadow-md rounded-lg border border-blue-100 overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
          <thead className="bg-blue-500 text-white">
            <tr>
              {showCheckboxes && (
                <th className="px-2 sm:px-4 py-4 text-left">Select</th>
              )}
              <th className="px-2 sm:px-4 py-4 text-left">Designation</th>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <th className="px-2 sm:px-4 py-4 text-left">Phone</th>
              {showStatus && (
                <SortableHeader field="status">Status</SortableHeader>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedApplicants.map((applicant, index) => (
              <tr
                key={applicant.name}
                onClick={() => {
                  console.log('Row clicked:', applicant); // Debug log
                  onRowClick?.(applicant); // Trigger onRowClick
                }}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-blue-50"
                } hover:bg-blue-100 transition duration-100 cursor-pointer`} // Add cursor-pointer
              >
                {showCheckboxes && (
                  <td className="px-2 sm:px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.includes(applicant.name)}
                      onChange={() => onSelectApplicant(applicant.name)}
                      onClick={(e) => e.stopPropagation()} // Prevent row click on checkbox
                      className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </td>
                )}
                <td className="px-2 sm:px-4 py-4 truncate">
                  {applicant.designation || "N/A"}
                </td>
                <td className="px-2 sm:px-4 py-4 font-semibold text-blue-900 truncate">
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
                {showStatus && (
                  <td className="px-2 sm:px-4 py-4 truncate font-medium text-blue-700">
                    {applicant.status || "N/A"}
                  </td>
                )}
              </tr>
            ))}
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
};