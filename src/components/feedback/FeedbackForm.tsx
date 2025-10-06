/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Send, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/toast/showToast";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Button } from "../ui/button";
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
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  issue_type: z.enum(["General Feedback", "Bug Report", "Feature Request"]),
  priority: z.enum(["Low", "Medium", "High"]),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: Partial<any>) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const backdropRef = useRef<HTMLDivElement>(null);
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
      subject: "",
      description: "",
      issue_type: "General Feedback",
      priority: "Medium",
    },
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  useEffect(() => {
    reset({
      subject: "",
      description: "",
      issue_type: "General Feedback",
      priority: "Medium",
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
      custom_image_attachements: images.map((img) => ({
        image: img.url
      })),
      opening_date: currentDate.toISOString().split('T')[0],
      opening_time: currentDate.toTimeString().split(' ')[0],
      status: "Open",
      raised_by: user?.email || "",
    };
    
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
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-md font-medium text-gray-700 mb-2"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  {...register("subject")}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.subject ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Brief subject for your issue"
                  disabled={isSubmitting}
                  autoComplete="off"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>
              {/* <div>
                <label htmlFor="issue_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="issue_type"
                  {...register("issue_type")}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.issue_type ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="General Feedback">General Issue</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
                {errors.issue_type && <p className="text-red-500 text-sm mt-1">{errors.issue_type.message}</p>}
              </div> */}

              <div>
                <label
                  htmlFor="priority"
                  className="block text-md font-medium text-gray-700 mb-2"
                >
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  {...register("priority")}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.priority ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Please provide detailed description of your issue..."
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

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

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 ">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isUploading}
                className="min-w-24"
              >
                <span className="text-lg">Cancel</span>
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
                  <div className="flex items-center gap-2 text-lg">
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
