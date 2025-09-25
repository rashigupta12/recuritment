

// Updated main LeadsManagement component
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import { useEffect, useState } from "react";
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
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingView, setPendingView] = useState<'list' | 'add' | 'edit'>('list');
  const { user } = useAuth();

  // Function to fetch leads
  const fetchLeads = async (email: string) => {
    try {
      setLoading(true);
      const response = await frappeAPI.getAllLeads(email);
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

  useEffect(() => {
    if (!user) return;
    fetchLeads(user.email);
  }, [setLeads, setLoading, user]);

  // Filter leads based on search query
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

  // Event handlers
  const handleFormClose = () => {
    setCurrentView('list');
    if (user) {
      fetchLeads(user?.email);
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleBack = () => {
    setPendingView('list');
    setShowConfirmation(true);
  };

  const handleConfirmBack = () => {
    setShowConfirmation(false);
    setCurrentView(pendingView);
  };

  const handleCancelBack = () => {
    setShowConfirmation(false);
    setPendingView('list');
  };

  const handleAddLead = () => {
    setCurrentView('add');
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentView('edit');
  };

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render form view (add or edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <>
        {/* <LeadsHeader
          searchQuery=""
          onSearchChange={() => {}}
          onAddLead={() => {}}
          showBackButton={true}
          onBack={handleBack}
        /> */}
       
<LeadsFormView
  currentView={currentView}
  selectedLead={selectedLead}
  onBack={handleBack}
  onFormClose={handleFormClose}
  // Remove onConfirmBack and onCancelBack as well since LeadsFormView handles them internally
/>
      </>
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

      <LeadsStats leads={leads} />
      
      <div className="max-w-7xl mx-auto py-2">
        {/* Desktop Table View */}
        {filteredLeads.length > 0 ? (
          <>
            <div className="hidden lg:block">
              <LeadsTable
                leads={filteredLeads}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
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

      {/* Lead Detail Modal */}
      {showModal && (
        <LeadDetailModal lead={selectedLead} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default LeadsManagement;