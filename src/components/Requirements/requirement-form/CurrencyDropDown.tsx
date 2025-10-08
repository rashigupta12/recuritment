'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { frappeAPI } from "@/lib/api/frappeClient";

interface Currency {
  name: string;
  symbol?: string;
}

interface CurrencyDropdownProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Common currencies with symbols for better display
  const commonCurrencies = [
    { name: 'INR', symbol: '₹' },
    { name: 'USD', symbol: '$' },
    { name: 'EUR', symbol: '€' },
    { name: 'GBP', symbol: '£' },
    { name: 'JPY', symbol: '¥' },
    { name: 'CAD', symbol: 'C$' },
    { name: 'AUD', symbol: 'A$' },
    { name: 'CHF', symbol: 'CHF' },
    { name: 'CNY', symbol: '¥' },
    { name: 'SGD', symbol: 'S$' }
  ];

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 4,
        left: rect.left + scrollX,
        width: Math.max(200, rect.width)
      });
    }
  };

  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true);
      try {
        // const response = await frappeAPI.makeAuthenticatedRequest(
        //   "GET",
        //   "/resource/Currency?fields=[\"name\"]&limit_page_length=0&order_by=name"
        // );

        const combinedCurrencies = [
            ...commonCurrencies,
            // ...fetchedCurrencies.filter((curr: Currency) => !commonCurrencyNames.has(curr.name))
          ];

          setCurrencies(combinedCurrencies);
        
        // if (response.data) {
          // Combine common currencies with fetched currencies, removing duplicates
          const commonCurrencyNames = new Set(commonCurrencies.map(c => c.name));
          // const fetchedCurrencies = response.data.map((curr: Currency) => ({
          //   name: curr.name,
          //   symbol: commonCurrencies.find(c => c.name === curr.name)?.symbol
          // }));
          
          
          
          
        // }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        // Fallback to common currencies if API fails
        setCurrencies(commonCurrencies);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && currencies.length === 0) {
      fetchCurrencies();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      calculateDropdownPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const getCurrencyDisplay = (currencyCode: string) => {
  //   const currency = currencies.find(c => c.name === currencyCode);
  //   if (currency) {
  //     return currency.symbol ? `${currency.name} (${currency.symbol})` : currency.name;
  //   }
  //   return currencyCode;
  // };

  const handleCurrencySelect = (currencyCode: string) => {
    onChange(currencyCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  // const getSymbolForCurrency = (currencyCode: string) => {
  //   const currency = currencies.find(c => c.name === currencyCode);
  //   return currency?.symbol || currencyCode;
  // };

  return (
    <>
      <div className="relative w-full ">
     <button
  ref={triggerRef}
  type="button"
  onClick={() => !disabled && setIsOpen(!isOpen)}
  disabled={disabled}
  className="px-2 py-1 text-md border border-gray-300 rounded  bg-gray-100 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed w-14"
>
  <span className="flex">
    <span className='text-md'>{value || 'Select Currency'}</span>
  </span>
  <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
</button>

      </div>

      {/* Dropdown Portal - Fixed positioning like MultiUserAssignment */}
      {isOpen && (
        <div 
          ref={dropdownRef} 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
          style={{ 
            top: `${dropdownPosition.top}px`, 
            left: `${dropdownPosition.left}px`, 
            width: `${dropdownPosition.width}px`,
            zIndex: 9999,
            maxHeight: '300px'
          }}
        >
          {/* Search Header */}
          {/* <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div> */}

          {/* Currency List */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-xs text-gray-500">Loading currencies...</p>
              </div>
            ) : filteredCurrencies.length > 0 ? (
              <div className="py-1">
                {filteredCurrencies.map((currency) => (
                  <button
                    key={currency.name}
                    onClick={() => handleCurrencySelect(currency.name)}
                    className={`w-full p-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${
                      value === currency.name ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {/* {currency.symbol && (
                        <span className="font-medium text-gray-700 w-6 text-center">
                          {currency.symbol}
                        </span>
                      )} */}
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {currency.name}
                        </div>
                        {/* {currency.symbol && currency.name !== currency.symbol && (
                          <div className="text-xs text-gray-500">
                            {currency.symbol}
                          </div>
                        )} */}
                      </div>
                    </div>
                    {value === currency.name && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No currencies found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchTerm ? `for "${searchTerm}"` : 'Try searching for a currency'}
                </p>
              </div>
            )}
          </div>

          {/* Footer with common currencies quick access */}
          {/* {!searchTerm && (
            <div className="border-t p-2">
              <div className="text-xs text-gray-500 mb-1">Common Currencies</div>
              <div className="flex flex-wrap gap-1">
                {commonCurrencies.slice(0, 6).map((currency) => (
                  <button
                    key={currency.name}
                    onClick={() => handleCurrencySelect(currency.name)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
                  >
                    {currency.name}
                  </button>
                ))}
              </div>
            </div>
          )} */}
        </div>
      )}
    </>
  );
};

export default CurrencyDropdown;