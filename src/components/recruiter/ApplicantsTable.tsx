/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { JobApplicant } from '../../app/(dashboard)/dashboard/recruiter/viewapplicant/page';

interface ApplicantsTableProps {
  applicants: JobApplicant[];
  selectedApplicants: string[];
  onSelectApplicant: (name: string) => void;
  showCheckboxes: boolean;
  showStatus: boolean;
}
type SortField = 'name' | 'email' | 'job_title' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export const ApplicantsTable = ({
  applicants,
  selectedApplicants,
  onSelectApplicant,
  showCheckboxes,
  showStatus,
}: ApplicantsTableProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedApplicants = [...applicants].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.applicant_name?.toLowerCase() || '';
        bValue = b.applicant_name?.toLowerCase() || '';
        break;
      case 'email':
        aValue = a.email_id?.toLowerCase() || '';
        bValue = b.email_id?.toLowerCase() || '';
        break;
      case 'job_title':
        aValue = a.job_title?.toLowerCase() || '';
        bValue = b.job_title?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      scope="col"
      className="px-6 py-4 text-left text-md font-heading text-white uppercase tracking-wide cursor-pointer transition-all select-none group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown
          className={`w-4 h-4 transition-all ${
            sortField === field
              ? 'text-white opacity-100 scale-110'
              : 'text-white opacity-60 group-hover:opacity-100'
          }`}
          style={{
            transform:
              sortField === field && sortDirection === 'desc'
                ? 'rotate(180deg) scale(1.1)'
                : 'rotate(0deg)',
          }}
        />
      </div>
    </th>
  );

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden border-2 border-blue-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-blue-100">
          <thead className="bg-blue-500 text-red-900">
            <tr>
              {showCheckboxes && (
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-md font-heading text-white uppercase tracking-wide"
                >
                  Select
                </th>
              )}
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="job_title">Job Title</SortableHeader>
              {showStatus && <SortableHeader field="status">Status</SortableHeader>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-50">
            {sortedApplicants.map((applicant, index) => (
              <tr
                key={applicant.name}
                className={`${
                  index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-white'
                } transition-all duration-200 ease-in-out cursor-pointer group border-l-4 border-transparent`}
              >
                {showCheckboxes && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.includes(applicant.name)}
                      onChange={() => onSelectApplicant(applicant.name)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                    {applicant.applicant_name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-blue-900">
                    {applicant.email_id || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                    {applicant.job_title || 'N/A'}
                  </div>
                </td>
                {showStatus && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-3 py-1 text-sm font-bold text-blue-900">
                      {applicant.status || 'N/A'}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedApplicants.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="text-blue-400 text-6xl mb-4">📋</div>
          <p className="text-blue-600 text-lg font-semibold">No applicants found</p>
          <p className="text-blue-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};