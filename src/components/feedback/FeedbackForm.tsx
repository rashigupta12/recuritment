// FeedbackForm.tsx (corrected)
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Send, X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/toast/showToast";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Button } from "../ui/button";
import PaymentImageUpload from "../comman/imageupload/ImageUpload";


interface ImageAttachment {
  name: string;
  owner: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  image: string;
  remarks?: string;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

interface FeedbackItem {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  naming_series: string;
  subject: string;
  customer: string;
  status: "Open" | "Replied" | "On Hold" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  issue_type: "Bug Report" | "Feature Request" | "General Feedback";
  description: string;
  resolution_details?: string;
  opening_date: string;
  opening_time: string;
  agreement_status: string;
  company: string;
  via_customer_portal: number;
  doctype: string;
  custom_images: ImageAttachment[];
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  remarks?: string;
  type: "image" | "pdf" | "doc";
}

const FeedbackForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: Partial<FeedbackItem>) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    issue_type: "General Feedback" as FeedbackItem["issue_type"],
    priority: "Medium" as FeedbackItem["priority"],
    customer: user?.email || "",
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject: "",
        description: "",
        issue_type: "General Feedback",
        priority: "Medium",
        customer: user?.email || "",
      });
      setImages([]);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      showToast.error("Please enter a subject");
      return;
    }

    if (!formData.description.trim()) {
      showToast.error("Please enter a description");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentDate = new Date();
      const feedbackData = {
        ...formData,
        custom_images: images.map((img, idx) => ({
          name: `img-${idx}-${Date.now()}`,
          owner: user?.email || "",
          modified_by: user?.email || "",
          docstatus: 0,
          idx: idx + 1,
          image: img.url,
          remarks: img.remarks || "",
          parent: "",
          parentfield: "custom_images",
          parenttype: "Feedback",
          doctype: "ImageAttachment",
        })),
        opening_date: currentDate.toISOString().split("T")[0],
        opening_time: currentDate.toTimeString().split(" ")[0],
        status: "Open" as FeedbackItem["status"],
      };

      await onSubmit(feedbackData);

      showToast.success("Feedback submitted successfully!");
      setFormData({
        subject: "",
        description: "",
        issue_type: "General Feedback",
        priority: "Medium",
        customer: user?.email || "",
      });
      setImages([]);
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const uploadResponse = await frappeAPI.upload(file, {});
      const fileData = uploadResponse.data.message || uploadResponse.data;
      const fileUrl = fileData.file_url;

      if (!fileUrl) {
        throw new Error("No file URL returned from upload");
      }

      return fileUrl.startsWith("http") ? fileUrl : `${fileUrl}`;
    } catch (error) {
      console.error("File upload failed:", error);
      showToast.error("Failed to upload image. Please try again.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // BACKDROP CLICK closes only if clicking backdrop itself
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // STOP propagation on modal content container
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={handleModalClick}
        tabIndex={-1} // Make focusable for keyboard and cursor improvements
        style={{ outline: "none" }}
      >
        {/* Header */}
        <div className="bg-primary text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Submit New Issue</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isSubmitting || isUploading}
              aria-label="Close feedback form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Field */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-text"
                placeholder="Brief subject for your issue"
                required
                // disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="issue_type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="issue_type"
                  value={formData.issue_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      issue_type: e.target.value as FeedbackItem["issue_type"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  // disabled={isSubmitting}
                >
                  <option value="General Feedback">General Issue</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as FeedbackItem["priority"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  // disabled={isSubmitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none cursor-text"
                placeholder="Please provide detailed description of your issue..."
                required
                // disabled={isSubmitting}
              />
            </div>

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <PaymentImageUpload
                images={images}
                onImagesChange={setImages}
                onUpload={handleImageUpload}
                maxImages={5}
                maxSizeMB={10}
              />
              {isUploading && (
                <p className="text-sm text-gray-500 mt-2">Uploading image...</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isUploading}
                className="min-w-24"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="min-w-24 bg-primary hover:bg-secondary text-white"
              >
                {isSubmitting || isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isUploading ? "Uploading..." : "Submitting..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit Issue
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FeedbackForm;
