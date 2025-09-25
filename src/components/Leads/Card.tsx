import { Lead } from "@/stores/leadStore";
import {
  Building2,
  EditIcon,
  Eye,
  Factory,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Users,
  UsersIcon,
  Globe,
} from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onView?: () => void;
  onEdit?: () => void;
}

const LeadCard = ({ lead, onView, onEdit }: LeadCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header with name and actions */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {lead.custom_full_name || lead.lead_name || "-"}
          </h3>
          <div className="text-sm text-gray-500 normal-case mt-1">
            {lead.custom_email_address || "-"}
          </div>
          <div className="text-sm text-gray-500">
            {lead.custom_phone_number || "-"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit Lead"
            >
              <EditIcon className="h-4 w-4" />
            </button>
          )}
          {onView && (
            <button
              onClick={onView}
              className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-900">
          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
          <span className="truncate">{lead.company_name || "-"}</span>
        </div>
        
        {lead.website && (
          <div className="flex items-center text-sm text-blue-500">
            <Globe className="h-4 w-4 mr-2 text-gray-400" />
            <a
              href={
                lead.website.startsWith("http")
                  ? lead.website
                  : `https://${lead.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline normal-case"
            >
              {lead.website}
            </a>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <Factory className="h-4 w-4 mr-2 text-gray-400" />
          <span>{lead.industry || "-"}</span>
        </div>
      </div>

      {/* Stage and Offerings */}
      <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500 uppercase font-medium">Stage</div>
          <div className="text-sm text-gray-900 capitalize">
            {lead.custom_stage || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-medium">Offerings</div>
          <div className="text-sm text-gray-900">
            {lead.custom_offerings || "-"}
          </div>
        </div>
      </div>

      {/* Salary and Hiring */}
      {(lead.custom_average_salary || lead.custom_estimated_hiring_) && (
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
          <div>
            <div className="flex items-center text-sm text-gray-900">
              <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
              <span>{lead.custom_average_salary || "-"}</span>
            </div>
            <div className="text-xs text-gray-500">Avg Salary</div>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-900">
              <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span>{lead.custom_estimated_hiring_ || "-"}</span>
            </div>
            <div className="text-xs text-gray-500">Est. Hiring</div>
          </div>
        </div>
      )}

      {/* Fee and Deal Value */}
      <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500 uppercase font-medium">Fee</div>
          <div className="text-sm text-gray-900">
            {lead.custom_fee ? `${lead.custom_fee}%` : "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-medium">Deal Value</div>
          <div className="flex items-center text-sm text-gray-900">
            {lead.custom_deal_value ? (
              <>
                <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                <span>{lead.custom_deal_value}</span>
              </>
            ) : (
              "-"
            )}
          </div>
        </div>
      </div>

      {/* Lead Owner */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 uppercase font-medium">Lead Owner</div>
        <div className="text-sm text-gray-900">
          {lead.custom_lead_owner_name || "-"}
        </div>
      </div>

     
    </div>
  );
};

export default LeadCard;