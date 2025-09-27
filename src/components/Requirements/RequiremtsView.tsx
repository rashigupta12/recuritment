'use client'
/*eslint-disable  @typescript-eslint/no-explicit-any*/
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  Building,
  Edit,
  FileText,
  Loader2,
  Plus,
  Search
} from "lucide-react";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";

// Type Definitions
type StaffingPlanItem = {
  currency: string;
  designation: string;
  vacancies: number;
  estimated_cost_per_position: number;
  number_of_positions: number;
  min_experience_reqyrs: number;
  job_description: string;
  attachmentsoptional?: string;
  assign_to?: string;
};

type StaffingPlan = {
  custom_contact_name: string;
  custom_contact_phone: string;
  custom_contact_email: string;
  name: string;
  custom_lead: string;
  from_date: string;
  to_date: string;
  creation: string;
  modified: string;
  owner: string;
  company: string;
  custom_assign_to?: string;
  assigned_to_full_name?: string;
  total_estimated_budget: number;
  staffing_details: StaffingPlanItem[];
  // Lead details
  lead_name?: string;
  company_name?: string;
  custom_full_name?: string;
  custom_email_address?: string;
  custom_phone_number?: string;
  custom_deal_value?: number;
  custom_expected_close_date?: string;
};

// Utility Functions
const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });
};

// Parse assign_to string to get user assignments
const parseAssignTo = (assignToString: string) => {
  if (!assignToString) return [];
  
  try {
    // Handle both JSON array format and simple string format
    if (assignToString.startsWith('[')) {
      return JSON.parse(assignToString);
    } else {
      // Simple format: "user@email.com:2,user2@email.com:1"
      return assignToString.split(',').map(assignment => {
        const [email, allocation] = assignment.split(':');
        return { userEmail: email.trim(), allocation: parseInt(allocation) || 1 };
      });
    }
  } catch (error) {
    console.error('Error parsing assign_to:', error);
    return [];
  }
};

// Get initials for user display
const getInitials = (name: string) => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
};

// Professional Job Card Component
const ProfessionalJobCard: React.FC<{
  plan: StaffingPlan;
  onEdit: () => void;
}> = ({ plan, onEdit }) => {
  const totalVacancies = plan.staffing_details?.reduce((sum, item) => sum + item.vacancies, 0) || 0;

  // Get top 3 designations for preview
  const topDesignations = plan.staffing_details?.slice(0, 3) || [];
  const remainingCount = Math.max(0, (plan.staffing_details?.length || 0) - 3);

  return (
    <div className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{plan.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1 text-gray-400" />
                <span className="truncate">{plan.company}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Overall Plan Assigned User Display */}
            {plan.custom_assign_to && (
              <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-1 text-xs">
                  {plan.assigned_to_full_name?.charAt(0).toUpperCase() || plan.custom_assign_to.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-20">{plan.assigned_to_full_name || plan.custom_assign_to.split('@')[0]}</span>
              </div>
            )}
            
            {/* Edit Button */}
            <button
              onClick={onEdit}
              className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
        </div>

        {/* Job Requirements Preview with Assignment Info */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Job Requirements</h4>
          <div className="space-y-2">
            {topDesignations.map((item, index) => {
              const assignments = parseAssignTo(item.assign_to || '');
              
              return (
                <div key={index} className="py-2 px-3 bg-gray-50 rounded">
                  {/* Main requirement info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="font-medium text-gray-900 truncate">{item.designation}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-purple-600 font-medium">{item.vacancies} positions</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-blue-600">{item.min_experience_reqyrs}+ yrs exp</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-blue-600">{item.currency}</span>
                    </div>
                    <span className="text-green-600 font-medium ml-2">{formatCurrency(item.estimated_cost_per_position)}</span>
                  </div>
                  
                  {/* Assignment info */}
                  {assignments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Assigned to:</div>
                      <div className="flex flex-wrap gap-1">
                        {assignments.map((assignment: { userEmail: string; allocation: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, assignIndex: React.Key | null | undefined) => (
                          <div key={assignIndex} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-1 text-xs">
                              {getInitials(assignment.userEmail.split('@')[0])}
                            </div>
                            <span className="mr-1">{assignment.userEmail.split('@')[0]}</span>
                            <span className="text-blue-500">({assignment.allocation})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div className="text-sm text-gray-500 text-center py-1">
                +{remainingCount} more requirements
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 gap-4 mb-3 py-2 bg-gray-50 rounded px-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Contact Details</div>
            <div className="font-medium text-gray-900 text-sm truncate">{plan.custom_contact_name}</div>
            <div className="text-xs text-blue-600 truncate">{plan.custom_contact_phone}, {plan.custom_contact_email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const StaffingPlansList: React.FC = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<StaffingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<StaffingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch staffing plans
  const fetchStaffingPlans = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        "/resource/Staffing Plan?&order_by=creation%20desc"
      );

      const plansData = response.data || [];
      const detailedLeads = await Promise.all(
        plansData.map(async (plan: { name: string }) => {
          try {
            const planDetails = await frappeAPI.makeAuthenticatedRequest(
              "GET",
              `/resource/Staffing Plan/${plan.name}`
            );
            return planDetails.data;
          } catch (err) {
            console.error(`Error fetching details for ${plan.name}:`, err);
            return null;
          }
        })
      );
     
      const validPlans = detailedLeads.filter(plan => plan !== null);
      setPlans(validPlans);
      setFilteredPlans(validPlans);
      
    } catch (error) {
      console.error('Error fetching staffing plans:', error);
      setError("Failed to load staffing plans. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStaffingPlans();
  }, []);

  // Filter functionality
  useEffect(() => {
    let filtered = [...plans];

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.custom_lead?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.custom_assign_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.assigned_to_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.staffing_details?.some(item => 
          item.designation.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm]);

  // Navigation handlers
  const handleCreateNew = () => {
    router.push('/dashboard/sales-manager/requirements/create');
  };

  const handleEditPlan = (plan: StaffingPlan) => {
    const queryParams = new URLSearchParams({
      planId: plan.name,
      leadId: plan.custom_lead,
      mode: 'edit'
    });
    router.push(`/dashboard/sales-manager/requirements/create?${queryParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Job Board</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStaffingPlans}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Job Board</h1>
              <p className="text-sm text-gray-600">View job requirements and assignments</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Job</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job, company, contact, assignee, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <ProfessionalJobCard
                key={plan.name}
                plan={plan}
                onEdit={() => handleEditPlan(plan)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching jobs found' : 'No job postings yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first job posting'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateNew}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mx-auto transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create First Job</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffingPlansList;