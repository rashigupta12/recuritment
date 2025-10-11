import LeadCard from "@/components/Leads/Card";
import { Lead } from "@/stores/leadStore";

interface LeadsMobileViewProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  isRestrictedUser: boolean; // Added prop for role-based restrictions
}

export const LeadsMobileView = ({ leads, onViewLead, onEditLead, isRestrictedUser }: LeadsMobileViewProps) => {
  return (
    <div className="lg:hidden space-y-4">
      {leads.map((lead) => (
        <LeadCard
          key={lead.name || lead.id}
          lead={lead}
          onView={() => onViewLead(lead)}
          onEdit={() => onEditLead(lead)}
          isRestrictedUser={isRestrictedUser}
        />
      ))}
    </div>
  );
};

// components/Leads/LeadsEmptyState.tsx
import { Users } from "lucide-react";

interface LeadsEmptyStateProps {
  searchQuery: string;
  onAddLead: () => void;
  isMobile?: boolean;
}

export const LeadsEmptyState = ({ searchQuery, onAddLead, isMobile = false }: LeadsEmptyStateProps) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-12 text-center ${isMobile ? 'lg:hidden' : 'hidden lg:block'}`}>
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
          onClick={onAddLead}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add Your First Lead
        </button>
      )}
    </div>
  );
};
