"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MultiUserAssignment } from "./MultiUserAssignment";
import LocationDropdown from "../requirement-form/LocationDropdown";
import { showToast } from "@/lib/toast/showToast";

// Types
type StaffingPlanItem = {
  location: string;
  currency: string;
  designation: string;
  vacancies: number;
  estimated_cost_per_position: number;
  number_of_positions: number;
  min_experience_reqyrs: number;
  job_description: string;
  assign_to?: string;
  job_id?: string;
  employment_type?: string;
};

type StaffingPlan = {
  name: string;
  company: string;
  staffing_details: StaffingPlanItem[];
};

interface JobOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffingPlan: StaffingPlan | null;
  staffingDetail: StaffingPlanItem | null;
  planIndex: number;
  detailIndex: number;
  onSuccess: (
    planIndex: number,
    detailIndex: number,
    updates: Partial<StaffingPlanItem>
  ) => void;
  refresh?: () => void;
}

const EMPLOYMENT_TYPES = ["Intern", "Contract", "Part-time", "Full-time"];

export const JobOpeningModal: React.FC<JobOpeningModalProps> = ({
  isOpen,
  onClose,
  staffingPlan,
  staffingDetail,
  planIndex,
  detailIndex,
  onSuccess,
  refresh,
}) => {
  const [isPublished, setIsPublished] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assignTo, setAssignTo] = useState("");
  const [editData, setEditData] = useState<Partial<StaffingPlanItem>>({});
  const [employmentType, setEmploymentType] = useState("");
  const [confirmInfo, setConfirmInfo] = useState(false);

  useEffect(() => {
    console.log("refresh prop:", refresh);
    if (staffingDetail) {
      setAssignTo(staffingDetail.assign_to || "");
      setEmploymentType(staffingDetail.employment_type || "Full-time");
      setEditData({
        designation: staffingDetail.designation,
        location: staffingDetail.location,
        vacancies: staffingDetail.vacancies,
        estimated_cost_per_position: staffingDetail.estimated_cost_per_position,
        min_experience_reqyrs: staffingDetail.min_experience_reqyrs,
        job_description: staffingDetail.job_description,
        currency: staffingDetail.currency,
      });
    }
  }, [staffingDetail]);

  const hasJobId = staffingDetail?.job_id;

  // Calculate if allocation exceeds vacancies
  const calculateTotalAllocated = (assignToString: string): number => {
    if (!assignToString) return 0;
    try {
      return assignToString.split(',').reduce((sum, item) => {
        const [, allocation] = item.trim().split('-');
        return sum + (parseInt(allocation) || 0);
      }, 0);
    } catch {
      return 0;
    }
  };

  const totalAllocated = calculateTotalAllocated(assignTo);
  const isOverAllocated = totalAllocated > (staffingDetail?.vacancies || 0);

  const handleInputChange = (
    field: keyof StaffingPlanItem,
    value: string | number
  ) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateOpening = async () => {
    if (!staffingPlan || !staffingDetail) return;
    
    setIsCreating(true);
    showToast.loading("Creating job opening...");
    
    try {
      const jobData = {
        job_title: editData.designation || staffingDetail.designation,
        company: staffingPlan.company,
        location: editData.location || staffingDetail.location,
        lower_range:
          editData.estimated_cost_per_position ||
          staffingDetail.estimated_cost_per_position,
        currency: editData.currency || staffingDetail.currency,
        job_description:
          editData.job_description || staffingDetail.job_description,
        publish: isPublished ? "1" : "0",
        staffing_plan: staffingPlan.name,
        salary_per: "Year",
        designation: editData.designation || staffingDetail.designation,
        employment_type: employmentType,
      };

      const jobResponse = await frappeAPI.makeAuthenticatedRequest(
        "POST",
        "/resource/Job Opening",
        jobData
      );

      const jobId = jobResponse.data.name;

      const updatedStaffingDetails = [...staffingPlan.staffing_details];
      updatedStaffingDetails[detailIndex] = {
        ...updatedStaffingDetails[detailIndex],
        ...editData,
        job_id: jobId,
        employment_type: employmentType,
      };

      await frappeAPI.makeAuthenticatedRequest(
        "PUT",
        `/resource/Staffing Plan/${staffingPlan.name}`,
        {
          staffing_details: updatedStaffingDetails,
        }
      );

      onSuccess(planIndex, detailIndex, {
        ...editData,
        job_id: jobId,
        employment_type: employmentType,
      });
      
      showToast.success(`Job opening created successfully${isPublished ? ' and published' : ''}`);
      
      if (refresh) refresh();
      onClose();
    } catch (error) {
      console.error("Error creating job opening:", error);
      showToast.error("Failed to create job opening. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAllocation = async () => {
    if (!staffingPlan || !staffingDetail) return;

    setIsAllocating(true);
    showToast.loading("Updating allocation...");
    
    try {
      const updatedStaffingDetails = [...staffingPlan.staffing_details];
      updatedStaffingDetails[detailIndex] = {
        ...updatedStaffingDetails[detailIndex],
        assign_to: assignTo,
      };

      await frappeAPI.makeAuthenticatedRequest(
        "PUT",
        `/resource/Staffing Plan/${staffingPlan.name}`,
        {
          staffing_details: updatedStaffingDetails,
        }
      );

      onSuccess(planIndex, detailIndex, { assign_to: assignTo });
      showToast.success("Allocation updated successfully");
      
      if (refresh) refresh();
      onClose();
    } catch (error) {
      console.error("Error updating allocation:", error);
      showToast.error("Failed to update allocation. Please try again.");
    } finally {
      setIsAllocating(false);
    }
  };

  if (!isOpen || !staffingDetail || !staffingPlan) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[1000px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {hasJobId ? "Job Allocation" : "New Job Opening"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-md">
          {!hasJobId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Position</label>
                <input
                  type="text"
                  value={editData.designation || ""}
                  onChange={(e) =>
                    handleInputChange("designation", e.target.value)
                  }
                  disabled={confirmInfo}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Location</label>
                <LocationDropdown
                  value={editData.location || ""}
                  onChange={(value) => handleInputChange("location", value)}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Vacancies</label>
                <input
                  type="number"
                  value={editData.vacancies || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "vacancies",
                      parseInt(e.target.value) || 0
                    )
                  }
                  disabled={confirmInfo}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Budget (LPA)</label>
                <input
                  type="number"
                  value={editData.estimated_cost_per_position || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "estimated_cost_per_position",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={confirmInfo}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={editData.min_experience_reqyrs || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "min_experience_reqyrs",
                      parseInt(e.target.value) || 0
                    )
                  }
                  disabled={confirmInfo}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  disabled={confirmInfo}
                  className="w-full px-2 py-1 border rounded"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {hasJobId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500">Company:</span>{" "}
                {staffingPlan.company}
              </div>
              <div>
                <span className="text-gray-500">Position:</span>{" "}
                {staffingDetail.designation}
              </div>
              <div>
                <span className="text-gray-500">Location:</span>{" "}
                {staffingDetail.location}
              </div>
              <div>
                <span className="text-gray-500">Experience:</span>{" "}
                {staffingDetail.min_experience_reqyrs}+ yrs
              </div>
              <div>
                <span className="text-gray-500">Employment:</span>{" "}
                {staffingDetail.employment_type || "Full-time"}
              </div>
              <div>
                <span className="text-gray-500">Vacancies:</span>{" "}
                {staffingDetail.vacancies}
              </div>
            </div>
          )}

          {!hasJobId && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={confirmInfo}
                  className="rounded"
                />
                <label
                  htmlFor="isPublished"
                  className="text-gray-900 text-md font-bold cursor-pointer select-none"
                >
                  Publish
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={confirmInfo}
                  onChange={(e) => setConfirmInfo(e.target.checked)}
                />
                <span className="text-gray-700 text-md">
                  I confirm all information is correct.
                </span>
              </div>
            </>
          )}

          {hasJobId && (
            <>
              <MultiUserAssignment
                assignTo={assignTo}
                totalVacancies={staffingDetail.vacancies}
                onAssignToChange={setAssignTo}
                disabled={isAllocating}
              />
              {isOverAllocated && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                  ⚠️ Total allocated ({totalAllocated}) exceeds vacancies ({staffingDetail.vacancies})
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {!hasJobId ? (
            <button
              onClick={handleCreateOpening}
              disabled={!confirmInfo || isCreating}
              className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {isCreating ? "Creating..." : "Create Opening"}
            </button>
          ) : (
            <button
              onClick={handleAllocation}
              disabled={isAllocating || isOverAllocated}
              className="px-4 py-1 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
            >
              {isAllocating ? "Updating..." : "Update Allocation"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};