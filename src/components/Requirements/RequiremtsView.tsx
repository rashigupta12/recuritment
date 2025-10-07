'use client'
import { frappeAPI } from '@/lib/api/frappeClient';
import {
  AlertCircle,
  Building,
  Clock,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { JobOpeningModal } from './requirement-view/JobopeningModal';
import { useAuth } from '@/contexts/AuthContext';


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

// Main Staffing Plans Table Component
const StaffingPlansTable: React.FC = () => {
  const [plans, setPlans] = useState<StaffingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<StaffingPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useAuth()

  const fetchStaffingPlans = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/resource/Staffing Plan?filters=[["owner","=","${user?.email}"]]&order_by=creation%20desc`
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

  console.log(plans)

  useEffect(() => {
    fetchStaffingPlans();
  }, []);


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

const handleJobSuccess = (planIndex: number,
  detailIndex: number,
  updates: Partial<StaffingPlanItem>) => {
  setPlans((prevPlans) => {
    const newPlans = [...prevPlans];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      staffing_details: newPlans[planIndex].staffing_details.map((detail, idx) =>
        idx === detailIndex ? { ...detail, ...updates } : detail
      ),
    };
    return newPlans;
  });
  setIsModalOpen(false); // close modal on success
};


const formatCompanyName = (name: string) => {
  if (!name) return "-";
  const trimmed = name.trim();

  // if short, return as is
  if (trimmed.length <= 30) return trimmed;

  // find nearest space before 30th character
  const splitIndex = trimmed.lastIndexOf(" ", 30);
  if (splitIndex === -1) return trimmed; // no space found, skip splitting

  return `${trimmed.slice(0, splitIndex)}\n${trimmed.slice(splitIndex + 1)}`;
};



  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="w-full mx-auto">
        <div className="mb-2">
          <div className="flex items-center justify-between ">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
              <p className="text-gray-600 mt-2">Manage and track all staffing requirements</p>
            </div>
            
            <div className="relative max-w-4xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, contact, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md"
              />
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
                    <th className="px-6 py-4 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                      Company &<br/> Contact
                    </th>
                    <th className="px-6 py-4 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                      Position Details
                    </th>
                    <th className="px-6 py-4 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                      Location &<br/> Experience
                    </th>
                    <th className="px-6 py-4 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                      Vacancies &<br/> Budget
                    </th>
                    <th className="px-6 py-4 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlans.map((plan, planIndex) => (
                    <React.Fragment key={plan.name}>
                      {plan.staffing_details.map((detail, detailIndex) => (
                        <tr key={`${plan.name}-${detailIndex}`} className="hover:bg-gray-50 transition-colors">
                          {detailIndex === 0 && (
                            <td className="px-4 py-3 align-top" rowSpan={plan.staffing_details.length}>
  <div className="flex flex-col space-y-1 max-w-[180px]"> {/* Fixed max width */}
    {/* Company with tooltip */}
    <div className="group relative">
      <div className="flex items-center">
        <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
        <span className="font-semibold text-gray-900 text-md leading-tight line-clamp-2">
          {plan.company}
        </span>
      </div>
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-md rounded py-1 px-2 z-10 whitespace-nowrap">
        {plan.company}
      </div>
    </div>
    
    {/* Contact info - more compact */}
    <div className="text-md text-gray-600 space-y-0.5">
      <div className="flex items-center truncate" title={plan.custom_contact_name}>
        <User className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
        <span className="truncate">{plan.custom_contact_name}</span>
      </div>
      <div className="flex items-center truncate">
        <Phone className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
        <span className="truncate">{plan.custom_contact_phone}</span>
      </div>
    </div>
  </div>
</td>
                          )}

                          <td className="px-6 py-4 capitalize">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-md">{detail.designation}</span>
                              <div className="text-md text-gray-500 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  {detail.number_of_positions} {detail.number_of_positions === 1 ? 'Position' : 'Positions'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center text-md text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{detail.location}</span>
                              </div>
                              <div className="flex items-center text-md text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{detail.min_experience_reqyrs}+ years exp</span>
                              </div>
                            </div>
                          </td>

                       <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              {(() => {
                                const allocated = detail.assign_to ? detail.assign_to.split(',').reduce((sum, item) => {
                                  const [, allocation] = item.trim().split('-');
                                  return sum + (parseInt(allocation) || 0);
                                }, 0) : 0;
                                const remaining = detail.vacancies - allocated;
                                return (
                                  <div className="flex items-center text-md">
                                    <Users className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="font-semibold text-green-600">{detail.vacancies}</span>
                                    <span className="text-gray-400 mx-1">|</span>
                                    <span className="text-blue-600 font-medium">{allocated}</span>
                                    <span className="text-gray-500 text-md ml-0.5">alloc</span>
                                    <span className="text-gray-400 mx-1">|</span>
                                    <span className="text-orange-600 font-medium">{remaining}</span>
                                    <span className="text-gray-500 text-md ml-0.5">left</span>
                                  </div>
                                );
                              })()}
                              <div className="flex items-center">
                                <IndianRupee className="h-4 w-4 text-purple-500 mr-1" />
                                <span className="font-medium text-gray-900">
                                  {detail.estimated_cost_per_position}L
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              {detail.job_id ? (
                                <>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-md bg-green-100 text-green-800">
                                    Job Created
                                  </span>
                                  {detail.assign_to && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-md bg-blue-100 text-blue-800">
                                      Allocated
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-md bg-gray-100 text-gray-800">
                                  Pending
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCreateOpening(plan, detail, planIndex, detailIndex)}
                                className={`flex items-center px-3 py-1.5 text-white rounded text-md transition-colors ${
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