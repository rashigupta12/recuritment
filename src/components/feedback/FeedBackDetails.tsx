/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Bug,
  Calendar,
  CheckCircle,
  Eye,
  MessageCircle,
  Paperclip,
  PlusCircle,
  X
} from "lucide-react";
import React, { useState } from "react";
import AttachmentPreviewModal from "./AttachmentperviewModal";
import { Button } from "../ui/button";
import { createPortal } from "react-dom";
import { FeedbackItem, ImageAttachment } from "@/types/feedback";

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Helper function to render HTML content safely
const renderHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return "";
  return stripHtml(htmlContent);
};

// Helper function to check if file is an image
const isImageFile = (attachment: ImageAttachment): boolean => {
  const filename = attachment?.image;

  if (!filename) return false;

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
  ];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return imageExtensions.includes(extension);
};

// Feedback Details Component with createPortal
const FeedbackDetails: React.FC<{
  feedback: FeedbackItem;
  onClose: () => void;
}> = ({ feedback, onClose }) => {
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "Replied":
        return "bg-blue-100 text-blue-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) {
      return "bg-gray-100 text-gray-800";
    }
    switch (priority) {
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-white";
      case "Low":
        return "bg-emerald-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case "Bug Report":
        return <Bug className="h-5 w-5" />;
      case "Feature Request":
        return <PlusCircle className="h-5 w-5" />;
      case "General Feedback":
      case "Query":
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getImageUrl = (attachment: ImageAttachment) => {
    const imageurl = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;
    const url = attachment.image;

    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    if (url.startsWith("blob:")) {
      return url;
    }

    if (url.startsWith("/")) {
      return `${imageurl}${url}`;
    }

    return `${imageurl}/${url}`;
  };

  const handleAttachmentView = (attachment: ImageAttachment, index: number) => {
    if (isImageFile(attachment)) {
      setCurrentAttachmentIndex(index);
      setShowAttachmentPreview(true);
    } else {
      const url = getImageUrl(attachment);
      if (url) {
        window.open(url, "_blank");
      }
    }
  };

  const fmt = (d?: string) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={stopPropagation}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 flex-shrink-0 z-10 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIssueTypeIcon(feedback.issue_type)}
              <h2 className="text-2xl font-bold tracking-tight">Issue Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close issue details"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-4 space-y-8">
          <div className="space-y-6">
            {/* Status, Priority, and Issue Type */}
            <div className="flex flex-wrap gap-3">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                  feedback.status
                )} shadow-sm`}
              >
                {feedback.status}
              </span>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(
                  feedback.priority
                )} shadow-sm`}
              >
                {feedback.priority || "N/A"}
              </span>
              <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-800 shadow-sm">
                {feedback.issue_type}
              </span>
            </div>

            {/* Subject */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Module</h3>
              <p className="text-gray-700 text-base">{feedback.subject}</p>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="text-gray-700 text-base whitespace-pre-wrap">
                {renderHtmlContent(feedback.description)}
              </div>
            </div>

            {/* Resolution Details */}
            {feedback.resolution_details && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Response from Support Team</h3>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-gray-700 text-base">
                  {renderHtmlContent(feedback.resolution_details)}
                </div>
              </div>
            )}

            {/* Dates and Raised By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Created</h4>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {fmt(feedback.opening_date)}
                    {feedback.opening_time && ` at ${feedback.opening_time}`}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Raised By</h4>
                <p className="text-gray-600 text-base">{feedback.raised_by}</p>
              </div>
            </div>

            {/* Attachments */}
            {feedback.custom_image_attachements && feedback.custom_image_attachements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attachments ({feedback.custom_image_attachements.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {feedback.custom_image_attachements.map((attachment, index) => {
                    const isImage = isImageFile(attachment);
                    const fileName =
                      attachment.image?.split("/").pop() ||
                      `Attachment ${index + 1}`;

                    return (
                      <div
                        key={attachment.name || index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {isImage ? (
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden">
                              <img
                                src={getImageUrl(attachment)}
                                alt={fileName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const nextSibling = target.nextElementSibling;
                                  target.style.display = "none";
                                  if (nextSibling && nextSibling instanceof HTMLElement) {
                                    nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                              <Eye
                                className="h-5 w-5 text-blue-500"
                                style={{ display: "none" }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Paperclip className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div className="max-w-[150px]">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileName}
                            </p>
                            {attachment.remarks && (
                              <p className="text-xs text-gray-500 truncate">
                                {attachment.remarks}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAttachmentView(attachment, index)}
                          className="h-8 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Attachment Preview Modal */}
        {feedback.custom_image_attachements && feedback.custom_image_attachements.length > 0 && (
          <AttachmentPreviewModal
            isOpen={showAttachmentPreview}
            onClose={() => setShowAttachmentPreview(false)}
            attachments={feedback.custom_image_attachements}
            currentIndex={currentAttachmentIndex}
            onIndexChange={setCurrentAttachmentIndex}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default FeedbackDetails;