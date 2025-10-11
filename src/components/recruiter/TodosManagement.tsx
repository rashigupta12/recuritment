/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { useEffect, useState, useMemo, useRef } from "react";
import { LoadingState } from "./LoadingState";
import { TodosTable } from "./TodosTable";
import { Calendar, Briefcase, MapPin, Award } from "lucide-react";
import { Pagination } from "@/components/comman/Pagination";
import { toast } from "sonner";
import { TodosHeader } from "@/components/recruiter/Header";

interface ToDo {
  name: string;
  status?: string;
  priority?: string;
  date?: string;
  allocated_to?: string;
  description?: string;
  reference_type?: string;
  reference_name?: string;
  custom_job_id?: string;
  assigned_by?: string;
  assigned_by_full_name?: string;
  creation?: string;
  modified?: string;
  doctype?: string;
  custom_department?: string;
  custom_date_assigned?: string;
  custom_job_title?: string;
}

interface FilterState {
  departments: string[];
  assignedBy: string[];
  clients: string[];
  locations: string[];
  jobTitles: string[];
  status: string[];
  dateRange: "all" | "today" | "week" | "month";
  vacancies: "all" | "single" | "multiple";
}

const TodosManagement = () => {
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    clients: [],
    locations: [],
    jobTitles: [],
    status: [],
    dateRange: "all",
    vacancies: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const router = useRouter();

  const fetchTodos = async (email: string) => {
    try {
      setLoading(true);
      const response = await frappeAPI.getAllTodos(email);
      const todos = response.data || [];
      console.log("All todos with full details:", todos);
      setTodos(todos);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to fetch todos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTodos(user.email);
  }, [user]);

  // Extract unique departments, assigners, locations, job titles, and statuses
  const uniqueDepartments = useMemo(() => {
    const departments = todos
      .map((todo) => todo.custom_department)
      .filter((dept): dept is string => typeof dept === "string" && dept.trim() !== "");
    return [...new Set(departments)];
  }, [todos]);

  const uniqueAssigners = useMemo(() => {
    const assigners = todos
      .map((todo) => todo.assigned_by_full_name)
      .filter((name): name is string => typeof name === "string" && name.trim() !== "");
    return [...new Set(assigners)];
  }, [todos]);

  const uniqueLocations = useMemo(() => {
    const locations = todos
      .map((todo) => {
        const match = todo.description?.match(/Location:\s*([^\n]+)/i);
        return match ? match[1].trim() : null;
      })
      .filter((loc): loc is string => typeof loc === "string" && loc.trim() !== "");
    return [...new Set(locations)];
  }, [todos]);

  const uniqueJobTitles = useMemo(() => {
    const jobTitles = todos
      .map((todo) => todo.custom_job_title)
      .filter((title): title is string => typeof title === "string" && title.trim() !== "");
    return [...new Set(jobTitles)];
  }, [todos]);

  const uniqueStatus = useMemo(() => {
    const statuses = todos
      .map((todo) => todo.status)
      .filter((status): status is string => typeof status === "string" && status.trim() !== "");
    console.log("Unique Statuses:", statuses);
    return [...new Set(statuses)];
  }, [todos]);

  const extractVacancies = (description?: string) => {
    const match = description?.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter todos based on search query and filters
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          (todo.description || "").toLowerCase().includes(searchLower) ||
          (todo.reference_type || "").toLowerCase().includes(searchLower) ||
          (todo.reference_name || "").toLowerCase().includes(searchLower) ||
          (todo.custom_job_id || "").toLowerCase().includes(searchLower) ||
          (todo.status || "").toLowerCase().includes(searchLower) ||
          (todo.priority || "").toLowerCase().includes(searchLower) ||
          (todo.custom_job_title || "").toLowerCase().includes(searchLower) ||
          (todo.custom_department || "").toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Department filter
      if (filters.departments.length > 0) {
        if (!todo.custom_department || !filters.departments.includes(todo.custom_department)) {
          return false;
        }
      }

      // Assigned by filter
      if (filters.assignedBy.length > 0) {
        if (
          !todo.assigned_by_full_name ||
          !filters.assignedBy.includes(todo.assigned_by_full_name)
        ) {
          return false;
        }
      }

      // Location filter
      if (filters.locations.length > 0) {
        if (!todo.description) return false;
        const location = todo.description.match(/Location:\s*([^\n]+)/i)?.[1]?.trim();
        if (!location || !filters.locations.includes(location)) return false;
      }

      // Job title filter
      if (filters.jobTitles.length > 0) {
        if (!todo.custom_job_title || !filters.jobTitles.includes(todo.custom_job_title)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0) {
        if (!todo.status || !filters.status.includes(todo.status)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        if (!todo.custom_date_assigned) return false;
        const todoDate = new Date(todo.custom_date_assigned);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filters.dateRange) {
          case "today":
            const todoDay = new Date(todoDate);
            todoDay.setHours(0, 0, 0, 0);
            if (todoDay.getTime() !== today.getTime()) return false;
            break;
          case "week":
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            if (todoDate < startOfWeek) return false;
            break;
          case "month":
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            if (todoDate < startOfMonth) return false;
            break;
        }
      }

      // Vacancies filter
      if (filters.vacancies !== "all") {
        const vacanciesCount = extractVacancies(todo.description);
        if (filters.vacancies === "single" && vacanciesCount !== 1) return false;
        if (filters.vacancies === "multiple" && vacanciesCount < 2) return false;
      }

      return true;
    });
  }, [todos, searchQuery, filters]);

  // Paginate filteredTodos
  const totalCount = filteredTodos.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedTodos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTodos.slice(startIndex, endIndex);
  }, [filteredTodos, currentPage, itemsPerPage]);

  // Event handlers
  const handleViewTodo = (todo: ToDo) => {
    router.push(`/dashboard/recruiter/todos/${todo.name}`);
  };

  const handleEditTodo = (todo: ToDo) => {
    console.log("Edit todo:", todo);
  };

  const handleRefresh = async () => {
    if (user) {
      try {
        setLoading(true);
        await fetchTodos(user.email);
        toast.success("Table refreshed successfully.");
        if (tableRef.current) {
          tableRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } catch (error) {
        toast.error("Failed to refresh todos.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filterConfig = [
    {
      id: "dateRange",
      title: "Date Range",
      icon: Calendar,
      type: "radio" as const,
      options: ["all", "today", "week", "month"],
      optionLabels: { all: "All Time", today: "Today", week: "This Week", month: "This Month" },
    },
    {
      id: "locations",
      title: "Location",
      icon: MapPin,
      options: uniqueLocations,
      searchKey: "locations",
      showInitialOptions: false,
    },
    {
      id: "jobTitles",
      title: "Job Title",
      icon: Briefcase,
      options: uniqueJobTitles,
      searchKey: "jobTitles",
      showInitialOptions: false,
    },
    {
      id: "status",
      title: "Status",
      icon: Award,
      options: uniqueStatus,
      searchKey: "status",
      alwaysShowOptions: true,
      type: "radio" as const,
      showInitialOptions: true,
    },
  ];

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TodosHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        totalJobs={todos.length}
        filteredJobs={filteredTodos.length}
        uniqueDepartments={uniqueDepartments}
        uniqueAssigners={uniqueAssigners}
        uniqueLocations={uniqueLocations}
        uniqueJobTitles={uniqueJobTitles}
        uniqueStatus={uniqueStatus}
        onFilterChange={handleFilterChange}
        filterConfig={filterConfig}
        title="My Jobs"
      />

      <div className="w-full mx-auto mt-4" ref={tableRef}>
        {loading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Refreshing table...</p>
            </div>
          </div>
        )}
        {paginatedTodos.length > 0 ? (
          <>
            <TodosTable
              todos={paginatedTodos}
              onViewTodo={handleViewTodo}
              onEditTodo={handleEditTodo}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">
              {searchQuery || Object.values(filters).some((filter) =>
                Array.isArray(filter) ? filter.length > 0 : filter !== "all"
              )
                ? "No Jobs found matching your search and filters."
                : "No Jobs assigned to you."}
            </div>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodosManagement;