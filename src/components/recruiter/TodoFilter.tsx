/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, RefreshCw, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FilterConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  options: string[];
  searchKey?: string;
  alwaysShowOptions?: boolean;
  type?: "checkbox" | "radio";
  optionLabels?: Record<string, string>;
  showInitialOptions?: boolean;
}

export interface FilterState {
  departments: string[];
  assignedBy: string[];
  clients: string[];
  locations: string[];
  jobTitles: string[];
  status: string[];
  contacts: string[];
  dateRange: "all" | "today" | "week" | "month";
  vacancies: "all" | "single" | "multiple";
}

interface TodoFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => Promise<void>;
  totalJobs?: number;
  filteredJobs?: number;
  uniqueDepartments?: string[];
  uniqueAssigners?: string[];
  uniqueClients?: string[];
  uniqueLocations?: string[];
  uniqueJobTitles?: string[];
  uniqueStatus?: string[];
  uniqueContacts?: string[];
  onFilterChange?: (filters: FilterState) => void;
  filterConfig?: FilterConfig[];
  title?: string;
}

export const TodoFilter = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  totalJobs = 0,
  filteredJobs = 0,
  uniqueDepartments = [],
  uniqueAssigners = [],
  uniqueClients = [],
  uniqueLocations = [],
  uniqueJobTitles = [],
  uniqueStatus = [],
  uniqueContacts = [],
  onFilterChange,
  filterConfig = [],
  title = "My Jobs",
}: TodoFilterProps) => {
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    clients: [],
    locations: [],
    jobTitles: [],
    status: [],
    contacts: [],
    dateRange: "all",
    vacancies: "all",
  });

  const [searchStates, setSearchStates] = useState<Record<string, string>>({
    clients: "",
    locations: "",
    jobTitles: "",
    status: "",
    departments: "",
    assignedBy: "",
    contacts: "",
  });
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    if (type === "dateRange" || type === "vacancies") {
      const newFilters = { ...filters, [type]: filters[type] === value ? "all" : value };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      const current = filters[type];
      if (Array.isArray(current)) {
        const newValue = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        const newFilters = { ...filters, [type]: newValue };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      }
    }
  };

  const clearAllFilters = () => {
    const resetFilters: FilterState = {
      departments: [],
      assignedBy: [],
      clients: [],
      locations: [],
      jobTitles: [],
      status: [],
      contacts: [],
      dateRange: "all",
      vacancies: "all",
    };
    setFilters(resetFilters);
    setSearchStates({
      clients: "",
      locations: "",
      jobTitles: "",
      status: "",
      departments: "",
      assignedBy: "",
      contacts: "",
    });
    onFilterChange?.(resetFilters);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const getFilteredOptions = (section: FilterConfig, options: string[]) => {
    const searchKey = searchStates[section.id] || "";
    if (section.searchKey) {
      if (section.showInitialOptions) {
        return searchKey
          ? options.filter((option) =>
              option.toLowerCase().includes(searchKey.toLowerCase())
            )
          : options;
      } else {
        return searchKey
          ? options.filter((option) =>
              option.toLowerCase().includes(searchKey.toLowerCase())
            )
          : [];
      }
    } else {
      return options;
    }
  };

  const activeFilterCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if ((key === "dateRange" || key === "vacancies") && typeof value === "string" && value !== "all") {
        return count + 1;
      } else if (Array.isArray(value) && value.length > 0) {
        return count + value.length;
      }
      return count;
    },
    0
  );

  return (
    <div className="">
      {/* Header Row: My Jobs + Search + Filter + Refresh */}
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
          {title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex-1 min-w-[250px] max-w-md items-end justify-end relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
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
                  className={`flex items-center gap-2 ${
                    activeFilterCount > 0
                      ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                      : ""
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-blue-600 text-white px-1.5 min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:max-w-md flex flex-col p-0"
              >
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
                        <h4 className="text-sm font-medium text-gray-700">
                          Active Filters
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {filters.departments.map((dept) => (
                            <Badge
                              key={dept}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              {dept}
                              <button
                                onClick={() => toggleFilter("departments", dept)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.assignedBy.map((assigner) => (
                            <Badge
                              key={assigner}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              {assigner}
                              <button
                                onClick={() => toggleFilter("assignedBy", assigner)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.clients.map((client) => (
                            <Badge
                              key={client}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              Client: {client}
                              <button
                                onClick={() => toggleFilter("clients", client)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.locations.map((location) => (
                            <Badge
                              key={location}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              {location}
                              <button
                                onClick={() => toggleFilter("locations", location)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.jobTitles.map((jobTitle) => (
                            <Badge
                              key={jobTitle}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              Job Title: {jobTitle}
                              <button
                                onClick={() => toggleFilter("jobTitles", jobTitle)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.status.map((status) => (
                            <Badge
                              key={status}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              Status: {status}
                              <button
                                onClick={() => toggleFilter("status", status)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.contacts.map((contact) => (
                            <Badge
                              key={contact}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              Contact: {contact}
                              <button
                                onClick={() => toggleFilter("contacts", contact)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {filters.dateRange !== "all" && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              {filters.dateRange === "today"
                                ? "Today"
                                : filters.dateRange === "week"
                                ? "This Week"
                                : "This Month"}
                              <button
                                onClick={() => toggleFilter("dateRange", "all")}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          )}
                          {filters.vacancies !== "all" && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              Vacancies: {filters.vacancies}
                              <button
                                onClick={() => toggleFilter("vacancies", "all")}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          )}
                        </div>
                        <Separator />
                      </div>
                    )}
                    {filterConfig.map((section) => {
                      const options = section.options;
                      const filteredOptions = getFilteredOptions(section, options);
                      const isOpen = openSection === section.id;
                      const sectionType = section.type || "checkbox";

                      let content;

                      if (sectionType === "radio") {
                        content = (
                          <div className="space-y-2 pl-6">
                            {section.options.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-3 cursor-pointer px-3 pt-1 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={section.id}
                                  checked={filters[section.id as keyof FilterState] === option}
                                  onChange={() => toggleFilter(section.id as keyof FilterState, option)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {section.optionLabels?.[option] || option}
                                </span>
                              </label>
                            ))}
                          </div>
                        );
                      } else {
                        content = (
                          <div className="space-y-1 pl-6">
                            {section.searchKey && (
                              <div className="relative mb-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder={`Search ${section.title.toLowerCase()}...`}
                                  value={searchStates[section.id]}
                                  onChange={(e) =>
                                    setSearchStates({
                                      ...searchStates,
                                      [section.id]: e.target.value,
                                    })
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
                                      onChange={() => toggleFilter(section.id as keyof FilterState, option)}
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
                        );
                      }

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
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {isOpen && content}
                          {section.id !== filterConfig[filterConfig.length - 1]?.id && (
                            <Separator />
                          )}
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
          </div>
        </div>
      </div>
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Active filters:</span>
          {filters.departments.map((dept) => (
            <Badge
              key={dept}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              {dept}
              <button
                onClick={() => toggleFilter("departments", dept)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.assignedBy.map((assigner) => (
            <Badge
              key={assigner}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              {assigner}
              <button
                onClick={() => toggleFilter("assignedBy", assigner)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.clients.map((client) => (
            <Badge
              key={client}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              Client: {client}
              <button
                onClick={() => toggleFilter("clients", client)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.locations.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              {location}
              <button
                onClick={() => toggleFilter("locations", location)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.jobTitles.map((jobTitle) => (
            <Badge
              key={jobTitle}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              Job Title: {jobTitle}
              <button
                onClick={() => toggleFilter("jobTitles", jobTitle)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.status.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              Status: {status}
              <button
                onClick={() => toggleFilter("status", status)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.contacts.map((contact) => (
            <Badge
              key={contact}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              Contact: {contact}
              <button
                onClick={() => toggleFilter("contacts", contact)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.dateRange !== "all" && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              {filters.dateRange === "today"
                ? "Today"
                : filters.dateRange === "week"
                ? "This Week"
                : "This Month"}
              <button
                onClick={() => toggleFilter("dateRange", "all")}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.vacancies !== "all" && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              Vacancies: {filters.vacancies}
              <button
                onClick={() => toggleFilter("vacancies", "all")}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
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