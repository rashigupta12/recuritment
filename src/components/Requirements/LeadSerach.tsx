/*eslint-disable  @typescript-eslint/no-explicit-any*/
"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Edit, Loader2, Mail, Phone, Plus, User, X, Building, Target, Users, Calendar, DollarSign } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// -------- Type Definitions --------
type LeadType = {
  name: string;
  custom_full_name: string;
  company_name: string;
  industry: string | null;
  custom_offerings: string | null;
  custom_expected_hiring_volume: number;
  custom_estimated_hiring_: number;
  custom_average_salary: number;
  custom_fee: number;
  custom_deal_value: number;
  custom_expected_close_date: string | null;
  custom_phone_number: string;
  custom_email_address: string;
};

type SimplifiedLead = {
  name: string;
  custom_full_name: string;
  company_name: string;
  industry: string;
  custom_offerings: string;
  custom_expected_hiring_volume: number;
  custom_estimated_hiring_: number;
  custom_average_salary: number;
  custom_fee: number;
  custom_deal_value: number;
  custom_expected_close_date: string;
  custom_phone_number: string;
  custom_email_address: string;
};

type LeadMeta = {
  uniqueIndustries: string[];
  uniqueOfferings: string[];
  uniqueCompanies: string[];
};

type LeadFormState = {
  custom_full_name: string;
  company_name: string;
  industry: string;
  custom_offerings: string;
  custom_expected_hiring_volume: number;
  custom_estimated_hiring_: number;
  custom_average_salary: number;
  custom_fee: number;
  custom_deal_value: number;
  custom_expected_close_date: string;
  custom_phone_number: string;
  custom_email_address: string;
};

// Initial state for lead form
const initialLeadFormState: LeadFormState = {
  custom_full_name: "",
  company_name: "",
  industry: "",
  custom_offerings: "",
  custom_expected_hiring_volume: 0,
  custom_estimated_hiring_: 0,
  custom_average_salary: 0,
  custom_fee: 0,
  custom_deal_value: 0,
  custom_expected_close_date: "",
  custom_phone_number: "",
  custom_email_address: "",
};

// -------- Meta Extraction Utility --------
function extractLeadMeta(leads: LeadType[]): LeadMeta {
  const industries = new Set<string>();
  const offerings = new Set<string>();
  const companies = new Set<string>();

  leads.forEach((lead) => {
    if (lead.industry && lead.industry.trim()) industries.add(lead.industry.trim());
    if (lead.custom_offerings && lead.custom_offerings.trim()) offerings.add(lead.custom_offerings.trim());
    if (lead.company_name && lead.company_name.trim()) companies.add(lead.company_name.trim());
  });

  return {
    uniqueIndustries: Array.from(industries),
    uniqueOfferings: Array.from(offerings),
    uniqueCompanies: Array.from(companies),
  };
}

