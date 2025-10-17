"use client";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import { useEffect, useState, useCallback, useMemo } from "react";
import LeadDetailModal from "./Details";
import { LoadingState } from "./LoadingState";
import { LeadsFormView } from "./FormView";
import { LeadsTable } from "./Table";
import { LeadsEmptyState, LeadsMobileView } from "./MobileView";
import { FilterState, TodosHeader } from "../recruiter/Header";
import { Building, Tag, Users } from "lucide-react";
import Pagination from "../comman/Pagination";

const LeadsManagement = () => {
  const { leads, setLeads, loading, setLoading } = useLeadStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "add" | "edit">("list");
  const { user } = useAuth();

  // Check if the user has a restricted role
  const restrictedRoles = ["Recruiter", "Sales User"];
  const isRestrictedUser = user?.roles?.some((role: string) => restrictedRoles.includes(role)) || false;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Define all possible stages (excluding Onboarded)
  const allStages = useMemo(
    () => [
      "Prospecting",
      "Lead Qualification",
      "Needs Analysis / Discovery",
      "Presentation / Proposal",
    ],
    []
  );

  // State for filters - MOVED TO PARENT COMPONENT
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

  // Optimized function to fetch leads with batch processing
  const fetchLeads = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        const response = await frappeAPI.getAllLeadsDetailed(email);
        if (response.data && Array.isArray(response.data)) {
          setLeads(response.data);
        } else {
          console.error("Unexpected response format:", response);
          setLeads([]);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    },
    [setLeads, setLoading]
  );

  // Wrapper function for refresh that doesn't require parameters and preserves filters
// Wrapper function for refresh that resets filters and fetches leads
const handleRefresh = useCallback(async () => {
  if (user?.email) {
    setSearchQuery("");
    // Reset filters to initial state
    setFilters({
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
    setCurrentPage(1);
    // Fetch leads
    await fetchLeads(user.email);
  }
}, [user?.email, fetchLeads, setFilters]);

  useEffect(() => {
    if (!user?.email) return;
    fetchLeads(user.email);
  }, [user, fetchLeads]);

  // Memoized filtered leads for better performance
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

    // Apply filters
    if (filters.clients.length > 0) {
      result = result.filter((lead) => filters.clients.includes(lead.company_name || ""));
    }
    if (filters.contacts.length > 0) {
      result = result.filter((lead) => filters.contacts.includes(lead.custom_full_name || ""));
    }
    if (filters.status.length > 0) {
      result = result.filter((lead) => filters.status.includes(lead.custom_stage || ""));
    }

    return result;
  }, [leads, searchQuery, filters]);

  // Pagination calculations
  const totalCount = filteredLeads.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Event handlers
  const handleFormClose = useCallback(() => {
    setCurrentView("list");
    setCurrentPage(1);
    // Refresh data but keep filters - just fetch without clearing filters
    if (user?.email) {
      fetchLeads(user.email);
    }
  }, [user, fetchLeads]);

  const handleViewLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedLead(null);
  }, []);

  const handleAddLead = useCallback(() => {
    setCurrentView("add");
  }, []);

  const handleEditLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setCurrentView("edit");
  }, []);

  // Handle filter change - now updates parent state
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Define filter configuration
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
        options: allStages,
        alwaysShowOptions: true,
        type: "radio" as const,
        showInitialOptions: true,
      },
    ],
    [leads, allStages]
  );

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render form view (add or edit)
  if (currentView === "add" || currentView === "edit") {
    return (
      <LeadsFormView
        currentView={currentView}
        selectedLead={selectedLead}
        onBack={handleFormClose}
        onFormClose={handleFormClose}
      />
    );
  }

  // Render list view
  return (
    <div className="min-h-screen bg-gray-50">
      <TodosHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        totalJobs={leads.length}
        filteredJobs={filteredLeads.length}
        uniqueClients={Array.from(new Set(leads.map((lead) => lead.company_name || ""))).filter(Boolean)}
        uniqueContacts={Array.from(new Set(leads.map((lead) => lead.custom_full_name || ""))).filter(Boolean)}
        uniqueStatus={allStages}
        onFilterChange={handleFilterChange}
        filterConfig={filterConfig}
        title="Leads"
        onAddLead={handleAddLead}
        showExportButton={false}
        showAddLeadButton={true}
        filters={filters}
      />

      <div className="w-full mx-auto py-2">
        {filteredLeads.length > 0 ? (
          <>
            <div className="hidden lg:block">
              <LeadsTable
                leads={paginatedLeads}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
              />
            </div>

            <LeadsMobileView
              leads={paginatedLeads}
              onViewLead={handleViewLead}
              onEditLead={handleEditLead}
              isRestrictedUser={isRestrictedUser}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              maxPagesToShow={5}
            />
          </>
        ) : (
          <>
            <LeadsEmptyState
              searchQuery={searchQuery}
              onAddLead={handleAddLead}
              isMobile={false}
            />
            <LeadsEmptyState
              searchQuery={searchQuery}
              onAddLead={handleAddLead}
              isMobile={true}
            />
          </>
        )}
      </div>

      {showModal && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={handleCloseModal}
          isRestrictedUser={isRestrictedUser}
        />
      )}
    </div>
  );
};

export default LeadsManagement;