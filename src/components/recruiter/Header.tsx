// import { Search, RefreshCw, Filter, X, Calendar, Building2, Users, Briefcase } from "lucide-react";
// import { useState } from "react";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";

// interface TodosHeaderProps {
//   searchQuery: string;
//   onSearchChange: (query: string) => void;
//   onRefresh: () => void;
//   totalJobs?: number;
//   filteredJobs?: number;
//   uniqueDepartments?: string[];
//   uniqueAssigners?: string[];
//   onFilterChange?: (filters: FilterState) => void;
// }

// interface FilterState {
//   departments: string[];
//   assignedBy: string[];
//   dateRange: 'all' | 'today' | 'week' | 'month';
//   vacancies: 'all' | 'single' | 'multiple';
// }

// export const TodosHeader = ({ 
//   searchQuery, 
//   onSearchChange, 
//   onRefresh,
//   totalJobs = 0,
//   filteredJobs = 0,
//   uniqueDepartments = [],
//   uniqueAssigners = [],
//   onFilterChange
// }: TodosHeaderProps) => {
//   const [filters, setFilters] = useState<FilterState>({
//     departments: [],
//     assignedBy: [],
//     dateRange: 'all',
//     vacancies: 'all'
//   });

//   const toggleFilter = (type: 'departments' | 'assignedBy', value: string) => {
//     const newFilters = {
//       ...filters,
//       [type]: filters[type].includes(value)
//         ? filters[type].filter(v => v !== value)
//         : [...filters[type], value]
//     };
//     setFilters(newFilters);
//     onFilterChange?.(newFilters);
//   };

//   const updateDateRange = (value: 'all' | 'today' | 'week' | 'month') => {
//     const newFilters = { ...filters, dateRange: value };
//     setFilters(newFilters);
//     onFilterChange?.(newFilters);
//   };

//   const updateVacancies = (value: 'all' | 'single' | 'multiple') => {
//     const newFilters = { ...filters, vacancies: value };
//     setFilters(newFilters);
//     onFilterChange?.(newFilters);
//   };

//   const clearAllFilters = () => {
//     const resetFilters = {
//       departments: [],
//       assignedBy: [],
//       dateRange: 'all' as const,
//       vacancies: 'all' as const
//     };
//     setFilters(resetFilters);
//     onFilterChange?.(resetFilters);
//   };

//   const activeFilterCount = filters.departments.length + filters.assignedBy.length + 
//     (filters.dateRange !== 'all' ? 1 : 0) + (filters.vacancies !== 'all' ? 1 : 0);

//   return (
//     <div className="">
//       <div className="">
//         {/* Header Row: My Jobs + Search + Filter + Refresh */}
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//           {/* Title */}
//           <h1 className="text-2xl font-semibold text-gray-900 whitespace-nowrap">My Jobs</h1>

//           {/* Search */}
//           <div className="flex items-center gap-3 flex-wrap justify-end">
//             <div className="flex-1 min-w-[250px] max-w-md items-end justify-end relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search jobs..."
//                 value={searchQuery}
//                 onChange={(e) => onSearchChange(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Filter + Refresh */}
//             <div className="flex items-center gap-2">
//               {/* Sheet Trigger */}
//               <Sheet>
//                 <SheetTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={`flex items-center gap-2 ${
//                       activeFilterCount > 0
//                         ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
//                         : ''
//                     }`}
//                   >
//                     <Filter className="w-4 h-4" />
//                     Filters
//                     {activeFilterCount > 0 && (
//                       <Badge variant="secondary" className="ml-1 bg-blue-600 text-white px-1.5 min-w-[20px] h-5 flex items-center justify-center">
//                         {activeFilterCount}
//                       </Badge>
//                     )}
//                   </Button>
//                 </SheetTrigger>
                
//                 <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
//                   <SheetHeader className="px-6 py-4 border-b">
//                     <div className="flex items-center justify-between">
//                       <SheetTitle className="flex items-center gap-2 text-lg">
//                         <Filter className="w-5 h-5" />
//                         Filters
//                       </SheetTitle>
                      
