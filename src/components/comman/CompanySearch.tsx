'use client';
import { frappeAPI } from '@/lib/api/frappeClient';
import { Building2, Edit, Globe, Loader2, Mail, MapPin, Plus, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// -------- Type Definitions --------
type CompanyType = {
  name: string;
  company_name: string;
  email?: string | null;
  website?: string | null;
  country: string;
};

type SimplifiedCompany = {
  name: string;
  company_name: string;
  email: string;
  website: string;
  country: string;
  companyId?: string;
};

type CompanySearchSectionProps = {
  onCompanySelect: (company: SimplifiedCompany) => void;
  selectedCompany: SimplifiedCompany | null;
  onEdit: () => void;
  onRemove: () => void;
 
};

// -------- Company Form State --------
type CompanyFormState = {
  company_name: string;
  country: string;
  email: string;
  website: string;
};

// Initial state for company form
const initialCompanyFormState: CompanyFormState = {
  company_name: '',
  country: '',
  email: '',
  website: '',
};

// -------- Component --------
const CompanySearchSection: React.FC<CompanySearchSectionProps> = ({
  onCompanySelect,
  selectedCompany,
  // onEdit,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Use separate state for company form to avoid conflicts
  const [companyForm, setCompanyForm] = useState<CompanyFormState>(initialCompanyFormState);

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
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
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
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Search companies
  const searchCompanies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.company_search.search_company?search_term=${encodeURIComponent(query)}`
      );
      if (response.message?.status === 'Success') {
        const data: CompanyType[] = response.message.data || [];
        console.log(data);
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Company search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      searchCompanies(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, searchCompanies]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCompanySelect = (company: CompanyType) => {
    const simplifiedCompany: SimplifiedCompany = {
      name: company.name,
      company_name: company.company_name,
      email: company.email || '',
      website: company.website || '',
      country: company.country,
      companyId: company.name,
    };
    onCompanySelect(simplifiedCompany);
    setSearchQuery(company.company_name);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && !isSearching) {
      setShowDropdown(true);
    } else if (searchQuery.trim()) {
      searchCompanies(searchQuery);
    }
  };

  const handleClearCompany = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    onRemove();
  };

  const handleEditCompany = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedCompany) {
      // Reset form with selected company data
      setCompanyForm({
        company_name: selectedCompany.company_name,
        country: selectedCompany.country,
        email: selectedCompany.email || '',
        website: selectedCompany.website || '',
      });
    }
    setShowCompanyDialog(true);
    setShowDropdown(false);
  };

  const handleCreateCompany = () => {
    // Reset form with new company data
    setCompanyForm({
      company_name: searchQuery || '',
      country: '',
      email: '',
      website: '',
    });
    setShowCompanyDialog(true);
    setShowDropdown(false);
  };

  const handleSaveCompany = async () => {
    try {
      setIsSaving(true);

      const companyData = {
        company_name: companyForm.company_name,
        country: companyForm.country,
        email: companyForm.email || null,
        website: companyForm.website || null,
      };

      let companyId: string;
      let companyName: string;

      if (selectedCompany?.companyId) {
        await frappeAPI.updateCompany(selectedCompany.companyId, companyData);
        companyId = selectedCompany.companyId;
        companyName = selectedCompany.company_name;
      } else {
        const response = await frappeAPI.createCompany(companyData);
        companyId = response.data.name;
        companyName = companyForm.company_name;
      }

      const simplifiedCompany: SimplifiedCompany = {
        name: companyName,
        company_name: companyForm.company_name,
        email: companyForm.email,
        website: companyForm.website,
        country: companyForm.country,
        companyId,
      };
      onCompanySelect(simplifiedCompany);
      setSearchQuery(companyName);
      setShowCompanyDialog(false);
      // Reset form after successful save
      setCompanyForm(initialCompanyFormState);
    } catch (error) {
      alert('Failed to save company. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseCompanyDialog = () => {
    setShowCompanyDialog(false);
    // Reset form when closing dialog
    setCompanyForm(initialCompanyFormState);
  };

  const hasValidCompany = Boolean(selectedCompany);

  // -------- Dropdown Component --------
  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
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
          Searching companies...
        </div>
      ) : searchResults.length > 0 ? (
        <div className="overflow-y-auto max-h-[calc(60vh-100px)]">
          {searchResults.map((company, index) => (
            <div
              key={company.name || index}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleCompanySelect(company)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{company.company_name}</p>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>{company.country}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{company.website}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div
            className="px-4 py-3 hover:bg-primary/5 cursor-pointer border-t bg-gray-50 text-primary font-medium"
            onClick={handleCreateCompany}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Add New Company
          </div>
        </div>
      ) : searchQuery ? (
        <div
          className="px-4 py-3 hover:bg-primary/5 cursor-pointer text-primary font-medium"
          onClick={handleCreateCompany}
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Create company for &quot;{searchQuery} &quot;
        </div>
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">
          Start typing to search companies...
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
            <Building2 className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search companies by name, website, or country..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />

            <div className="absolute right-2 flex items-center space-x-1 z-10">
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              {!isSearching && (hasValidCompany || searchQuery.trim()) && (
                <>
                  {hasValidCompany && (
                    <button
                      type="button"
                      onClick={handleEditCompany}
                      className="p-1 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                      title="Edit company"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearCompany}
                    className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Clear company"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {showDropdown && typeof document !== 'undefined' && createPortal(<DropdownContent />, document.body)}
      </div>

      {/* Selected Company Display */}
      {selectedCompany && (
        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div> */}
              <div>
                <h3 className="font-medium text-gray-900">{selectedCompany.company_name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-2" />
                    {selectedCompany.country}
                  </div>
                  {selectedCompany.website && (
                    <div className="flex items-center">
                      <Globe className="h-3 w-3 mr-2" />
                      {selectedCompany.website}
                    </div>
                  )}
                  {selectedCompany.email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      {selectedCompany.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Company Dialog */}
      {showCompanyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCompany ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button
                onClick={handleCloseCompanyDialog}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
  type="text"
  value={companyForm.company_name}
  onChange={(e) => {
    const value = e.target.value;
    // Capitalize first letter only
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setCompanyForm(prev => ({ ...prev, company_name: formattedValue }));
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
  required
/>

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select
                  value={companyForm.country}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Netherlands">Netherlands</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
               <input
  type="email"
  value={companyForm.email}
  onChange={(e) => {
    const value = e.target.value;
    // Email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Only update state if empty or valid email
    if (value === '' || emailRegex.test(value)) {
      setCompanyForm(prev => ({ ...prev, email: value }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
  placeholder="info@company.com"
/>

              </div>
              <div>
                
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={handleCloseCompanyDialog}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCompany}
                disabled={isSaving || !companyForm.company_name.trim() || !companyForm.country.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isSaving
                    ? 'Saving...'
                    : selectedCompany
                    ? 'Update Company'
                    : 'Create Company'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySearchSection;