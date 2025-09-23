'use client'
import {
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import React from 'react';

// Accordion Section Component
type AccordionSectionProps = {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  completed?: boolean;
};

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children, completed = false }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-visible"> {/* Changed overflow-hidden to overflow-visible */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors ${
          completed ? 'bg-primary/5 border-primary/20' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className={`font-medium ${completed ? 'text-primary' : 'text-gray-900'}`}>
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white relative z-10"> {/* Added relative and z-10 */}
          {children}
        </div>
      )}
    </div>
  );
};
export default AccordionSection;