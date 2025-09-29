'use client'
import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Briefcase, 
  Clock, 
  IndianRupee, 
  Mail, 
  MapPin, 
  Phone, 
  Plus, 
  Search, 
  User, 
  Users,
  X,
  Check,
  AlertCircle,
  UserPlus,
  Trash2,
  Loader2
} from 'lucide-react';
import { frappeAPI } from '@/lib/api/frappeClient';
// Type definitions
type StaffingPlanItem = {
  location: string;
  currency: string;
  designation: string;
  vacancies: number;
  estimated_cost_per_position: number;
  number_of_positions: number;
  min_experience_reqyrs: number;
  job_description: string;
  attachmentsoptional?: string;
  assign_to?: string;
  job_id?: string;
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
};

type Assignment = {
  userEmail: string;
  userName: string;
  allocation: number;
};

type User = {
  name: string;
  full_name: string;
  email: string;
  user_image?: string;
};

type SelectedJob = {
  staffingPlan: StaffingPlan;
  staffingDetail: StaffingPlanItem;
  planIndex: number;
  detailIndex: number;
};


// Assignment helper functions
const parseAssignTo = (assignTo: string): Assignment[] => {
  if (!assignTo) return [];
  try {
    const assignments = assignTo.split(',').map(item => {
      // Handle both colon and hyphen formats for backward compatibility
      const separator = item.includes('-') ? '-' : ':';
      const [userEmail, allocation] = item.trim().split(separator);
      return {
        userEmail: userEmail.trim(),
        userName: userEmail.split('@')[0],
        allocation: parseInt(allocation) || 1
      };
    });
    return assignments;
  } catch {
    return [];
  }
};

const formatAssignTo = (assignments: Assignment[]): string => {
  return assignments
    .filter(assignment => assignment.userEmail && assignment.allocation > 0)
    .map(assignment => `${assignment.userEmail}-${assignment.allocation}`) // Always use hyphen
    .join(', ');
};
// Multi User Assignment Component Props
interface MultiUserAssignmentProps {
  assignTo: string;
  totalVacancies: number;
  onAssignToChange: (assignTo: string) => void;
  disabled?: boolean;
}

