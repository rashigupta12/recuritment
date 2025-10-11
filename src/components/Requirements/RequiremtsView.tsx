/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  Building,
  Clock,
  Edit,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  User,
  Users,
  Upload,
  Download, // Used for Unpublish icon (can be replaced with a more suitable icon)
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { SortableTableHeader } from "../recruiter/SortableTableHeader";
import { FilterState } from "../recruiter/TodoHeader";
import { JobOpeningModal } from "./requirement-view/JobopeningModal";
import Pagination from "../comman/Pagination";
import { TodosHeader } from "./Header";
import { formatToIndianCurrency } from "../Leads/helper";

// Type definitions
type StaffingPlanItem = {
  location: string;
  currency: string;
  designation: string;
  vacancies: number;
  currency_symbol: string;
  estimated_cost_per_position: number;
  number_of_positions: number;
  min_experience_reqyrs: number;
  job_description: string;
  attachmentsoptional?: string;
  assign_to?: string;
  job_id?: string;
  employment_type?: string;
  publish?: number; // Added to track publish status
};

type StaffingPlan = {
  custom_contact_name: string | null;
  custom_contact_phone: string;
  custom_contact_email: string;
  name: string;
  custom_lead: string;
  currency: string;
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

type SelectedJob = {
  staffingPlan: StaffingPlan;
  staffingDetail: StaffingPlanItem;
  planIndex: number;
  detailIndex: number;
  mode: "view" | "allocation";
};

type SortField =
  | "company"
  | "designation"
  | "location"
  | "experience"
  | "vacancies"
  | "budget"
  | "datetime";
type AllFields = SortField | "contact" | "status" | "actions";
type SortDirection = "asc" | "desc" | null;

// Main Staffing Plans Table Component
const StaffingPlansTable: React.FC = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<StaffingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<StaffingPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [publishingJobs, setPublishingJobs] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { user } = useAuth();

  // Check if user is project manager
  const isProjectManager = user?.roles?.includes("Projects Manager") || false;

  // Filter state for TodosHeader
  const [filterState, setFilterState] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    clients: [],
    locations: [],
    jobTitles: [],
    status: "",
    contacts: [],
    dateRange: "all",
    vacancies: "all",
  });

  // Collect unique values for filters
  const uniqueCompanies = useMemo(
    () =>
      Array.from(
        new Set(
          plans
            .map((plan) => plan.company)
            .filter((company): company is string => typeof company === "string" && company.trim() !== "")
        )
      ),
    [plans]
  );
  const uniqueContacts = useMemo(
    () =>
      Array.from(
        new Set(
          plans
            .map((plan) => plan.custom_contact_name)
            .filter((contact): contact is string => typeof contact === "string" && contact.trim() !== "")
        )
      ),
    [plans]
  );
  const uniquePositions = useMemo(
    () =>
      Array.from(
        new Set(
          plans
            .flatMap((plan) => plan.staffing_details.map((detail) => detail.designation))
            .filter((designation): designation is string => typeof designation === "string" && designation.trim() !== "")
        )
      ),
    [plans]
  );

  // Filter configuration for TodosHeader
  const filterConfig = useMemo(
    () => [
      {
        id: "clients",
        title: "Company",
        icon: Building,
        options: uniqueCompanies,
        searchKey: "company",
        showInitialOptions: false,
      },
      {
        id: "jobTitles",
        title: "Position",
        icon: User,
        options: uniquePositions,
        searchKey: "designation",
        showInitialOptions: false,
      },
      {
        id: "contacts",
        title: "Contact",
        icon: User,
        options: uniqueContacts,
        searchKey: "contact",
        showInitialOptions: false,
      },
    ],
    [uniqueCompanies, uniqueContacts, uniquePositions]
  );

  const handleSort = (field: AllFields) => {
    if (field === "contact" || field === "status" || field === "actions")
      return;

    if (sortField === field) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else setSortDirection("asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const columns = useMemo(() => {
    const cols: Array<{
      field: AllFields;
      label: string;
      sortable?: boolean;
      align?: "left" | "center" | "right";
      width?: string;
    }> = [
      { field: "datetime", label: "Date", sortable: true, align: "center" },
      {
        field: "company",
        label: "Company & Contact",
        sortable: true,
        width: "200px",
        align: "center",
      },
      { field: "designation", label: "Position Details", sortable: true, align: "center" },
      { field: "location", label: "Location & Experience", sortable: true, align: "center" },
      { field: "vacancies", label: "Vacancies & Budget", sortable: true, align: "center" },
      { field: "actions", label: "Action", sortable: false, align: "center" },
    ];
    return cols;
  }, []);

  const fetchStaffingPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.get_staffing_plan.get_staffing_plans_with_children`
      );

      const plansData = response.message?.data || [];
      console.log("Fetched plans:", plansData);
      setPlans(plansData);
      setFilteredPlans(plansData);
    } catch (error) {
      console.error("Error fetching staffing plans:", error);
      setError("Failed to load staffing plans. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Combined filtering and sorting logic with frontend pagination
  const paginatedPlans = useMemo(() => {
    let filtered = [...plans];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          (plan.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (plan.custom_contact_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.staffing_details.some(
            (detail) =>
              (detail.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (detail.location || "").toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply filters from TodosHeader
    if (filterState.clients.length > 0) {
      filtered = filtered.filter((plan) =>
        filterState.clients.includes(plan.company || "")
      );
    }
    if (filterState.contacts.length > 0) {
      filtered = filtered.filter((plan) =>
        plan.custom_contact_name && filterState.contacts.includes(plan.custom_contact_name)
      );
    }
    if (filterState.jobTitles.length > 0) {
      filtered = filtered.filter((plan) =>
        plan.staffing_details.some((detail) =>
          filterState.jobTitles.includes(detail.designation || "")
        )
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aDetail = a.staffing_details[0] || {};
        const bDetail = b.staffing_details[0] || {};

        let valueA: any;
        let valueB: any;

        switch (sortField) {
          case "company":
            valueA = (a.company || "").toLowerCase();
            valueB = (b.company || "").toLowerCase();
            break;
          case "designation":
            valueA = (aDetail.designation || "").toLowerCase();
            valueB = (bDetail.designation || "").toLowerCase();
            break;
          case "location":
            valueA = (aDetail.location || "").toLowerCase();
            valueB = (bDetail.location || "").toLowerCase();
            break;
          case "experience":
            valueA = aDetail.min_experience_reqyrs || 0;
            valueB = bDetail.min_experience_reqyrs || 0;
            break;
          case "vacancies":
            valueA = aDetail.vacancies || 0;
            valueB = bDetail.vacancies || 0;
            break;
          case "budget":
            valueA = aDetail.estimated_cost_per_position || 0;
            valueB = bDetail.estimated_cost_per_position || 0;
            break;
          case "datetime":
            valueA = new Date(a.creation || "").getTime();
            valueB = new Date(b.creation || "").getTime();
            break;
          default:
            return 0;
        }

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Update filtered plans for rendering filter counts
    setFilteredPlans(filtered);

    // Apply frontend pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [plans, searchTerm, filterState, sortField, sortDirection, currentPage, itemsPerPage]);

  // Calculate total pages based on filtered data
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);

  useEffect(() => {
    fetchStaffingPlans();
  }, []);

  // Reset to first page when filters or search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterState]);

  // Handle filter changes from TodosHeader
  const handleFilterChange = (newFilters: FilterState) => {
    console.log("Applying filters:", newFilters);
    setFilterState(newFilters);
  };

  const handleAllocation = (
    plan: StaffingPlan,
    detail: StaffingPlanItem,
    planIndex: number,
    detailIndex: number
  ) => {
    setSelectedJob({
      staffingPlan: plan,
      staffingDetail: detail,
      planIndex,
      detailIndex,
      mode: "allocation",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (planName: string) => {
    router.push(
      `/dashboard/recruiter/requirements/create?planId=${planName}&mode=edit`
    );
  };

  const handleCreate = async () => {
    await router.push(`/dashboard/recruiter/requirements/create`);
  };

  const handlePublish = async (
    jobId: string,
    planIndex: number,
    detailIndex: number,
    isPublished: boolean
  ) => {
    setPublishingJobs((prev) => new Set(prev).add(jobId));

    try {
      await frappeAPI.makeAuthenticatedRequest(
        "PUT",
        `/resource/Job Opening/${jobId}`,
        { publish: isPublished ? 0 : 1 }
      );

      // Update the local state to reflect the new publish status
      setPlans((prevPlans) => {
        const newPlans = [...prevPlans];
        newPlans[planIndex] = {
          ...newPlans[planIndex],
          staffing_details: newPlans[planIndex].staffing_details.map(
            (detail, idx) =>
              idx === detailIndex ? { ...detail, publish: isPublished ? 0 : 1 } : detail
          ),
        };
        return newPlans;
      });

      alert(isPublished ? "Job opening unpublished successfully!" : "Job opening published successfully!");
    } catch (error) {
      console.error(`Error ${isPublished ? "unpublishing" : "publishing"} job:`, error);
      alert(`Failed to ${isPublished ? "unpublish" : "publish"} job opening. Please try again.`);
    } finally {
      setPublishingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleJobSuccess = (
    planIndex: number,
    detailIndex: number,
    updates: Partial<StaffingPlanItem>
  ) => {
    setPlans((prevPlans) => {
      const newPlans = [...prevPlans];
      newPlans[planIndex] = {
        ...newPlans[planIndex],
        staffing_details: newPlans[planIndex].staffing_details.map(
          (detail, idx) =>
            idx === detailIndex ? { ...detail, ...updates } : detail
        ),
      };
      return newPlans;
    });
    setIsModalOpen(false);
  };

  const formatDateAndTimeV2 = (dateString?: string) => {
    if (!dateString) return { date: "-", time: "-" };
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return { date: formattedDate, time: formattedTime };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto">
        {/* Header with filters */}
        <TodosHeader
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={() => fetchStaffingPlans()}
          totalJobs={plans.length}
          filteredJobs={filteredPlans.length}
          uniqueClients={uniqueCompanies}
          uniqueContacts={uniqueContacts}
          uniqueJobTitles={uniquePositions}
          uniqueStatus={[] as string[]}
          onFilterChange={handleFilterChange}
          filterConfig={filterConfig}
          title="Customers Requirements"
          oncreateButton={handleCreate}
        />

        {/* Main Table */}
        {isLoading ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Staffing Plans
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch your data...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchStaffingPlans()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mx-auto transition-colors"
            >
              <span>Try Again</span>
            </button>
          </div>
        ) : paginatedPlans.length > 0 ? (
          <>
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <SortableTableHeader
                    columns={columns}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="bg-blue-500 text-white"
                  />
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedPlans.map((plan, planIndex) => (
                      <React.Fragment key={plan.name}>
                        {plan.staffing_details.map((detail, detailIndex) => (
                          <tr
                            key={`${plan.name}-${detailIndex}`}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {plan.creation && (
                              <td className="px-4 py-2 whitespace-nowrap text-md text-gray-900">
                                {(() => {
                                  const { date, time } = formatDateAndTimeV2(
                                    plan.creation
                                  );
                                  return (
                                    <div className="flex flex-col leading-tight">
                                      <span>{date}</span>
                                      <span className="text-md text-gray-500">
                                        {time}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>
                            )}

                            {detailIndex === 0 && (
                              <td
                                className="px-4 py-3 align-top"
                                rowSpan={plan.staffing_details.length}
                                width={"300px"}
                              >
                                <div className="flex flex-col space-y-1 max-w-[250px]">
                                  <div className="group relative">
                                    <div className="flex items-center">
                                      <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                      <span className="font-semibold text-gray-900 text-md leading-tight line-clamp-2">
                                        {plan.company || "-"}
                                      </span>
                                    </div>
                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-md rounded py-1 px-2 z-10 whitespace-nowrap">
                                      {plan.company || "-"}
                                    </div>
                                  </div>
                                  <div className="text-md text-gray-600 space-y-0.5">
                                    <div
                                      className="flex items-center truncate"
                                      title={plan.custom_contact_name || "-"}
                                    >
                                      <User className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                      <span className="truncate">
                                        {plan.custom_contact_name || "-"}
                                      </span>
                                    </div>
                                    <div className="flex items-center truncate">
                                      <Phone className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                      <span className="truncate">
                                        {plan.custom_contact_phone || "-"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            )}

                            <td className="px-4 py-4 capitalize">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 text-md">
                                  {detail.designation || "-"}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center text-md text-gray-600">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                  <span>{detail.location || "-"}</span>
                                </div>
                                <div className="flex items-center text-md text-gray-600">
                                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                  <span>
                                    {detail.min_experience_reqyrs || 0}+ years
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-col space-y-2">
                                {(() => {
                                  const allocated = detail.assign_to
                                    ? detail.assign_to
                                      .split(",")
                                      .reduce((sum, item) => {
                                        const [, allocation] = item
                                          .trim()
                                          .split("-");
                                        return (
                                          sum + (parseInt(allocation) || 0)
                                        );
                                      }, 0)
                                    : 0;
                                  const remaining = detail.vacancies - allocated;
                                  return (
                                    <div className="flex items-center text-md">
                                      <Users className="h-4 w-4 text-green-500 mr-1" />
                                      <span className="font-semibold text-green-600">
                                        {detail.vacancies}
                                      </span>
                                      <span className="text-gray-400 mx-1">
                                        |
                                      </span>
                                      <span className="text-blue-600 font-medium">
                                        {allocated}
                                      </span>
                                      <span className="text-gray-500 text-md ml-0.5">
                                        alloc
                                      </span>
                                      <span className="text-gray-400 mx-1">
                                        |
                                      </span>
                                      <span className="text-orange-600 font-medium">
                                        {remaining}
                                      </span>
                                      <span className="text-gray-500 text-md ml-0.5">
                                        left
                                      </span>
                                    </div>
                                  );
                                })()}
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900">
                                    {formatToIndianCurrency(Number(detail.estimated_cost_per_position), detail.currency || "")}L
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-1 flex-wrap gap-2">
                                {isProjectManager ? (
                                  detail.job_id && (
                                    <button
                                      onClick={() =>
                                        handleAllocation(
                                          plan,
                                          detail,
                                          planIndex,
                                          detailIndex
                                        )
                                      }
                                      className="flex items-center px-3 py-1.5 text-white bg-green-600 hover:bg-green-700 rounded text-md transition-colors"
                                      title="Manage Allocation"
                                    >
                                      <Users className="h-4 w-4 mr-1" />
                                      Allocation
                                    </button>
                                  )
                                ) : (
                                  <>
                                    <div className="relative group">
                                      <button
                                        onClick={() => handleEdit(plan.name)}
                                        className="flex items-center px-1 py-1.5 text-blue-500 rounded text-md transition-colors"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <span
                                        className="absolute left-1/2 -translate-x-1/2 -top-7 
                                          px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 
                                          group-hover:opacity-100 transform -translate-y-1 
                                          group-hover:-translate-y-2 transition-all duration-200 pointer-events-none whitespace-nowrap"
                                      >
                                        Edit Staffing Plan
                                      </span>
                                    </div>

                                    {detail.job_id && (
                                      <div className="relative group">
                                        <button
                                          onClick={() =>
                                            handlePublish(
                                              detail.job_id!,
                                              planIndex,
                                              detailIndex,
                                              detail.publish === 1
                                            )
                                          }
                                          disabled={publishingJobs.has(
                                            detail.job_id
                                          )}
                                          className={`flex items-center px-3 py-1.5 rounded text-md transition-colors ${
                                            detail.publish === 1
                                              ? "text-red-500 hover:text-red-600"
                                              : "text-blue-600 hover:text-blue-700"
                                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                          {publishingJobs.has(detail.job_id) ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                          ) : detail.publish === 1 ? (
                                            <Download className="h-4 w-4 mr-1" />
                                          ) : (
                                            <Upload className="h-4 w-4 mr-1" />
                                          )}
                                          <span>
                                            {detail.publish === 1
                                              ? "Unpublish"
                                              : "Publish"}
                                          </span>
                                        </button>
                                        <span
                                          className="absolute left-1/2 -translate-x-1/2 -top-7 
                                            px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 
                                            group-hover:opacity-100 transform -translate-y-1 
                                            group-hover:-translate-y-2 transition-all duration-200 pointer-events-none whitespace-nowrap"
                                        >
                                          {publishingJobs.has(detail.job_id)
                                            ? detail.publish === 1
                                              ? "Unpublishing..."
                                              : "Publishing..."
                                            : detail.publish === 1
                                            ? "Unpublish"
                                            : "Publish"}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}
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

            {/* Reusable Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={filteredPlans.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center mt-4">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterState.clients.length > 0 || filterState.contacts.length > 0 || filterState.jobTitles.length > 0
                ? "No matching results found"
                : "No job openings available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterState.clients.length > 0 || filterState.contacts.length > 0 || filterState.jobTitles.length > 0
                ? "Try adjusting your search terms or filters"
                : "Start by creating your first staffing plan"}
            </p>
          </div>
        )}

        {selectedJob && (
          <JobOpeningModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            staffingPlan={selectedJob.staffingPlan}
            staffingDetail={selectedJob.staffingDetail}
            planIndex={selectedJob.planIndex}
            detailIndex={selectedJob.detailIndex}
            onSuccess={handleJobSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default StaffingPlansTable;