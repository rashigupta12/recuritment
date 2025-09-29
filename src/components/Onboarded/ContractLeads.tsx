/*eslint-disable @typescript-eslint/no-explicit-any*/
// Updated main LeadsManagement component
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import { useEffect, useState } from "react";
import LeadDetailModal from "../Leads/Details";
import { LoadingState } from "../Leads/LoadingState";
import { LeadsMobileView } from "../Leads/MobileView";

import { useRouter } from "next/navigation";
import { LeadsTable } from "./Table";



interface CustomerDetails {
  name: string;
  customer_name: string;
  lead_name: string;
  email_id: string;
  mobile_no: string;
  industry: string;
  website: string;
  // ... other customer fields
}

const ContractLeads = () => {
  const { leads, setLeads, loading, setLoading } = useLeadStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "add" | "edit">(
    "list"
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingView, setPendingView] = useState<"list" | "add" | "edit">(
    "list"
  );
  const { user } = useAuth();
  const router = useRouter();

  // Main function to fetch leads through the customer chain
  const fetchLeads = async (email: string) => {
    try {
      setLoading(true);

      // Step 1: Get customers owned by the user
      const customersRes = await frappeAPI.getAllCustomers(email);
      const customers = customersRes?.data || [];
      console.log("Fetched customers:", customers);

      if (customers.length === 0) {
        setLeads([]);
        return;
      }

      // Step 2: Get customer details
      const customerDetailsList = await Promise.all(
        customers.map((customer: { name: string }) =>
          frappeAPI.getCustomerBYId(customer.name)
        )
      );

      // Some APIs wrap response in .data, normalize here
      const validCustomerDetails = customerDetailsList
        .map((res: any) => res?.data ?? res)
        .filter(Boolean) as CustomerDetails[];

      console.log("Fetched customer details:", validCustomerDetails);

      // Step 3: Get lead details for customers with a lead_name
      const leadDetailsList = await Promise.all(
        validCustomerDetails
          .filter((customer) => !!customer.lead_name)
          .map((customer) => frappeAPI.getLeadById(customer.lead_name))
      );

      // Again, unwrap .data if needed
      const validLeads = leadDetailsList
        .map((res: any) => res?.data ?? res)
        .filter(Boolean) as Lead[];

      console.log("Fetched lead details:", validLeads);

      // Step 4: Filter leads owned by current user
      const userLeads = validLeads.filter(
        (lead) =>
          lead.lead_owner === email ||
          lead.owner === email ||
          lead.custom_lead_owner_name
            ?.toLowerCase()
            .includes(email.split("@")[0])
      );

      setLeads(userLeads.length > 0 ? userLeads : validLeads);
    } catch (error) {
      console.error("Error in fetchLeads:", error);
      setLeads([]);
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
  // const handleFormClose = () => {
  //   setCurrentView("list");
  //   if (user) {
  //     fetchLeads(user?.email);
  //   }
  // };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  // const handleBack = () => {
  //   setPendingView("list");
  //   setShowConfirmation(true);
  // };

  const handleConfirmBack = () => {
    setShowConfirmation(false);
    setCurrentView(pendingView);
  };

  const handleCancelBack = () => {
    setShowConfirmation(false);
    setPendingView("list");
  };

  // const handleAddLead = () => {
  //   setCurrentView("add");
  // };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentView("edit");
  };

  // Fixed navigation function for App Router
  const handleCreateContract = (lead: Lead) => {
    // Navigate to staffing plan page with the selected lead using App Router syntax
    router.push(
      `/dashboard/sales-manager/requirements/create?leadId=${lead.name}`
    );
  };

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render list view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-2">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          {/* <p className="text-gray-600">Manage your contract-ready leads and create staffing plans</p> */}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads by name, company, email, industry, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <>
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No customers found</div>
              <div className="text-gray-400 text-sm mt-2">
                No contract-ready leads are available at the moment.
              </div>
            </div>
          </>
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
              Are you sure you want to go back? Any unsaved changes will be
              lost.
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
