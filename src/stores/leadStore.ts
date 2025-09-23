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
}

export interface LeadFormData {
  contact: Contact | null
  company: Company | null
  industry: Industry | null
  expectedHiringVolume: number
  city: string
  budget: number
  state: string
  country: string
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
  
  // Helper to build final payload
  buildLeadPayload: () => Partial<Lead>
}

const initialFormData: LeadFormData = {
  contact: null,
  company: null,
  industry: null,
  expectedHiringVolume: 0,
  city: '',
  budget: 0,
  state: '',
  country: 'India'
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
          (state) => ({
            formData: { ...state.formData, [field]: value }
          }),
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

      // Helper to build final lead payload
      buildLeadPayload: () => {
        const { formData } = get()
        
        if (!formData.contact || !formData.company || !formData.industry) {
          throw new Error('Missing required form data')
        }

        return {
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
          country: formData.country
        }
      }
    }),
    {
      name: 'lead-store'
    }
  )
)