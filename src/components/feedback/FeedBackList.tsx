// FeedbackList.tsx (corrected)

import React from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  Bug,
  PlusCircle,
  CheckCircle,
  Calendar,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { FeedbackItem } from "@/types/feedback";



const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const renderHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return "";
  return stripHtml(htmlContent);
};

const FeedbackList: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  feedbacks: FeedbackItem[];
  loading: boolean;
  onViewFeedback: (feedback: FeedbackItem) => void;
  onNewFeedback: () => void;
}> = ({
  isOpen,
  onClose,
  feedbacks,
  loading,
  onViewFeedback,
  onNewFeedback,
}) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-white";
      case "Low":
        return "bg-emerald-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case "Bug Report":
        return <Bug className="h-4 w-4" />;
      case "Feature Request":
        return <PlusCircle className="h-4 w-4" />;
      case "General Feedback":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  // BACKDROP CLICK - close only if backdrop itself clicked
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // STOP propagation inside modal content
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9000] flex items-center justify-center capitalize"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full  overflow-hidden flex flex-col"
        onClick={stopPropagation}
        tabIndex={-1} // focusable container
        style={{ outline: "none" }}
      >
        {/* Header */}
        <div className="bg-primary text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Helpdesk</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close feedback list"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex items-center gap-3 text-secondary">
                <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span>Loading Issue...</span>
              </div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Issues Found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven &apos;t submitted any Issue yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-emerald-100">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.name}
                  className=" hover:bg-emerald-50 transition-colors cursor-pointer"
                  onClick={() => onViewFeedback(feedback)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onViewFeedback(feedback);
                    }
                  }}
                  role="button"
                  aria-label={`View feedback titled ${feedback.subject}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-primary truncate">
                          {feedback.subject}
                        </h3>
                        <span className="flex-shrink-0">
                          {getIssueTypeIcon(feedback.issue_type)}
                        </span>
                        {feedback.status === "Replied" && (
                          <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2 text-sm">
                        {renderHtmlContent(feedback.description)}
                      </p>

                      {feedback.resolution_details &&
                        feedback.status === "Replied" && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 text-sm">
                            <p className="text-blue-800 font-medium mb-1">
                              Response:
                            </p>
                            <p className="text-blue-700 line-clamp-2">
                              {renderHtmlContent(feedback.resolution_details)}
                            </p>
                          </div>
                        )}

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {feedback.opening_date
                              ? format(
                                  new Date(feedback.opening_date),
                                  "dd/MM/yyyy"
                                )
                              : "No date"}
                            {feedback.opening_time &&
                              ` at ${feedback.opening_time}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              feedback.status
                            )}`}
                          >
                            {feedback.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              feedback.priority
                            )}`}
                          >
                            {feedback.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-primary bg-emerald-100 px-2 py-1 rounded">
                        {feedback.issue_type}
                      </span>
                      {feedback.custom_images?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Paperclip className="h-3 w-3" />
                          {feedback.custom_images.length} attachment
                          {feedback.custom_images.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-primary p-4 bg-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-primary">
              {feedbacks.length} items • Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNewFeedback();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary hover:bg-secondary text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ pointerEvents: "auto", zIndex: 1 }}
              >
                <Plus className="h-4 w-4" />
                New
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FeedbackList;