//                     </div>
//                   </SheetHeader>
                  
//                   <ScrollArea className="flex-1 px-6 py-4">
//                     <div className="space-y-6">
//                       {/* Active Filters */}
//                       {activeFilterCount > 0 && (
//                         <div className="space-y-3">
//                           <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
//                           <div className="flex flex-wrap gap-2">
//                             {filters.departments.map(dept => (
//                               <Badge key={dept} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                                 {dept}
//                                 <button 
//                                   onClick={() => toggleFilter('departments', dept)} 
//                                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                                 >
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </Badge>
//                             ))}
//                             {filters.assignedBy.map(assigner => (
//                               <Badge key={assigner} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                                 {assigner}
//                                 <button 
//                                   onClick={() => toggleFilter('assignedBy', assigner)} 
//                                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                                 >
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </Badge>
//                             ))}
//                             {filters.dateRange !== 'all' && (
//                               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                                 {filters.dateRange === 'today' ? 'Today' : filters.dateRange === 'week' ? 'This Week' : 'This Month'}
//                                 <button 
//                                   onClick={() => updateDateRange('all')} 
//                                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                                 >
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </Badge>
//                             )}
//                             {filters.vacancies !== 'all' && (
//                               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                                 {filters.vacancies === 'single' ? 'Single' : 'Multiple'}
//                                 <button 
//                                   onClick={() => updateVacancies('all')} 
//                                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                                 >
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </Badge>
//                             )}
//                           </div>
//                           <Separator />
//                         </div>
//                       )}

//                       {/* Date Range Filter */}
//                       <div className="space-y-3">
//                         <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                           <Calendar className="w-4 h-4 text-gray-600" />
//                           Date Range
//                         </h4>
//                         <div className="space-y-2">
//                           {[
//                             { value: 'all', label: 'All Time' },
//                             { value: 'today', label: 'Today' },
//                             { value: 'week', label: 'This Week' },
//                             { value: 'month', label: 'This Month' }
//                           ].map(option => (
//                             <label key={option.value} className="flex items-center gap- cursor-pointer px-3 pt-1 rounded-lg hover:bg-gray-50 transition-colors">
//                               <input
//                                 type="radio"
//                                 name="dateRange"
//                                 checked={filters.dateRange === option.value}
//                                 onChange={() => updateDateRange(option.value as any)}
//                                 className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                               />
//                               <span className="text-sm font-medium text-gray-700">{option.label}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>

//                       <Separator />

//                       {/* Department Filter */}
//                       {/* {uniqueDepartments.length > 0 && (
//                         <div className="space-y-3">
//                           <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                             <Briefcase className="w-4 h-4 text-gray-600" />
//                             Department
//                           </h4>
//                           <div className="space-y-2 max-h-48 overflow-y-auto">
//                             {uniqueDepartments.map(dept => (
//                               <label key={dept} className="flex items-center gap-3 cursor-pointer px-3  pt-1 rounded-lg hover:bg-gray-50 transition-colors">
//                                 <input
//                                   type="checkbox"
//                                   checked={filters.departments.includes(dept)}
//                                   onChange={() => toggleFilter('departments', dept)}
//                                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                 />
//                                 <span className="text-sm font-medium text-gray-700">{dept}</span>
//                               </label>
//                             ))}
//                           </div>
//                           <Separator />
//                         </div>
//                       )} */}

//                       {/* Assigned By Filter */}
//                       {uniqueAssigners.length > 0 && (
//                         <div className="space-y-3">
//                           <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                             <Users className="w-4 h-4 text-gray-600" />
//                             Assigned By
//                           </h4>
//                           <div className="space-y-2 max-h-48 overflow-y-auto">
//                             {uniqueAssigners.map(assigner => (
//                               <label key={assigner} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
//                                 <input
//                                   type="checkbox"
//                                   checked={filters.assignedBy.includes(assigner)}
//                                   onChange={() => toggleFilter('assignedBy', assigner)}
//                                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                 />
//                                 <span className="text-sm font-medium text-gray-700">{assigner}</span>
//                               </label>
//                             ))}
//                           </div>
//                           <Separator />
//                         </div>
//                       )}

//                       {/* Vacancies Filter */}
//                       <div className="space-y-3">
//                         <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                           <Building2 className="w-4 h-4 text-gray-600" />
//                           Vacancies
//                         </h4>
//                         <div className="space-y-2">
//                           {[
//                             { value: 'all', label: 'All Vacancies' },
//                             { value: 'single', label: 'Single (1 Position)' },
//                             { value: 'multiple', label: 'Multiple' }
//                           ].map(option => (
//                             <label key={option.value} className="flex items-center gap-3 cursor-pointer px-3 pt-1 rounded-lg hover:bg-gray-50 transition-colors">
//                               <input
//                                 type="radio"
//                                 name="vacancies"
//                                 checked={filters.vacancies === option.value}
//                                 onChange={() => updateVacancies(option.value as any)}
//                                 className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                               />
//                               <span className="text-sm font-medium text-gray-700">{option.label}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </ScrollArea>

//                   {/* Footer Actions */}
//                   <div className="border-t p-4 bg-gray-50">
//                     <div className="flex gap-3">
//                       <Button
//                         variant="outline"
//                         onClick={clearAllFilters}
//                         className="flex-1 border-gray-300 hover:bg-gray-200"
//                       >
//                         Clear All
//                       </Button>
//                       <SheetTrigger asChild>
//                         <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
//                           Show Results
//                         </Button>
//                       </SheetTrigger>
//                     </div>
//                   </div>
//                 </SheetContent>
//               </Sheet>

//               {/* Refresh Button */}
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={onRefresh}
//                 className="h-10 w-10"
//               >
//                 <RefreshCw className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Active Filters Pills (outside sheet) */}
//         {activeFilterCount > 0 && (
//           <div className="mt-3 flex flex-wrap items-center gap-2">
//             <span className="text-sm text-gray-600 font-medium">Active filters:</span>
//             {filters.departments.map(dept => (
//               <Badge key={dept} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                 {dept}
//                 <button 
//                   onClick={() => toggleFilter('departments', dept)} 
//                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </Badge>
//             ))}
//             {filters.assignedBy.map(assigner => (
//               <Badge key={assigner} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                 {assigner}
//                 <button 
//                   onClick={() => toggleFilter('assignedBy', assigner)} 
//                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </Badge>
//             ))}
//             {filters.dateRange !== 'all' && (
//               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                 {filters.dateRange === 'today' ? 'Today' : filters.dateRange === 'week' ? 'This Week' : 'This Month'}
//                 <button 
//                   onClick={() => updateDateRange('all')} 
//                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </Badge>
//             )}
//             {filters.vacancies !== 'all' && (
//               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                 {filters.vacancies === 'single' ? 'Single' : 'Multiple'}
//                 <button 
//                   onClick={() => updateVacancies('all')} 
//                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </Badge>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearAllFilters}
//               className="text-blue-600 hover:text-blue-700 h-auto px-2 py-1 text-sm"
//             >
//               Clear all
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };




// import { Search, RefreshCw, Filter, X, Calendar, Building2, Users, Briefcase } from "lucide-react";
// import { useState } from "react";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";

// interface FilterState {
//   departments: string[];
//   assignedBy: string[];
//   clients: string[];
//   locations: string[];
//   dateRange: 'all' | 'today' | 'week' | 'month';
//   vacancies: 'all' | 'single' | 'multiple';
// }

// interface TodosHeaderProps {
//   searchQuery: string;
//   onSearchChange: (query: string) => void;
//   onRefresh: () => void;
//   totalJobs?: number;
//   filteredJobs?: number;
//   uniqueDepartments?: string[];
//   uniqueAssigners?: string[];
//   uniqueClients?: string[];
//   uniqueLocations?: string[];
//   onFilterChange?: (filters: FilterState) => void;
// }

// export const TodosHeader = ({
//   searchQuery,
//   onSearchChange,
//   onRefresh,
//   totalJobs = 0,
//   filteredJobs = 0,
//   uniqueDepartments = [],
//   uniqueAssigners = [],
//   uniqueClients = [],
//   uniqueLocations = [],
//   onFilterChange
// }: TodosHeaderProps) => {
//   const [filters, setFilters] = useState<FilterState>({
//     departments: [],
//     assignedBy: [],
//     clients: [],
//     locations: [],
//     dateRange: 'all',
//     vacancies: 'all'
//   });

//   const [clientSearch, setClientSearch] = useState("");
//   const [locationSearch, setLocationSearch] = useState("");

//   const toggleFilter = (type: keyof FilterState, value: string) => {
//     if (type === "dateRange" || type === "vacancies") return;
//     const current = filters[type] as string[];
//     const newFilters = {
//       ...filters,
//       [type]: current.includes(value)
//         ? current.filter(v => v !== value)
//         : [...current, value]
//     };
//     setFilters(newFilters);
//     onFilterChange?.(newFilters);
//   };

//   const updateDateRange = (value: 'all' | 'today' | 'week' | 'month') => {
//     const newFilters = { ...filters, dateRange: value };
//     setFilters(newFilters);
//     onFilterChange?.(newFilters);
//   };

//   const updateVacancies = (value: 'all' | 'single' | 'multiple') => {
//     const newFilters = { ...filters, vacancies: value };
//     setFilters(newFilters);
//     onFilterChange?.(newFilters);
//   };

//   const clearAllFilters = () => {
//     const resetFilters: FilterState = {
//       departments: [],
//       assignedBy: [],
//       clients: [],
//       locations: [],
//       dateRange: 'all',
//       vacancies: 'all'
//     };
//     setFilters(resetFilters);
//     onFilterChange?.(resetFilters);
//   };

//   const activeFilterCount =
//     filters.departments.length +
//     filters.assignedBy.length +
//     filters.clients.length +
//     filters.locations.length +
//     (filters.dateRange !== 'all' ? 1 : 0) +
//     (filters.vacancies !== 'all' ? 1 : 0);

//   return (
//     <div>
//       <div>
//         {/* Header Row */}
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//           <h1 className="text-2xl font-semibold text-gray-900 whitespace-nowrap">My Jobs</h1>

//           <div className="flex items-center gap-3 flex-wrap justify-end">
//             {/* Search Box */}
//             <div className="flex-1 min-w-[250px] max-w-md items-end justify-end relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search jobs..."
//                 value={searchQuery}
//                 onChange={(e) => onSearchChange(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               {/* Filters */}
//               <Sheet>
//                 <SheetTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={`flex items-center gap-2 ${
//                       activeFilterCount > 0
//                         ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
//                         : ''
//                     }`}
//                   >
//                     <Filter className="w-4 h-4" />
//                     Filters
//                     {activeFilterCount > 0 && (
//                       <Badge
//                         variant="secondary"
//                         className="ml-1 bg-blue-600 text-white px-1.5 min-w-[20px] h-5 flex items-center justify-center"
//                       >
//                         {activeFilterCount}
//                       </Badge>
//                     )}
//                   </Button>
//                 </SheetTrigger>

//                 <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto max-h-[100vh] pb-6">
//                   <SheetHeader className="px-6 py-4 border-b">
//                     <SheetTitle className="flex items-center gap-2 text-lg">
//                       <Filter className="w-5 h-5" />
//                       Filters
//                     </SheetTitle>
//                   </SheetHeader>

