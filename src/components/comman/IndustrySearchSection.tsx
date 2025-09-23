'use client';
import { frappeAPI } from '@/lib/api/frappeClient';
import { Factory, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// -------- Type Definitions --------
type IndustryType = { 
  industry: string;
};

type IndustrySearchSectionProps = {
  onIndustrySelect: (industry: IndustryType) => void;
  selectedIndustry: IndustryType | null;
};

// -------- Component --------
const IndustrySearchSection: React.FC<IndustrySearchSectionProps> = ({
  onIndustrySelect,
  selectedIndustry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IndustryType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Search industries
  const searchIndustries = useCallback(async (query: string) => {
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
        `/method/recruitment_app.search_industry.search_industry_type?search_term=${encodeURIComponent(query)}`
      );
      if (response.message?.status === 'Success') {
        const data: IndustryType[] = response.message.data || [];
        console.log(data);
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Industry search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      searchIndustries(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, searchIndustries]);

  // Update search query when selectedIndustry changes
  useEffect(() => {
    if (selectedIndustry) {
      setSearchQuery(selectedIndustry.industry);
    }
  }, [selectedIndustry]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleIndustrySelect = (industry: IndustryType) => {
    onIndustrySelect(industry);
    setSearchQuery(industry.industry);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && !isSearching) {
      setShowDropdown(true);
    } else if (searchQuery.trim()) {
      searchIndustries(searchQuery);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && !target.closest('.industry-search-container')) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // -------- Render --------
  return (
    <div className="industry-search-container relative">
      <div className="relative">
        <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search industries..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching industries...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="overflow-y-auto max-h-[calc(60vh-100px)]">
              {searchResults.map((industry, index) => (
                <div
                  key={industry.industry || index}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleIndustrySelect(industry)}
                >
                  <div className="flex items-center">
                    <Factory className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{industry.industry}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No industries found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Start typing to search industries...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndustrySearchSection;