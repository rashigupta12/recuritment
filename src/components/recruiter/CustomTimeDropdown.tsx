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
  const [inputValue, setInputValue] = useState(selectedTime || '');
  const [filteredSlots, setFilteredSlots] = useState(timeSlots);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(selectedTime || '');
  }, [selectedTime]);

  // Filter time slots based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSlots(timeSlots);
    } else {
      const filtered = timeSlots.filter((slot) =>
        slot.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSlots(filtered);
    }
  }, [inputValue, timeSlots]);

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

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectTime = (time: string) => {
    setInputValue(time);
    onSelectTime(time);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Auto-trigger onSelectTime for free-form input
    onSelectTime(value);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    onSelectTime('');
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-gray-700 font-semibold mb-2 text-md">
        From Time <span className="text-red-500">*</span>
      </label>

      {/* Custom Dropdown Input */}
      <div ref={dropdownRef} className="relative w-full">
        <div
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder="Select Time"
            className="flex-1 bg-transparent outline-none text-md text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {inputValue && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <button
              type="button"
              onClick={handleToggleDropdown}
              disabled={disabled}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              aria-label="Toggle dropdown"
            >
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Dropdown List */}
        {isOpen && timeSlots.length > 0 && (
          <div
            ref={listRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {filteredSlots.length > 0 ? (
              filteredSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleSelectTime(time)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors text-sm font-normal ${
                    inputValue === time
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'text-gray-700 hover:text-blue-900'
                  }`}
                >
                  {time}
                </button>
              ))
            ) : (
              <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                No matching time slots
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}