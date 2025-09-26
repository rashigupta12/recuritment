'use client'
/*eslint-disable  @typescript-eslint/no-explicit-any*/
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  Building, 
  Users, 
  DollarSign, 
  Upload, 
  FileText,
  Briefcase,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  Target,
  Edit,
  X,
  User,
  Search,
  TrendingUp,
  Clock,
  ArrowLeft,
  IndianRupee,
  AlertCircle,
  UserPlus,
  Check
} from "lucide-react";
import { frappeAPI } from "@/lib/api/frappeClient";

// Type Definitions
type User = {
  name: string;
  full_name: string;
  email: string;
  user_image?: string;
};

type LeadType = {
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

type StaffingPlanForm = {
  name: string;
  custom_lead: string;
  from_date: string;
  to_date: string;
  custom_assign_to?: string;
  assigned_to_full_name?: string;
  staffing_details: StaffingPlanItem[];
};

// Initial Data
const initialStaffingPlanItem: StaffingPlanItem = {
  currency: "INR",
  designation: "",
  vacancies: 0,
  estimated_cost_per_position: 0,
  number_of_positions: 1,
  min_experience_reqyrs: 0,
  job_description: "",
  attachmentsoptional: ""
};

const initialStaffingPlanForm: StaffingPlanForm = {
  name: "",
  custom_lead: "",
  from_date: new Date().toISOString().split('T')[0],
  to_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  staffing_details: [initialStaffingPlanItem]
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

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });
};

const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

const cleanJobDescription = (description: string): string => {
  if (!description) return "";
  const cleanText = description.replace(/<[^>]*>/g, '');
  return cleanText.trim();
};

