/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import { useEffect, useState, useCallback, useMemo } from "react";
import LeadDetailModal from "../Leads/Details";
import { LoadingState } from "../Leads/LoadingState";
import { LeadsMobileView } from "../Leads/MobileView";
import { useRouter } from "next/navigation";
import { LeadsTable } from "./Table";
import { Building2, User, Bookmark, Tag } from "lucide-react";
import { TodosHeader } from "../recruiter/TodoHeader";
import Pagination from "../comman/Pagination";

interface CustomerDetails {
  name: string;
  customer_name: string;
  lead_name: string;
  email_id: string;
  mobile_no: string;
  industry: string;
  website: string;
}

interface FilterState {
  departments: string[];
  assignedBy: string[];
  clients: string[];
  locations: string[];
  jobTitles: string[];
  status: string;
  dateRange: "all" | "today" | "week" | "month";
  vacancies: "all" | "single" | "multiple";
}

interface FilterConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  options: string[];
  searchKey?: string;
  alwaysShowOptions?: boolean;
  type?: "checkbox" | "radio";
  optionLabels?: Record<string, string>;
  showInitialOptions?: boolean;
}

const ContractLeads = () => {
  const { leads, setLeads, loading, setLoading } = useLeadStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    clients: [],
    locations: [],
    jobTitles: [],
    status: "",
    dateRange: "all",
    vacancies: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stageMapping: Record<string, string> = useMemo(
    () => ({
      Prospecting: "Pr",
      "Lead Qualification": "LQ",
      "Needs Analysis / Discovery": "NAD",
      "Presentation / Proposal": "PP",
      Contract: "Co",
      Onboarded: "On",
      "Follow-Up / Relationship Management": "FURM",
    }),
    []
  );

  const fetchLeads = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        const response = await frappeAPI.getContractReadyLeadsRecuiter(email);
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
    },
    [setLeads, setLoading]
  );

  useEffect(() => {
    if (!user?.email) return;
    fetchLeads(user.email);
  }, [user, fetchLeads]);

  const uniqueCompanies = useMemo(
    () =>
      Array.from(
        new Set(
          leads
            .map((lead) => lead.company_name)
            .filter((name): name is string => typeof name === "string" && name.trim() !== "")
        )
      ),
    [leads]
  );

  const uniqueContacts = useMemo(
    () =>
      Array.from(
        new Set(
          leads
            .map((lead) => lead.custom_full_name || lead.lead_name)
            .filter((name): name is string => typeof name === "string" && name.trim() !== "")
        )
      ),
    [leads]
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        id: "clients",
        title: "Company",
        icon: Building2,
        options: uniqueCompanies,
        searchKey: "clients",
        showInitialOptions: false,
        type: "checkbox",
      },
      {
        id: "jobTitles",
        title: "Contact",
        icon: User,
        options: uniqueContacts,
        searchKey: "jobTitles",
        showInitialOptions: false,
        type: "checkbox",
      },
      {
        id: "status",
        title: "Stage",
        icon: Tag,
        options: ["Contract", "Onboarded"],
        searchKey: "status",
        showInitialOptions: true,
        type: "radio",
      },
    ],
    [uniqueCompanies, uniqueContacts]
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        status: newFilters.status || "",
      }));
      console.log("Updated Filters:", { ...filters, ...newFilters });
      setCurrentPage(1);
    },
    []
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((lead) =>
        [
          lead.custom_full_name || "",
          lead.company_name || "",
          lead.custom_email_address || "",
          lead.industry || "",
          lead.city || "",
        ].some((field) => field.toLowerCase().includes(searchLower))
      );
    }

    if (filters.clients.length > 0) {
      filtered = filtered.filter(
        (lead) => lead.company_name && filters.clients.includes(lead.company_name)
      );
    }
    if (filters.jobTitles.length > 0) {
      filtered = filtered.filter((lead) => {
        const contactName = lead.custom_full_name || lead.lead_name;
        return contactName && filters.jobTitles.includes(contactName);
      });
    }
    if (filters.status) {
      filtered = filtered.filter(
        (lead) => lead.custom_stage === filters.status
      );
    }

    console.log("Filtered Leads:", filtered);
    return filtered;
  }, [leads, searchQuery, filters]);

  const totalCount = filteredLeads.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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

  const handleCreateContract = useCallback(
    async (lead: any) => {
      await router.push(
        `/dashboard/recruiter/requirements/create?leadId=${lead.name}`
      );
    },
    [router]
  );

  const handleConfirmBack = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  const handleCancelBack = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-2">
        <TodosHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={() => fetchLeads(user?.email || "")}
          totalJobs={leads.length}
          filteredJobs={filteredLeads.length}
          uniqueClients={uniqueCompanies}
          uniqueJobTitles={uniqueContacts}
          uniqueStatus={["Contract", "Onboarded"]}
          onFilterChange={handleFilterChange}
          filterConfig={filterConfig}
          title="Customers"
        />

        {filteredLeads.length > 0 ? (
          <>
            <div className="hidden lg:block mt-4">
              <LeadsTable
                leads={paginatedLeads}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
                onCreateContract={handleCreateContract}
              />
            </div>
            <LeadsMobileView
              leads={paginatedLeads}
              onViewLead={handleViewLead}
              onEditLead={handleEditLead}
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
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchQuery ||
              filters.clients.length > 0 ||
              filters.jobTitles.length > 0 ||
              filters.status
                ? "No matching customers found"
                : "No customers found"}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {searchQuery ||
              filters.clients.length > 0 ||
              filters.jobTitles.length > 0 ||
              filters.status
                ? "Try adjusting your search terms or filters"
                : "No contract-ready leads are available at the moment."}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <LeadDetailModal lead={selectedLead} onClose={handleCloseModal} />
      )}

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