"use client";
/*eslint-disable  @typescript-eslint/no-explicit-any*/
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
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

const TOAST_ID = "global-toast";

export const showToast = {
  success: (message: string) => toast.success(message, { id: TOAST_ID }),
  error: (message: string) => toast.error(message, { id: TOAST_ID }),
  loading: (message: string) => toast.loading(message, { id: TOAST_ID }),
  dismiss: () => toast.dismiss(TOAST_ID),
};

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
  // Store File objects temporarily until form submission
  const [pendingJDFiles, setPendingJDFiles] = useState<{
    [key: number]: File;
  }>({});
  // Track which job descriptions are expanded
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

  // Handle browser back/forward/reload
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
        // Prevent the navigation
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

  // Staffing Details Management
  const addStaffingItem = () => {
    // Check if all existing rows have designation before adding new one
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

      // Remove pending file if exists
      setPendingJDFiles((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      // Remove expanded state if exists
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

  // Toggle description accordion
  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Job Description Upload - Parse only for summary
  const handleJDUpload = async (file: File, index: number) => {
    if (!file) return;

    // Validate file type
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
        // Only update the job_description field with the summary
        updateStaffingItem(index, "job_description", result.description);

        // Store the file for later upload
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

  // Form Submission - Upload all pending JD files first
const handleSubmit = async () => {
  if (!selectedLead) {
    setError("Please select a lead first");
    return;
  }

  if (!formData.staffing_details.length) {
    setError("Please add at least one staffing requirement");
    return;
  }

  // Validate all rows before submission
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
    // Step 1: Upload all pending JD files to Frappe
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

    // Step 2: Prepare submission data with uploaded file URLs
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
      })),
    };

    // Step 3: Create or update the staffing plan
    let response;
    if (isEditMode && originalPlanId) {
      response = await frappeAPI.makeAuthenticatedRequest(
        "PUT",
        `/resource/Staffing Plan/${originalPlanId}`,
        submissionData
      );
      setSuccessMessage(`Plan updated: ${originalPlanId}`);

      // Update initial form data after successful save
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

    // Immediate redirect after successful submission
    setSuccessMessage("");
    router.push("/dashboard/sales-manager/requirements");
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
      router.push("/dashboard/sales-manager/requirements");
    }
  };

  const confirmBack = () => {
    setShowBackConfirm(false);
    router.push("/dashboard/sales-manager/requirements");
  };

  const cancelBack = () => {
    setShowBackConfirm(false);
  };

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
        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? "Edit Job Board" : "Create Job Board"}
                </h1>
                {isEditMode && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-md">
                    Edit Mode
                  </span>
                )}
                {isLoadingLead && (
                  <div className="flex items-center text-md text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Loading lead...
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-md text-red-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Form Content */}
          {selectedLead && (
            <div className="p-3">
              {/* Staffing Requirements Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <h3 className="text-md font-medium text-gray-900">
                      Requirements
                    </h3>
                  </div>
                  <button
                    onClick={addStaffingItem}
                    disabled={
                      !allRowsHaveDesignation(formData.staffing_details)
                    }
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !allRowsHaveDesignation(formData.staffing_details)
                        ? "Please fill designation for all existing rows"
                        : "Add new requirement"
                    }
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Requirement</span>
                  </button>
                </div>

                {/* Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-md"
                      style={{ tableLayout: "fixed", minWidth: "1200px" }}
                    >
                      <thead className="bg-primary">
                        <tr className="text-left text-white border-b border-gray-200">
                          <th
                            className="p-3 font-medium"
                            style={{
                              width: "200px",
                              minWidth: "200px",
                              maxWidth: "200px",
                            }}
                          >
                            Designation
                          </th>
                          <th
                            className="p-3 font-medium text-center"
                            style={{
                              width: "80px",
                              minWidth: "80px",
                              maxWidth: "80px",
                            }}
                          >
                            Vacancy
                          </th>
                          <th
                            className="p-3 font-medium text-center"
                            style={{
                              width: "100px",
                              minWidth: "100px",
                              maxWidth: "100px",
                            }}
                          >
                            Currency
                          </th>
                          <th
                            className="p-3 font-medium text-center"
                            style={{
                              width: "100px",
                              minWidth: "100px",
                              maxWidth: "100px",
                            }}
                          >
                            AVG.SAL(LPA)
                          </th>
                          <th
                            className="p-3 font-medium text-center"
                            style={{
                              width: "80px",
                              minWidth: "80px",
                              maxWidth: "80px",
                            }}
                          >
                            Exp (Yrs)
                          </th>
                          <th
                            className="p-3 font-medium "
                            style={{
                              width: "150px",
                              minWidth: "150px",
                              maxWidth: "150px",
                            }}
                          >
                            Location
                          </th>
                          <th
                            className="p-3 font-medium"
                            style={{
                              width: "120px",
                              minWidth: "120px",
                              maxWidth: "120px",
                            }}
                          >
                            Upload JD
                          </th>
                          <th
                            className="p-3 font-medium text-center"
                            style={{
                              width: "80px",
                              minWidth: "80px",
                              maxWidth: "80px",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.staffing_details.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr className="bg-white hover:bg-gray-50 transition-colors">
                              {/* Designation */}
                              <td
                                className="p-3"
                                style={{
                                  width: "200px",
                                  minWidth: "200px",
                                  maxWidth: "200px",
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

                              {/* Vacancies */}
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
                                  className="w-full text-center px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                />
                              </td>

                              {/* Currency */}
                              <td
                                className="p-3 text-end"
                                style={{
                                  width: "100px",
                                  minWidth: "100px",
                                  maxWidth: "100px",
                                }}
                              >
                                <CurrencyDropdown
                                  value={item.currency}
                                  onChange={(currency) =>
                                    updateStaffingItem(
                                      index,
                                      "currency",
                                      currency
                                    )
                                  }
                                />
                              </td>

                              {/* Salary in LPA */}
                              <td
                                className="p-3 text-center"
                                style={{
                                  width: "200px",
                                  minWidth: "200px",
                                  maxWidth: "200px",
                                }}
                              >
                                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                  {/* Left fixed section (20%) */}
                                  <div className="w-[30%] bg-gray-100 text-gray-700 font-medium text-sm py-1">
                                    {item.currency}
                                  </div>

                                  {/* Right input section (80%) */}
                                  <input
                                    type="text"
                                    value={item.estimated_cost_per_position}
                                    onChange={(e) =>
                                      updateStaffingItem(
                                        index,
                                        "estimated_cost_per_position",
                                        parseFloat(
                                          e.target.value.replace(/[^\d.]/g, "")
                                        ) || 0
                                      )
                                    }
                                    className="w-[70%] text-center px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter salary"
                                  />
                                </div>
                              </td>

                              {/* Min Experience */}
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
                                  className="w-full text-center px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  step="0.5"
                                  placeholder="0"
                                  min="0"
                                />
                              </td>

                              {/* Location */}
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

                              {/* Upload JD */}
                              <td className="p-3" style={{ width: "120px" }}>
                                <div className="flex items-center gap-1">
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
                                        <span className="text-md">Upload</span>
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

                              {/* Action */}
                              <td
                                className="p-3 text-center"
                                style={{
                                  width: "80px",
                                  minWidth: "80px",
                                  maxWidth: "80px",
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

                            {/* Description Row - Accordion View */}
                            {item.job_description && (
                              <tr className="bg-gray-50 border-t border-gray-200">
                                <td colSpan={8} className="p-0">
                                  <div>
                                    {/* Accordion Header */}
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
                                        <span>Job Description Summary</span>
                                        <span className="text-xs text-gray-500">
                                          (Click to edit )
                                        </span>
                                      </div>
                                    </button>

                                    {/* Accordion Content */}
                                    {expandedDescriptions[index] && (
                                      <div className="px-3 pb-3">
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

                  {/* Create Button at Bottom */}
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
                          ? "Update Job Board"
                          : "Create Job Board"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2 z-50 animate-in slide-in-from-bottom max-w-md">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-md">{successMessage}</span>
        </div>
      )}

      {/* Back Confirmation Dialog */}
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
