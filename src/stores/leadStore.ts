/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/leadStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Contact {
  designation: string | undefined
  gender: string | undefined
  organization: string | undefined
  first_name: string | undefined
  last_name: string | undefined
  contactId: string | undefined
  name: string
  email: string
  phone: string
  id?: string
}

export interface Company {
  companyId: string | undefined
  email: string
  company_name: string
  name: string
  website: string
  country: string
  id?: string
}

export interface Industry {
  industry: string
  name: string
  id?: string
}

export interface Lead {
  custom_fixed_charges: number
  owner: string
  lead_owner: string
  custom_lead_owner_name: string
  mobile_no: string
  id?: string
  custom_full_name: string
  custom_phone_number: string
  custom_email_address: string
  status: string
  company_name: string
  custom_expected_hiring_volume: number
  industry: string
  city: string
  custom_budgetinr: number
  website: string
  state: string
  country: string
  creation?: string
  lead_name?: string
  email_id?: string
  name?: string
  // New fields
  custom_stage?: string
  custom_offerings?: string
  custom_estimated_hiring_?: number
  custom_average_salary?: number
  custom_fee?: number
  custom_deal_value?: number
  custom_expected_close_date?: string
}

export interface LeadFormData {
  custom_fixed_charges: number
  contact: Contact | null
  company: Company | null
  industry: Industry | null
  expectedHiringVolume: number
  city: string
  budget: number
  state: string
  country: string
  // New fields integrated into form data
  custom_stage: string
  custom_offerings: string
  custom_estimated_hiring_: number
  custom_average_salary: number
  custom_fee: number
  custom_deal_value: number
  custom_expected_close_date: string
}

interface LeadStore {
  // Lead data
  leads: Lead[]
  loading: boolean
  error: string | null
  
  // Form state
  formData: LeadFormData
  currentStep: number
  isFormOpen: boolean
  
  // Actions
  setLeads: (leads: Lead[]) => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, lead: Partial<Lead>) => void
  deleteLead: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Form actions
  setContact: (contact: Contact | null) => void
  setCompany: (company: Company | null) => void
  setIndustry: (industry: Industry | null) => void
  updateFormField: (field: keyof LeadFormData, value: any) => void
  resetForm: () => void
  setCurrentStep: (step: number) => void
  setFormOpen: (open: boolean) => void
  
  // Helper to build final payload with automatic deal value calculation
  buildLeadPayload: () => Partial<Lead>
  
  // Helper to calculate deal value automatically
  calculateDealValue: () => number
}

const initialFormData: LeadFormData = {
  contact: null,
  company: null,
  industry: null,
  expectedHiringVolume: 0,
  city: '',
  budget: 0,
  state: '',
  country: 'India',
  // New fields with default values
  custom_stage: 'Prospecting',
  custom_offerings: 'Lateral - All Levels',
  custom_estimated_hiring_: 0,
  custom_average_salary: 0,
  custom_fee: 0,
  custom_deal_value: 0,
  custom_expected_close_date: '',
  custom_fixed_charges: 0
}

export const useLeadStore = create<LeadStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      leads: [],
      loading: false,
      error: null,
      formData: initialFormData,
      currentStep: 0,
      isFormOpen: false,

      // Lead actions
      setLeads: (leads) => set({ leads }, false, 'setLeads'),
      
      addLead: (lead) =>
        set(
          (state) => ({
            leads: [lead, ...state.leads]
          }),
          false,
          'addLead'
        ),
      
      updateLead: (id, updatedLead) =>
        set(
          (state) => ({
            leads: state.leads.map((lead) =>
              lead.id === id || lead.name === id
                ? { ...lead, ...updatedLead }
                : lead
            )
          }),
          false,
          'updateLead'
        ),
      
      deleteLead: (id) =>
        set(
          (state) => ({
            leads: state.leads.filter((lead) => lead.id !== id && lead.name !== id)
          }),
          false,
          'deleteLead'
        ),
      
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),

      // Form actions
      setContact: (contact) =>
        set(
          (state) => ({
            formData: { ...state.formData, contact }
          }),
          false,
          'setContact'
        ),
      
      setCompany: (company) =>
        set(
          (state) => ({
            formData: { ...state.formData, company }
          }),
          false,
          'setCompany'
        ),
      
      setIndustry: (industry) =>
        set(
          (state) => ({
            formData: { ...state.formData, industry }
          }),
          false,
          'setIndustry'
        ),
      
      updateFormField: (field, value) =>
        set(
          (state) => {
            const newFormData = { ...state.formData, [field]: value }
            
            // Auto-calculate deal value when relevant fields change
            if (field === 'custom_fee' || field === 'custom_estimated_hiring_' || field === 'custom_average_salary') {
              const fee = field === 'custom_fee' ? value : newFormData.custom_fee
              const hiring = field === 'custom_estimated_hiring_' ? value : newFormData.custom_estimated_hiring_
              const salary = field === 'custom_average_salary' ? value : newFormData.custom_average_salary
              
              // Calculate: fee * hiring * salary / 100 (assuming fee is in percentage)
              const dealValue = (fee && hiring && salary) ? (fee * hiring * salary) / 100 : 0
              newFormData.custom_deal_value = dealValue
            }
            
            return {
              formData: newFormData
            }
          },
          false,
          'updateFormField'
        ),
      
      resetForm: () =>
        set(
          {
            formData: initialFormData,
            currentStep: 0
          },
          false,
          'resetForm'
        ),
      
      setCurrentStep: (step) => set({ currentStep: step }, false, 'setCurrentStep'),
      setFormOpen: (open) => set({ isFormOpen: open }, false, 'setFormOpen'),

      // Helper to calculate deal value
      calculateDealValue: () => {
        const { formData } = get()
        const { custom_fee, custom_estimated_hiring_, custom_average_salary } = formData
        
        if (!custom_fee || !custom_estimated_hiring_ || !custom_average_salary) {
          return 0
        }
        
        // Calculate: fee * hiring * salary / 100 (assuming fee is in percentage)
        return (custom_fee * custom_estimated_hiring_ * custom_average_salary) / 100
      },

      // Helper to build final lead payload
     // In your leadStore.ts, update the buildLeadPayload function:
buildLeadPayload: () => {
  const { formData } = get()
  
  if (!formData.contact || !formData.company || !formData.industry) {
    throw new Error('Missing required form data')
  }

  return {
    // Original fields
    custom_full_name: formData.contact.name,
    custom_phone_number: formData.contact.phone,
    custom_email_address: formData.contact.email,
    status: 'Lead',
    company_name: formData.company.name,
    custom_expected_hiring_volume: formData.expectedHiringVolume,
    industry: formData.industry.name,
    city: formData.city,
    custom_budgetinr: formData.budget,
    website: formData.company.website,
    state: formData.state,
    country: formData.country,
    // New fields
    custom_stage: formData.custom_stage,
    custom_offerings: formData.custom_offerings,
    custom_estimated_hiring_: formData.custom_estimated_hiring_,
    custom_average_salary: formData.custom_average_salary,
    custom_fee: formData.custom_fee,
    custom_fixed_charges: formData.custom_fixed_charges, // Add this line
    custom_deal_value: formData.custom_deal_value,
    custom_expected_close_date: formData.custom_expected_close_date
  }
}
    }),
    {
      name: 'lead-store'
    }
  )
)