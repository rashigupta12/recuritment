'use client'
import {
  Building2,
  Factory,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Globe,
  Users
} from 'lucide-react';

type LeadType = {
  name?: string;
  custom_full_name?: string;
  lead_name?: string;
  custom_email_address?: string;
  email_id?: string;
  custom_phone_number?: string;
  mobile_no?: string;
  company_name?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  custom_budgetinr?: number;
  custom_expected_hiring_volume?: number;
  status?: string;
  creation?: string;
  website?: string;
};

const LeadCard = ({ lead }: { lead: LeadType }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow transition-shadow">
      {/* Header with Contact Info and Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {lead.custom_full_name || lead.lead_name || 'Unnamed Lead'}
            </h3>
            <div className="flex flex-wrap text-xs text-gray-600 gap-3 mt-1">
              <span className="flex items-center">
                <Mail className="h-3 w-3 mr-1 text-gray-400" />
                {lead.custom_email_address || lead.email_id || 'No email'}
              </span>
              <span className="flex items-center">
                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                {lead.custom_phone_number || lead.mobile_no || 'No phone'}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
            lead.status === 'Lead'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {lead.status || 'Lead'}
        </span>
      </div>

      {/* Company + Website */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
        <div className="flex items-center">
          <Building2 className="h-3 w-3 mr-1" />
          {lead.company_name || 'No company'}
        </div>
        {lead.website && (
          <div className="flex items-center">
            <Globe className="h-3 w-3 mr-1" />
            {lead.website}
          </div>
        )}
      </div>

      {/* Address, Industry, Budget, Hiring */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <h4 className="font-medium flex items-center mb-1">
            <MapPin className="h-3 w-3 mr-1" /> Address
          </h4>
          {lead.state || lead.city || lead.country ? (
            <>
              {lead.state && <div>{lead.state}</div>}
              {lead.city && <div>{lead.city}</div>}
              {lead.country && <div>{lead.country}</div>}
            </>
          ) : (
            'N/A'
          )}
        </div>

        <div>
          <h4 className="font-medium flex items-center mb-1">
            <Factory className="h-3 w-3 mr-1" /> Industry
          </h4>
          {lead.industry || 'N/A'}
        </div>

        <div>
          <h4 className="font-medium flex items-center mb-1">
            <IndianRupee className="h-3 w-3 mr-1" /> Budget
          </h4>
          {lead.custom_budgetinr
            ? `₹${lead.custom_budgetinr.toLocaleString()}`
            : 'N/A'}
        </div>

        <div>
          <h4 className="font-medium mb-1">Hiring Volume</h4>
          {lead.custom_expected_hiring_volume || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
