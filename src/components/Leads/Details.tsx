"use client";
import { Lead } from "@/stores/leadStore";
import {
  Building2,
  Calendar,
  DollarSign,
  EditIcon,
  Factory,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Users,
  X
} from "lucide-react";

// Lead Detail Modal Component Props Interface
interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

// Lead Detail Modal Component
const LeadDetailModal = ({ lead, onClose }: LeadDetailModalProps) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{lead.custom_full_name || lead.lead_name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {lead.custom_email_address || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {lead.custom_phone_number || "N/A"}
                </p>
              </div>
             
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-green-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Company Name</label>
                <p className="text-gray-900">{lead.company_name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Industry</label>
                <p className="text-gray-900 flex items-center">
                  <Factory className="h-4 w-4 mr-2 text-gray-400" />
                  {lead.industry || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Website</label>
                <p className="text-gray-900">{lead.website || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Company Email</label>
                <p className="text-gray-900">{lead.email_id || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">City</label>
                <p className="text-gray-900">{lead.city || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">State</label>
                <p className="text-gray-900">{lead.state || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Country</label>
                <p className="text-gray-900">{lead.country || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Budget (INR)</label>
                <p className="text-gray-900 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-2 text-gray-400" />
                  {lead.custom_budgetinr ? `₹${lead.custom_budgetinr.toLocaleString()}` : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Expected Hiring Volume</label>
                <p className="text-gray-900">{lead.custom_expected_hiring_volume || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-600" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">
                  {lead.creation ? new Date(lead.creation).toLocaleDateString() : "N/A"}
                </p>
              </div>
             
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <EditIcon className="h-4 w-4" />
            Edit Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal
