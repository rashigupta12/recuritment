/*eslint-disable @typescript-eslint/no-explicit-any */
import { Search, RefreshCw, Filter, X, Calendar, Users, Briefcase, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface TodosHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  totalJobs?: number;
  filteredJobs?: number;
  uniqueDepartments?: string[];
  uniqueAssigners?: string[];
  uniqueLocations?: string[];
  uniqueJobTitles?: string[];
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  departments: string[];
  assignedBy: string[];
  locations: string[];
  jobTitles: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
  vacancies: 'all' | 'single' | 'multiple';
}

export const TodosHeader = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  totalJobs = 0,
  filteredJobs = 0,
  uniqueDepartments = [],
  uniqueAssigners = [],
  uniqueLocations = [],
  uniqueJobTitles = [],
  onFilterChange
}: TodosHeaderProps) => {
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    locations: [],
    jobTitles: [],
    dateRange: 'all',
    vacancies: 'all'
  });

  const [locationSearch, setLocationSearch] = useState('');
  const [jobTitleSearch, setJobTitleSearch] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleFilter = (type: 'departments' | 'assignedBy' | 'locations' | 'jobTitles', value: string) => {
    const newFilters = {
      ...filters,
      [type]: filters[type].includes(value)
        ? filters[type].filter(v => v !== value)
        : [...filters[type], value]
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const updateDateRange = (value: 'all' | 'today' | 'week' | 'month') => {
    const newFilters = { ...filters, dateRange: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const updateVacancies = (value: 'all' | 'single' | 'multiple') => {
    const newFilters = { ...filters, vacancies: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      departments: [],
      assignedBy: [],
      locations: [],
      jobTitles: [],
      dateRange: 'all' as const,
      vacancies: 'all' as const
    };
    setFilters(resetFilters);
    setLocationSearch('');
    setJobTitleSearch('');
    onFilterChange?.(resetFilters);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const filteredLocations = uniqueLocations.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const filteredJobTitles = uniqueJobTitles.filter(jobTitle =>
    jobTitle.toLowerCase().includes(jobTitleSearch.toLowerCase())
  );

  const activeFilterCount = filters.departments.length + 
    filters.assignedBy.length +
    filters.locations.length +
    filters.jobTitles.length +
    (filters.dateRange !== 'all' ? 1 : 0) + 
    (filters.vacancies !== 'all' ? 1 : 0);

  // Filter sections configuration
  const filterSections = [
    {
      id: 'dateRange',
      title: 'Date Range',
      icon: Calendar,
      content: (
        <div className="space-y-2 pl-6">
          {[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' }
          ].map(option => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer px-3 pt-1 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="dateRange"
                checked={filters.dateRange === option.value}
                onChange={() => updateDateRange(option.value as any)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )
    },
    ...(uniqueJobTitles.length > 0 ? [{
      id: 'jobTitle',
      title: 'Job Title',
      icon: Briefcase,
      content: (
        <div className="space-y-3 pl-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search job titles..."
              value={jobTitleSearch}
              onChange={(e) => setJobTitleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredJobTitles.map(jobTitle => (
              <label key={jobTitle} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.jobTitles.includes(jobTitle)}
                  onChange={() => toggleFilter('jobTitles', jobTitle)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{jobTitle}</span>
              </label>
            ))}
            {filteredJobTitles.length === 0 && (
              <div className="text-center py-3 text-sm text-gray-500">
                No job titles found
              </div>
            )}
          </div>
        </div>
      )
    }] : []),
    ...(uniqueLocations.length > 0 ? [{
      id: 'location',
      title: 'Location',
      icon: MapPin,
      content: (
        <div className="space-y-3 pl-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredLocations.map(location => (
              <label key={location} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.locations.includes(location)}
                  onChange={() => toggleFilter('locations', location)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{location}</span>
              </label>
            ))}
            {filteredLocations.length === 0 && (
              <div className="text-center py-3 text-sm text-gray-500">
                No locations found
              </div>
            )}
          </div>
        </div>
      )
    }] : []),
    ...(uniqueAssigners.length > 0 ? [{
      id: 'assignedBy',
      title: 'Assigned By',
      icon: Users,
      content: (
        <div className="space-y-2 pl-6">
          {uniqueAssigners.map(assigner => (
            <label key={assigner} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={filters.assignedBy.includes(assigner)}
                onChange={() => toggleFilter('assignedBy', assigner)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{assigner}</span>
            </label>
          ))}
        </div>
      )
    }] : []),
    {
      id: 'vacancies',
      title: 'Vacancies',
      icon: Users,
      content: (
        <div className="space-y-2 pl-6">
          {[
            { value: 'all', label: 'All Vacancies' },
            { value: 'single', label: 'Single (1 Position)' },
            { value: 'multiple', label: 'Multiple' }
          ].map(option => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer px-3 pt-1 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="vacancies"
                checked={filters.vacancies === option.value}
                onChange={() => updateVacancies(option.value as any)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="">
      <div className="">
        {/* Header Row: My Jobs + Search + Filter + Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 whitespace-nowrap">My Jobs</h1>
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
                    Filters
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
                            {filters.departments.map(dept => (
                              <Badge key={dept} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {dept}
                                <button 
                                  onClick={() => toggleFilter('departments', dept)} 
                                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                            {filters.assignedBy.map(assigner => (
                              <Badge key={assigner} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {assigner}
                                <button 
                                  onClick={() => toggleFilter('assignedBy', assigner)} 
                                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                            {filters.locations.map(location => (
                              <Badge key={location} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {location}
                                <button 
                                  onClick={() => toggleFilter('locations', location)} 
                                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                            {filters.jobTitles.map(jobTitle => (
                              <Badge key={jobTitle} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                Job Title: {jobTitle}
                                <button 
                                  onClick={() => toggleFilter('jobTitles', jobTitle)} 
                                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                            {filters.dateRange !== 'all' && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {filters.dateRange === 'today' ? 'Today' : filters.dateRange === 'week' ? 'This Week' : 'This Month'}
                                <button 
                                  onClick={() => updateDateRange('all')} 
                                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            )}
                            {filters.vacancies !== 'all' && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {filters.vacancies === 'single' ? 'Single' : 'Multiple'}
                                <button 
                                  onClick={() => updateVacancies('all')} 
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
                      {filterSections.map((section) => (
                        <div key={section.id} className="space-y-3">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <section.icon className="w-4 h-4 text-gray-600" />
                              {section.title}
                            </span>
                            {openSection === section.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {openSection === section.id && section.content}
                          {section.id !== filterSections[filterSections.length - 1].id && <Separator />}
                        </div>
                      ))}
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
            {filters.departments.map(dept => (
              <Badge key={dept} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                {dept}
                <button
                  onClick={() => toggleFilter('departments', dept)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.assignedBy.map(assigner => (
              <Badge key={assigner} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                {assigner}
                <button
                  onClick={() => toggleFilter('assignedBy', assigner)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.locations.map(location => (
              <Badge key={location} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                {location}
                <button
                  onClick={() => toggleFilter('locations', location)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.jobTitles.map(jobTitle => (
              <Badge key={jobTitle} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                Job Title: {jobTitle}
                <button
                  onClick={() => toggleFilter('jobTitles', jobTitle)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.dateRange !== 'all' && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                {filters.dateRange === 'today' ? 'Today' : filters.dateRange === 'week' ? 'This Week' : 'This Month'}
                <button
                  onClick={() => updateDateRange('all')}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.vacancies !== 'all' && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                {filters.vacancies === 'single' ? 'Single' : 'Multiple'}
                <button
                  onClick={() => updateVacancies('all')}
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
    </div>
  );
};
