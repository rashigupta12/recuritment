/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  Building,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  Filter,
  IndianRupee,
  Loader2,
  MapPin,
  PaintBucket,
  Phone,
  Plus,
  RefreshCw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { JobOpeningModal } from "./requirement-view/JobopeningModal";
import { useAuth } from "@/contexts/AuthContext";
import { SortableTableHeader } from "../recruiter/SortableTableHeader";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// FilterConfig and FilterState interfaces for TodosHeader
interface FilterConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  options: string[];
  searchKey?: string;
  alwaysShowOptions?: boolean;
  type?: 'checkbox' | 'radio';
  optionLabels?: Record<string, string>;
  showInitialOptions?: boolean;
}

interface FilterState {
  company: string[];
  contact: string[];
  designation: string[];
}

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
  employment_type?: string;
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

// TodosHeader Component
interface TodosHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => Promise<void>;
  totalJobs?: number;
  filteredJobs?: number;
  uniqueCompany?: string[];
  uniqueContact?: string[];
  uniqueDesignation?: string[];
  onFilterChange?: (filters: FilterState) => void;
  filterConfig?: FilterConfig[];
  title?: string;
   onAddButton: () => Promise<void>;

}

const TodosHeader = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  totalJobs = 0,
  filteredJobs = 0,
  uniqueCompany = [],
  uniqueContact = [],
  uniqueDesignation = [],
  onFilterChange,
  filterConfig = [],
  title = 'Customers Requirements',
  onAddButton
}: TodosHeaderProps) => {
  const [filters, setFilters] = useState<FilterState>({
    company: [],
    contact: [],
    designation: [],
  });

  const [searchStates, setSearchStates] = useState<Record<string, string>>({
    company: '',
    contact: '',
    designation: '',
  });
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    const current = filters[type];
    if (Array.isArray(current)) {
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const newFilters = { ...filters, [type]: newValue };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    }
  };

  const clearAllFilters = () => {
    const resetFilters: FilterState = {
      company: [],
      contact: [],
      designation: [],
    };
    setFilters(resetFilters);
    setSearchStates({
      company: '',
      contact: '',
      designation: '',
    });
    onFilterChange?.(resetFilters);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const getFilteredOptions = (section: FilterConfig, options: string[]) => {
    const searchKey = searchStates[section.id] || '';
    if (section.searchKey) {
      if (section.showInitialOptions) {
        return searchKey ? options.filter((option) =>
          option.toLowerCase().includes(searchKey.toLowerCase())
        ) : options;
      } else {
        return searchKey ? options.filter((option) =>
          option.toLowerCase().includes(searchKey.toLowerCase())
        ) : [];
      }
    } else {
      return options;
    }
  };

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count;
  }, 0);

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">{title}</h1>
         
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex-1 min-w-[250px] max-w-md items-end justify-end relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."

              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 ${activeFilterCount > 0
                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                    : ''
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-blue-600 text-white px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                      <Filter className="w-5 h-5" />
                      Filters
                    </SheetTitle>
                  </div>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="p-6 py-2 space-y-4">
                    {activeFilterCount > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
                        <div className="flex flex-wrap gap-2">
                          {filters.company.map((company) => (
                            <Badge key={company} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                              Company: {company}
                              <button
                                onClick={() => toggleFilter('company', company)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.contact.map((contact) => (
                            <Badge key={contact} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                              Contact: {contact}
                              <button
                                onClick={() => toggleFilter('contact', contact)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.designation.map((designation) => (
                            <Badge key={designation} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                              Position: {designation}
                              <button
                                onClick={() => toggleFilter('designation', designation)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Separator />
                      </div>
                    )}
                    {filterConfig.map((section) => {
                      const options = section.options;
                      const filteredOptions = getFilteredOptions(section, options);
                      const isOpen = openSection === section.id;

                      return (
                        <div key={section.id} className="space-y-3">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <section.icon className="w-4 h-4 text-gray-600" />
                              {section.title}
                            </span>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {isOpen && (
                            <div className="space-y-1 pl-6">
                              {section.searchKey && (
                                <div className="relative mb-1">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    placeholder={`Search ${section.title.toLowerCase()}...`}
                                    value={searchStates[section.id]}
                                    onChange={(e) =>
                                      setSearchStates({ ...searchStates, [section.id]: e.target.value })
                                    }
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              )}
                              {filteredOptions.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {filteredOptions.map((option) => (
                                    <label
                                      key={option}
                                      className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={filters[section.id as keyof FilterState].includes(option)}
                                        onChange={() =>
                                          toggleFilter(section.id as keyof FilterState, option)
                                        }
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        {option}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-3 text-sm text-gray-500">
                                  {searchStates[section.id].length > 0 &&
                                    `No ${section.title.toLowerCase()} found`}
                                </div>
                              )}
                            </div>
                          )}
                          {section.id !== filterConfig[filterConfig.length - 1]?.id && <Separator />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="flex-1 border-gray-300 hover:bg-gray-200"
                    >
                      Clear All
                    </Button>
                    <SheetTrigger asChild>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Show Results
                      </Button>
                    </SheetTrigger>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              className="h-10 w-10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={onAddButton}
              className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
            </Button>
          </div>
        </div>
      </div>
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Active filters:</span>
          {filters.company.map((company) => (
            <Badge key={company} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              Company: {company}
              <button
                onClick={() => toggleFilter('company', company)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.contact.map((contact) => (
            <Badge key={contact} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              Contact: {contact}
              <button
                onClick={() => toggleFilter('contact', contact)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.designation.map((designation) => (
            <Badge key={designation} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              Position: {designation}
              <button
                onClick={() => toggleFilter('designation', designation)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-blue-600 hover:text-blue-700 h-auto px-2 py-1 text-sm"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

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
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    company: [],
    contact: [],
    designation: [],
  });

  // Check if user is project manager
  const isProjectManager = user?.roles?.includes("Project Manager") || false;

  // Filter configuration
  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      id: 'company',
      title: 'Company',
      icon: Building,
      options: Array.from(new Set(plans.map(plan => plan.company))),
      searchKey: 'company',
      showInitialOptions: false,
    },
    {
      id: 'contact',
      title: 'Contact',
      icon: User,
      options: Array.from(new Set(plans.map(plan => plan.custom_contact_name))),
      searchKey: 'contact',
      showInitialOptions: false,
    },
    {
      id: 'designation',
      title: 'Position',
      icon: Users,
      options: Array.from(new Set(plans.flatMap(plan => plan.staffing_details.map(detail => detail.designation)))),
      searchKey: 'designation',
      showInitialOptions: false,
    },
  ], [plans]);

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
      { field: "datetime", label: "Date", align: "center" },
      {
        field: "company",
        label: "Company & Contact",
        width: "200px",
        align: "center",
      },
      { field: "designation", label: "Position Details", align: "center" },
      { field: "location", label: "Location & Experience", align: "center" },
      { field: "vacancies", label: "Vacancies & Budget", align: "center" },
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

      const validPlans = detailedPlans.filter(
        (plan) => plan !== null
      ) as StaffingPlan[];
      setPlans(validPlans);
      setFilteredPlans(validPlans);
    } catch (error) {
      console.error("Error fetching staffing plans:", error);
      setError("Failed to load staffing plans. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffingPlans();
  }, []);

  useEffect(() => {
    let filtered = [...plans];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.custom_contact_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          plan.staffing_details.some(
            (detail) =>
              detail.designation
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              detail.location.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply filters
    if (filters.company.length > 0) {
      filtered = filtered.filter(plan => filters.company.includes(plan.company));
    }
    if (filters.contact.length > 0) {
      filtered = filtered.filter(plan => filters.contact.includes(plan.custom_contact_name));
    }
    if (filters.designation.length > 0) {
      filtered = filtered.filter(plan =>
        plan.staffing_details.some(detail => filters.designation.includes(detail.designation))
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      const sortedFiltered: StaffingPlan[] = [];
      filtered.forEach((plan) => {
        const sortedDetails = [...plan.staffing_details].sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (sortField) {
            case "designation":
              aValue = a.designation.toLowerCase();
              bValue = b.designation.toLowerCase();
              break;
            case "location":
              aValue = a.location.toLowerCase();
              bValue = b.location.toLowerCase();
              break;
            case "experience":
              aValue = a.min_experience_reqyrs;
              bValue = b.min_experience_reqyrs;
              break;
            case "vacancies":
              aValue = a.vacancies;
              bValue = b.vacancies;
              break;
            case "budget":
              aValue = a.estimated_cost_per_position;
              bValue = b.estimated_cost_per_position;
              break;
            case "company":
              aValue = plan.company.toLowerCase();
              bValue = plan.company.toLowerCase();
              break;
            default:
              return 0;
          }

          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });

        sortedFiltered.push({
          ...plan,
          staffing_details: sortedDetails,
        });
      });

      if (sortField === "company") {
        sortedFiltered.sort((a, b) => {
          const aValue = a.company.toLowerCase();
          const bValue = b.company.toLowerCase();
          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });
      }

      filtered = sortedFiltered;
    }

    setFilteredPlans(filtered);
  }, [searchTerm, plans, sortField, sortDirection, filters]);

  const handleViewDetails = (
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
      mode: "view",
    });
    setIsModalOpen(true);
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

  const handlePublish = async (
    jobId: string,
    planIndex: number,
    detailIndex: number
  ) => {
    setPublishingJobs((prev) => new Set(prev).add(jobId));

    try {
      await frappeAPI.makeAuthenticatedRequest(
        "PUT",
        `/resource/Job Opening/${jobId}`,
        { publish: 1 }
      );

      alert("Job opening published successfully!");
    } catch (error) {
      console.error("Error publishing job:", error);
      alert("Failed to publish job opening. Please try again.");
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

 const handleAddbutton = async () => {
  router.push(`/dashboard/recruiter/requirements/create`);
};

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  console.log(plans);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto">
        <TodosHeader
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchStaffingPlans}
          totalJobs={plans.length}
          filteredJobs={filteredPlans.length}
          uniqueCompany={Array.from(new Set(plans.map(plan => plan.company)))}
          uniqueContact={Array.from(new Set(plans.map(plan => plan.custom_contact_name)))}
          uniqueDesignation={Array.from(new Set(plans.flatMap(plan => plan.staffing_details.map(detail => detail.designation))))}
          onFilterChange={handleFilterChange}
          filterConfig={filterConfig}
          onAddButton={handleAddbutton}
        />
        

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
                <SortableTableHeader
                  columns={columns}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="bg-blue-500 text-white"
                />
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlans.map((plan, planIndex) => (
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
                                      {plan.company}
                                    </span>
                                  </div>
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-md rounded py-1 px-2 z-10 whitespace-nowrap">
                                    {plan.company}
                                  </div>
                                </div>
                                <div className="text-md text-gray-600 space-y-0.5">
                                  <div
                                    className="flex items-center truncate"
                                    title={plan.custom_contact_name}
                                  >
                                    <User className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                      {plan.custom_contact_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center truncate">
                                    <Phone className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                      {plan.custom_contact_phone}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}

                          <td className="px-4 py-4 capitalize">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-md">
                                {detail.designation}
                              </span>
                              <div className="text-md text-gray-500 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  {detail.number_of_positions}{" "}
                                  {detail.number_of_positions === 1
                                    ? "Position"
                                    : "Positions"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center text-md text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{detail.location}</span>
                              </div>
                              <div className="flex items-center text-md text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                <span>
                                  {detail.min_experience_reqyrs}+ years exp
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
                                <IndianRupee className="h-4 w-4 text-purple-500 mr-1" />
                                <span className="font-medium text-gray-900">
                                  {detail.estimated_cost_per_position}L
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-1 flex-wrap gap-2">
                              <div className="relative group">
                                <button
                                  onClick={() =>
                                    handleViewDetails(
                                      plan,
                                      detail,
                                      planIndex,
                                      detailIndex
                                    )
                                  }
                                  className="flex items-center px-1 py-1.5 text-blue-500 rounded text-md transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <span
                                  className="absolute left-1/2 -translate-x-1/2 -top-7 
    px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 
    group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
                                >
                                  View Details
                                </span>
                              </div>

                              {detailIndex === 0 && (
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
                              )}

                              {detail.job_id && (
                                <div className="relative group">
                                  <button
                                    onClick={() =>
                                      handlePublish(
                                        detail.job_id!,
                                        planIndex,
                                        detailIndex
                                      )
                                    }
                                    disabled={publishingJobs.has(detail.job_id)}
                                    className="flex items-center px-1 py-1.5 text-blue-500 rounded text-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {publishingJobs.has(detail.job_id) ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      </>
                                    ) : (
                                      <>
                                        <PaintBucket className="h-4 w-4 mr-1" />
                                      </>
                                    )}
                                  </button>
                                  <span
                                    className="absolute left-1/2 -translate-x-1/2 -top-7 
      px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 
      group-hover:opacity-100 transform -translate-y-1 
      group-hover:-translate-y-2 transition-all duration-200 pointer-events-none whitespace-nowrap"
                                  >
                                    {publishingJobs.has(detail.job_id)
                                      ? "Publishing..."
                                      : "Publish"}
                                  </span>
                                </div>
                              )}

                              {isProjectManager && detail.job_id && (
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
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filters.company.length > 0 || filters.contact.length > 0 || filters.designation.length > 0
                ? "No matching results found"
                : "No job openings available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filters.company.length > 0 || filters.contact.length > 0 || filters.designation.length > 0
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