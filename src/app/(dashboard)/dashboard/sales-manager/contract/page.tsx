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
import { Filter, RefreshCw, Users, Building, Tag } from "lucide-react";
import { getStageAbbreviation } from "@/components/Onboarded/Table"; // Import the function
import { FilterState, TodosHeader } from "@/components/recruiter/TodoHeader";

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

  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    clients: [],
    locations: [],
    jobTitles: [],
    status: [],
    contacts: [],
    dateRange: "all",
    vacancies: "all",
  });

  // Define stage mapping (full name to abbreviation)
  const stageMapping: Record<string, string> = useMemo(() => ({
    "Prospecting": "Pr",
    "Lead Qualification": "LQ",
    "Needs Analysis / Discovery": "NAD",
    "Presentation / Proposal": "PP",
    "Contract": "Co",
    "Onboarded": "On",
    "Follow-Up / Relationship Management": "FURM",
    
  }), []);

  // Define filter configuration with full names as options
  const filterConfig = useMemo(
    () => [
      {
        id: "clients",
        title: "Company",
        icon: Building,
        options: Array.from(new Set(leads.map((lead) => lead.company_name || ""))).filter(Boolean),
        searchKey: "company_name",
        showInitialOptions: false,
      },
      {
        id: "contacts",
        title: "Contact",
        icon: Users,
        options: Array.from(new Set(leads.map((lead) => lead.custom_full_name || ""))).filter(Boolean),
        searchKey: "custom_full_name",
        showInitialOptions: false,
      },
      {
        id: "status",
        title: "Stage",
        icon: Tag,
        options: Object.keys(stageMapping), // Use full names as options
        // No need for optionLabels if options are full names
      },
    ],
    [leads, stageMapping]
  );

  // Optimized function to fetch contract leads
  const fetchLeads = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const response = await frappeAPI.getContractReadyLeads(email);
      
      if (response.data && Array.isArray(response.data)) {
        const transformedLeads = response.data.map((lead: Lead) => ({
          ...lead,
          status: lead.custom_stage ? getStageAbbreviation(lead.custom_stage) : lead.status,
        }));
        setLeads(transformedLeads);
        console.log("Fetched leads data:", transformedLeads);
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
    fetchLeads(user.email).then(() => {
      console.log("Leads after fetch:", leads);
    });
  }, [user, fetchLeads]);

  // Handle filter change with mapping
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    const updatedFilters = { ...newFilters };
    // Map full names to abbreviations for status
    if (updatedFilters.status.length > 0) {
      updatedFilters.status = updatedFilters.status.map(status => stageMapping[status] || status);
    }
    setFilters(updatedFilters);
  }, [stageMapping]);

  // Memoized filtered leads with filter application
  const filteredLeads = useMemo(() => {
    let result = leads;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter((lead) => {
        return (
          (lead.custom_full_name || "").toLowerCase().includes(searchLower) ||
          (lead.company_name || "").toLowerCase().includes(searchLower) ||
          (lead.custom_email_address || "").toLowerCase().includes(searchLower) ||
          (lead.industry || "").toLowerCase().includes(searchLower) ||
          (lead.city || "").toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply filters using status
    if (filters.clients.length > 0) {
      result = result.filter((lead) => filters.clients.includes(lead.company_name || ""));
    }
    if (filters.contacts.length > 0) {
      result = result.filter((lead) => filters.contacts.includes(lead.custom_full_name || ""));
    }
    if (filters.status.length > 0) {
      result = result.filter((lead) => filters.status.includes(lead.status || ""));
    }

    return result;
  }, [leads, searchQuery, filters]);

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

  const handleRefresh = useCallback(async () => {
    if (user?.email) {
      await fetchLeads(user.email);
      console.log("Refreshed leads:", leads);
    }
  }, [user, fetchLeads]);

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-2">
        {/* TodosHeader Component with custom filter config and onFilterChange */}
        <TodosHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          totalJobs={leads.length}
          filteredJobs={filteredLeads.length}
          uniqueClients={Array.from(new Set(leads.map((lead) => lead.company_name || ""))).filter(Boolean)}
          uniqueContacts={Array.from(new Set(leads.map((lead) => lead.custom_full_name || ""))).filter(Boolean)}
          uniqueStatus={Object.keys(stageMapping)} // Use full names
          onFilterChange={handleFilterChange}
          filterConfig={filterConfig}
          title="Customers"
        />

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
              {searchQuery || filters.clients.length > 0 || filters.contacts.length > 0 || filters.status.length > 0
                ? "No matching customers found"
                : "No customers found"}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {searchQuery || filters.clients.length > 0 || filters.contacts.length > 0 || filters.status.length > 0
                ? "Try adjusting your search or filter terms"
                : "No contract-ready leads are available at the moment."}
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