// Assign Dropdown Component
const AssignDropdown: React.FC<{
  assignedUser: string | undefined;
  assignedUserName: string | undefined;
  onAssign: (userEmail: string, userName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ assignedUser, assignedUserName, onAssign, isOpen, onToggle, disabled = false }) => {
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
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (userEmail: string, userName: string) => {
    onAssign(userEmail, userName);
    onToggle();
    setSearchTerm("");
  };

  const handleClearAssignment = () => {
    onAssign("", "");
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">
            {assignedUser ? 'Change Assignment' : 'Assign Job'}
          </h4>
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
          <>
            {assignedUser && (
              <button
                onClick={handleClearAssignment}
                className="w-full p-3 text-left hover:bg-red-50 text-red-600 flex items-center space-x-3 border-b"
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Clear Assignment</div>
                  <div className="text-xs text-red-500">Remove current assignee</div>
                </div>
              </button>
            )}
            {filteredUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleAssign(user.email, user.full_name || user.email)}
                className={`w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b last:border-b-0 ${
                  assignedUser === user.email ? 'bg-blue-50' : ''
                }`}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                  {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name || user.email}
                    {assignedUser === user.email && (
                      <Check className="h-3 w-3 text-green-500 ml-1 inline" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </button>
            ))}
          </>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

// Lead Search Component
const LeadSearchSection: React.FC<{
  onLeadSelect: (lead: LeadType | null) => void;
  selectedLead: LeadType | null;
  disabled?: boolean;
}> = ({ onLeadSelect, selectedLead, disabled = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LeadType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchLeads = useCallback(async (query: string) => {
    if (!query.trim() || disabled) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.lead_search.search_lead?search_term=${encodeURIComponent(query)}`
      );
      
      if (response.message?.status === "success") {
        const data: LeadType[] = response.message.data || [];
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!selectedLead && !disabled) {
      const handler = setTimeout(() => {
        searchLeads(searchQuery);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [searchQuery, searchLeads, selectedLead, disabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLead && !disabled) {
      setSearchQuery(e.target.value);
    }
  };

  const handleLeadSelect = (lead: LeadType) => {
    if (!disabled) {
      onLeadSelect(lead);
      setSearchQuery(lead.custom_full_name);
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const handleClearSelection = () => {
    if (!disabled) {
      onLeadSelect(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    if (!selectedLead && searchQuery.trim() && !isSearching && !disabled) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <Search className="absolute left-2 h-3 w-3 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedLead ? selectedLead.custom_full_name : "Search leads by name, company, or email..."}
          value={selectedLead ? selectedLead.custom_full_name : searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          className={`w-full pl-7 pr-8 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          disabled={!!selectedLead || disabled}
          readOnly={!!selectedLead || disabled}
        />
        {selectedLead && !disabled && (
          <button
            onClick={handleClearSelection}
            className="absolute right-2 p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {showDropdown && !selectedLead && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded border border-gray-200 max-h-60 overflow-y-auto"
        >
          {isSearching ? (
            <div className="p-3 text-center text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin mx-auto mb-1" />
              <div className="text-xs">Searching...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((lead) => (
                <div
                  key={lead.name}
                  className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleLeadSelect(lead)}
                >
                  <div className="text-sm font-medium text-gray-900">{lead.custom_full_name}</div>
                  <div className="text-xs text-gray-600 flex items-center mt-0.5">
                    <Building className="h-2.5 w-2.5 mr-1" />
                    {lead.company_name}
                  </div>
                  {(lead.custom_email_address || lead.custom_phone_number) && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                      {lead.custom_email_address && (
                        <span className="flex items-center">
                          <Mail className="h-2.5 w-2.5 mr-1" />
                          {lead.custom_email_address}
                        </span>
                      )}
                      {lead.custom_phone_number && (
                        <span className="flex items-center">
                          <Phone className="h-2.5 w-2.5 mr-1" />
                          {lead.custom_phone_number}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-3 text-center text-gray-500 text-xs">
              No leads found for &pos;{searchQuery}&pos;
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500 text-xs">
              Start typing to search leads...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Lead Info Sidebar
const LeadInfoSidebar: React.FC<{ lead: LeadType }> = ({ lead }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Selected Lead</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
          {lead.name}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{lead.custom_full_name}</h4>
          <div className="flex items-center text-gray-600 mb-1">
            <Building className="h-3 w-3 mr-1" />
            <span className="text-xs">{lead.company_name}</span>
          </div>
        </div>

        <div className="space-y-1">
          {lead.industry && (
            <div className="flex items-center text-xs text-gray-600">
              <Target className="h-3 w-3 mr-1 text-blue-500" />
              <span>{lead.industry}</span>
            </div>
          )}
          {lead.custom_offerings && (
            <div className="flex items-center text-xs text-gray-600">
              <Briefcase className="h-3 w-3 mr-1 text-blue-500" />
              <span>{lead.custom_offerings}</span>
            </div>
          )}
        </div>

        {(lead.custom_email_address || lead.custom_phone_number) && (
          <div className="border-t border-blue-200 pt-2 space-y-1">
            {lead.custom_email_address && (
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="h-3 w-3 mr-1 text-blue-500" />
                <span className="truncate">{lead.custom_email_address}</span>
              </div>
            )}
            {lead.custom_phone_number && (
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="h-3 w-3 mr-1 text-blue-500" />
                <span>{lead.custom_phone_number}</span>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-blue-200 pt-2 space-y-1">
          {lead.custom_deal_value > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <IndianRupee className="h-3 w-3 mr-1 text-green-500" />
                Deal Value
              </span>
              <span className="text-xs font-semibold text-green-600">
                {formatCurrency(lead.custom_deal_value)}
              </span>
            </div>
          )}
          {lead.custom_average_salary > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Avg Salary</span>
              <span className="text-xs font-medium text-gray-900">
                {formatCurrency(lead.custom_average_salary)}
              </span>
            </div>
          )}
          {lead.custom_fee > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Fee</span>
              <span className="text-xs font-medium text-gray-900">{lead.custom_fee}%</span>
            </div>
          )}
        </div>

        <div className="border-t border-blue-200 pt-2 space-y-1">
          {lead.custom_expected_hiring_volume > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <Users className="h-3 w-3 mr-1 text-purple-500" />
                Expected Volume
              </span>
              <span className="text-xs font-medium text-gray-900">{lead.custom_expected_hiring_volume}</span>
            </div>
          )}
          {lead.custom_estimated_hiring_ > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-orange-500" />
                Est. Hiring
              </span>
              <span className="text-xs font-medium text-gray-900">{lead.custom_estimated_hiring_}</span>
            </div>
          )}
          {lead.custom_expected_close_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 flex items-center">
                <Clock className="h-3 w-3 mr-1 text-red-500" />
                Close Date
              </span>
              <span className="text-xs font-medium text-gray-900">
                {formatDate(lead.custom_expected_close_date)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const StaffingPlanCreator: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<StaffingPlanForm>(initialStaffingPlanForm);
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{[key: number]: boolean}>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalPlanId, setOriginalPlanId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  useEffect(() => {
    const handleInitialLoad = async () => {
      const leadId = searchParams.get('leadId');
      const planId = searchParams.get('planId');
      const mode = searchParams.get('mode');
      
      setIsEditMode(mode === 'edit');
      
      if (planId && mode === 'edit') {
        setIsLoadingPlan(true);
        setOriginalPlanId(planId);
        
        try {
          const planResponse = await frappeAPI.makeAuthenticatedRequest(
            "GET",
            `/resource/Staffing Plan/${planId}`
          );
          
          if (planResponse && planResponse.data) {
            const planData = planResponse.data;
            
            setFormData({
              name: planData.name || "",
              custom_lead: planData.custom_lead || "",
              from_date: planData.from_date || new Date().toISOString().split('T')[0],
              to_date: planData.to_date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              custom_assign_to: planData.custom_assign_to || "",
              assigned_to_full_name: planData.assigned_to_full_name || "",
              staffing_details: planData.staffing_details?.map((item: any) => ({
                currency: item.currency || "INR",
                designation: item.designation || "",
                vacancies: item.vacancies || 0,
                estimated_cost_per_position: item.estimated_cost_per_position || 0,
                number_of_positions: item.number_of_positions || 1,
                min_experience_reqyrs: item.min_experience_reqyrs || 0,
                job_description: cleanJobDescription(item.job_description || ""),
                attachmentsoptional: item.attachmentsoptional || ""
              })) || [initialStaffingPlanItem]
            });
            
            if (planData.custom_lead) {
              setIsLoadingLead(true);
              try {
                const leadResponse = await frappeAPI.makeAuthenticatedRequest(
                  "GET",
                  `/resource/Lead/${planData.custom_lead}`
                );
                
                if (leadResponse && leadResponse.data) {
                  setSelectedLead(leadResponse.data);
                }
              } catch (leadError) {
                console.error('Error fetching lead details:', leadError);
                setError("Could not load lead details");
              } finally {
                setIsLoadingLead(false);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching plan details:', error);
          setError("Could not load plan details");
        } finally {
          setIsLoadingPlan(false);
        }
      } else if (leadId) {
        setIsLoadingLead(true);
        try {
          const response = await frappeAPI.makeAuthenticatedRequest(
            "GET",
            `/resource/Lead/${leadId}`
          );
          
          if (response && response.data) {
            const leadData: LeadType = response.data;
            setSelectedLead(leadData);
          }
          
        } catch (error) {
          console.error('Error fetching lead details:', error);
          setError("Could not load lead details");
        } finally {
          setIsLoadingLead(false);
        }
      }
    };

    handleInitialLoad();
  }, [searchParams]);

  useEffect(() => {
    if (selectedLead && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        name: capitalizeWords(`Staffing Plan - ${selectedLead.custom_full_name}`),
        custom_lead: selectedLead.name,
        to_date: selectedLead.custom_expected_close_date || prev.to_date
      }));
    }
  }, [selectedLead, isEditMode]);

  // Staffing Details Management
  const addStaffingItem = () => {
    setFormData(prev => ({
      ...prev,
      staffing_details: [
        ...prev.staffing_details,
        { ...initialStaffingPlanItem }
      ]
    }));
  };

  const removeStaffingItem = (index: number) => {
    if (formData.staffing_details.length > 1) {
      setFormData(prev => ({
        ...prev,
        staffing_details: prev.staffing_details.filter((_, i) => i !== index)
      }));
    }
  };

  const updateStaffingItem = (index: number, field: keyof StaffingPlanItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      staffing_details: prev.staffing_details.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // File Upload
  const handleFileUpload = async (file: File, index: number) => {
    if (!file) return;

    setUploadingFiles(prev => ({ ...prev, [index]: true }));

    try {
      const uploadResult = await frappeAPI.upload(file, {
        is_private: false,
        folder: "Home"
      });

      if (uploadResult.success) {
        updateStaffingItem(index, 'attachmentsoptional', uploadResult.file_url);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [index]: false }));
    }
  };

  // Assign User
  const handleAssignUser = async (userEmail: string, userName: string) => {
    setFormData(prev => ({
      ...prev,
      custom_assign_to: userEmail,
      assigned_to_full_name: userName
    }));
  };

  // Form Submission
  const handleSubmit = async () => {
    if (!selectedLead) {
      setError("Please select a lead first");
      return;
    }

    if (!formData.staffing_details.length) {
      setError("Please add at least one staffing requirement");
      return;
    }

    setIsSaving(true);
    setError("");
    
    try {
      const submissionData = {
        custom_lead: formData.custom_lead,
        from_date: formData.from_date,
        to_date: formData.to_date,
        custom_assign_to: formData.custom_assign_to || "",
        staffing_details: formData.staffing_details.map(item => ({
          currency: item.currency,
          designation: capitalizeWords(item.designation),
          vacancies: item.vacancies,
          estimated_cost_per_position: item.estimated_cost_per_position,
          number_of_positions: item.number_of_positions,
          min_experience_reqyrs: item.min_experience_reqyrs,
          job_description: `<div class="ql-editor read-mode"><p>${capitalizeWords(item.job_description)}</p></div>`,
          attachmentsoptional: item.attachmentsoptional || ""
        }))
      };

      let response;
      if (isEditMode && originalPlanId) {
        response = await frappeAPI.makeAuthenticatedRequest(
          "PUT",
          `/resource/Staffing Plan/${originalPlanId}`,
          submissionData
        );
        setSuccessMessage(`Plan updated: ${originalPlanId}`);
      } else {
        response = await frappeAPI.createStaffingPlan(submissionData);
        setSuccessMessage(`Plan created: ${response.data.name}`);
        
        if (!isEditMode) {
          setFormData(initialStaffingPlanForm);
          setSelectedLead(null);
        }
      }
      
      setTimeout(() => {
        setSuccessMessage("");
        router.push('/dashboard/sales-manager/requirements');
      }, 2000);
      
    } catch (error) {
      console.error("Error:", error);
      setError(isEditMode ? "Failed to update plan" : "Failed to create plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/sales-manager/requirements');
  };

  if (isLoadingPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Job Details</h3>
          <p className="text-gray-600">Please wait while we fetch the Job data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="flex gap-2 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? 'Edit Job Board' : 'Create Job Board'}
                </h1>
                {isEditMode && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Edit Mode
                  </span>
                )}
                {isLoadingLead && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Loading lead...
                  </div>
                )}
              </div>
              
              {/* Assign Button and Save Button */}
              <div className="flex items-center gap-2">
                {/* Assign Button */}
                <div className="relative">
                  {formData.custom_assign_to ? (
                    <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded text-sm">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                        {formData.assigned_to_full_name?.charAt(0).toUpperCase() || formData.custom_assign_to.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-32">
                        {formData.assigned_to_full_name || formData.custom_assign_to.split('@')[0]}
                      </span>
                      <button
                        onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                      className="flex items-center space-x-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded text-sm transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Assign</span>
                    </button>
                  )}
                  
                  <AssignDropdown
                    assignedUser={formData.custom_assign_to}
                    assignedUserName={formData.assigned_to_full_name}
                    onAssign={handleAssignUser}
                    isOpen={showAssignDropdown}
                    onToggle={() => setShowAssignDropdown(false)}
                  />
                </div>

                {/* Save Button */}
                {selectedLead && (
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving || !formData.custom_lead}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSaving ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}</span>
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            
            {!selectedLead && !isLoadingLead && (
              <LeadSearchSection 
                onLeadSelect={setSelectedLead} 
                selectedLead={selectedLead}
                disabled={isEditMode}
              />
            )}
            {selectedLead && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-800">
                <span className="font-medium">Selected Lead:</span> {selectedLead.custom_full_name} - {selectedLead.company_name}
                {!isEditMode && (
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="ml-2 text-green-600 hover:text-green-800 underline"
                  >
                    Change Lead
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form Content */}
          {selectedLead && (
            <div className="p-3">
              {/* Staffing Requirements Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-900">Requirements</h3>
                  </div>
                  <button
                    onClick={addStaffingItem}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Requirement</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr className="text-left text-gray-700 border-b border-gray-200">
                        <th className="p-3 font-medium min-w-[180px]">Designation</th>
                        <th className="p-3 font-medium min-w-[100px]">Vacancies</th>
                        <th className="p-3 font-medium min-w-[120px]">Salary/Position</th>
                        <th className="p-3 font-medium min-w-[100px]">Min Exp (Yrs)</th>
                        <th className="p-3 font-medium min-w-[100px]">Currency</th>
                        <th className="p-3 font-medium min-w-[120px]">Attachment</th>
                        <th className="p-3 font-medium min-w-[80px] text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.staffing_details.map((item, index) => (
                        <tr key={index} className="bg-white hover:bg-gray-50 transition-colors">
                          {/* Designation */}
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.designation}
                              onChange={(e) => updateStaffingItem(index, 'designation', e.target.value)}
                              onBlur={(e) => updateStaffingItem(index, 'designation', capitalizeWords(e.target.value))}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Software Developer"
                            />
                          </td>
                          
                          {/* Vacancies */}
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.vacancies || ''}
                              onChange={(e) => updateStaffingItem(index, 'vacancies', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              min="0"
                              placeholder="0"
                            />
                          </td>
                          
                          {/* Salary */}
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.estimated_cost_per_position || ''}
                              onChange={(e) => updateStaffingItem(index, 'estimated_cost_per_position', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          
                          {/* Min Experience */}
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.min_experience_reqyrs || ''}
                              onChange={(e) => updateStaffingItem(index, 'min_experience_reqyrs', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              step="0.5"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          
                          {/* Currency */}
                          <td className="p-3">
                            <select
                              value={item.currency}
                              onChange={(e) => updateStaffingItem(index, 'currency', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="INR">INR (₹)</option>
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                            </select>
                          </td>
                          
                          {/* Attachment */}
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors">
                                <Upload className="h-4 w-4" />
                                <span className="text-sm">Upload</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], index)}
                                />
                              </label>
                              {uploadingFiles[index] && (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                              )}
                              {item.attachmentsoptional && (
                                <FileText className="h-4 w-4 text-green-600"  />
                              )}
                            </div>
                          </td>
                          
                          {/* Action */}
                          <td className="p-3 text-center">
                            <button
                              onClick={() => removeStaffingItem(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={formData.staffing_details.length === 1}
                              title={formData.staffing_details.length === 1 ? "Cannot remove the only requirement" : "Remove requirement"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                {/* {formData.staffing_details.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Summary</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {formData.staffing_details.reduce((sum, item) => sum + item.vacancies, 0)}
                        </div>
                        <div className="text-blue-600 text-xs">Total Vacancies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {formData.staffing_details.reduce((sum, item) => sum + item.number_of_positions, 0)}
                        </div>
                        <div className="text-blue-600 text-xs">Total Positions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(formData.staffing_details.reduce((sum, item) => 
                            sum + (item.estimated_cost_per_position * item.vacancies), 0))}
                        </div>
                        <div className="text-blue-600 text-xs">Total Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {formData.staffing_details.length}
                        </div>
                        <div className="text-blue-600 text-xs">Job Types</div>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          {isLoadingLead ? (
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Loading Lead</h3>
              <p className="text-xs text-gray-500">Please wait while we load the lead details...</p>
            </div>
          ) : selectedLead ? (
            <LeadInfoSidebar lead={selectedLead} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Lead Selected</h3>
              <p className="text-xs text-gray-500">
                {isEditMode ? 'Lead information will appear here once loaded.' : 'Search and select a lead to create a staffing plan.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default StaffingPlanCreator;