const MultiUserAssignment: React.FC<MultiUserAssignmentProps> = ({ 
  assignTo, 
  totalVacancies, 
  onAssignToChange, 
  disabled = false 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const parsedAssignments = parseAssignTo(assignTo);
    setAssignments(parsedAssignments);
  }, [assignTo]);

  useEffect(() => {
    if (users.length > 0 && assignments.length > 0) {
      const updatedAssignments = assignments.map(assignment => {
        const user = users.find(u => u.email === assignment.userEmail);
        return {
          ...assignment,
          userName: user ? user.full_name : assignment.userEmail.split('@')[0]
        };
      });
      setAssignments(updatedAssignments);
    }
  }, [users, assignments]);

  const totalAllocated = assignments.reduce((sum, assignment) => sum + assignment.allocation, 0);
  const remainingVacancies = totalVacancies - totalAllocated;
  const isValid = totalAllocated === totalVacancies && totalVacancies > 0;

  const loadUsers = async () => {
    if (users.length > 0) return;
    
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadyAssigned = !assignments.some(assignment => assignment.userEmail === user.email);
    return matchesSearch && notAlreadyAssigned;
  });

  const updateAssignments = (newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    onAssignToChange(formatAssignTo(newAssignments));
  };

  const addAssignment = (userEmail: string, userName: string) => {
    const defaultAllocation = Math.min(remainingVacancies, Math.max(1, Math.floor(remainingVacancies / 2)));
    const newAssignment = {
      userEmail,
      userName,
      allocation: defaultAllocation
    };
    
    updateAssignments([...assignments, newAssignment]);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const removeAssignment = (index: number) => {
    const updated = assignments.filter((_, i) => i !== index);
    updateAssignments(updated);
  };

  const updateAllocation = (index: number, allocation: number) => {
    const updated = assignments.map((assignment, i) => 
      i === index ? { ...assignment, allocation: Math.max(0, allocation) } : assignment
    );
    updateAssignments(updated);
  };

  const clearAllAssignments = () => {
    updateAssignments([]);
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getValidationColor = (): string => {
    if (totalVacancies === 0) return 'text-gray-500';
    if (totalAllocated === totalVacancies) return 'text-green-600';
    if (totalAllocated > totalVacancies) return 'text-red-600';
    return 'text-orange-600';
  };

  const getStatusIcon = () => {
    if (totalVacancies === 0) return null;
    if (totalAllocated === totalVacancies) return <Check className="h-3 w-3 text-green-600" />;
    if (totalAllocated > totalVacancies) return <AlertCircle className="h-3 w-3 text-red-600" />;
    return <AlertCircle className="h-3 w-3 text-orange-600" />;
  };

  if (totalVacancies === 0) {
    return (
      <div className="text-xs text-gray-400 text-center py-2">
        Set vacancies first
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="space-y-1">
          {assignments.length === 0 ? (
            <div className="text-center py-2">
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (!showDropdown) loadUsers();
                }}
                disabled={disabled}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors disabled:opacity-50"
              >
                <UserPlus className="h-3 w-3" />
                <span>Assign</span>
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {assignments.map((assignment, index) => (
                  <div key={assignment.userEmail} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                        {getInitials(assignment.userName)}
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {assignment.userName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={assignment.allocation}
                        onChange={(e) => updateAllocation(index, parseInt(e.target.value) || 0)}
                        className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500"
                        min="0"
                        max={assignment.allocation + remainingVacancies}
                        disabled={disabled}
                      />
                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                        disabled={disabled}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <div className={`text-xs font-medium ${getValidationColor()}`}>
                    {totalAllocated}/{totalVacancies}
                  </div>
                  {getStatusIcon()}
                  {remainingVacancies > 0 && (
                    <span className="text-xs text-orange-600">
                      {remainingVacancies} left
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {remainingVacancies > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(!showDropdown);
                        if (!showDropdown) loadUsers();
                      }}
                      disabled={disabled}
                      className="p-0.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Add more assignees"
                    >
                      <UserPlus className="h-3 w-3" />
                    </button>
                  )}
                  {assignments.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllAssignments}
                      className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                      disabled={disabled}
                      title="Clear all assignments"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">Add Assignee</h4>
              <button 
                onClick={() => setShowDropdown(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            {remainingVacancies > 0 && (
              <div className="text-xs text-orange-600 mt-2 bg-orange-50 px-2 py-1 rounded">
                {remainingVacancies} positions remaining
              </div>
            )}
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-500 mb-2" />
                <div className="text-sm text-gray-500">Loading users...</div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="py-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => addAssignment(user.email, user.full_name || user.email)}
                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                      {getInitials(user.full_name || user.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || user.email}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm ? `No users found for "${searchTerm}"` : 'No available users'}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Job Opening Modal Component Props
interface JobOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffingPlan: StaffingPlan | null;
  staffingDetail: StaffingPlanItem | null;
  planIndex: number;
  detailIndex: number;
  onSuccess: (planIndex: number, detailIndex: number, updates: Partial<StaffingPlanItem>) => void;
}

const JobOpeningModal: React.FC<JobOpeningModalProps> = ({ 
  isOpen, 
  onClose, 
  staffingPlan, 
  staffingDetail, 
  planIndex, 
  detailIndex,
  onSuccess 
}) => {
  const [isPublished, setIsPublished] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  
  useEffect(() => {
    if (staffingDetail?.assign_to) {
      setAssignTo(staffingDetail.assign_to);
    }
  }, [staffingDetail]);

  const handleCreateOpening = async () => {
    if (!staffingPlan || !staffingDetail) return;
    
    setIsCreating(true);
    try {
      // Create Job Opening
      const jobData = {
        job_title: staffingDetail.designation,
        company: staffingPlan.company,
        location: staffingDetail.location,
  
        lower_range: staffingDetail.estimated_cost_per_position,
       
        currency: staffingDetail.currency,
        job_description: staffingDetail.job_description,
     
        publish: isPublished ? '1' : '0',
        staffing_plan: staffingPlan.name,
        salary_per: "Year"

       
      };

      const jobResponse = await frappeAPI.makeAuthenticatedRequest(
        'POST',
        '/resource/Job Opening',
        jobData
      );

      const jobId = jobResponse.data.name;

      // Update Staffing Plan with job_id
      const updatedStaffingDetails = [...staffingPlan.staffing_details];
      updatedStaffingDetails[detailIndex] = {
        ...updatedStaffingDetails[detailIndex],
        job_id: jobId
      };

      await frappeAPI.makeAuthenticatedRequest(
        'PUT',
        `/resource/Staffing Plan/${staffingPlan.name}`,
        {
          staffing_details: updatedStaffingDetails
        }
      );

      onSuccess(planIndex, detailIndex, { job_id: jobId });
      
    } catch (error) {
      console.error('Error creating job opening:', error);
    } finally {
      setIsCreating(false);
    }
  };

 const handleAllocation = async () => {
  if (!staffingPlan || !staffingDetail) return;
  
  setIsAllocating(true);
  try {
    // Parse and reformat the assign_to to ensure it uses hyphens
    const parsedAssignments = parseAssignTo(assignTo);
    const formattedAssignTo = formatAssignTo(parsedAssignments);

    const updatedStaffingDetails = [...staffingPlan.staffing_details];
    updatedStaffingDetails[detailIndex] = {
      ...updatedStaffingDetails[detailIndex],
      assign_to: formattedAssignTo // Use the properly formatted string
    };

    await frappeAPI.makeAuthenticatedRequest(
      'PUT',
      `/resource/Staffing Plan/${staffingPlan.name}`,
      {
        staffing_details: updatedStaffingDetails
      }
    );

    onSuccess(planIndex, detailIndex, { assign_to: formattedAssignTo });
    onClose();
    
  } catch (error) {
    console.error('Error updating allocation:', error);
  } finally {
    setIsAllocating(false);
  }
};
  if (!isOpen || !staffingDetail || !staffingPlan) return null;

  const hasJobId = staffingDetail.job_id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {hasJobId ? 'Manage Job Allocation' : 'Create Job Opening'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Job Details
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Position:</span>
                <div className="font-medium">{staffingDetail.designation}</div>
              </div>
              <div>
                <span className="text-gray-600">Company:</span>
                <div className="font-medium">{staffingPlan.company}</div>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <div className="font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {staffingDetail.location}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Experience:</span>
                <div className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {staffingDetail.min_experience_reqyrs}+ years
                </div>
              </div>
             
              <div>
                <span className="text-gray-600">Vacancies:</span>
                <div className="font-medium text-green-600">{staffingDetail.vacancies}</div>
              </div>
              <div>
                <span className="text-gray-600">Budget:</span>
                <div className="font-medium flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                  {staffingDetail.estimated_cost_per_position} LPA
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {/* <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span>{staffingPlan.custom_contact_name}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>{staffingPlan.custom_contact_phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-blue-600">{staffingPlan.custom_contact_email}</span>
              </div>
            </div>
          </div> */}

          {/* Job Description */}
          {staffingDetail.job_description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Job Description</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                {staffingDetail.job_description}
              </div>
            </div>
          )}

          {!hasJobId && (
            /* Publish Checkbox */
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700">
                Publish job opening immediately
              </label>
            </div>
          )}

          {/* Allocation Section */}
          {hasJobId && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Job Allocation
              </h3>
              <div className="relative">
                <MultiUserAssignment
                  assignTo={assignTo}
                  totalVacancies={staffingDetail.vacancies}
                  onAssignToChange={setAssignTo}
                  disabled={isAllocating}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          {!hasJobId ? (
            <button
              onClick={handleCreateOpening}
              disabled={isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isCreating ? 'Creating...' : 'Create Opening'}</span>
            </button>
          ) : (
            <button
              onClick={handleAllocation}
              disabled={isAllocating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isAllocating && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isAllocating ? 'Updating...' : 'Update Allocation'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Staffing Plans Table Component
const StaffingPlansTable: React.FC = () => {
  const [plans, setPlans] = useState<StaffingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<StaffingPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staffing plans from Frappe API
  const fetchStaffingPlans = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        "/resource/Staffing Plan?order_by=creation%20desc"
      );

      const plansData = response.data || [];
      const detailedPlans = await Promise.all(
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
     
      const validPlans = detailedPlans.filter(plan => plan !== null) as StaffingPlan[];
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

  useEffect(() => {
    let filtered = [...plans];
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.custom_contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.staffing_details.some(detail => 
          detail.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          detail.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredPlans(filtered);
  }, [searchTerm, plans]);

  const handleCreateOpening = (
    plan: StaffingPlan, 
    detail: StaffingPlanItem, 
    planIndex: number, 
    detailIndex: number
  ) => {
    setSelectedJob({ 
      staffingPlan: plan, 
      staffingDetail: detail, 
      planIndex, 
      detailIndex 
    });
    setIsModalOpen(true);
  };

  const handleJobSuccess = (
    planIndex: number, 
    detailIndex: number, 
    updates: Partial<StaffingPlanItem>
  ) => {
    setPlans(prevPlans => {
      const newPlans = [...prevPlans];
      newPlans[planIndex] = {
        ...newPlans[planIndex],
        staffing_details: newPlans[planIndex].staffing_details.map((detail, idx) =>
          idx === detailIndex ? { ...detail, ...updates } : detail
        )
      };
      return newPlans;
    });
    
    if (updates.job_id) {
      // Keep modal open for allocation after job creation
      setSelectedJob(prev => prev ? {
        ...prev,
        staffingDetail: { ...prev.staffingDetail, ...updates }
      } : null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Openings Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage and track all staffing requirements</p>
            </div>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, contact, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPlans.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredPlans.reduce((sum, plan) => 
                    sum + plan.staffing_details.reduce((detailSum, detail) => 
                      detailSum + detail.number_of_positions, 0), 0)}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Vacancies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredPlans.reduce((sum, plan) => 
                    sum + plan.staffing_details.reduce((detailSum, detail) => 
                      detailSum + detail.vacancies, 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredPlans.reduce((sum, plan) => sum + plan.total_estimated_budget, 0))}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Table */}
        {isLoading ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Staffing Plans</h3>
            <p className="text-gray-600">Please wait while we fetch your data...</p>
          </div>
        ) : error ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchStaffingPlans}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mx-auto transition-colors"
            >
              <span>Try Again</span>
            </button>
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company & Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location & Experience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacancies & Budget
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlans.map((plan, planIndex) => (
                    <React.Fragment key={plan.name}>
                      {plan.staffing_details.map((detail, detailIndex) => (
                        <tr key={`${plan.name}-${detailIndex}`} className="hover:bg-gray-50 transition-colors">
                          {/* Company & Contact */}
                          {detailIndex === 0 && (
                            <td className="px-6 py-4 align-top" rowSpan={plan.staffing_details.length}>
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                                  <span className="font-semibold text-gray-900">{plan.company}</span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-1" />
                                    <span>{plan.custom_contact_name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 text-gray-400 mr-1" />
                                    <span>{plan.custom_contact_phone}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-gray-400 mr-1" />
                                    <span className="text-blue-600 hover:underline cursor-pointer">
                                      {plan.custom_contact_email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Position Details */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-sm">{detail.designation}</span>
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  {detail.number_of_positions} {detail.number_of_positions === 1 ? 'Position' : 'Positions'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Location & Experience */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{detail.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{detail.min_experience_reqyrs}+ years exp</span>
                              </div>
                            </div>
                          </td>

                          {/* Vacancies & Budget */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-green-500 mr-1" />
                                <span className="font-semibold text-green-600">{detail.vacancies}</span>
                                <span className="text-gray-500 text-sm ml-1">open</span>
                              </div>
                              <div className="flex items-center">
                                <IndianRupee className="h-4 w-4 text-purple-500 mr-1" />
                                <span className="font-medium text-gray-900">
                                  {detail.estimated_cost_per_position}L
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              {detail.job_id ? (
                                <>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    Job Created
                                  </span>
                                  {detail.assign_to && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                      Allocated
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                  Pending
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCreateOpening(plan, detail, planIndex, detailIndex)}
                                className={`flex items-center px-3 py-1.5 text-white rounded text-sm transition-colors ${
                                  detail.job_id 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {detail.job_id ? (
                                  <>
                                    <Users className="h-4 w-4 mr-1" />
                                    Allocation
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Create
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching results found' : 'No job openings available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Start by creating your first staffing plan'
              }
            </p>
          </div>
        )}

        {/* Footer Stats */}
        {filteredPlans.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600 bg-white px-6 py-3 rounded-lg border border-gray-200">
            <span>
              Showing {filteredPlans.length} of {plans.length} companies
            </span>
            <span>
              Total Budget: {formatCurrency(filteredPlans.reduce((sum, plan) => sum + plan.total_estimated_budget, 0))}
            </span>
          </div>
        )}

        {/* Job Opening Modal */}
        <JobOpeningModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          staffingPlan={selectedJob?.staffingPlan || null}
          staffingDetail={selectedJob?.staffingDetail || null}
          planIndex={selectedJob?.planIndex || 0}
          detailIndex={selectedJob?.detailIndex || 0}
          onSuccess={handleJobSuccess}
        />
      </div>
    </div>
  );
};

export default StaffingPlansTable;