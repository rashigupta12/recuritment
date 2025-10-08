/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle, Send, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/toast/showToast";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Button } from "@/components/ui/button";
import PaymentImageUpload from "../comman/imageupload/ImageUpload";

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  remarks?: string;
  type: "image" | "pdf" | "doc";
}

// Define Zod schema for validation
const feedbackSchema = z.object({
  module: z.enum(["Dashboard", "Customers","Requirements","Jobs Assigned", "Candidate Tracker",]),
  description: z.string().min(1, "Description is required"),
  issue_type: z.enum(["General Feedback", "Bug Report", "Feature Request"]),
  type: z.enum(["Incident", "Feedback"]),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: Partial<any>) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      module: "Dashboard",
      description: "",
      issue_type: "General Feedback",
      type: "Feedback",
    },
  });

  useEffect(() => {
    reset({
      module: "Dashboard",
      description: "",
      issue_type: "General Feedback",
      type: "Feedback",
    });
    setImages([]);
  }, [user, reset]);

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

  const onFormSubmit = async (data: FeedbackFormData) => {
    const currentDate = new Date();
    try {
      const feedbackData = {
        ...data,
        subject: data.module,
        priority: data.type === "Incident" ? "High" : "Medium",
        custom_image_attachements: images.map((img) => ({
          image: img.url
        })),
        opening_date: currentDate.toISOString().split('T')[0],
        opening_time: currentDate.toTimeString().split(' ')[0],
        status: "Open",
        raised_by: user?.email || "",
      };
      console.log("Feedback data sent to backend:", feedbackData);
      await onSubmit(feedbackData);
      showToast.success("Feedback submitted successfully!");
      reset();
      setImages([]);
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast.error("Failed to submit feedback. Please try again.");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl  flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary px-6 py-4 border-b rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-white" />
              <h2 className="text-xl font-semibold text-white">Submit Issue</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Close feedback form"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <form id="feedback-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Module */}
            <div className="space-y-2">
              <label htmlFor="module" className="block text-md font-medium text-gray-700">
                Module
              </label>
              <select
                id="module"
                {...register("module")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="Dashboard">Dashboard</option>
                <option value="Jobs Assigned">Jobs Assigned</option>
                <option value="Candidate Tracker">Candidate Tracker</option>
                <option value="Requirements">Requirements</option>
              </select>
              {errors.module && (
                <p className="text-red-600 text-xs">{errors.module.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="block text-md font-medium text-gray-700">
                Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Incident"
                    {...register("type")}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-md text-gray-700">Incident</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Feedback"
                    {...register("type")}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-md text-gray-700">Feedback</span>
                </label>
              </div>
              {errors.type && (
                <p className="text-red-600 text-xs">{errors.type.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-md font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe your issue or feedback..."
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-red-600 text-xs">{errors.description.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-md font-medium text-gray-700">
                Attachments
              </label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600 mb-3">
                  Add screenshots or files (Max 5 files, 10MB each)
                </p>
                <PaymentImageUpload
                  images={images}
                  onImagesChange={setImages}
                  onUpload={handleImageUpload}
                  maxImages={5}
                  maxSizeMB={10}
                />
                {isUploading && (
                  <div className="flex items-center gap-2 mt-2 text-md text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting || isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isUploading ? "Uploading..." : "Submitting..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit
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