import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface CustomTimeDropdownProps {
  timeSlots: string[];
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
  disabled?: boolean;
}

export default function CustomTimeDropdown({
  timeSlots,
  selectedTime,
  onSelectTime,
  disabled = false,
}: CustomTimeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when an option is selected
  const handleSelectTime = (time: string) => {
    onSelectTime(time);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectTime('');
  };

  return (
    <div className="w-full">
      <label className="block text-gray-700 font-semibold mb-2 text-md">
        From Time <span className="text-red-500">*</span>
      </label>

      {/* Custom Dropdown Input */}
      <div
        ref={dropdownRef}
        className="relative w-full"
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-md"
        >
          <span className={selectedTime ? 'text-gray-900' : 'text-gray-500'}>
            {selectedTime || 'Select Time'}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedTime && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown List */}
        {isOpen && (
          <div
            ref={listRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {timeSlots.length > 0 ? (
              timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleSelectTime(time)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors text-sm font-normal ${
                    selectedTime === time
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'text-gray-700 hover:text-blue-900'
                  }`}
                >
                  {time}
                </button>
              ))
            ) : (
              <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                No available time slots
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}