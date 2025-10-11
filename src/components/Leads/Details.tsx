"use client";
import { Lead } from "@/stores/leadStore";
import {
  Building2,
  Factory,
  IndianRupee,
  Users,
  Users2Icon,
  X
} from "lucide-react";

// Lead Detail Modal Component Props Interface
interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

// Helper function to format text with proper capitalization
const formatTextWithLines = (text: string | null | undefined) => {
  if (!text) return "N/A";
  
  const words = text.split(/[\-/]+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  
  return words.join(" / ");
};

// Lead Detail Modal Component
const LeadDetailModal = ({ lead, onClose }: LeadDetailModalProps) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary">
          <h2 className="text-xl font-semibold text-white">Lead Details</h2>
          <button
            onClick={onClose}
            className="p-2  rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-2">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <Users className="h-3 w-3 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="text-md font-medium text-black">Full Name</label>
                <p className="text-gray-900">{lead.custom_full_name || lead.lead_name || "N/A"}</p>
              </div>
              
              <div>
                <label className="text-md font-medium text-black">Phone</label>
                <p className="text-gray-900 flex items-center">
                  {/* <Phone className="h-4 w-4 mr-2 text-gray-400" /> */}
                  {lead.custom_phone_number || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-md font-medium text-black">Email</label>
                <p className="text-gray-900 flex items-center">
                  {/* <Mail className="h-4 w-4 mr-2 text-gray-400" /> */}
                  {lead.custom_email_address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 rounded-lg p-2">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <Building2 className="h-3 w-3 mr-2 text-green-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-md font-medium text-black">Company Name</label>
                <p className="text-gray-900">{lead.company_name || "N/A"}</p>
              </div>
              <div>
                <label className="text-md font-medium text-black">Industry</label>
                <p className="text-gray-900 flex items-center">
                  <Factory className="h-4 w-4 mr-2 text-gray-400" />
                  {lead.industry || "N/A"}
                </p>
              </div>
              <div className="">
                <label className="text-md font-medium text-black">Website</label>
                <p className="text-gray-900">{lead.website || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Stage & Offering Information */}
          <div className="bg-gray-50 rounded-lg p-2">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <Users2Icon className="h-3 w-3 mr-2 text-purple-600" />
              Stage & Offering
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-md font-medium text-black">Stage</label>
                <p className="text-gray-900">{formatTextWithLines(lead.custom_stage)}</p>
              </div>
              <div>
                <label className="text-md font-medium text-black">Offering</label>
                <p className="text-gray-900">{formatTextWithLines(lead.custom_offerings)}</p>
              </div>
            </div>
          </div>

          {/* Salary & Hiring Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <IndianRupee className="h-3 w-3 mr-2 text-green-600" />
              Salary & Hiring Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-md font-medium text-black">Average Salary</label>
                <p className="text-gray-900 flex items-center">
                  {/* <IndianRupee className="h-4 w-4 mr-2 text-gray-400" /> */}
                  {lead.custom_average_salary 
                    ? `₹${Number(lead.custom_average_salary).toLocaleString("en-IN")}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-md font-medium text-black">Estimated Hiring</label>
                <p className="text-gray-900">{lead.custom_estimated_hiring_ || "N/A"}</p>
              </div>
              <div>
                <label className="text-md font-medium text-black"> {lead.custom_fee ?" Fee Percent %":"Fixed Fee"}</label>
                <p className="text-gray-900">{lead.custom_fee ? `${lead.custom_fee}%` : `${lead.custom_fixed_charges}`}</p>
              </div>
                 <div>
                <label className="text-md font-medium text-black">Deal Value</label>
                <p className="text-gray-900 flex items-center">
                  {/* <IndianRupee className="h-4 w-4 mr-2 text-gray-400" /> */}
                  {lead.custom_deal_value 
                    ? `₹${Number(lead.custom_deal_value).toLocaleString("en-IN")}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-md font-medium text-black">Closing Date</label>
                <p className="text-gray-900">{lead.custom_expected_close_date || "N/A"}</p>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        {/* <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          
        </div> */}
      </div>
    </div>
  );
};

export default LeadDetailModal;