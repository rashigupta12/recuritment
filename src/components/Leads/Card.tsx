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
          <h3 className="text-lg font-semibold text-gray-900">
            {lead.custom_full_name || lead.lead_name || "Unnamed Lead"}
          </h3>
          <p className="text-sm text-gray-500">
            {lead.company_name || "No company"}
          </p>
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

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        {lead.custom_email_address && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{lead.custom_email_address}</span>
          </div>
        )}
        {lead.custom_phone_number && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{lead.custom_phone_number}</span>
          </div>
        )}
        {(lead.city || lead.state || lead.country) && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">
              {[lead.city, lead.state, lead.country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
        <div>
          <div className="flex items-center text-sm text-gray-600">
            <Factory className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{lead.industry || "No industry"}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <span>{lead.custom_expected_hiring_volume || "0"} hires</span>
          </div>
        </div>
      </div>

      {/* Budget */}
      {lead.custom_budgetinr && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm font-medium text-gray-900">
            <IndianRupee className="h-4 w-4 mr-2 text-gray-400" />
            <span>₹{lead.custom_budgetinr.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadCard;