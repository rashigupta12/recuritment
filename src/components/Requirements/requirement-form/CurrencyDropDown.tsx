import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

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
        const combinedCurrencies = [...commonCurrencies];
        setCurrencies(combinedCurrencies);
      } catch (error) {
        console.error('Error fetching currencies:', error);
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

  const handleCurrencySelect = (currencyCode: string) => {
    onChange(currencyCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-20 px-3 py-2 text-sm bg-white flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium">{value || 'INR'}</span>
          <ChevronDown className={`h-3 w-3 text-gray-400 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Portal - Fixed positioning */}
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
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {currency.name}
                        </div>
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CurrencyDropdown;