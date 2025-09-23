'use client'
import CompanySearchSection from '@/components/comman/CompanySearch';
import ContactSearchSection from '@/components/comman/ContactSearch';
import IndustrySearchSection from '@/components/comman/IndustrySearchSection';
import { frappeAPI } from '@/lib/api/frappeClient';
import { useLeadStore } from '@/stores/leadStore';
import {
  Building2,
  Factory,
  IndianRupee,
  Loader2,
  MapPin,
  User,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import AccordionSection from './AccordionSection';

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
};

type SectionKey = 'contact' | 'company' | 'industry' | 'details';

const LeadForm: React.FC<LeadFormProps> = ({ onClose }) => {
  const { formData, setContact, setCompany, setIndustry, updateFormField, resetForm, buildLeadPayload } = useLeadStore();
  const [openSections, setOpenSections] = useState<{ contact: boolean; company: boolean; industry: boolean; details: boolean }>({ contact: true, company: false, industry: false, details: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSection = (section: SectionKey) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = buildLeadPayload();
      await frappeAPI.createLead(payload);
      
      // Reset form and close
      resetForm();
      onClose();
      
      // You would refresh the leads list here
      console.log('Lead created successfully:', payload);
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead. Please try again.');
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
      name: formData.contact.name || '',
      email: formData.contact.email || '',
      phone: formData.contact.phone || '',
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
      name: formData.company.name || '',
      company_name: formData.company.company_name || formData.company.name || '',
      email: formData.company.email || '',
      website: formData.company.website || '',
      country: formData.company.country || '',
      companyId: formData.company.companyId,
    };
  };

  const getSelectedIndustry = (): IndustryType | null => {
    if (!formData.industry) return null;
    return {
      industry: formData.industry.industry || formData.industry.name || '',
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
          <div className="space-y-4">
            {/* Contact Section */}
            <AccordionSection
              title="Contact Information"
              icon={User}
              isOpen={openSections.contact}
              onToggle={() => toggleSection('contact')}
              completed={!!formData.contact}
            >
              <ContactSearchSection
                selectedContact={getSelectedContact()}
                onContactSelect={handleContactSelect}
                onEdit={() => {/* Open contact edit modal */}}
                onRemove={() => setContact(null)}
              />
            </AccordionSection>

            {/* Company Section */}
            <AccordionSection
              title="Organization Information"
              icon={Building2}
              isOpen={openSections.company}
              onToggle={() => toggleSection('company')}
              completed={!!formData.company}
            >
              <CompanySearchSection
                selectedCompany={getSelectedCompany()}
                onCompanySelect={handleCompanySelect}
                onEdit={() => {/* Open company edit modal */}}
                onRemove={() => setCompany(null)}
              />
            </AccordionSection>

            {/* Industry Section */}
            <AccordionSection
              title="Industry Selection"
              icon={Factory}
              isOpen={openSections.industry}
              onToggle={() => toggleSection('industry')}
              completed={!!formData.industry}
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
              onToggle={() => toggleSection('details')}
              completed={formData.expectedHiringVolume > 0 && !!formData.city && formData.budget > 0}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Hiring Volume
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.expectedHiringVolume}
                      onChange={(e) => updateFormField('expectedHiringVolume', parseInt(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="e.g., 10"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => updateFormField('budget', parseInt(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="e.g., 500000"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormField('city', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormField('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="e.g., Maharashtra"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateFormField('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="e.g., India"
                  />
                </div>
              </div>
            </AccordionSection>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Creating...' : 'Create Lead'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default LeadForm