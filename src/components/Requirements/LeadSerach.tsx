'use client'
/*eslint-disable  @typescript-eslint/no-explicit-any*/
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  Building,
  Loader2,
  Mail,
  Phone,
  Search,
  User,
  X
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LeadType } from "./helper";

// Lead Search Component
export const LeadSearchSection: React.FC<{
  onLeadSelect: (lead: LeadType | null) => void;
  selectedLead: LeadType | null;
  disabled?: boolean;
}> = ({ onLeadSelect, selectedLead, disabled = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LeadType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchLeads = useCallback(async (query: string) => {
    if (!query.trim() || disabled) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.lead_search.search_lead?search_term=${encodeURIComponent(query)}`
      );
      
      if (response.message?.status === "success") {
        const data: LeadType[] = response.message.data || [];
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!selectedLead && !disabled) {
      const handler = setTimeout(() => {
        searchLeads(searchQuery);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [searchQuery, searchLeads, selectedLead, disabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLead && !disabled) {
      setSearchQuery(e.target.value);
    }
  };

  const handleLeadSelect = (lead: LeadType) => {
    if (!disabled) {
      onLeadSelect(lead);
      setSearchQuery(lead.custom_full_name);
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const handleClearSelection = () => {
    if (!disabled) {
      onLeadSelect(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    if (!selectedLead && searchQuery.trim() && !isSearching && !disabled) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <Search className="absolute left-2 h-3 w-3 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedLead ? selectedLead.custom_full_name : "Search leads by name, company, or email..."}
          value={selectedLead ? selectedLead.custom_full_name : searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          className={`w-full pl-7 pr-8 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          disabled={!!selectedLead || disabled}
          readOnly={!!selectedLead || disabled}
        />
        {selectedLead && !disabled && (
          <button
            onClick={handleClearSelection}
            className="absolute right-2 p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {showDropdown && !selectedLead && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded border border-gray-200 max-h-60 overflow-y-auto"
        >
          {isSearching ? (
            <div className="p-3 text-center text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin mx-auto mb-1" />
              <div className="text-xs">Searching...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((lead) => (
                <div
                  key={lead.name}
                  className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleLeadSelect(lead)}
                >
                  <div className="text-sm font-medium text-gray-900">{lead.custom_full_name}</div>
                  <div className="text-xs text-gray-600 flex items-center mt-0.5">
                    <Building className="h-2.5 w-2.5 mr-1" />
                    {lead.company_name}
                  </div>
                  {(lead.custom_email_address || lead.custom_phone_number) && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                      {lead.custom_email_address && (
                        <span className="flex items-center">
                          <Mail className="h-2.5 w-2.5 mr-1" />
                          {lead.custom_email_address}
                        </span>
                      )}
                      {lead.custom_phone_number && (
                        <span className="flex items-center">
                          <Phone className="h-2.5 w-2.5 mr-1" />
                          {lead.custom_phone_number}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-3 text-center text-gray-500 text-xs">
              No leads found for &pos;{searchQuery}&pos;
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500 text-xs">
              Start typing to search leads...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
