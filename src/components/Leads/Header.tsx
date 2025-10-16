// components/Leads/LeadsHeader.tsx
"use client";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

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

}: // title = "Leads Management",
LeadsHeaderProps) => {
  return (
    <div className="bg-white border-gray-200">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* Left: Header */}
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>

        {/* Right: Search + Filters + Refresh */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads by name, company, email, industry, or city..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
          {/* <Button
            className="flex items-center gap-2  transition-colors "
            variant="outline"
            size="icon"
          >
            <Filter className="w-5 h-5" />
          
          </Button> */}

          {/* Refresh Button */}
          {/* <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button> */}

          <Button
            onClick={onAddLead}
            className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4 stroke-[3]" />{" "}
            {/* precise balanced size */}
          </Button>
        </div>
      </div>
    </div>
  );
};
