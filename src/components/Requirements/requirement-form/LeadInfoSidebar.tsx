'use client'

import {
  Briefcase,
  Building,
  Clock,
  IndianRupee,
  Mail,
  Phone,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import React from "react";
import { formatCurrency, formatDate, LeadType } from "../helper";



// Lead Info Sidebar
export const LeadInfoSidebar: React.FC<{ lead: LeadType }> = ({ lead }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
      <div className="flex items-center justify-between mb-3">
      
        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
          {lead.name}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{lead.custom_full_name}</h4>
          <div className="flex items-center text-gray-600 mb-1">
            <Building className="h-3 w-3 mr-1" />
            <span className="text-xs">{lead.company_name}</span>
          </div>
        </div>

        <div className="space-y-1">
          {lead.industry && (
            <div className="flex items-center text-xs text-gray-600">
              <Target className="h-3 w-3 mr-1 text-blue-500" />
              <span>{lead.industry}</span>
            </div>
          )}
          {lead.custom_offerings && (
            <div className="flex items-center text-xs text-gray-600">
              <Briefcase className="h-3 w-3 mr-1 text-blue-500" />
              <span>{lead.custom_offerings}</span>
            </div>
          )}
        </div>

        {(lead.custom_email_address || lead.custom_phone_number) && (
          <div className="border-t border-blue-200 pt-2 space-y-1">
            {lead.custom_email_address && (
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="h-3 w-3 mr-1 text-blue-500" />
                <span className="truncate">{lead.custom_email_address}</span>
              </div>
            )}
            {lead.custom_phone_number && (
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="h-3 w-3 mr-1 text-blue-500" />
                <span>{lead.custom_phone_number}</span>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-blue-200 pt-2 space-y-1">
          {lead.custom_deal_value > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <IndianRupee className="h-3 w-3 mr-1 text-green-500" />
                Deal Value
              </span>
              <span className="text-xs font-semibold text-green-600">
                {formatCurrency(lead.custom_deal_value)}
              </span>
            </div>
          )}
          {lead.custom_average_salary > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Avg Salary</span>
              <span className="text-xs font-medium text-gray-900">
                {formatCurrency(lead.custom_average_salary)}
              </span>
            </div>
          )}
          {lead.custom_fee > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Fee</span>
              <span className="text-xs font-medium text-gray-900">{lead.custom_fee}%</span>
            </div>
          )}
        </div>

        <div className="border-t border-blue-200 pt-2 space-y-1">
          {lead.custom_expected_hiring_volume > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <Users className="h-3 w-3 mr-1 text-purple-500" />
                Expected Volume
              </span>
              <span className="text-xs font-medium text-gray-900">{lead.custom_expected_hiring_volume}</span>
            </div>
          )}
          {lead.custom_estimated_hiring_ > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-orange-500" />
                Est. Hiring
              </span>
              <span className="text-xs font-medium text-gray-900">{lead.custom_estimated_hiring_}</span>
            </div>
          )}
          {lead.custom_expected_close_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <Clock className="h-3 w-3 mr-1 text-red-500" />
                Close Date
              </span>
              <span className="text-xs font-medium text-gray-900">
                {formatDate(lead.custom_expected_close_date)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};