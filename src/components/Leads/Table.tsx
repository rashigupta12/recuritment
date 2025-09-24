
// components/Leads/LeadsTable.tsx
import { EditIcon, Eye, Factory } from "lucide-react";
import { Lead } from "@/stores/leadStore";

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}

export const LeadsTable = ({ leads, onViewLead, onEditLead }: LeadsTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact Info.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company Info.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Industry
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Budget
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

const LeadsTableRow = ({ lead, onView, onEdit }: LeadsTableRowProps) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {lead.custom_full_name || lead.lead_name || "Unnamed Lead"}
            </div>
            <div className="text-sm text-gray-500">
              {lead.custom_email_address || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {lead.custom_phone_number || "N/A"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {lead.company_name || "No company"}
        </div>
        <div className="text-sm text-gray-500">{lead.email_id}</div>
        <div className="text-sm text-gray-500">{lead.website}</div>
        <div className="text-sm text-gray-500">
          {lead.country || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center space-x-1">
          {[lead.city, lead.state, lead.country].filter(Boolean).join(", ")}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center">
          <Factory className="h-4 w-4 mr-2 text-gray-400" />
          {lead.industry || "No industry"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center">
          {lead.custom_budgetinr
            ? `₹${lead.custom_budgetinr.toLocaleString()}`
            : "No budget"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center">
          {lead.custom_expected_hiring_volume || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <EditIcon 
            className="text-green-500 h-5 w-5 cursor-pointer hover:text-green-600 transition-colors" 
            onClick={onEdit}
          />
          <Eye 
            className="h-5 w-5 text-blue-400 cursor-pointer hover:text-blue-600 transition-colors" 
            onClick={onView}
          />
        </div>
      </td>
    </tr>
  );
};