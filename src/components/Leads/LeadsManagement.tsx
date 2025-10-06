"use client";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import { useEffect, useState, useCallback, useMemo } from "react";
import LeadDetailModal from "./Details";
import { LoadingState } from "./LoadingState";
import { LeadsHeader } from "./Header";
import { LeadsFormView } from "./FormView";
import { LeadsStats } from "./Stats";
import { LeadsTable } from "./Table";
import { LeadsEmptyState, LeadsMobileView } from "./MobileView";

const LeadsManagement = () => {
  const { leads, setLeads, loading, setLoading } = useLeadStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "add" | "edit">("list");
  
  const { user } = useAuth();

  // Optimized function to fetch leads with batch processing
  const fetchLeads = useCallback(async (email: string) => {
    try {
      setLoading(true);
      
      // Fetch all leads with necessary fields in single request
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

  // Event handlers
  const handleFormClose = useCallback(() => {
    setCurrentView("list");
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
      <LeadsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddLead={handleAddLead}
      />

      {/* <LeadsStats leads={leads} /> */}

      <div className="w-full mx-auto py-2">
        {filteredLeads.length > 0 ? (
          <>
            <div className="hidden lg:block">
              <LeadsTable
                leads={filteredLeads}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
              />
            </div>

            <LeadsMobileView
              leads={filteredLeads}
              onViewLead={handleViewLead}
              onEditLead={handleEditLead}
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
        <LeadDetailModal lead={selectedLead} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default LeadsManagement;