/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  capitalizeWords,
  cleanJobDescription,
  initialStaffingPlanForm,
  initialStaffingPlanItem,
  LeadType,
  StaffingPlanForm,
  StaffingPlanItem,
} from "./helper";
import { LeadSearchSection } from "./LeadSerach";
import CurrencyDropdown from "./requirement-form/CurrencyDropDown";
import DesignationDropdown from "./requirement-form/DesignationDropdown";
import LocationDropdown from "./requirement-form/LocationDropdown";
import toast from "react-hot-toast";
import { SortableTableHeader } from "../recruiter/SortableTableHeader";
import { TooltipProvider } from "../ui/tooltip";
import { formatToIndianCurrency } from "../Leads/helper";
import StaffingPlansTable from "./RequiremtsView";

const TOAST_ID = "global-toast";

export const showToast = {
  success: (message: string) => toast.success(message, { id: TOAST_ID }),
  error: (message: string) => toast.error(message, { id: TOAST_ID }),
  loading: (message: string) => toast.loading(message, { id: TOAST_ID }),
  dismiss: () => toast.dismiss(TOAST_ID),
};

interface Column<T extends string> {
  field: T;
  label: string;
  sortable: boolean;
  align: "left" | "center" | "right";
  width: string;
}

// Confirmation Dialog Component
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Validation function
const validateStaffingItem = (
  item: StaffingPlanItem,
  index: number
): boolean => {
  const {
    designation,
    vacancies,
    currency,
    estimated_cost_per_position,
    min_experience_reqyrs,
    location,
    employment_type,
  } = item;

  if (!designation?.trim()) {
    showToast.error(`Row ${index + 1}: Designation is required`);
    return false;
  }

  if (!vacancies || vacancies <= 0) {
    showToast.error(`Row ${index + 1}: Vacancies must be greater than 0`);
    return false;
  }

  if (!currency?.trim()) {
    showToast.error(`Row ${index + 1}: Currency is required`);
    return false;
  }

  if (!estimated_cost_per_position || estimated_cost_per_position <= 0) {
    showToast.error(`Row ${index + 1}: Average salary must be greater than 0`);
    return false;
  }

  if (min_experience_reqyrs === undefined || min_experience_reqyrs < 0) {
    showToast.error(`Row ${index + 1}: Experience must be 0 or greater`);
    return false;
  }

  if (!location?.trim()) {
    showToast.error(`Row ${index + 1}: Location is required`);
    return false;
  }

  if (!employment_type?.trim()) {
    showToast.error(`Row ${index + 1}: Employment type is required`);
    return false;
  }

  return true;
};

// Check if all existing rows have designation
const allRowsHaveDesignation = (
  staffingDetails: StaffingPlanItem[]
): boolean => {
  return staffingDetails.every((item) => item.designation?.trim());
};

// Check if form has changes
const hasFormChanges = (
  formData: StaffingPlanForm,
  initialForm: StaffingPlanForm,
  pendingFiles: { [key: number]: File }
): boolean => {
  if (JSON.stringify(formData) !== JSON.stringify(initialForm)) return true;
  if (Object.keys(pendingFiles).length > 0) return true;
  return false;
};

// Define table column types
type StaffingTableColumn =
  | "designation"
  | "vacancies"
  | "currency"
  | "salary"
  | "experience"
  | "location"
  | "employment_type"
  | "upload"
  | "action";

// Employment Type Dropdown Component with Search
const EmploymentTypeDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEmploymentTypes = async () => {
      setIsLoading(true);
      try {
        const response = await frappeAPI.makeAuthenticatedRequest(
          "GET",
          '/resource/Employment Type?fields=["name"]&limit_page_length=0'
        );

        if (response.data) {
          const types = response.data.map((item: any) => item.name);
          setEmploymentTypes(types);
          setFilteredTypes(types);
        }
      } catch (error) {
        console.error("Error fetching employment types:", error);
        const fallbackTypes = [
          "Full-time",
          "Part-time",
          "Probation",
          "Contract",
          "Commission",
          "Piecework",
          "Intern",
          "Apprentice",
        ];
        setEmploymentTypes(fallbackTypes);
        setFilteredTypes(fallbackTypes);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmploymentTypes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTypes(employmentTypes);
    } else {
      const filtered = employmentTypes.filter((type) =>
        type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTypes(filtered);
    }
  }, [searchQuery, employmentTypes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (type: string) => {
    onChange(type);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggle = () => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      setSearchQuery("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    } else if (e.key === "Enter" && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {!isOpen ? (
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <span className="truncate text-left">
            {value || "Employment Type"}
          </span>
          <ChevronDown
            className={`h-3 w-3 text-gray-400 transition-transform flex-shrink-0 ml-1 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      ) : (
        <div className="w-full border border-blue-500 rounded shadow-sm bg-white">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search employment types..."
            className="w-full px-2 py-1.5 text-sm focus:outline-none focus:ring-0 border-0 rounded"
          />
        </div>
      )}

      {isOpen && (
        <div
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1 min-w-[200px]"
          style={{
            top: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().bottom +
                window.scrollY +
                4
              : 0,
            left: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().left +
                window.scrollX
              : 0,
            width: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().width
              : "auto",
            zIndex: 9999,
          }}
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
              <span className="text-xs">Loading employment types...</span>
            </div>
          ) : filteredTypes.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-xs">
              No employment types found
              {searchQuery && (
                <div className="mt-1">
                  No results for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          ) : (
            filteredTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  value === type
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                {type}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
const StaffingPlanCreator: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<StaffingPlanForm>(
    initialStaffingPlanForm
  );
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingJDs, setUploadingJDs] = useState<{
    [key: number]: boolean;
  }>({});
  const [pendingJDFiles, setPendingJDFiles] = useState<{
    [key: number]: File;
  }>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalPlanId, setOriginalPlanId] = useState<string>("");
  const [error, setError] = useState("");
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);
  const [initialFormData, setInitialFormData] = useState<StaffingPlanForm>(
    initialStaffingPlanForm
  );
  const [previousPlans, setPreviousPlans] = useState<any[]>([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);

  // Table sorting state
  const [sortField, setSortField] = useState<StaffingTableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

  // Table columns configuration
  const tableColumns: Column<StaffingTableColumn>[] = [
    {
      field: "designation",
      label: "Designation",
      sortable: false,
      align: "center",
      width: "180px",
    },
    {
      field: "vacancies",
      label: "No. of Vacancies",
      sortable: false,
      align: "center",
      width: "70px",
    },
    {
      field: "salary",
      label: "Average Salary",
      sortable: false,
      align: "center",
      width: "150px",
    },
    {
      field: "experience",
      label: "Exp (Yrs)",
      sortable: false,
      align: "center",
      width: "70px",
    },
    {
      field: "location",
      label: "Location",
      sortable: false,
      align: "center",
      width: "120px",
    },
    {
      field: "employment_type",
      label: "Employment Type",
      sortable: false,
      align: "center",
      width: "80px",
    },
    {
      field: "upload",
      label: "Job Description",
      sortable: false,
      align: "center",
      width: "80px",
    },
    {
      field: "action",
      label: "Action",
      sortable: false,
      align: "center",
      width: "80px",
    },
  ];

  // Handle table sorting
  const handleSort = (field: StaffingTableColumn) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    const handleInitialLoad = async () => {
      const leadId = searchParams.get("leadId");
      const planId = searchParams.get("planId");
      const mode = searchParams.get("mode");

      setIsEditMode(mode === "edit");

      if (planId && mode === "edit") {
        setIsLoadingPlan(true);
        setOriginalPlanId(planId);

        try {
          const planResponse = await frappeAPI.makeAuthenticatedRequest(
            "GET",
            `/resource/Staffing Plan/${planId}`
          );

          if (planResponse && planResponse.data) {
            const planData = planResponse.data;
            const loadedFormData = {
              name: planData.name || "",
              custom_lead: planData.custom_lead || "",
              from_date:
                planData.from_date || new Date().toISOString().split("T")[0],
              to_date:
                planData.to_date ||
                new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              custom_assign_to: planData.custom_assign_to || "",
              assigned_to_full_name: planData.assigned_to_full_name || "",
              staffing_details: planData.staffing_details?.map((item: any) => ({
                currency: item.currency || "INR",
                designation: item.designation || "",
                vacancies: item.vacancies || 0,
                estimated_cost_per_position:
                  item.estimated_cost_per_position || 0,
                number_of_positions: item.number_of_positions || 1,
                min_experience_reqyrs: item.min_experience_reqyrs || 0,
                job_description: cleanJobDescription(
                  item.job_description || ""
                ),
                attachmentsoptional: item.attachmentsoptional || "",
                assign_to: item.assign_to || "",
                location: item.location || "",
                employment_type: item.employment_type || "",
              })) || [initialStaffingPlanItem],
            };

            setFormData(loadedFormData);
            setInitialFormData(loadedFormData);

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
                console.error("Error fetching lead details:", leadError);
                setError("Could not load lead details");
              } finally {
                setIsLoadingLead(false);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching plan details:", error);
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
          console.error("Error fetching lead details:", error);
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
      const newFormData = {
        ...initialStaffingPlanForm,
        name: capitalizeWords(
          `Staffing Plan - ${selectedLead.custom_full_name}`
        ),
        custom_lead: selectedLead.name,
        to_date:
          selectedLead.custom_expected_close_date ||
          initialStaffingPlanForm.to_date,
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
    }
  }, [selectedLead, isEditMode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormChanges(formData, initialFormData, pendingJDFiles)) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasFormChanges(formData, initialFormData, pendingJDFiles)) {
        setShowBackConfirm(true);
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [formData, initialFormData, pendingJDFiles]);

  useEffect(() => {
    if (selectedLead) {
      const fetchPreviousPlans = async () => {
        setIsLoadingPrevious(true);
        try {
          const response = await frappeAPI.makeAuthenticatedRequest(
            "GET",
            `/resource/Staffing Plan?filters=[["custom_lead","=","${selectedLead.name}"]]&order_by=creation%20desc`
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
            (plan) => plan !== null && plan.name !== originalPlanId
          ) as any[];
          setPreviousPlans(validPlans);
        } catch (error) {
          console.error("Error fetching previous staffing plans:", error);
          setError("Failed to load previous requirements. Please try again.");
        } finally {
          setIsLoadingPrevious(false);
        }
      };

      fetchPreviousPlans();
    } else {
      setPreviousPlans([]);
    }
  }, [selectedLead, originalPlanId]);

  const addStaffingItem = () => {
    if (!allRowsHaveDesignation(formData.staffing_details)) {
      showToast.error(
        "Please fill designation for all existing rows before adding a new one"
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      staffing_details: [
        ...prev.staffing_details,
        { ...initialStaffingPlanItem },
      ],
    }));
  };

  const removeStaffingItem = (index: number) => {
    if (formData.staffing_details.length > 1) {
      setFormData((prev) => ({
        ...prev,
        staffing_details: prev.staffing_details.filter((_, i) => i !== index),
      }));

      setPendingJDFiles((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      setExpandedDescriptions((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const updateStaffingItem = (
    index: number,
    field: keyof StaffingPlanItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      staffing_details: prev.staffing_details.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleJDUpload = async (file: File, index: number) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload PDF, DOCX, or TXT files only");
      return;
    }

    setUploadingJDs((prev) => ({ ...prev, [index]: true }));
    setError("");

    try {
      console.log("Parsing job description with AI...");
      const parseFormData = new FormData();
      parseFormData.append("file", file);
      parseFormData.append("fileName", file.name);

      const response = await fetch("/api/jobdescription", {
        method: "POST",
        body: parseFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse job description");
      }

      const result = await response.json();

      if (result.success && result.description) {
        updateStaffingItem(index, "job_description", result.description);
        setPendingJDFiles((prev) => ({
          ...prev,
          [index]: file,
        }));
      }
    } catch (error) {
      console.error("Error processing JD:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process job description";
      setError(errorMessage);
    } finally {
      setUploadingJDs((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedLead) {
      setError("Please select a lead first");
      return;
    }

    if (!formData.staffing_details.length) {
      setError("Please add at least one staffing requirement");
      return;
    }

    let allValid = true;
    formData.staffing_details.forEach((item, index) => {
      if (!validateStaffingItem(item, index)) {
        allValid = false;
      }
    });

    if (!allValid) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const uploadedFileUrls: { [key: number]: string } = {};

      for (const [indexStr, file] of Object.entries(pendingJDFiles)) {
        const index = parseInt(indexStr);
        console.log(`Uploading JD file for requirement ${index}...`);

        try {
          const uploadResult = await frappeAPI.upload(file, {
            is_private: false,
            folder: "Home",
          });

          if (uploadResult.success && uploadResult.file_url) {
            uploadedFileUrls[index] = uploadResult.file_url;
            console.log(
              `JD file uploaded successfully: ${uploadResult.file_url}`
            );
          }
        } catch (uploadError) {
          console.error(
            `Failed to upload JD file for requirement ${index}:`,
            uploadError
          );
        }
      }

      const submissionData = {
        custom_lead: formData.custom_lead,
        from_date: formData.from_date,
        to_date: formData.to_date,
        custom_assign_to: formData.custom_assign_to || "",
        staffing_details: formData.staffing_details.map((item, index) => ({
          currency: item.currency,
          designation: capitalizeWords(item.designation),
          vacancies: item.vacancies,
          estimated_cost_per_position: item.estimated_cost_per_position,
          number_of_positions: item.number_of_positions,
          min_experience_reqyrs: item.min_experience_reqyrs,
          job_description: item.job_description.startsWith("<")
            ? item.job_description
            : `<div class="ql-editor read-mode"><p>${capitalizeWords(
                item.job_description
              )}</p></div>`,
          attachmentsoptional:
            uploadedFileUrls[index] || item.attachmentsoptional || "",
          assign_to: item.assign_to || "",
          location: item.location || "",
          employment_type: item.employment_type || "",
        })),
      };

      let response;
      if (isEditMode && originalPlanId) {
        response = await frappeAPI.makeAuthenticatedRequest(
          "PUT",
          `/resource/Staffing Plan/${originalPlanId}`,
          submissionData
        );
        setSuccessMessage(`Plan updated: ${originalPlanId}`);

        setInitialFormData(formData);
        setPendingJDFiles({});
      } else {
        response = await frappeAPI.createStaffingPlan(submissionData);
        setSuccessMessage(`Plan created: ${response.data.name}`);

        if (!isEditMode) {
          setFormData(initialStaffingPlanForm);
          setInitialFormData(initialStaffingPlanForm);
          setSelectedLead(null);
          setPendingJDFiles({});
        }
      }

      setSuccessMessage("");
      router.push("/dashboard/recruiter/contract");
    } catch (error) {
      console.error("Error:", error);
      setError(isEditMode ? "Failed to update plan" : "Failed to create plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasFormChanges(formData, initialFormData, pendingJDFiles)) {
      setShowBackConfirm(true);
    } else {
      router.push("/dashboard/recruiter/contract");
    }
  };

  const confirmBack = () => {
    setShowBackConfirm(false);
    router.push("/dashboard/recruiter/contract");
  };

  const cancelBack = () => {
    setShowBackConfirm(false);
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

  // RENDER - Moved loading check here instead of early return
  if (isLoadingPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Job Details
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the Job data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex gap-2 w-full mx-auto">
        <div className="flex-1 bg-white rounded-lg shadow-sm border">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Requirements" : "Create Requirements"}
                </h1>
                {isLoadingLead && (
                  <div className="flex items-center text-md text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Loading lead...
                  </div>
                )}
              </div>

              <button
                onClick={addStaffingItem}
                disabled={!allRowsHaveDesignation(formData.staffing_details)}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !allRowsHaveDesignation(formData.staffing_details)
                    ? "Please fill designation for all existing rows"
                    : "Add new requirement"
                }
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              {!selectedLead && !isLoadingLead && (
                <LeadSearchSection
                  onLeadSelect={setSelectedLead}
                  selectedLead={selectedLead}
                  disabled={isEditMode}
                />
              )}
              {selectedLead && (
                <div className="bg-green-50 border border-green-200 rounded p-2 pl-5 text-sm text-green-800">
                  <span className="font-medium">Selected Lead:</span>{" "}
                  {selectedLead.custom_full_name} - {selectedLead.company_name}
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-md text-red-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {selectedLead && (
            <div className="p-3">
              <div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table
                      className="w-full"
                      style={{ tableLayout: "fixed", minWidth: "800px" }}
                    >
                      <SortableTableHeader
                        columns={tableColumns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />

                      <tbody className="divide-y divide-gray-200">
                        {formData.staffing_details.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr className="bg-white hover:bg-gray-50 transition-colors">
                              <td
                                className="p-3"
                                style={{
                                  width: "180px",
                                  minWidth: "180px",
                                  maxWidth: "180px",
                                }}
                              >
                                <DesignationDropdown
                                  value={item.designation}
                                  onChange={(val) =>
                                    updateStaffingItem(
                                      index,
                                      "designation",
                                      val
                                    )
                                  }
                                />
                              </td>

                              <td
                                className="p-3 text-center"
                                style={{
                                  width: "80px",
                                  minWidth: "80px",
                                  maxWidth: "80px",
                                }}
                              >
                                <input
                                  type="number"
                                  value={item.vacancies || ""}
                                  onChange={(e) =>
                                    updateStaffingItem(
                                      index,
                                      "vacancies",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-full text-end px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                />
                              </td>

                              <td
                                className="p-2 text-center"
                                style={{
                                  width: "300px",
                                  minWidth: "300px",
                                  maxWidth: "300px",
                                }}
                              >
                                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                  <div className="w-[25%] border-r border-gray-300">
                                    <CurrencyDropdown
                                      value={item.currency}
                                      onChange={(val) =>
                                        updateStaffingItem(
                                          index,
                                          "currency",
                                          val
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="w-[45%]">
                                    <input
                                      type="number"
                                      value={
                                        item.estimated_cost_per_position === 0 ||
                                        item.estimated_cost_per_position === undefined
                                          ? ""
                                          : item.estimated_cost_per_position
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        updateStaffingItem(
                                          index,
                                          "estimated_cost_per_position",
                                          value === "" ? 0 : parseFloat(value) || 0
                                        );
                                      }}
                                      className="w-full text-end px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm border-0"
                                      placeholder="0"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="w-[25%] ">LPA</div>
                                </div>
                              </td>

                              <td
                                className="p-3 text-center"
                                style={{
                                  width: "80px",
                                  minWidth: "80px",
                                  maxWidth: "80px",
                                }}
                              >
                                <input
                                  type="number"
                                  value={item.min_experience_reqyrs || ""}
                                  onChange={(e) =>
                                    updateStaffingItem(
                                      index,
                                      "min_experience_reqyrs",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-full text-end px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  step="0.5"
                                  placeholder="0"
                                  min="0"
                                />
                              </td>

                              <td
                                className="p-3"
                                style={{
                                  width: "150px",
                                  minWidth: "150px",
                                  maxWidth: "150px",
                                }}
                              >
                                <LocationDropdown
                                  value={item.location || ""}
                                  onChange={(val) =>
                                    updateStaffingItem(index, "location", val)
                                  }
                                />
                              </td>

                              <td
                                className="p-2"
                                style={{
                                  width: "80px",
                                  minWidth: "80px",
                                  maxWidth: "80px",
                                }}
                              >
                                <EmploymentTypeDropdown
                                  value={item.employment_type || ""}
                                  onChange={(val) =>
                                    updateStaffingItem(
                                      index,
                                      "employment_type",
                                      val
                                    )
                                  }
                                />
                              </td>

                              <td
                                className="p-3 text-center"
                                style={{ width: "120px" }}
                              >
                                <div className="flex justify-center items-center gap-2">
                                  <label className="flex items-center space-x-1 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors">
                                    {uploadingJDs[index] ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-md">
                                          Parsing...
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4" />
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.docx,.txt"
                                      onChange={(e) =>
                                        e.target.files?.[0] &&
                                        handleJDUpload(e.target.files[0], index)
                                      }
                                      disabled={uploadingJDs[index]}
                                    />
                                  </label>

                                  {pendingJDFiles[index] &&
                                    !uploadingJDs[index] && (
                                      <FileText className="h-4 w-4 text-orange-600" />
                                    )}

                                  {item.attachmentsoptional &&
                                    !pendingJDFiles[index] && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                </div>
                              </td>

                              <td
                                className="p-3 text-center"
                                style={{
                                  width: "50px",
                                  minWidth: "50px",
                                  maxWidth: "50px",
                                }}
                              >
                                <button
                                  onClick={() => removeStaffingItem(index)}
                                  disabled={
                                    formData.staffing_details.length === 1
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={
                                    formData.staffing_details.length === 1
                                      ? "Cannot remove the only requirement"
                                      : "Remove requirement"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>

                            {item.job_description && (
                              <tr className="bg-gray-50 border-t border-gray-200">
                                <td colSpan={8} className="p-0">
                                  <div>
                                    <button
                                      onClick={() => toggleDescription(index)}
                                      className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex items-center gap-2 text-md font-medium text-gray-700">
                                        {expandedDescriptions[index] ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                        <FileText className="h-4 w-4" />
                                        <span>Job Description </span>
                                        <span className="text-xs text-gray-500">
                                          <Edit className="h-4 w-4" />
                                        </span>
                                      </div>
                                    </button>

                                    {expandedDescriptions[index] && (
                                      <div className="border-t border-gray-200 px-3 py-3 bg-white">
                                        <textarea
                                          value={item.job_description
                                            .replace(/<[^>]*>/g, "")
                                            .replace(/&nbsp;/g, " ")
                                            .trim()}
                                          onChange={(e) =>
                                            updateStaffingItem(
                                              index,
                                              "job_description",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-md resize-y min-h-[300px]"
                                          placeholder="Upload a JD file to auto-generate a summary here, or type manually. You can edit the generated summary as needed."
                                        />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        isSaving ||
                        !formData.custom_lead ||
                        !allRowsHaveDesignation(formData.staffing_details)
                      }
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      <span>
                        {isSaving
                          ? isEditMode
                            ? "Updating..."
                            : "Creating..."
                          : isEditMode
                          ? "Save Requirement(s)"
                          : "Create Requirement(s)"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedLead && (
            <div className="p-6 border-t border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Previous Requirements
              </h2>
              {isLoadingPrevious ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Loading previous requirements...
                  </p>
                </div>
              ) : previousPlans.length > 0 ? (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    {/* <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-500 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Position Details
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Location & Experience
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Vacancies & Budget
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previousPlans.map((plan) => (
                          <React.Fragment key={plan.name}>
                            {plan.staffing_details.map(
                              (detail: any, detailIndex: number) => (
                                <tr
                                  key={`${plan.name}-${detailIndex}`}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  {plan.creation && (
                                    <td className="px-4 py-2 whitespace-nowrap text-md text-gray-900">
                                      {(() => {
                                        const { date, time } =
                                          formatDateAndTimeV2(plan.creation);
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
                                  <td className="px-4 py-4 capitalize">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-gray-900 text-md">
                                        {detail.designation}
                                      </span>
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
                                          {detail.min_experience_reqyrs}+ years
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
                                              .reduce(
                                                (sum: number, item: string) => {
                                                  const [, allocation] = item
                                                    .trim()
                                                    .split("-");
                                                  return (
                                                    sum +
                                                    (parseInt(allocation) || 0)
                                                  );
                                                },
                                                0
                                              )
                                          : 0;
                                        const remaining =
                                          detail.vacancies - allocated;
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
                                </tr>
                              )
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table> */}
                    <StaffingPlansTable selectedLead={selectedLead}/>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                  No previous requirements found for this company.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2 z-50 animate-in slide-in-from-bottom max-w-md">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-md">{successMessage}</span>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showBackConfirm}
        onConfirm={confirmBack}
        onCancel={cancelBack}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Leave"
        cancelText="Stay"
      />
    </div>
  );
};

export default StaffingPlanCreator;