//                   <ScrollArea className="flex-1 px-6 py-4">
//                     <div className="space-y-6">
//                       {/* Active Filters */}
//                       {activeFilterCount > 0 && (
//                         <div className="space-y-3">
//                           <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
//                           <div className="flex flex-wrap gap-2">
//                             {[...filters.departments, ...filters.assignedBy, ...filters.clients, ...filters.locations].map((item) => (
//                               <Badge key={item} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                                 {item}
//                                 <button
//                                   onClick={() =>
//                                     toggleFilter(
//                                       filters.departments.includes(item)
//                                         ? 'departments'
//                                         : filters.assignedBy.includes(item)
//                                         ? 'assignedBy'
//                                         : filters.clients.includes(item)
//                                         ? 'clients'
//                                         : 'locations',
//                                       item
//                                     )
//                                   }
//                                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                                 >
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </Badge>
//                             ))}
//                             {filters.dateRange !== 'all' && (
//                               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                                 {filters.dateRange === 'today'
//                                   ? 'Today'
//                                   : filters.dateRange === 'week'
//                                   ? 'This Week'
//                                   : 'This Month'}
//                                 <button onClick={() => updateDateRange('all')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </Badge>
//                             )}
//                             {filters.vacancies !== 'all' && (
//                               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                                 {filters.vacancies === 'single' ? 'Single' : 'Multiple'}
//                                 <button onClick={() => updateVacancies('all')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </Badge>
//                             )}
//                           </div>
//                           <Separator />
//                         </div>
//                       )}

//                       {/* Date Range */}
//                       <div className="space-y-3">
//                         <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                           <Calendar className="w-4 h-4 text-gray-600" />
//                           Date Range
//                         </h4>
//                         <div className="space-y-2">
//                           {['all', 'today', 'week', 'month'].map((value) => (
//                             <label key={value} className="flex items-center gap-3 cursor-pointer px-3 pt-1 rounded-lg hover:bg-gray-50 transition-colors">
//                               <input
//                                 type="radio"
//                                 name="dateRange"
//                                 checked={filters.dateRange === value}
//                                 onChange={() => updateDateRange(value as any)}
//                                 className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                               />
//                               <span className="text-sm font-medium text-gray-700">
//                                 {value === 'all'
//                                   ? 'All Time'
//                                   : value === 'today'
//                                   ? 'Today'
//                                   : value === 'week'
//                                   ? 'This Week'
//                                   : 'This Month'}
//                               </span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>

//                       <Separator />

//                       {/* Assigned By */}
//                       {uniqueAssigners.length > 0 && (
//                         <div className="space-y-3">
//                           <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                             <Users className="w-4 h-4 text-gray-600" />
//                             Assigned By
//                           </h4>
//                           <div className="space-y-2 max-h-48 overflow-y-auto">
//                             {uniqueAssigners.map((assigner) => (
//                               <label key={assigner} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
//                                 <input
//                                   type="checkbox"
//                                   checked={filters.assignedBy.includes(assigner)}
//                                   onChange={() => toggleFilter('assignedBy', assigner)}
//                                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                 />
//                                 <span className="text-sm font-medium text-gray-700">{assigner}</span>
//                               </label>
//                             ))}
//                           </div>
//                           <Separator />
//                         </div>
//                       )}

//                       {/* Client */}
//                       {uniqueClients.length > 0 && (
//                         <div className="space-y-3">
//                           <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                             <Briefcase className="w-4 h-4 text-gray-600" />
//                             Client
//                           </h4>
//                           <input
//                             type="text"
//                             placeholder="Search client..."
//                             value={clientSearch}
//                             onChange={(e) => setClientSearch(e.target.value)}
//                             className="w-full mb-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                           />
//                           <div className="space-y-2 max-h-48 overflow-y-auto">
//                             {uniqueClients
//                               .filter((c) => c.toLowerCase().includes(clientSearch.toLowerCase()))
//                               .map((client) => (
//                                 <label key={client} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
//                                   <input
//                                     type="checkbox"
//                                     checked={filters.clients.includes(client)}
//                                     onChange={() => toggleFilter('clients', client)}
//                                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                   />
//                                   <span className="text-sm font-medium text-gray-700">{client}</span>
//                                 </label>
//                               ))}
//                           </div>
//                           <Separator />
//                         </div>
//                       )}

