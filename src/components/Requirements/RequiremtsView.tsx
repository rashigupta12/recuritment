'use client'
/*eslint-disable  @typescript-eslint/no-explicit-any*/
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  Building,
  ChevronDown,
  Edit,
  FileText,
  Loader2,
  Plus,
  Search,
  UserPlus,
  X
} from "lucide-react";
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from "react";

// Type Definitions
type User = {
  name: string;
  full_name: string;
  email: string;
  user_image?: string;
};

type StaffingPlanItem = {
  currency: string;
  designation: string;
  vacancies: number;
  estimated_cost_per_position: number;
  number_of_positions: number;
  min_experience_reqyrs: number;
  job_description: string;
  attachmentsoptional?: string;
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

// Assign Dropdown Component
const AssignDropdown: React.FC<{
  plan: StaffingPlan;
  onAssign: (planName: string, userEmail: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ plan, onAssign, isOpen, onToggle }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchUsers();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        "/resource/User?fields=[\"name\",\"full_name\",\"email\",\"user_image\"]&limit_page_length=50"
      );
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (userEmail: string) => {
    onAssign(plan.name, userEmail);
    onToggle();
    setSearchTerm("");
  };

  // Don't show dropdown if user is already assigned
  if (!isOpen || plan.custom_assign_to) return null;

  return (
    <div ref={dropdownRef} className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Assign Job</h4>
          <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-500" />
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user.email}
              onClick={() => handleAssign(user.email)}
              className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b last:border-b-0"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

// Professional Job Card Component
const ProfessionalJobCard: React.FC<{
  plan: StaffingPlan;
  onEdit: () => void;
  onAssign: (planName: string, userEmail: string) => void;
}> = ({ plan, onEdit, onAssign }) => {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  
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
          
          <div className="flex items-center space-x-2 relative">
            {/* Assigned User Display */}
            {plan.custom_assign_to && (
              <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-1 text-xs">
                  {plan.assigned_to_full_name?.charAt(0).toUpperCase() || plan.custom_assign_to.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-20">{plan.assigned_to_full_name || plan.custom_assign_to.split('@')[0]}</span>
              </div>
            )}
            
            {/* Assign Button - Only show if not assigned */}
            {!plan.custom_assign_to && (
              <button
                onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-sm font-medium transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Assign
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            )}
            
            {/* Edit Button */}
            <button
              onClick={onEdit}
              className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>

            {/* Assign Dropdown */}
            <AssignDropdown
              plan={plan}
              onAssign={onAssign}
              isOpen={showAssignDropdown}
              onToggle={() => setShowAssignDropdown(false)}
            />
          </div>
        </div>

        {/* Job Requirements Preview */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Job Requirements</h4>
          <div className="space-y-2">
            {topDesignations.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm">
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
            ))}
            {remainingCount > 0 && (
              <div className="text-sm text-gray-500 text-center py-1">
                +{remainingCount} more requirements
              </div>
            )}
          </div>
        </div>

        {/* Contact & Deal Info */}
        <div className="grid grid-cols-2 gap-4 mb-3 py-2 bg-gray-50 rounded px-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Contact Details</div>
            <div className="font-medium text-gray-900 text-sm truncate">{plan.custom_contact_name}</div>
            <div className="text-xs text-blue-600 truncate"> {plan.custom_contact_phone} , {plan.custom_contact_email}</div>
          </div>
          {/* <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Total Budget</div>
            <div className="font-semibold text-green-600 text-sm">{formatCurrency(plan.total_estimated_budget)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Modified: {formatDate(plan.modified)}
            </div>
          </div> */}
        </div>

        {/* Summary Stats */}
        {/* <div className="grid grid-cols-4 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{totalVacancies}</div>
            <div className="text-xs text-gray-500">Total Positions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{plan.staffing_details?.length || 0}</div>
            <div className="text-xs text-gray-500">Job Types</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{formatCurrency(plan.total_estimated_budget)}</div>
            <div className="text-xs text-gray-500">Total Budget</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">
              {Math.round((new Date().getTime() - new Date(plan.creation).getTime()) / (1000 * 3600 * 24))}d
            </div>
            <div className="text-xs text-gray-500">Days Old</div>
          </div>
        </div> */}
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

  // Handle assignment
  const handleAssignUser = async (planName: string, userEmail: string) => {
    try {
      // Get user details first to show full name
      const userResponse = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/resource/User/${userEmail}`
      );
      
      const userData = userResponse.data;
      
      // Update the staffing plan with custom_assign_to field
      await frappeAPI.makeAuthenticatedRequest(
        "PUT",
        `/resource/Staffing Plan/${encodeURIComponent(planName)}`,
        {
          custom_assign_to: userEmail
        }
      );

      // Update local state
      setPlans(prevPlans =>
        prevPlans.map(plan =>
          plan.name === planName
            ? { ...plan, custom_assign_to: userEmail, assigned_to_full_name: userData.full_name }
            : plan
        )
      );

      setFilteredPlans(prevPlans =>
        prevPlans.map(plan =>
          plan.name === planName
            ? { ...plan, custom_assign_to: userEmail, assigned_to_full_name: userData.full_name }
            : plan
        )
      );

    } catch (error) {
      console.error('Error assigning user:', error);
      alert('Failed to assign user. Please try again.');
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
              <p className="text-sm text-gray-600">Manage and assign job requirements</p>
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
                onAssign={handleAssignUser}
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