// components/Leads/LeadsHeader.tsx
"use client";
import { ArrowLeft, Plus, Search } from "lucide-react";

interface LeadsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddLead: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
}

export const LeadsHeader = ({
  searchQuery,
  onSearchChange,
  onAddLead,
  showBackButton = false,
  onBack,
  // title = "Leads Management",
}: LeadsHeaderProps) => {
  return (
    <div className="bg-white border-gray-200">
      {/* {showBackButton ? (
        <div className="border-b border-gray-200 px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Leads</span>
          </button>
        </div>
      ) : ( */}
        <div className="w-full mx-auto pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="relative w-full md:w-[40%]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, company, email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <button
              onClick={onAddLead}
              className="w-full md:w-[10%] flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      {/* )} */}
    </div>
  );
};