// -------- Formatting Utilities --------
const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)}K`;
  }
  return `₹${amount}`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// -------- Component --------
const LeadSearchSection: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LeadType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLead, setSelectedLead] = useState<SimplifiedLead | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [leadForm, setLeadForm] = useState<LeadFormState>(initialLeadFormState);
  const [leadMeta, setLeadMeta] = useState<LeadMeta>({
    uniqueIndustries: [],
    uniqueOfferings: [],
    uniqueCompanies: [],
  });

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const inputRect = inputRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    setDropdownPosition({
      top: inputRect.bottom + scrollTop,
      left: inputRect.left + scrollLeft,
      width: inputRect.width,
    });
  }, []);

  useEffect(() => {
    if (showDropdown) {
      calculateDropdownPosition();
      const handleResize = () => calculateDropdownPosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize);
      };
    }
  }, [showDropdown, calculateDropdownPosition]);

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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Search leads
  const searchLeads = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setLeadMeta({
        uniqueIndustries: [],
        uniqueOfferings: [],
        uniqueCompanies: [],
      });
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
        setLeadMeta(extractLeadMeta(data));
      } else {
        setSearchResults([]);
        setLeadMeta({
          uniqueIndustries: [],
          uniqueOfferings: [],
          uniqueCompanies: [],
        });
      }
    } catch (error) {
      setSearchResults([]);
      setLeadMeta({
        uniqueIndustries: [],
        uniqueOfferings: [],
        uniqueCompanies: [],
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      searchLeads(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, searchLeads]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLeadSelect = (lead: LeadType) => {
    const simplifiedLead: SimplifiedLead = {
      name: lead.name,
      custom_full_name: lead.custom_full_name,
      company_name: lead.company_name,
      industry: lead.industry || "",
      custom_offerings: lead.custom_offerings || "",
      custom_expected_hiring_volume: lead.custom_expected_hiring_volume,
      custom_estimated_hiring_: lead.custom_estimated_hiring_,
      custom_average_salary: lead.custom_average_salary,
      custom_fee: lead.custom_fee,
      custom_deal_value: lead.custom_deal_value,
      custom_expected_close_date: lead.custom_expected_close_date || "",
      custom_phone_number: lead.custom_phone_number,
      custom_email_address: lead.custom_email_address,
    };

    setSelectedLead(simplifiedLead);
    setSearchQuery(lead.custom_full_name);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && !isSearching) {
      setShowDropdown(true);
    } else if (searchQuery.trim()) {
      searchLeads(searchQuery);
    }
  };

  const handleClearLead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedLead(null);
  };

  const handleEditLead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedLead) {
      setLeadForm({
        custom_full_name: selectedLead.custom_full_name,
        company_name: selectedLead.company_name,
        industry: selectedLead.industry,
        custom_offerings: selectedLead.custom_offerings,
        custom_expected_hiring_volume: selectedLead.custom_expected_hiring_volume,
        custom_estimated_hiring_: selectedLead.custom_estimated_hiring_,
        custom_average_salary: selectedLead.custom_average_salary,
        custom_fee: selectedLead.custom_fee,
        custom_deal_value: selectedLead.custom_deal_value,
        custom_expected_close_date: selectedLead.custom_expected_close_date,
        custom_phone_number: selectedLead.custom_phone_number,
        custom_email_address: selectedLead.custom_email_address,
      });
    }
    setShowLeadDialog(true);
    setShowDropdown(false);
  };

  const handleCreateLead = () => {
    setLeadForm({
      ...initialLeadFormState,
      custom_full_name: searchQuery,
    });
    setShowLeadDialog(true);
    setShowDropdown(false);
  };

  const handleSaveLead = async () => {
    if (!leadForm.custom_full_name.trim()) return;

    try {
      setIsSaving(true);

      const leadData: any = {
        custom_full_name: leadForm.custom_full_name.trim(),
        company_name: leadForm.company_name.trim() || null,
        industry: leadForm.industry || null,
        custom_offerings: leadForm.custom_offerings || null,
        custom_expected_hiring_volume: leadForm.custom_expected_hiring_volume,
        custom_estimated_hiring_: leadForm.custom_estimated_hiring_,
        custom_average_salary: leadForm.custom_average_salary,
        custom_fee: leadForm.custom_fee,
        custom_deal_value: leadForm.custom_deal_value,
        custom_expected_close_date: leadForm.custom_expected_close_date || null,
        custom_phone_number: leadForm.custom_phone_number,
        custom_email_address: leadForm.custom_email_address,
      };

      let leadId: string;
      let leadName: string;

      if (selectedLead?.name) {
        await frappeAPI.updateLead(selectedLead.name, leadData);
        leadId = selectedLead.name;
        leadName = leadForm.custom_full_name;
      } else {
        const response = await frappeAPI.createLead(leadData);
        leadId = response.data.name;
        leadName = leadForm.custom_full_name;
      }

      const simplifiedLead: SimplifiedLead = {
        name: leadId,
        custom_full_name: leadForm.custom_full_name,
        company_name: leadForm.company_name,
        industry: leadForm.industry,
        custom_offerings: leadForm.custom_offerings,
        custom_expected_hiring_volume: leadForm.custom_expected_hiring_volume,
        custom_estimated_hiring_: leadForm.custom_estimated_hiring_,
        custom_average_salary: leadForm.custom_average_salary,
        custom_fee: leadForm.custom_fee,
        custom_deal_value: leadForm.custom_deal_value,
        custom_expected_close_date: leadForm.custom_expected_close_date,
        custom_phone_number: leadForm.custom_phone_number,
        custom_email_address: leadForm.custom_email_address,
      };

      setSelectedLead(simplifiedLead);
      setSearchQuery(leadName);
      setShowLeadDialog(false);
      setLeadForm(initialLeadFormState);
    } catch (error) {
      console.error(error);
      alert("Failed to save lead. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseLeadDialog = () => {
    setShowLeadDialog(false);
    setLeadForm(initialLeadFormState);
  };

  const hasValidLead = Boolean(selectedLead);

  // -------- Dropdown Component --------
  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed bg-white shadow-lg rounded-md border border-gray-200 max-h-80 overflow-y-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
    >
      {isSearching ? (
        <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Searching leads...
        </div>
      ) : searchResults.length > 0 ? (
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          {searchResults.map((lead, index) => (
            <div
              key={lead.name || index}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleLeadSelect(lead)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {lead.custom_full_name}
                    </p>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                      {lead.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center">
                      <Building className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{lead.company_name}</span>
                    </div>
                    {lead.industry && (
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{lead.industry}</span>
                      </div>
                    )}
                    {lead.custom_offerings && (
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{lead.custom_offerings}</span>
                      </div>
                    )}
                    {lead.custom_expected_close_date && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{formatDate(lead.custom_expected_close_date)}</span>
                      </div>
                    )}
                    {lead.custom_deal_value > 0 && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{formatCurrency(lead.custom_deal_value)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-1">
                      {lead.custom_email_address && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{lead.custom_email_address}</span>
                        </div>
                      )}
                      {lead.custom_phone_number && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{lead.custom_phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div
            className="px-4 py-3 hover:bg-primary/5 cursor-pointer border-t bg-gray-50 text-primary font-medium"
            onClick={handleCreateLead}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Add New Lead
          </div>
        </div>
      ) : searchQuery ? (
        <div
          className="px-4 py-3 hover:bg-primary/5 cursor-pointer text-primary font-medium"
          onClick={handleCreateLead}
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Create lead for &quot;{searchQuery}&quot;
        </div>
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">
          Start typing to search leads...
        </div>
      )}
      {(leadMeta.uniqueIndustries.length > 0 ||
        leadMeta.uniqueOfferings.length > 0 ||
        leadMeta.uniqueCompanies.length > 0) && (
        <div className="px-4 py-2 border-t text-xs text-gray-400 bg-gray-50">
          <div>
            <span className="font-medium">Industries:</span>{" "}
            {leadMeta.uniqueIndustries.join(", ")}
          </div>
          <div>
            <span className="font-medium">Offerings:</span>{" "}
            {leadMeta.uniqueOfferings.join(", ")}
          </div>
          <div>
            <span className="font-medium">Companies:</span>{" "}
            {leadMeta.uniqueCompanies.join(", ")}
          </div>
        </div>
      )}
    </div>
  );

  // -------- Render --------
  return (
    <div className="space-y-4">
      {/* Search Field */}
      <div className="w-full">
        <div className="relative">
          <div className="flex items-center">
            <User className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search leads by name, company, or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />

            <div className="absolute right-2 flex items-center space-x-1 z-10">
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              {!isSearching && (hasValidLead || searchQuery.trim()) && (
                <>
                  {hasValidLead && (
                    <button
                      type="button"
                      onClick={handleEditLead}
                      className="p-1 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                      title="Edit lead"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearLead}
                    className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Clear lead"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {showDropdown &&
          typeof document !== "undefined" &&
          createPortal(<DropdownContent />, document.body)}
      </div>

      {/* Selected Lead Display */}
      {selectedLead && (
        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 animate-in fade-in-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedLead.custom_full_name}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedLead.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mt-2">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="font-medium">{selectedLead.company_name}</span>
                  </div>
                  {selectedLead.industry && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      <span>{selectedLead.industry}</span>
                    </div>
                  )}
                  {selectedLead.custom_offerings && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{selectedLead.custom_offerings}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              {selectedLead.custom_email_address && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{selectedLead.custom_email_address}</span>
                </div>
              )}
              {selectedLead.custom_phone_number && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{selectedLead.custom_phone_number}</span>
                </div>
              )}
              {selectedLead.custom_expected_close_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Expected Close: {formatDate(selectedLead.custom_expected_close_date)}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {selectedLead.custom_estimated_hiring_ > 0 && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Estimated Hiring: {selectedLead.custom_estimated_hiring_}</span>
                </div>
              )}
              {selectedLead.custom_average_salary > 0 && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Avg Salary: {formatCurrency(selectedLead.custom_average_salary)}</span>
                </div>
              )}
              {selectedLead.custom_deal_value > 0 && (
                <div className="flex items-center font-medium text-green-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>Deal Value: {formatCurrency(selectedLead.custom_deal_value)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Lead Dialog */}
      {showLeadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedLead ? "Edit Lead" : "Add New Lead"}
              </h2>
              <button
                onClick={handleCloseLeadDialog}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={leadForm.custom_full_name}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_full_name: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={leadForm.company_name}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      company_name: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={leadForm.industry}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      industry: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offerings
                  </label>
                  <input
                    type="text"
                    value={leadForm.custom_offerings}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_offerings: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Hiring Volume
                  </label>
                  <input
                    type="number"
                    value={leadForm.custom_expected_hiring_volume}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_expected_hiring_volume: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hiring
                  </label>
                  <input
                    type="number"
                    value={leadForm.custom_estimated_hiring_}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_estimated_hiring_: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={leadForm.custom_average_salary}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_average_salary: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={leadForm.custom_fee}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_fee: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    value={leadForm.custom_deal_value}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_deal_value: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={leadForm.custom_expected_close_date}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_expected_close_date: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={leadForm.custom_email_address}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_email_address: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={leadForm.custom_phone_number}
                    onChange={(e) => setLeadForm(prev => ({
                      ...prev,
                      custom_phone_number: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={handleCloseLeadDialog}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLead}
                disabled={isSaving || !leadForm.custom_full_name.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isSaving
                    ? "Saving..."
                    : selectedLead
                    ? "Update Lead"
                    : "Create Lead"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadSearchSection;