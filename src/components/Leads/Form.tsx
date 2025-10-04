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
import { useRouter } from "next/navigation";
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

// Fee type enum
type FeeType = "percent" | "fixed";

const LeadForm: React.FC<LeadFormProps> = ({
  onClose,
  editLead,
  onUnsavedChanges,
}) => {
  const router = useRouter();
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
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [autoFetchOrganization, setAutoFetchOrganization] = useState<string | null>(null);
  const [feeType, setFeeType] = useState<FeeType>("percent");

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

  // Stage descriptions
  const stageDescriptions: Record<string, string> = {
    "Prospecting": "Identifying and researching potential clients.",
    "Lead Qualification": "Assessing if the lead meets criteria for pursuit.",
    "Needs Analysis / Discovery": "Understanding client needs and requirements.",
    "Presentation / Proposal": "Presenting solutions or proposals to the client.",
    "Contract": "Negotiating and finalizing contract terms.",
    "Onboarded": "Client is fully onboarded and services begin.",
    "Follow-Up / Relationship Management": "Maintaining client relationship post-onboarding."
  };

  const checkFormChanges = useCallback(() => {
    return (
      formData.contact !== null ||
      formData.company !== null ||
      formData.industry !== null ||
      formData.custom_average_salary > 0 ||
      formData.custom_fee > 0 ||
      (formData.custom_fixed_charges && formData.custom_fixed_charges > 0) ||
      formData.custom_expected_close_date !== "" ||
      formData.custom_stage !== "Prospecting" ||
      formData.custom_offerings !== "Lateral - All Levels" ||
      formData.custom_estimated_hiring_ > 0
    );
  }, [formData]);

  const calculateDealValue = useCallback(() => {
    const { custom_estimated_hiring_, custom_average_salary, custom_fee, custom_fixed_charges } = formData;
    if (feeType === "fixed") {
      if (!custom_estimated_hiring_ || custom_estimated_hiring_ === 0 || !custom_fixed_charges || custom_fixed_charges === 0) {
        return 0;
      }
      return custom_fixed_charges * custom_estimated_hiring_;
    } else {
      if (!custom_estimated_hiring_ || custom_estimated_hiring_ === 0 || !custom_average_salary || custom_average_salary === 0 || !custom_fee || custom_fee === 0) {
        return 0;
      }
      return (custom_fee * custom_estimated_hiring_ * custom_average_salary) / 100;
    }
  }, [formData.custom_estimated_hiring_, formData.custom_average_salary, formData.custom_fee, formData.custom_fixed_charges, feeType]);

  useEffect(() => {
    const dealValue = calculateDealValue();
    if (Math.round(dealValue) !== Math.round(formData.custom_deal_value)) {
      updateFormField("custom_deal_value", dealValue);
    }
  }, [calculateDealValue, formData.custom_deal_value, updateFormField]);

  useEffect(() => {
    if (isFormSubmitted) return;
    const hasChanges = checkFormChanges();
    setHasUnsavedChanges(hasChanges);
    onUnsavedChanges?.(hasChanges);
  }, [checkFormChanges, onUnsavedChanges, isFormSubmitted]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isFormSubmitted) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isFormSubmitted]);

  useEffect(() => {
    resetForm();
    setIsFormSubmitted(false);
    if (!editLead) {
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
      const defaultDate = nextMonth.toISOString().split("T")[0];
      updateFormField("custom_expected_close_date", defaultDate);
    }
    if (editLead) {
      if (
        editLead.custom_full_name ||
        editLead.custom_email_address ||
        editLead.custom_phone_number
      ) {
        const nameParts = (editLead.custom_full_name || editLead.lead_name || "").split(" ");
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

      if (editLead.industry) {
        setIndustry({
          name: editLead.industry,
          industry: editLead.industry,
        });
      }

      updateFormField("custom_stage", editLead.custom_stage || "Prospecting");
      updateFormField("custom_offerings", editLead.custom_offerings || "Lateral - All Levels");
      updateFormField("custom_estimated_hiring_", editLead.custom_estimated_hiring_ || 0);
      updateFormField("custom_average_salary", editLead.custom_average_salary || 0);
      updateFormField("custom_fee", editLead.custom_fee || 0);
      updateFormField("custom_fixed_charges", editLead.custom_fixed_charges || 0);
      updateFormField("custom_deal_value", editLead.custom_deal_value || 0);
      updateFormField("custom_expected_close_date", editLead.custom_expected_close_date || "");
      
      if (editLead.custom_fixed_charges && editLead.custom_fixed_charges > 0) {
        setFeeType("fixed");
      } else {
        setFeeType("percent");
      }
    }
  }, [resetForm, editLead, setContact, setCompany, setIndustry, updateFormField]);

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => {
      const sectionOrder: SectionKey[] = ["contact", "company", "industry", "details"];
      const newState = { ...prev };
      if (prev[section]) {
        newState[section] = false;
        return newState;
      }
      sectionOrder.forEach((key) => {
        newState[key] = false;
      });
      newState[section] = true;
      return newState;
    });
  };

  const handleStageChange = (newStage: string) => {
    console.log("Stage changed to:", newStage); // Debug log
    updateFormField("custom_stage", newStage);
  };

  const handleConfirmSubmit = async () => {
    console.log("Submitting lead with stage:", formData.custom_stage); // Debug log
    try {
      setIsSubmitting(true);
      const payload = buildLeadPayload();
      let response;
      const isOnboardedStage = formData.custom_stage === "Onboarded";

      if (editLead && editLead.name) {
        console.log("Updating lead:", editLead.name);
        response = await frappeAPI.updateLead(editLead.name, payload);
      } else {
        console.log("Creating new lead");
        response = await frappeAPI.createLead(payload);
      }

      setIsFormSubmitted(true);
      setHasUnsavedChanges(false);
      onUnsavedChanges?.(false);
      resetForm();

      if (isOnboardedStage) {
        console.log("Navigating to contract page");
        router.push("/dashboard/sales-manager/contract");
      } else {
        console.log("Closing form");
        onClose();
      }

      console.log("Lead created/updated successfully:", response);
    } catch (error) {
      console.error(`Error ${editLead ? "updating" : "creating"} lead:`, error);
      alert(`Failed to ${editLead ? "update" : "create"} lead. Please try again.`);
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirmation(false);
    }
  };

  const handleCancelSubmit = () => {
    console.log("Submit confirmation cancelled"); // Debug log
    setShowSubmitConfirmation(false);
  };

  const handleSubmit = () => {
    console.log("Submit button clicked, stage:", formData.custom_stage); // Debug log
    if (formData.custom_stage === "Onboarded") {
      console.log("Showing submit confirmation dialog"); // Debug log
      setShowSubmitConfirmation(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const handleFeeTypeChange = (newFeeType: FeeType) => {
    setFeeType(newFeeType);
    if (newFeeType === "fixed") {
      updateFormField("custom_fee", 0);
    } else {
      updateFormField("custom_fixed_charges", 0);
    }
  };

  const handleCloseWithConfirmation = (action: () => void) => {
    if (hasUnsavedChanges && !isFormSubmitted) {
      setPendingAction(() => action);
      setShowLeaveConfirmation(true);
    } else {
      action();
    }
  };

  const handleBackClick = () => {
    if (isFormSubmitted) {
      onClose();
    } else {
      handleCloseWithConfirmation(onClose);
    }
  };

  const handleCancel = () => {
    if (isFormSubmitted) {
      onClose();
    } else {
      handleCloseWithConfirmation(onClose);
    }
  };

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
    <div className="w-full mx-auto bg-white">
      <ConfirmationDialog
        isOpen={showLeaveConfirmation}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      />

      <SuccessDialog
        isOpen={showSubmitConfirmation}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        message="Once you move to 'Onboarded' stage, you won't be able to make changes anymore. Are you sure you want to proceed?"
      />

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

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <div className="space-y-3">
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
                autoFetchOrganization={autoFetchOrganization}
                onAutoFetchComplete={() => setAutoFetchOrganization(null)}
              />
            </AccordionSection>

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

        <div className="col-span-12 lg:col-span-6">
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">Deal / Sales Details</h3>
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
                          {`${stg}: ${stageDescriptions[stg]}`}
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
                      onChange={(e) => updateFormField("custom_offerings", e.target.value)}
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

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-gray-900">Hiring & Financial Details</h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Annual Hires
                    </label>
                    <input
                      type="number"
                      value={formData.custom_estimated_hiring_ === 0 ? "" : formData.custom_estimated_hiring_}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateFormField("custom_estimated_hiring_", value === "" ? 0 : parseInt(value, 10));
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
                      value={formData.custom_average_salary === 0 ? "" : formData.custom_average_salary.toLocaleString("en-IN")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        updateFormField("custom_average_salary", value === "" ? 0 : parseFloat(value));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 8,00,000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Fee Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feeType"
                        value="percent"
                        checked={feeType === "percent"}
                        onChange={(e) => handleFeeTypeChange(e.target.value as FeeType)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Fee Percent (%)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feeType"
                        value="fixed"
                        checked={feeType === "fixed"}
                        onChange={(e) => handleFeeTypeChange(e.target.value as FeeType)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Fixed Fee (INR)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {feeType === "percent" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fee (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.custom_fee === 0 ? "" : formData.custom_fee}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateFormField("custom_fee", value === "" ? 0 : parseFloat(value));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 15.5"
                        min="0"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fixed Fee (INR)
                      </label>
                      <input
                        type="text"
                        value={
                          !formData.custom_fixed_charges || formData.custom_fixed_charges === 0 
                            ? "" 
                            : formData.custom_fixed_charges.toLocaleString("en-IN")
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, "");
                          updateFormField("custom_fixed_charges", value === "" ? 0 : parseFloat(value));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 50,000"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={formData.custom_expected_close_date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => updateFormField("custom_expected_close_date", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Value (INR)
                  </label>
                  <input
                    type="text"
                    value={formData.custom_deal_value === 0 ? "" : Math.round(formData.custom_deal_value).toLocaleString("en-IN")}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Auto-calculated"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {feeType === "fixed" 
                      ? "(Fixed Fee × Estimated Hiring)"
                      : "(Fee % × Estimated Hiring × Avg Salary) ÷ 100"
                    }
                  </p>
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