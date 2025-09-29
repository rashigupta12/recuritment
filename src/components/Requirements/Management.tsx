"use client";
/*eslint-disable  @typescript-eslint/no-explicit-any*/
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Users
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

// Main Component
const StaffingPlanCreator: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<StaffingPlanForm>(
    initialStaffingPlanForm
  );
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: number]: boolean;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalPlanId, setOriginalPlanId] = useState<string>("");
  const [error, setError] = useState<string>("");
  // const [showAssignDropdown, setShowAssignDropdown] = useState(false);

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

            setFormData({
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
                assign_to: item.assign_to || "", // Added this line
              })) || [initialStaffingPlanItem],
            });

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
      setFormData((prev) => ({
        ...prev,
        name: capitalizeWords(
          `Staffing Plan - ${selectedLead.custom_full_name}`
        ),
        custom_lead: selectedLead.name,
        to_date: selectedLead.custom_expected_close_date || prev.to_date,
      }));
    }
  }, [selectedLead, isEditMode]);

  // Staffing Details Management
  const addStaffingItem = () => {
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

  // File Upload
  const handleFileUpload = async (file: File, index: number) => {
    if (!file) return;

    setUploadingFiles((prev) => ({ ...prev, [index]: true }));

    try {
      const uploadResult = await frappeAPI.upload(file, {
        is_private: false,
        folder: "Home",
      });

      if (uploadResult.success) {
        updateStaffingItem(index, "attachmentsoptional", uploadResult.file_url);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Assign User (for overall plan assignment)
  // const handleAssignUser = async (userEmail: string, userName: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     custom_assign_to: userEmail,
  //     assigned_to_full_name: userName,
  //   }));
  // };

  // Form Submission
  const handleSubmit = async () => {
    if (!selectedLead) {
      setError("Please select a lead first");
      return;
    }

    if (!formData.staffing_details.length) {
      setError("Please add at least one staffing requirement");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const submissionData = {
        custom_lead: formData.custom_lead,
        from_date: formData.from_date,
        to_date: formData.to_date,
        custom_assign_to: formData.custom_assign_to || "",
        staffing_details: formData.staffing_details.map((item) => ({
  currency: item.currency,
  designation: capitalizeWords(item.designation),
  vacancies: item.vacancies,
  estimated_cost_per_position: item.estimated_cost_per_position,
  number_of_positions: item.number_of_positions,
  min_experience_reqyrs: item.min_experience_reqyrs,
  job_description: `<div class="ql-editor read-mode"><p>${capitalizeWords(item.job_description)}</p></div>`,
  attachmentsoptional: item.attachmentsoptional || "",
  assign_to: item.assign_to || "",
  location: item.location || "", // <-- ADD THIS LINE
}))
,
      };

      let response;
      if (isEditMode && originalPlanId) {
        response = await frappeAPI.makeAuthenticatedRequest(
          "PUT",
          `/resource/Staffing Plan/${originalPlanId}`,
          submissionData
        );
        setSuccessMessage(`Plan updated: ${originalPlanId}`);
      } else {
        response = await frappeAPI.createStaffingPlan(submissionData);
        setSuccessMessage(`Plan created: ${response.data.name}`);

        if (!isEditMode) {
          setFormData(initialStaffingPlanForm);
          setSelectedLead(null);
        }
      }

      setTimeout(() => {
        setSuccessMessage("");
        router.push("/dashboard/sales-manager/requirements");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setError(isEditMode ? "Failed to update plan" : "Failed to create plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/sales-manager/requirements");
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
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Edit Mode
                  </span>
                )}
                {isLoadingLead && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Loading lead...
                  </div>
                )}
              </div>

              {/* Assign Button and Save Button */}
              <div className="flex items-center gap-2">
                {/* Save Button */}
                {selectedLead && (
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving || !formData.custom_lead}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>
                      {isSaving
                        ? isEditMode
                          ? "Updating..."
                          : "Creating..."
                        : isEditMode
                        ? "Update"
                        : "Create"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {!selectedLead && !isLoadingLead && (
              <LeadSearchSection
                onLeadSelect={setSelectedLead}
                selectedLead={selectedLead}
                disabled={isEditMode}
              />
            )}
            {selectedLead && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-800">
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

          {/* Form Content */}
          {selectedLead && (
            <div className="p-3">
              {/* Staffing Requirements Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-900">
                      Requirements
                    </h3>
                  </div>
                  <button
                    onClick={addStaffingItem}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Requirement</span>
                  </button>
                </div>

                {/* Updated Table with improved overflow handling */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1200px]">
                      <thead className="bg-gray-100">
                        <tr className="text-left text-gray-700 border-b border-gray-200">
                          <th className="p-3 font-medium w-[180px]">
                            Designation
                          </th>
                          <th className="p-3 font-medium w-[60px] text-center">
                            Vac
                          </th>
                          <th className="p-3 font-medium w-[60px] text-center">
                            AVG.SAL(PA)
                          </th>
                          <th className="p-3 font-medium w-[60px] text-center">
                            Exp (Yrs)
                          </th>
                          <th className="p-3 font-medium w-[80px] text-center">
                            Currency
                          </th>
                          <th className="p-3 font-medium w-[180px]">
                            Location
                          </th>
                          {/* <th className="p-3 font-medium w-[100px]">
                            Assign To
                          </th> */}
                          <th className="p-3 font-medium w-[100px]">
                            Attachment
                          </th>
                          <th className="p-3 font-medium w-[80px] text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.staffing_details.map((item, index) => (
                          <tr
                            key={index}
                            className="bg-white hover:bg-gray-50 transition-colors"
                          >
                            {/* Designation */}
                            <td className="p-3">
                              <DesignationDropdown
                                value={item.designation}
                                onChange={(val) =>
                                  updateStaffingItem(index, "designation", val)
                                }
                              />
                            </td>

                            {/* Vacancies */}
                            <td className="p-3 text-center">
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
                                className="w-[60px] text-center px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                min="0"
                                placeholder="0"
                              />
                            </td>

                            {/* Salary in LPA */}
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                value={item.estimated_cost_per_position || ""}
                                onChange={(e) =>
                                  updateStaffingItem(
                                    index,
                                    "estimated_cost_per_position",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-[60px] text-center px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </td>

                            {/* Min Experience */}
                            <td className="p-3 text-center">
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
                                className="w-[60px] text-center px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                step="0.5"
                                placeholder="0"
                                min="0"
                              />
                            </td>

                            {/* Currency */}
                            <td className="p-3 text-center w-[80px]">
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

                            {/* Location */}
                            <td className="p-3 w-[180px]">
                              <LocationDropdown
                                value={item.location || ""}
                                onChange={(val) =>
                                  updateStaffingItem(index, "location", val)
                                }
                              />
                            </td>

                            {/* Multi-User Assignment */}
                            {/* <td className="p-3 w-[100px]">
                              <MultiUserAssignment
                                assignTo={item.assign_to}
                                totalVacancies={item.vacancies}
                                onAssignToChange={(assignTo) =>
                                  updateStaffingItem(
                                    index,
                                    "assign_to",
                                    assignTo
                                  )
                                }
                                itemIndex={index}
                              />
                            </td> */}

                            {/* Attachment */}
                            <td className="p-3 w-[100px]">
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors">
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm">Upload</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) =>
                                      e.target.files?.[0] &&
                                      handleFileUpload(e.target.files[0], index)
                                    }
                                  />
                                </label>
                                {uploadingFiles[index] && (
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                )}
                                {item.attachmentsoptional && (
                                  <FileText className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </td>

                            {/* Action */}
                            <td className="p-3 text-center">
                              <button
                                onClick={() => removeStaffingItem(index)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {/* <div className="w-80 flex-shrink-0">
          {isLoadingLead ? (
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Loading Lead
              </h3>
              <p className="text-xs text-gray-500">
                Please wait while we load the lead details...
              </p>
            </div>
          ) : selectedLead ? (
            <LeadInfoSidebar lead={selectedLead} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                No Lead Selected
              </h3>
              <p className="text-xs text-gray-500">
                {isEditMode
                  ? "Lead information will appear here once loaded."
                  : "Search and select a lead to create a staffing plan."}
              </p>
            </div>
          )}
        </div> */}
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default StaffingPlanCreator;
