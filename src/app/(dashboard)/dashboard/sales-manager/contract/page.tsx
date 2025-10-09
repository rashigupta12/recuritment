/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import { useEffect, useState, useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/Leads/LoadingState";
import { LeadsTable } from "@/components/Onboarded/Table";
import { LeadsMobileView } from "@/components/Leads/MobileView";
import LeadDetailModal from "@/components/Leads/Details";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw } from "lucide-react";



interface CustomerDetails {
  name: string;
  customer_name: string;
  lead_name: string;
  email_id: string;
  mobile_no: string;
  industry: string;
  website: string;
}

const ContractLeads = () => {
  const { leads, setLeads, loading, setLoading } = useLeadStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Optimized function to fetch contract leads
  const fetchLeads = useCallback(async (email: string) => {
    try {
      setLoading(true);

      // Single API call to get customers with contract-ready leads
      const response = await frappeAPI.getContractReadyLeads(email);
      
      if (response.data && Array.isArray(response.data)) {
        setLeads(response.data);
        console.log("Fetched contract leads:", response.data);
      } else {
        console.log("No contract-ready leads found");
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching contract leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [setLeads, setLoading]);

  useEffect(() => {
    if (!user?.email) return;
    fetchLeads(user.email);
  }, [user, fetchLeads]);

  // Memoized filtered leads for better performance
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    
    const searchLower = searchQuery.toLowerCase();
    return leads.filter((lead) => {
      return (
        (lead.custom_full_name || "").toLowerCase().includes(searchLower) ||
        (lead.company_name || "").toLowerCase().includes(searchLower) ||
        (lead.custom_email_address || "").toLowerCase().includes(searchLower) ||
        (lead.industry || "").toLowerCase().includes(searchLower) ||
        (lead.city || "").toLowerCase().includes(searchLower)
      );
    });
  }, [leads, searchQuery]);

 

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedLead(null);
  }, []);


const handleViewLead = useCallback((lead: any) => {
  setSelectedLead(lead as Lead);
  setShowModal(true);
}, []);

const handleEditLead = useCallback((lead: any) => {
  setSelectedLead(lead as Lead);
  console.log("Edit lead:", lead);
}, []);

const handleCreateContract = useCallback(async (lead: any) => {
  await router.push(`/dashboard/sales-manager/requirements/create?leadId=${lead.name}`);
}, [router]);

  const handleConfirmBack = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  const handleCancelBack = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-2">

      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

          {/* Right: Search + Filters + Refresh */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads by name, company, email, industry, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filters Button */}
            <Button className="flex items-center gap-2  transition-colors "  variant="outline"
              size="icon">
              <Filter className="w-5 h-5" />
              {/* <span className="text-sm font-medium">Filters</span> */}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
</div>


        {/* Desktop Table View */}
        {filteredLeads.length > 0 ? (
          <>
            <div className="hidden lg:block">
              <LeadsTable
                leads={filteredLeads}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
                onCreateContract={handleCreateContract}
              />
            </div>

            {/* Mobile Card View */}
            <LeadsMobileView
              leads={filteredLeads}
              onViewLead={handleViewLead}
              onEditLead={handleEditLead}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchQuery ? "No matching customers found" : "No customers found"}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "No contract-ready leads are available at the moment."
              }
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {showModal && (
        <LeadDetailModal lead={selectedLead} onClose={handleCloseModal} />
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirm Navigation
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to go back? Any unsaved changes will be lost.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmBack}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Yes, go back
              </button>
              <button
                onClick={handleCancelBack}
                className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractLeads;