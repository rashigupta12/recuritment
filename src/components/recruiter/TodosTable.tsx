/*eslint-disable @typescript-eslint/no-explicit-any*/

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Edit2,
  Share2,
  PinIcon,
  Clock,
  MapPin,
  User,
  Users,
  Building,
  Phone,
} from "lucide-react";
import { showToast } from "../Requirements/Management";
import { SortableTableHeader } from "./SortableTableHeader";

interface SortableTableHeaderProps {
  columns: {
    field: SortField;
    label: string;
    align?: "center" | "left" | "right";
    sortable?: boolean;
  }[];
  sortField: SortField | null;
  sortDirection: SortDirection | null;
  onSort: (field: SortField) => void;
}

interface ToDo {
  custom_department?: string;
  name: string;
  status?: string;
  priority?: string;
  date?: string;
  allocated_to?: string;
  description?: string;
  reference_type?: string;
  reference_name?: string;
  custom_job_id?: string;
  creation?: string;
  modified?: string;
  doctype?: string;
  custom_date_assigned?: string;
  custom_job_title?: string;
  experience?: string;
}

interface TodosTableProps {
  todos: ToDo[];
  onViewTodo: (todo: ToDo) => void;
  onEditTodo: (todo: ToDo) => void;
}

type SortField =
  | "date"
  | "aging"
  | "title"
  | "company"
  | "location"
  | "vacancies"
  | "status";
type SortDirection = "asc" | "desc" | null;

export default function TodosTable({
  todos,
  onViewTodo,
  onEditTodo,
}: TodosTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
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

  const extractCompany = (description?: string) => {
    const match = description?.match(/Company:\s*([^\n]+)/i);
    return match ? match[1].trim() : "-";
  };

  const extractContactName = (description?: string) => {
    const match = description?.match(/Contact Name:\s*([^\n]+)/i);
    return match ? match[1].trim() : "-";
  };

  const extractContactPhone = (description?: string) => {
    const match = description?.match(/Contact Phone:\s*([^\n]+)/i);
    return match ? match[1].trim() : "-";
  };

  const extractContactEmail = (description?: string) => {
    const match = description?.match(/Contact Email:\s*([^\n]+)/i);
    return match ? match[1].trim() : "-";
  };

  const extractLocation = (description?: string) => {
    const match = description?.match(/Location:\s*([^\n]+)/i);
    return match ? match[1].trim() : "-";
  };

  const extractVacancies = (description?: string) => {
    const match = description?.match(/YOUR ALLOCATED POSITIONS:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  const extractExperience = (description?: string) => {
    const match = description?.match(/Min Experience Required:\s*([^\n]+)/i);
    return match ? match[1].trim() : "-";
  };

  const parseExperienceToNumber = (experience: string) => {
    if (experience === "-") return 0;
    // Extract numeric part (e.g., "5.0 years" -> 5.0)
    const numericMatch = experience.match(/(\d+\.?\d*)/);
    return numericMatch ? parseFloat(numericMatch[1]) : 0;
  };

  const calculateAging = (dateAssigned?: string) => {
    if (!dateAssigned) return 0;
    const assigned = new Date(dateAssigned);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays;
  };

  const columns = [
    { field: "date" as const, label: "Date" },
    {
      field: "aging" as const,
      label: "Aging(Days)",
      align: "center" as const,
      sortable: false,
    },
    { field: "company" as const, label: "Company & Contact" },
    { field: "title" as const, label: "Position Details" },
    { field: "location" as const, label: "Location & Experience" },
    {
      field: "vacancies" as const,
      label: "Vacancies",
      align: "center" as const,
      sortable: false,
    },
    {
      field: "status" as const,
      label: "Status",
      align: "center" as const,
      sortable: false,
    },
  ];

  const sortedTodos = [...todos].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "date":
        aValue = a.custom_date_assigned
          ? new Date(a.custom_date_assigned).getTime()
          : 0;
        bValue = b.custom_date_assigned
          ? new Date(b.custom_date_assigned).getTime()
          : 0;
        break;
      case "aging":
        aValue = calculateAging(a.custom_date_assigned);
        bValue = calculateAging(b.custom_date_assigned);
        break;
      case "title":
        aValue = a.custom_job_title || "-";
        bValue = b.custom_job_title || "-";
        break;
      case "company":
        aValue = extractCompany(a.description);
        bValue = extractCompany(b.description);
        break;
      case "location":
        aValue = extractLocation(a.description);
        bValue = extractLocation(b.description);
        break;
      case "vacancies":
        aValue = extractVacancies(a.description);
        bValue = extractVacancies(b.description);
        break;
      case "status":
        aValue = a.status || "-";
        bValue = b.status || "-";
        break;
    }
    if (aValue === "-" && bValue !== "-") return 1;
    if (bValue === "-" && aValue !== "-") return -1;
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleRowClick = (todo: ToDo, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (todo.status?.toLowerCase() === "cancelled") {
      showToast.error("This job is cancelled");
      return;
    }
    onViewTodo(todo);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-100">
        <SortableTableHeader
          columns={columns}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <tbody className="divide-y divide-gray-100">
          {sortedTodos.length > 0 ? (
            sortedTodos.map((todo, index) => {
              const aging = calculateAging(todo.custom_date_assigned);
              const vacancies = extractVacancies(todo.description);
              const contactName = extractContactName(todo.description);
              const contactPhone = extractContactPhone(todo.description);
              const experience = todo.experience || extractExperience(todo.description);
              const experienceValue = parseExperienceToNumber(experience);

              return (
                <tr
                  key={todo.name}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                  onClick={(e) => handleRowClick(todo, e)}
                >
                  {/* Date Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-md font-medium text-gray-900">
                      {todo.custom_date_assigned
                        ? new Date(
                            todo.custom_date_assigned
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </div>
                  </td>
                  {/* Aging Column */}
                  <td className="px-6 py-4 text-center">
                    <div className="text-md font-medium text-gray-900">
                      {aging > 0 ? aging : "-"}
                    </div>
                  </td>
                  {/* Company & Contact Column */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      {extractCompany(todo.description) !== "-" ? (
                        <div className="flex items-start gap-2 font-semibold text-gray-900 text-md">
                          <Building className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <span className="block">
                            {extractCompany(todo.description)}
                          </span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                      {contactName !== "-" ? (
                        <div className="flex items-center text-sm text-gray-500 mt-0.5 leading-snug">
                          <User className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="truncate">{contactName}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                      {contactPhone !== "-" ? (
                        <div className="flex items-center text-xs text-gray-500 mt-0.5 leading-snug">
                          <Phone className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="truncate">{contactPhone}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </td>
                  {/* Position Details Column */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-md">
                      {todo.custom_job_title || "-"}
                    </div>
                  </td>
                  {/* Location & Experience Column */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-md text-gray-600">
                      {extractLocation(todo.description) !== "-" ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{extractLocation(todo.description)}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                      {experienceValue > 0 ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{experience}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </td>
                  {/* Vacancies Column */}
                  <td className="px-6 py-4 text-center">
                    {vacancies > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-md font-semibold text-green-600">
                          {vacancies}
                        </span>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  {/* Status Column */}
                  <td className="px-6 py-4 text-center">
                    <div className="text-md font-medium text-gray-900">
                      {todo.status || "-"}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-12 text-gray-500">
                No jobs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}