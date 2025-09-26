"use client";
import CompanySearchSection from "@/components/comman/CompanySearch";
import ContactSearchSection from "@/components/comman/ContactSearch";
import IndustrySearchSection from "@/components/comman/IndustrySearchSection";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Factory,
  IndianRupee,
  Loader2,
  User
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import ConfirmationDialog from "../comman/ConfirmationDialog";
import SuccessDialog from "../comman/SuccessDialog";
import AccordionSection from "./AccordionSection";

// Import the types from the search components to ensure consistency
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

// Lead Form Component
type LeadFormProps = {
  onClose: () => void;
  editLead?: Lead | null;
  onUnsavedChanges?: (hasChanges: boolean) => void;
};

type SectionKey = "contact" | "company" | "industry" | "details";

const LeadForm: React.FC<LeadFormProps> = ({
  onClose,
  editLead,
  onUnsavedChanges,
}) => {
  const {
    formData,
    setContact,
    setCompany,
    setIndustry,
    updateFormField,
    resetForm,
    buildLeadPayload,
  } = useLeadStore();

  const [openSections, setOpenSections] = useState<{
    contact: boolean;
    company: boolean;
    industry: boolean;
    details: boolean;
  }>({ contact: true, company: false, industry: false, details: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showContractConfirmation, setShowContractConfirmation] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pendingStageChange, setPendingStageChange] = useState<string | null>(
    null
  );
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [autoFetchOrganization, setAutoFetchOrganization] = useState<string | null>(null);

  // Updated offerings and stages
  const offerings = [
    "Lateral - All Levels",
    "Lateral - Executive",
    "Lateral - Upto Sr Level",
    "RPO",
    "MSP",
    "Contingent",
    "Contract",
  ];

  const stages = [
    "Prospecting",
    "Lead Qualification",
    "Needs Analysis / Discovery",
    "Presentation / Proposal",
    "Contract",
    "Onboarded",
    "Follow-Up / Relationship Management",
  ];

  // Check if form has changes
  const checkFormChanges = useCallback(() => {
    return (
      formData.contact !== null ||
      formData.company !== null ||
      formData.industry !== null ||
      formData.custom_average_salary > 0 ||
      formData.custom_fee > 0 ||
      formData.custom_expected_close_date !== "" ||
      formData.custom_stage !== "Prospecting" ||
      formData.custom_offerings !== "Lateral - All Levels" ||
      formData.custom_estimated_hiring_ > 0
    );
  }, [formData]);

  // Update hasUnsavedChanges whenever form data changes
  useEffect(() => {
    // Don't track changes if form has been submitted successfully
    if (isFormSubmitted) return;

    const hasChanges = checkFormChanges();
    setHasUnsavedChanges(hasChanges);
    // Notify parent component about unsaved changes
    onUnsavedChanges?.(hasChanges);
  }, [checkFormChanges, onUnsavedChanges, isFormSubmitted]);

  // Set up event listeners for page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isFormSubmitted) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isFormSubmitted]);

  // Reset form data when component mounts or editLead changes
  useEffect(() => {
    resetForm();
    setIsFormSubmitted(false); // Reset the submitted flag when form reloads

    // If editing, populate form with existing data
    if (editLead) {
      // Populate contact information
      if (
        editLead.custom_full_name ||
        editLead.custom_email_address ||
        editLead.custom_phone_number
      ) {
        const nameParts = (
          editLead.custom_full_name ||
          editLead.lead_name ||
          ""
        ).split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setContact({
          name: editLead.custom_full_name || editLead.lead_name || "",
          email: editLead.custom_email_address || "",
          phone: editLead.custom_phone_number || "",
          first_name: firstName,
          last_name: lastName,
          designation: "",
          gender: "",
          organization: editLead.company_name || "",
          contactId: undefined,
        });
      }

      // Populate company information
      if (editLead.company_name) {
        setCompany({
          name: editLead.company_name,
          company_name: editLead.company_name,
          email: editLead.email_id || "",
          website: editLead.website || "",
          country: editLead.country || "",
          companyId: undefined,
        });
      }

      // Populate industry information
      if (editLead.industry) {
        setIndustry({
          name: editLead.industry,
          industry: editLead.industry,
        });
      }
      // Set new fields using the store
      updateFormField("custom_stage", editLead.custom_stage || "Prospecting");
      updateFormField(
        "custom_offerings",
        editLead.custom_offerings || "Lateral - All Levels"
      );
      updateFormField(
        "custom_estimated_hiring_",
        editLead.custom_estimated_hiring_ || 0
      );
      updateFormField(
        "custom_average_salary",
        editLead.custom_average_salary || 0
      );
      updateFormField("custom_fee", editLead.custom_fee || 0);
      updateFormField("custom_deal_value", editLead.custom_deal_value || 0);
      updateFormField(
        "custom_expected_close_date",
        editLead.custom_expected_close_date || ""
      );
    }
  }, [
    resetForm,
    editLead,
    setContact,
    setCompany,
    setIndustry,
    updateFormField,
  ]);

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => {
      const sectionOrder: SectionKey[] = [
        "contact",
        "company",
        "industry",
        "details",
      ];
      const newState = { ...prev };

      if (prev[section]) {
        newState[section] = false;
        return newState;
      }

      // Close all sections first
      sectionOrder.forEach((key) => {
        newState[key] = false;
      });

      // Open the clicked section
      newState[section] = true;

      return newState;
    });
  };

  // Handle stage change with contract confirmation
  const handleStageChange = (newStage: string) => {
    if (newStage === "Onboarded" && formData.custom_stage !== "onboarded") {
      setPendingStageChange(newStage);
      setShowContractConfirmation(true);
    } else {
      updateFormField("custom_stage", newStage);
    }
  };

  // Handle contract confirmation
  const handleConfirmContract = () => {
    if (pendingStageChange) {
      updateFormField("custom_stage", pendingStageChange);
      setPendingStageChange(null);
    }
    setShowContractConfirmation(false);
  };

  const handleCancelContract = () => {
    setPendingStageChange(null);
    setShowContractConfirmation(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const payload = buildLeadPayload();

      let response;

      if (editLead && editLead.name) {
        // Update existing lead
        console.log("Updating lead:", editLead.name);
        response = await frappeAPI.updateLead(editLead.name, payload);
      } else {
        // Create new lead
        response = await frappeAPI.createLead(payload);
      }

      // Mark form as successfully submitted to prevent change tracking
      setIsFormSubmitted(true);

      // Clear unsaved changes state and notify parent
      setHasUnsavedChanges(false);
      onUnsavedChanges?.(false);

      // Reset form and close WITHOUT confirmation
      resetForm();

      // Call onClose directly without going through confirmation
      onClose();

      console.log("Lead created/updated successfully:", response);
    } catch (error) {
      console.error(`Error ${editLead ? "updating" : "creating"} lead:`, error);
      alert(
        `Failed to ${editLead ? "update" : "create"} lead. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced handlers with confirmation
  const handleCloseWithConfirmation = (action: () => void) => {
    if (hasUnsavedChanges && !isFormSubmitted) {
      setPendingAction(() => action);
      setShowLeaveConfirmation(true);
    } else {
      action();
    }
  };

  const handleBackClick = () => {
    // If form was successfully submitted, close without confirmation
    if (isFormSubmitted) {
      onClose();
    } else {
      handleCloseWithConfirmation(onClose);
    }
  };

  const handleCancel = () => {
    // If form was successfully submitted, close without confirmation
    if (isFormSubmitted) {
      onClose();
    } else {
      handleCloseWithConfirmation(onClose);
    }
  };

  // Confirmation dialog handlers
  const handleConfirmLeave = () => {
    setShowLeaveConfirmation(false);
    setHasUnsavedChanges(false);
    onUnsavedChanges?.(false);
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirmation(false);
    setPendingAction(null);
  };

  const canSubmit = formData.contact && formData.company && formData.industry;

  // Handler functions to convert between store types and component types
  const handleContactSelect = (contact: SimplifiedContact) => {
    const storeContact = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      contactId: contact.contactId,
      designation: contact.designation,
      gender: contact.gender,
      organization: contact.organization,
      first_name: contact.first_name,
      last_name: contact.last_name,
    };
    setContact(storeContact);
     if (contact.organization && contact.organization.trim()) {
    setAutoFetchOrganization(contact.organization.trim());
  }
  };

  const handleCompanySelect = (company: SimplifiedCompany) => {
    const storeCompany = {
      name: company.name,
      company_name: company.company_name,
      email: company.email,
      website: company.website,
      country: company.country,
      companyId: company.companyId,
    };
    setCompany(storeCompany);
  };

  const handleIndustrySelect = (industry: IndustryType) => {
    const storeIndustry = {
      name: industry.industry,
      industry: industry.industry,
    };
    setIndustry(storeIndustry);
  };

  // Convert store types to component types for display
  const getSelectedContact = (): SimplifiedContact | null => {
    if (!formData.contact) return null;
    return {
      name: formData.contact.name || "",
      email: formData.contact.email || "",
      phone: formData.contact.phone || "",
      contactId: formData.contact.contactId,
      designation: formData.contact.designation,
      gender: formData.contact.gender,
      organization: formData.contact.organization,
      first_name: formData.contact.first_name,
      last_name: formData.contact.last_name,
    };
  };

const getSelectedCompany = (): SimplifiedCompany | null => {
  if (!formData.company) return null;
  
  // Ensure all required fields are properly mapped
  return {
    name: formData.company.name || "",
    company_name: formData.company.company_name || formData.company.name || "",
    email: formData.company.email || "",
    website: formData.company.website || "",
    country: formData.company.country || "",
    companyId: formData.company.companyId,

  };
};

  const getSelectedIndustry = (): IndustryType | null => {
    if (!formData.industry) return null;
    return {
      industry: formData.industry.industry || formData.industry.name || "",
    };
  };

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* Leave Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLeaveConfirmation}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      />

      {/* Contract Stage Confirmation Dialog */}
      <SuccessDialog
        isOpen={showContractConfirmation}
        onConfirm={handleConfirmContract}
        onCancel={handleCancelContract}
        message="Once you move to 'Onboarded' stage, you won't be able to make changes anymore. Are you sure you want to proceed?"
      />

      {/* Header */}
      <div className="pb-4">
        <div className="flex items-center justify-between">
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
            {hasUnsavedChanges && !isFormSubmitted && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Unsaved Changes
              </span>
            )}
            {isFormSubmitted && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Submitted Successfully
              </span>
            )}
          </div>

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
              className="px-6 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

      {/* Form Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Client Information */}
        <div className="col-span-12 lg:col-span-6">
          <div className="space-y-3">
            {/* Contact Section */}
            <AccordionSection
              title="Contact Information"
              icon={User}
              isOpen={openSections.contact}
              onToggle={() => toggleSection("contact")}
              completed={!!formData.contact}
              compact={true}
            >
              <ContactSearchSection
                selectedContact={getSelectedContact()}
                onContactSelect={handleContactSelect}
                onEdit={() => {
                  /* Open contact edit modal */
                }}
                onRemove={() => setContact(null)}
              />
            </AccordionSection>

            {/* Company Section */}
            <AccordionSection
              title="Organization Information"
              icon={Building2}
              isOpen={openSections.company}
              onToggle={() => toggleSection("company")}
              completed={!!formData.company}
              compact={true}
            >
              <CompanySearchSection
  selectedCompany={getSelectedCompany()}
  onCompanySelect={handleCompanySelect}
  onEdit={() => { /* Open company edit modal */ }}
  onRemove={() => setCompany(null)}
  // NEW: Pass auto-fetch organization
  autoFetchOrganization={autoFetchOrganization}
  onAutoFetchComplete={() => setAutoFetchOrganization(null)} // Reset after completion
/>
            </AccordionSection>

            {/* Industry Section */}
            <AccordionSection
              title="Industry Selection"
              icon={Factory}
              isOpen={openSections.industry}
              onToggle={() => toggleSection("industry")}
              completed={!!formData.industry}
              compact={true}
            >
              <IndustrySearchSection
                selectedIndustry={getSelectedIndustry()}
                onIndustrySelect={handleIndustrySelect}
              />
            </AccordionSection>
          </div>
        </div>

        {/* Right Column - Deal & Financial Information */}
        <div className="col-span-12 lg:col-span-6">
          <div className="space-y-3">
            {/* Deal/Sales Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">
                  Deal / Sales Details
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage
                    </label>
                    <select
                      value={formData.custom_stage}
                      onChange={(e) => handleStageChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {stages.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offering
                    </label>
                    <select
                      value={formData.custom_offerings}
                      onChange={(e) =>
                        updateFormField("custom_offerings", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {offerings.map((offer) => (
                        <option key={offer} value={offer}>
                          {offer}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiring Metrics */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-gray-900">
                  Hiring & Financial Details
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hiring
                    </label>
                    <input
                      type="number"
                      value={
                        formData.custom_estimated_hiring_ === 0
                          ? ""
                          : formData.custom_estimated_hiring_
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        updateFormField(
                          "custom_estimated_hiring_",
                          value === "" ? 0 : parseInt(value, 10)
                        );
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 50"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avg Salary (INR)
                    </label>
                    <input
                      type="text"
                      value={
                        formData.custom_average_salary === 0
                          ? ""
                          : formData.custom_average_salary.toLocaleString(
                              "en-IN"
                            )
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, ""); // Remove commas
                        updateFormField(
                          "custom_average_salary",
                          value === "" ? 0 : parseFloat(value)
                        );
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 8,00,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={
                        formData.custom_fee === 0 ? "" : formData.custom_fee
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        updateFormField(
                          "custom_fee",
                          value === "" ? 0 : parseFloat(value)
                        );
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 15.5"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Value (INR)
                    </label>
                    <input
                      type="text"
                      value={
                        formData.custom_deal_value === 0
                          ? ""
                          : Math.round(
                              formData.custom_deal_value
                            ).toLocaleString("en-IN")
                      }
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      placeholder="Auto-calculated"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      (Fee (%) × Estimated Hiring × Avg Salary) ÷ 100
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={formData.custom_expected_close_date}
                      onChange={(e) =>
                        updateFormField(
                          "custom_expected_close_date",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
