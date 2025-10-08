import { boolean } from "zod";

// Type Definitions
export type UserInfo = {
  name: string;
  full_name: string;
  email: string;
  user_image?: string;
};

export type LeadType = {
  name: string;
  custom_full_name: string;
  company_name: string;
  industry: string | null;
  custom_offerings: string | null;
  custom_expected_hiring_volume: number;
  custom_estimated_hiring_: number;
  custom_average_salary: number;
  custom_fee: number;
  custom_deal_value: number;
  custom_expected_close_date: string | null;
  custom_phone_number: string;
  custom_email_address: string;
};

export type Assignment = {
  userEmail: string;
  userName: string;
  allocation: number;
};

export type StaffingPlanItem = {
  employment_type: string;
  publish: boolean;
  location: string;
  currency: string;
  designation: string;
  vacancies: number;
  estimated_cost_per_position: number;
  number_of_positions: number;
  min_experience_reqyrs: number;
  job_description: string;
  attachmentsoptional?: string;
  assign_to: string; // "email1-allocation1,email2-allocation2" format
};

export type StaffingPlanForm = {
  name: string;
  custom_lead: string;
  from_date: string;
  to_date: string;
  custom_assign_to?: string;
  assigned_to_full_name?: string;
  staffing_details: StaffingPlanItem[];
};
// MultiUserAssignment Component
export type MultiUserAssignmentProps = {
  assignTo: string;
  totalVacancies: number;
  onAssignToChange: (assignTo: string) => void;
  disabled?: boolean;
  itemIndex: number;
};

// Initial Data
export const initialStaffingPlanItem: StaffingPlanItem = {
  currency: "INR",
  designation: "",
  vacancies: 0,
  estimated_cost_per_position: 0,
  number_of_positions: 1,
  min_experience_reqyrs: 0,
  job_description: "",
  attachmentsoptional: "",
  assign_to: "",
  location: "",
   employment_type:"",
   publish:false
};

export const initialStaffingPlanForm: StaffingPlanForm = {
  name: "",
  custom_lead: "",
  from_date: new Date().toISOString().split('T')[0],
  to_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  staffing_details: [initialStaffingPlanItem]
};

// Utility Functions
export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });
};

export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

export const cleanJobDescription = (description: string): string => {
  if (!description) return "";
  const cleanText = description.replace(/<[^>]*>/g, '');
  return cleanText.trim();
};

// Utility functions to parse and format assign_to string
export const parseAssignTo = (assignToString: string): Assignment[] => {
  if (!assignToString) return [];
  
  return assignToString.split(',').map(item => {
    const [email, allocation] = item.split('-');
    return {
      userEmail: email,
      userName: email.split('@')[0], // Will be replaced with actual name when users are loaded
      allocation: parseInt(allocation) || 0
    };
  });
};

export const formatAssignTo = (assignments: Assignment[]): string => {
  return assignments.map(assignment => 
    `${assignment.userEmail}-${assignment.allocation}`
  ).join(',');
};