//                       {/* Location */}
//                       {uniqueLocations.length > 0 && (
//                         <div className="space-y-3">
//                           <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                             <Building2 className="w-4 h-4 text-gray-600" />
//                             Location
//                           </h4>
//                           <input
//                             type="text"
//                             placeholder="Search location..."
//                             value={locationSearch}
//                             onChange={(e) => setLocationSearch(e.target.value)}
//                             className="w-full mb-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                           />
//                           <div className="space-y-2 max-h-48 overflow-y-auto">
//                             {uniqueLocations
//                               .filter((l) => l.toLowerCase().includes(locationSearch.toLowerCase()))
//                               .map((location) => (
//                                 <label key={location} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
//                                   <input
//                                     type="checkbox"
//                                     checked={filters.locations.includes(location)}
//                                     onChange={() => toggleFilter('locations', location)}
//                                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                   />
//                                   <span className="text-sm font-medium text-gray-700">{location}</span>
//                                 </label>
//                               ))}
//                           </div>
//                           <Separator />
//                         </div>
//                       )}

//                       {/* Vacancies */}
//                       <div className="space-y-3">
//                         <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
//                           <Building2 className="w-4 h-4 text-gray-600" />
//                           Vacancies
//                         </h4>
//                         <div className="space-y-2">
//                           {['all', 'single', 'multiple'].map((value) => (
//                             <label key={value} className="flex items-center gap-3 cursor-pointer px-3 pt-1 rounded-lg hover:bg-gray-50 transition-colors">
//                               <input
//                                 type="radio"
//                                 name="vacancies"
//                                 checked={filters.vacancies === value}
//                                 onChange={() => updateVacancies(value as any)}
//                                 className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                               />
//                               <span className="text-sm font-medium text-gray-700">
//                                 {value === 'all'
//                                   ? 'All Vacancies'
//                                   : value === 'single'
//                                   ? 'Single (1 Position)'
//                                   : 'Multiple'}
//                               </span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </ScrollArea>

//                   {/* Footer Actions */}
//                   <div className="border-t p-4 bg-gray-50">
//                     <div className="flex gap-3">
//                       <Button
//                         variant="outline"
//                         onClick={clearAllFilters}
//                         className="flex-1 border-gray-300 hover:bg-gray-200"
//                       >
//                         Clear All
//                       </Button>
//                       <SheetTrigger asChild>
//                         <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
//                           Show Results
//                         </Button>
//                       </SheetTrigger>
//                     </div>
//                   </div>
//                 </SheetContent>
//               </Sheet>

//               {/* Refresh */}
//               <Button variant="outline" size="icon" onClick={onRefresh} className="h-10 w-10">
//                 <RefreshCw className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Active Filters Pills */}
//         {activeFilterCount > 0 && (
//           <div className="mt-3 flex flex-wrap items-center gap-2">
//             <span className="text-sm text-gray-600 font-medium">Active filters:</span>
//             {[...filters.departments, ...filters.assignedBy, ...filters.clients, ...filters.locations].map((item) => (
//               <Badge key={item} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                 {item}
//                 <button
//                   onClick={() =>
//                     toggleFilter(
//                       filters.departments.includes(item)
//                         ? 'departments'
//                         : filters.assignedBy.includes(item)
//                         ? 'assignedBy'
//                         : filters.clients.includes(item)
//                         ? 'clients'
//                         : 'locations',
//                       item
//                     )
//                   }
//                   className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </Badge>
//             ))}
//             {filters.dateRange !== 'all' && (
//               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                 {filters.dateRange === 'today'
//                   ? 'Today'
//                   : filters.dateRange === 'week'
//                   ? 'This Week'
//                   : 'This Month'}
//                 <button onClick={() => updateDateRange('all')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
//                   <X className="w-3 h-3" />
//                 </button>
//               </Badge>
//             )}
//             {filters.vacancies !== 'all' && (
//               <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
//                 {filters.vacancies === 'single' ? 'Single' : 'Multiple'}
//                 <button onClick={() => updateVacancies('all')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
//                   <X className="w-3 h-3" />
//                 </button>
//               </Badge>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearAllFilters}
//               className="text-blue-600 hover:text-blue-700 h-auto px-2 py-1 text-sm"
//             >
//               Clear all
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };




import { Search, RefreshCw, Filter, X, Calendar, Building2, Users, Briefcase, MapPin } from "lucide-react";
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
  uniqueClients?: string[];
  uniqueLocations?: string[];
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  departments: string[];
  assignedBy: string[];
  clients: string[];
  locations: string[];
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
  uniqueClients = [],
  uniqueLocations = [],
  onFilterChange
}: TodosHeaderProps) => {
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    clients: [],
    locations: [],
    dateRange: 'all',
    vacancies: 'all'
  });

  const [clientSearch, setClientSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  const toggleFilter = (type: 'departments' | 'assignedBy' | 'clients' | 'locations', value: string) => {
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
      clients: [],
      locations: [],
      dateRange: 'all' as const,
      vacancies: 'all' as const
    };
    setFilters(resetFilters);
    setClientSearch('');
    setLocationSearch('');
    onFilterChange?.(resetFilters);
  };

  const filteredClients = uniqueClients.filter(client =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredLocations = uniqueLocations.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const activeFilterCount = filters.departments.length + filters.assignedBy.length + 
    filters.clients.length + filters.locations.length +
    (filters.dateRange !== 'all' ? 1 : 0) + (filters.vacancies !== 'all' ? 1 : 0);

  return (
    <div className="">
      <div className="">
        {/* Header Row: My Jobs + Search + Filter + Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 whitespace-nowrap">My Jobs</h1>

          {/* Search */}
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

            {/* Filter + Refresh */}
            <div className="flex items-center gap-2">
              {/* Sheet Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 ${
                      activeFilterCount > 0
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
                  
                  <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-6">
                      {/* Active Filters */}
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
                            {filters.clients.map(client => (
                              <Badge key={client} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                Company: {client}
                                <button 
                                  onClick={() => toggleFilter('clients', client)} 
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

                      {/* Date Range Filter */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          Date Range
                        </h4>
                        <div className="space-y-2">
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
                      </div>

                      <Separator />

                      {/* Department Filter */}
                      {uniqueDepartments.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Briefcase className="w-4 h-4 text-gray-600" />
                            Department
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {uniqueDepartments.map(dept => (
                              <label key={dept} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={filters.departments.includes(dept)}
                                  onChange={() => toggleFilter('departments', dept)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{dept}</span>
                              </label>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      )}

                      {/* Company Filter */}
                      {uniqueClients.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Building2 className="w-4 h-4 text-gray-600" />
                            Company
                          </h4>
                          {/* Company Search */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search companies..."
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {filteredClients.map(client => (
                              <label key={client} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={filters.clients.includes(client)}
                                  onChange={() => toggleFilter('clients', client)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{client}</span>
                              </label>
                            ))}
                            {filteredClients.length === 0 && (
                              <div className="text-center py-3 text-sm text-gray-500">
                                No companies found
                              </div>
                            )}
                          </div>
                          <Separator />
                        </div>
                      )}

                      {/* Location Filter */}
                      {uniqueLocations.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            Location
                          </h4>
                          {/* Location Search */}
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
                          <Separator />
                        </div>
                      )}

                      {/* Assigned By Filter */}
                      {uniqueAssigners.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Users className="w-4 h-4 text-gray-600" />
                            Assigned By
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
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
                          <Separator />
                        </div>
                      )}

                      {/* Vacancies Filter */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Users className="w-4 h-4 text-gray-600" />
                          Vacancies
                        </h4>
                        <div className="space-y-2">
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
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Footer Actions */}
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

              {/* Refresh Button */}
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

        {/* Active Filters Pills (outside sheet) */}
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
            {filters.clients.map(client => (
              <Badge key={client} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                Company: {client}
                <button 
                  onClick={() => toggleFilter('clients', client)} 
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