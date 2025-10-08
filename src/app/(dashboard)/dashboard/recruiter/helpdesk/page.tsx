/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { showToast } from "@/lib/toast/showToast";
import { FeedbackItem } from "@/types/feedback";
import FeedbackList from "@/components/feedback/FeedBackList";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackDetails from "@/components/feedback/FeedBackDetails";

type ViewType = "list" | "form" | "details";

export default function HelpdeskPage() {
  const { user } = useAuth();
  
  const [activeView, setActiveView] = useState<ViewType>("list");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeedbacks = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const listResponse = await frappeAPI.getFeedbackByUserId(user.email);

      if (!listResponse.data) {
        throw new Error("No feedback data received");
      }

      const feedbackPromises = listResponse.data.map(
        async (issue: { name: string }) => {
          const detailResponse = await frappeAPI.getFeedbackById(issue.name);
          return detailResponse.data;
        }
      );

      const feedbacksData = await Promise.all(feedbackPromises);
      
      const transformedFeedbacks: FeedbackItem[] = feedbacksData.map((feedback: any) => ({
        ...feedback,
        custom_image_attachements: feedback.custom_image_attachements || feedback.custom_images || [],
        raised_by: feedback.raised_by || user.email || '',
        issue_type: feedback.issue_type || 'General Feedback'
      }));
      
      setFeedbacks(transformedFeedbacks);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      showToast.error("Failed to load feedbacks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "list") {
      fetchFeedbacks();
    }
  }, [activeView, user?.email]);

  const handleSubmitFeedback = async (feedbackData: Partial<FeedbackItem>) => {
    try {
      const apiData = {
        ...feedbackData,
        raised_by: user?.email,
        status: "Open",
        issue_type: "Query",
      };

      Object.keys(apiData).forEach(
        (key) =>
          (apiData as Record<string, any>)[key] === undefined &&
          delete (apiData as Record<string, any>)[key]
      );

      await frappeAPI.createFeedback(apiData);

      showToast.success("Feedback submitted successfully!");
      setActiveView("list");
      await fetchFeedbacks();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast.error("Failed to submit feedback. Please try again.");
      throw error;
    }
  };

  const handleNewFeedback = () => {
    setSelectedFeedback(null);
    setActiveView("form");
  };

  const handleViewFeedback = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setActiveView("details");
  };

  const handleCloseDetails = () => {
    setSelectedFeedback(null);
    setActiveView("list");
  };

  const handleCloseForm = () => {
    setSelectedFeedback(null);
    setActiveView("list");
  };

  return (
    <div className="h-full">
      {activeView === "list" && (
        <FeedbackListPage
          feedbacks={feedbacks}
          loading={loading}
          onViewFeedback={handleViewFeedback}
          onNewFeedback={handleNewFeedback}
        />
      )}
      
      {activeView === "form" && (
        <FeedbackForm
          isOpen={true}
          onClose={handleCloseForm}
          onSubmit={handleSubmitFeedback}
        />
      )}
      
      {activeView === "details" && selectedFeedback && (
        <FeedbackDetails
          feedback={selectedFeedback}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

interface FeedbackListPageProps {
  feedbacks: FeedbackItem[];
  loading: boolean;
  onViewFeedback: (feedback: FeedbackItem) => void;
  onNewFeedback: () => void;
}

function FeedbackListPage({
  feedbacks,
  loading,
  onViewFeedback,
  onNewFeedback,
}: FeedbackListPageProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Helpdesk</h1>
          </div>
          <button
            onClick={onNewFeedback}
            className="px-4 py-2 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            + New Issue
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading issues...</span>
            </div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Issues Found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't submitted any issues yet.
            </p>
            <button
              onClick={onNewFeedback}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Create Your First Issue
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedbacks.map((feedback) => (
              <FeedbackRow
                key={feedback.name}
                feedback={feedback}
                onView={onViewFeedback}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {feedbacks.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {feedbacks.length} issue{feedbacks.length !== 1 ? "s" : ""} • Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

interface FeedbackRowProps {
  feedback: FeedbackItem;
  onView: (feedback: FeedbackItem) => void;
}

function FeedbackRow({ feedback, onView }: FeedbackRowProps) {
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

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div
      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onView(feedback)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(feedback);
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate mb-2">
            {feedback.subject}
          </h3>

          <p className="text-gray-700 mb-3 line-clamp-2 text-sm">
            {stripHtml(feedback.description)}
          </p>

          {feedback.resolution_details && feedback.status === "Replied" && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 text-sm">
              <p className="text-blue-800 font-medium mb-1">Response:</p>
              <p className="text-blue-700 line-clamp-2">
                {stripHtml(feedback.resolution_details)}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
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
            <span className="text-xs text-gray-500">
              {feedback.opening_date
                ? new Date(feedback.opening_date).toLocaleDateString()
                : "No date"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}