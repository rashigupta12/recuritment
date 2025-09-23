"use client";
import LeadCard from "@/components/Leads/LeadCard";
import LeadForm from "@/components/Leads/LeadForm";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { useLeadStore } from "@/stores/leadStore";
import {
  Factory,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

type LeadType = {
  name?: string;
  custom_full_name?: string;
  lead_name?: string;
  custom_email_address?: string;
  email_id?: string;
  custom_phone_number?: string;
  company_name?: string;
  industry?: string;
  city?: string;
  custom_budgetinr?: number;
  custom_expected_hiring_volume?: number;
  status?: string;
  creation?: string;
  website?: string;
  state?: string;
  country?: string;
};

// Main Leads Component
const LeadsManagement = () => {
  const { leads, setLeads, loading, setLoading, addLead } = useLeadStore();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await frappeAPI.getAllLeads();
        const leadList = response.data || [];

        const detailedLeads = await Promise.all(
          leadList.map(async (lead: { name: string }) => {
            try {
              const leadDetails = await frappeAPI.getLeadById(lead.name);
              return leadDetails.data;
            } catch (err) {
              console.error(`Error fetching details for ${lead.name}:`, err);
              return null;
            }
          })
        );

        setLeads(detailedLeads.filter(Boolean));
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [setLeads, setLoading]);

  console.log(leads);

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (lead.custom_full_name || "").toLowerCase().includes(searchLower) ||
      (lead.company_name || "").toLowerCase().includes(searchLower) ||
      (lead.custom_email_address || "").toLowerCase().includes(searchLower) ||
      (lead.industry || "").toLowerCase().includes(searchLower) ||
      (lead.city || "").toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 ">
        <div className="max-w-7xl mx-auto pb-2">
          <div className="flex items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, company, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
           
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto py-2">
        {/* Desktop Table View - hidden on mobile */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  Hiring Volumne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead, index) => (
                <tr
                  key={lead.name || lead.id || index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.custom_full_name ||
                            lead.lead_name ||
                            "Unnamed Lead"}
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
                    <div className="text-sm text-gray-500">
                      {lead.mobile_no || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">{lead.website}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      {lead.state}
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
                      <IndianRupee className="h-4 w-4 mr-2 text-gray-400" />
                      {lead.custom_budgetinr
                        ? `₹${lead.custom_budgetinr.toLocaleString()}`
                        : "No budget"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      {/* <Phone className="h-4 w-4 mr-2 text-gray-400" /> */}
                      {lead.custom_expected_hiring_volume || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lead.status === "Lead"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {lead.status || "Lead"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - hidden on desktop */}
        <div className="lg:hidden space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No leads found" : "No leads yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No leads match your search for "${searchQuery}"`
                  : "Get started by adding your first lead"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Your First Lead
                </button>
              )}
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <LeadCard key={lead.name || lead.id} lead={lead} />
            ))
          )}
        </div>

        {/* Empty state for desktop table */}
        {filteredLeads.length === 0 && (
          <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No leads found" : "No leads yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `No leads match your search for "${searchQuery}"`
                : "Get started by adding your first lead"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Your First Lead
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lead Form Modal */}
      {showForm && <LeadForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default LeadsManagement;
