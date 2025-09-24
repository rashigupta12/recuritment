"use client";
import CompanySearchSection from "@/components/comman/CompanySearch";
import ContactSearchSection from "@/components/comman/ContactSearch";
import IndustrySearchSection from "@/components/comman/IndustrySearchSection";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Lead, useLeadStore } from "@/stores/leadStore";
import {
  Building2,
  Factory,
  IndianRupee,
  Loader2,
  MapPin,
  User,
  Users,
} from "lucide-react";
import React, { useState, useEffect } from "react";
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
};

type SectionKey = "contact" | "company" | "industry" | "details";

const LeadForm: React.FC<LeadFormProps> = ({ onClose, editLead }) => {
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

  // Reset form data when component mounts or editLead changes
  useEffect(() => {
    resetForm();
    
    // If editing, populate form with existing data
    if (editLead) {
      // Populate contact information
      if (editLead.custom_full_name || editLead.custom_email_address || editLead.custom_phone_number) {
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

      // Populate form fields
      updateFormField("expectedHiringVolume", editLead.custom_expected_hiring_volume || 0);
      updateFormField("budget", editLead.custom_budgetinr || 0);
      updateFormField("city", editLead.city || "");
      updateFormField("state", editLead.state || "");
      updateFormField("country", editLead.country || "");
    }
  }, [resetForm, editLead, setContact, setCompany, setIndustry, updateFormField]);

  // Track changes to form
  useEffect(() => {
    setHasUnsavedChanges(
      !!formData.contact || 
      !!formData.company || 
      !!formData.industry || 
      formData.expectedHiringVolume > 0 ||
      formData.budget > 0 ||
      !!formData.city ||
      !!formData.state ||
      !!formData.country
    );
  }, [formData]);

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => {
      // Close all previous sections when opening a new one
      const sectionOrder: SectionKey[] = ["contact", "company", "industry", "details"];
      const currentIndex = sectionOrder.indexOf(section);
      
      const newState = { ...prev };
      
      // If clicking on already open section, just toggle it
      if (prev[section]) {
        newState[section] = false;
        return newState;
      }
      
      // Close all sections first
      sectionOrder.forEach(key => {
        newState[key] = false;
      });
      
      // Open the clicked section
      newState[section] = true;
      
      return newState;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (editLead) {
        // Update existing lead logic would go here
        // For now, we'll treat it as create
        console.log("Updating lead:", editLead.name);
      }
      
      const payload = buildLeadPayload();
      const response = await frappeAPI.createLead(payload);

      // Reset form and close
      resetForm();
      setHasUnsavedChanges(false);
      onClose();

      console.log("Lead created/updated successfully:", response);

      // Show success message
      alert(`Lead ${editLead ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error(`Error ${editLead ? 'updating' : 'creating'} lead:`, error);
      alert(`Failed to ${editLead ? 'update' : 'create'} lead. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.contact && formData.company && formData.industry;

  // Handler functions to convert between store types and component types
  const handleContactSelect = (contact: SimplifiedContact) => {
    // Convert SimplifiedContact to your store's contact type
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
  };

  const handleCompanySelect = (company: SimplifiedCompany) => {
    // Convert SimplifiedCompany to your store's company type
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
    // Convert IndustryType to your store's industry type
    const storeIndustry = {
      name: industry.industry, // Map 'industry' field to 'name' field
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
    return {
      name: formData.company.name || "",
      company_name:
        formData.company.company_name || formData.company.name || "",
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

  const handleCancel = () => {
    resetForm();
    setHasUnsavedChanges(false);
    onClose();
  };

  return (
    <div className="space-y-3">
      {/* Grid Layout for Accordions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Column 1 */}
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
              onEdit={() => {
                /* Open company edit modal */
              }}
              onRemove={() => setCompany(null)}
            />
          </AccordionSection>
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
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

          {/* Lead Details Section */}
          <AccordionSection
            title="Lead Details"
            icon={Users}
            isOpen={openSections.details}
            onToggle={() => toggleSection("details")}
            completed={
              formData.expectedHiringVolume > 0 &&
              !!formData.city &&
              formData.budget > 0
            }
            compact={true}
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected Hiring Volume
                  </label>
                  <div className="relative">
                    <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="number"
                      value={
                        formData.expectedHiringVolume === 0
                          ? ""
                          : formData.expectedHiringVolume
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        updateFormField(
                          "expectedHiringVolume",
                          value === "" ? 0 : parseInt(value, 10)
                        );
                      }}
                      className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="e.g., 10"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected Revenue (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget === 0 ? "" : formData.budget}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateFormField(
                          "budget",
                          value === "" ? 0 : parseInt(value, 10)
                        );
                      }}
                      className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="e.g., 500000"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => {
                        const value = e.target.value;
                        const capitalized =
                          value.charAt(0).toUpperCase() + value.slice(1);
                        updateFormField("city", capitalized);
                      }}
                      className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => {
                      const value = e.target.value;
                      const capitalized =
                        value.charAt(0).toUpperCase() + value.slice(1);
                      updateFormField("state", capitalized);
                    }}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => {
                    const value = e.target.value;
                    const capitalized =
                      value.charAt(0).toUpperCase() + value.slice(1);
                    updateFormField("country", capitalized);
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="e.g., India"
                />
              </div>
            </div>
          </AccordionSection>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
          <span>
            {isSubmitting 
              ? `${editLead ? 'Updating' : 'Creating'}...` 
              : `${editLead ? 'Update' : 'Create'} Lead`
            }
          </span>
        </button>
      </div>
    </div>
  );
};

export default LeadForm;