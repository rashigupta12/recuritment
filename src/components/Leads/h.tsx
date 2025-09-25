/*eslint-disable @typescript-eslint/no-explicit-any */
//new components
"use client";
import {
  ArrowLeft,
  Briefcase,
  IndianRupee,
  Loader2,
  User
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import ConfirmationDialog from "../comman/ConfirmationDialog";
// import ConfirmationDialog from "./comman/ConfirmationDialog";

// Type definitions
type SimplifiedContact = {
  name: string;
  email: string;
  phone: string;
  contactId?: string;
  designation?: string;
  gender?: string;
  organization?: string;
  first_name?: string;
  last_name?: string;
};

type SimplifiedCompany = {
  name: string;
  company_name: string;
  email: string;
  website: string;
  country: string;
  companyId?: string;
};

type IndustryType = {
  industry: string;
};

type LeadFormProps = {
  onClose: () => void;
  editLead?: any | null;
};

const LeadForm: React.FC<LeadFormProps> = ({ onClose, editLead }) => {
  const [formData, setFormData] = useState({
    // Client Information
    contact: null as SimplifiedContact | null,
    company: null as SimplifiedCompany | null,
    industry: null as IndustryType | null,

    // Deal/Sales Details
    stage: "Prospect",
    offering: "RPO",
    owner: "",

    // Hiring Metrics
    expectedHiringVolume: 0,
    avgSalary: 0,
    fee: 0,

    // Financials & Location
    budget: 0,
    expectedClose: "",
    city: "",
    state: "",
    country: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Check if form has changes - useCallback to prevent unnecessary re-renders
  const checkFormChanges = useCallback(() => {
    return formData.contact !== null || 
           formData.company !== null || 
           formData.industry !== null ||
           formData.expectedHiringVolume > 0 ||
           formData.avgSalary > 0 ||
           formData.fee > 0 ||
           formData.budget > 0 ||
           formData.expectedClose !== "" ||
           formData.city !== "" ||
           formData.state !== "" ||
           formData.country !== "";
  }, [formData]);

  // Update hasUnsavedChanges whenever formData changes
  useEffect(() => {
    setHasUnsavedChanges(checkFormChanges());
  }, [checkFormChanges]);

  // Set up event listeners for page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form submitted:", formData);
      setHasUnsavedChanges(false); // Reset unsaved changes flag
      alert(`Lead ${editLead ? "updated" : "created"} successfully!`);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced handlers with confirmation
  const handleCloseWithConfirmation = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowConfirmation(true);
    } else {
      action();
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    handleCloseWithConfirmation(onClose);
  };

  // Handle cancel button click
  const handleCancel = () => {
    handleCloseWithConfirmation(onClose);
  };

  // Confirmation dialog handlers
  const handleConfirmLeave = () => {
    setShowConfirmation(false);
    setHasUnsavedChanges(false);
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleCancelLeave = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  const stages = [
    "Prospect",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
  ];
  const offerings = [
    "RPO",
    "MSP",
    "Staffing",
    "Executive Search",
    "Consulting",
  ];

  const canSubmit = formData.contact && formData.company && formData.industry;

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* Confirmation Dialog - Make sure this is rendered */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      />
      
      <div className="pb-2">
        <div className="flex items-center justify-between">
          {/* Title + Back button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full border border-primary">
                <ArrowLeft className="h-4 w-4" />
              </span>
            </button>

            <h2 className="text-xl font-semibold text-gray-900">
              {editLead ? "Edit Lead" : "Create New Lead"}
            </h2>
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Unsaved Changes
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {isSubmitting
                  ? `${editLead ? "Updating" : "Creating"}...`
                  : `${editLead ? "Update" : "Create"} Lead`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Rest of your form content remains the same */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Client Information */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-gray-50 rounded-lg p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-gray-900">Client Information</h3>
            </div>

            <div className="space-y-4">
              {/* Contact Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Contact
                </label>
                {formData.contact ? (
                  <div className="p-3 rounded-md border border-primary bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formData.contact.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.contact.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.contact.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => updateFormField("contact", null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSection("contact")}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Select Contact
                  </button>
                )}
              </div>

              {/* Company Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization
                </label>
                {formData.company ? (
                  <div className="p-3 rounded-md border border-primary bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formData.company.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.company.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.company.website}
                        </p>
                      </div>
                      <button
                        onClick={() => updateFormField("company", null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSection("company")}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Select Organization
                  </button>
                )}
              </div>

              {/* Industry Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                {formData.industry ? (
                  <div className="p-3 rounded-md border border-primary bg-blue-50">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900">
                        {formData.industry.industry}
                      </p>
                      <button
                        onClick={() => updateFormField("industry", null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSection("industry")}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Select Industry
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Deal & Financial Information */}
        <div className="col-span-12 lg:col-span-6">
          <div className="space-y-4">
            {/* Deal/Sales Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">
                  Deal / Sales Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => updateFormField("stage", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offering
                  </label>
                  <select
                    value={formData.offering}
                    onChange={(e) =>
                      updateFormField("offering", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {offerings.map((offering) => (
                      <option key={offering} value={offering}>
                        {offering}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Hiring Metrics */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-gray-900">Hiring Metrics</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Hires
                  </label>
                  <input
                    type="number"
                    value={formData.expectedHiringVolume || ""}
                    onChange={(e) =>
                      updateFormField(
                        "expectedHiringVolume",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Salary (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.avgSalary || ""}
                    onChange={(e) =>
                      updateFormField(
                        "avgSalary",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 800000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.fee || ""}
                    onChange={(e) =>
                      updateFormField("fee", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 15.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Value (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.budget || ""}
                    onChange={(e) =>
                      updateFormField("budget", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g., 5000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Close
                  </label>
                  <input
                    type="date"
                    value={formData.expectedClose}
                    onChange={(e) =>
                      updateFormField("expectedClose", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock selection modals would go here */}
      {activeSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Select {activeSection}</h3>
            <p className="text-gray-600 mb-4">
              Selection interface would go here
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveSection(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Mock selection
                  if (activeSection === "contact") {
                    updateFormField("contact", {
                      name: "John Doe",
                      email: "john@example.com",
                      phone: "+91 9876543210",
                    });
                  } else if (activeSection === "company") {
                    updateFormField("company", {
                      name: "Tech Corp",
                      email: "info@techcorp.com",
                      website: "www.techcorp.com",
                    });
                  } else if (activeSection === "industry") {
                    updateFormField("industry", { industry: "Technology" });
                  }
                  setActiveSection(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadForm;