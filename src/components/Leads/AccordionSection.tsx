"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

type AccordionSectionProps = {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  completed?: boolean;
  compact?: boolean;
};

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  completed = false,
  compact = false,
}) => {
  return (
    <div className="border border-gray-200 rounded-md">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors ${
          compact ? 'px-4 py-3' : 'px-5 py-4'
        } ${
          completed ? "bg-primary/5 border-primary/20" : ""
        }`}
      >
        <div className={`flex items-center ${compact ? 'space-x-3' : 'space-x-4'}`}>
          <div
            className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center ${
              completed ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} />
          </div>
          <span
            className={`${compact ? 'text-sm' : 'text-md'} font-medium ${
              completed ? "text-primary" : "text-gray-900"
            }`}
          >
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className={`${compact ? 'h-5 w-5' : 'h-7 w-7'} text-gray-400`} />
        ) : (
          <ChevronDown className={`${compact ? 'h-5 w-5' : 'h-7 w-7'} text-gray-400`} />
        )}
      </button>
      {isOpen && (
        <div className={`bg-white ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;