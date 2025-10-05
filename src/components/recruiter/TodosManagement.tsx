'use client';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { useEffect, useState, useMemo } from "react";
import { LoadingState } from "./LoadingState";
import { TodosHeader } from "./Header";
import { TodosTable } from "./TodosTable";

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
  locations: string[];
  jobTitles: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
  vacancies: 'all' | 'single' | 'multiple';
}

const TodosManagement = () => {
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    assignedBy: [],
    locations: [],
    jobTitles: [],
    dateRange: 'all',
    vacancies: 'all'
  });
  
  const { user } = useAuth();
  const router = useRouter();

  const fetchTodos = async (email: string) => {
    try {
      setLoading(true);
      const response = await frappeAPI.getAllTodos(email);
      const todos = response.data || [];
      console.log('All todos with full details:', todos);
      setTodos(todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTodos(user.email);
  }, [user]);

  // Extract unique departments, assigners, locations, and job titles from todos
  const uniqueDepartments = useMemo(() => {
    const departments = todos
      .map(todo => todo.custom_department)
      .filter(Boolean) as string[];
    return [...new Set(departments)];
  }, [todos]);

  const uniqueAssigners = useMemo(() => {
    const assigners = todos
      .map(todo => todo.assigned_by_full_name)
      .filter(Boolean) as string[];
    return [...new Set(assigners)];
  }, [todos]);

  const uniqueLocations = useMemo(() => {
    const locations = todos
      .map(todo => {
        const match = todo.description?.match(/Location:\s*([^\n]+)/i);
        return match ? match[1].trim() : null;
      })
      .filter(Boolean) as string[];
    return [...new Set(locations)];
  }, [todos]);

  const uniqueJobTitles = useMemo(() => {
    const jobTitles = todos
      .map(todo => todo.custom_job_title)
      .filter(Boolean) as string[];
    return [...new Set(jobTitles)];
  }, [todos]);

  const extractVacancies = (description?: string) => {
    const match = description?.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter todos based on search query AND filters
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
        if (!todo.assigned_by_full_name || !filters.assignedBy.includes(todo.assigned_by_full_name)) {
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

      // Date range filter
      if (filters.dateRange !== 'all') {
        if (!todo.custom_date_assigned) return false;
        const todoDate = new Date(todo.custom_date_assigned);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filters.dateRange) {
          case 'today':
            const todoDay = new Date(todoDate);
            todoDay.setHours(0, 0, 0, 0);
            if (todoDay.getTime() !== today.getTime()) return false;
            break;
          case 'week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            if (todoDate < startOfWeek) return false;
            break;
          case 'month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            if (todoDate < startOfMonth) return false;
            break;
        }
      }

      // Vacancies filter
      if (filters.vacancies !== 'all') {
        const vacanciesCount = extractVacancies(todo.description);
        if (filters.vacancies === 'single' && vacanciesCount !== 1) return false;
        if (filters.vacancies === 'multiple' && vacanciesCount < 2) return false;
      }

      return true;
    });
  }, [todos, searchQuery, filters]);

  // Event handlers
  const handleViewTodo = (todo: ToDo) => {
    router.push(`/dashboard/recruiter/todos/${todo.name}`);
  };

  const handleEditTodo = (todo: ToDo) => {
    console.log('Edit todo:', todo);
  };

  const handleRefresh = () => {
    if (user) {
      fetchTodos(user.email);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Render loading state
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
        onFilterChange={handleFilterChange}
      />

      <div className="w-full mx-auto">
        {filteredTodos.length > 0 ? (
          <TodosTable
            todos={filteredTodos}
            onViewTodo={handleViewTodo}
            onEditTodo={handleEditTodo}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">
              {searchQuery || Object.values(filters).some(filter => 
                Array.isArray(filter) ? filter.length > 0 : filter !== 'all'
              ) 
                ? "No tasks found matching your search and filters." 
                : "No tasks assigned to you."}
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
