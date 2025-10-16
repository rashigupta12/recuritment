/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { showToast } from "@/lib/toast/showToast";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import FeedbackDetails from "@/components/feedback/FeedBackDetails";
import { SortableTableHeader } from "@/components/recruiter/SortableTableHeader";
import { FeedbackItem } from "@/types/feedback";
import FeedbackForm from "@/components/Leads/FeedbackForm";


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
      const listResponse = await frappeAPI.makeAuthenticatedRequest(
        `GET`,
        `/method/recruitment_app.get_issues.get_issues_with_attachments?owner=${user?.email}`
      );

      if (!listResponse.message.data) {
        throw new Error("No feedback data received");
      }

      // Map API response to match FeedbackItem type
      const mappedFeedbacks: FeedbackItem[] = listResponse.message.data.map((item: any) => ({
        ...item,
        doctype: "Issue", // Assuming doctype is "Issue" based on context
        custom_images: item.custom_image_attachements || [], // Map custom_image_attachements to custom_images
      }));

      setFeedbacks(mappedFeedbacks);
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
        doctype: "Issue", // Added to match API expectations
        custom_images: feedbackData.custom_images || [], // Ensure custom_images is included
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
    <div className="relative">
      <div className="w-full h-full">
        {activeView === "list" && (
          <FeedbackListPage
            feedbacks={feedbacks}
            loading={loading}
            onViewFeedback={handleViewFeedback}
            onNewFeedback={handleNewFeedback}
          />
        )}
        {activeView === "details" && selectedFeedback && (
          <FeedbackDetails
            feedback={selectedFeedback}
            onClose={handleCloseDetails}
          />
        )}
        {activeView === "form" && (
          <FeedbackForm
            isOpen={true}
            onClose={handleCloseForm}
            onSubmit={handleSubmitFeedback}
          />
        )}
      </div>
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
  const [sortField, setSortField] = useState<keyof FeedbackItem | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [sortedFeedbacks, setSortedFeedbacks] = useState<FeedbackItem[]>(feedbacks);

  useEffect(() => {
    setSortedFeedbacks(feedbacks);
  }, [feedbacks]);

  const columns: Array<Column<keyof FeedbackItem>> = [
    { field: "opening_date", label: "Date", sortable: true, align: "left" },
    { field: "custom_module", label: "Module", sortable: true, align: "left" },
    { field: "description", label: "Description", sortable: true, align: "left" },
    { field: "status", label: "Status", sortable: true, align: "left" },
  ];

  const handleSort = (field: keyof FeedbackItem) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";

    const sorted = [...feedbacks].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (field === "opening_date") {
        const aDate = aValue && typeof aValue === "string" ? new Date(aValue).getTime() : 0;
        const bDate = bValue && typeof bValue === "string" ? new Date(bValue).getTime() : 0;
        return newDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return newDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setSortedFeedbacks(sorted);
    setSortField(field);
    setSortDirection(newDirection);
  };

  return (
    <div>
      <div className="p-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Helpdesk</h1>
          </div>

          <button
            onClick={onNewFeedback}
            className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg border border-blue-100 overflow-hidden w-full">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading issues...</span>
              </div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-10 text-blue-600 text-sm bg-blue-50">
              <p>No Issues Found</p>
              <p className="text-blue-400 text-xs mt-1">
                You haven&apos;t submitted any issues yet.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-blue-100">
              <SortableTableHeader
                columns={columns}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <tbody className="divide-y divide-gray-100">
                {sortedFeedbacks.map((feedback, index) => (
                  <FeedbackRow
                    key={feedback.name}
                    feedback={feedback}
                    onView={onViewFeedback}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

interface Column<T> {
  field: T;
  label: string;
  sortable: boolean;
  align: "left" | "center" | "right";
}

interface FeedbackRowProps {
  feedback: FeedbackItem;
  onView: (feedback: FeedbackItem) => void;
  index: number;
}

function FeedbackRow({ feedback, onView, index }: FeedbackRowProps) {
  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <tr
      className={`${index % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition duration-100 cursor-pointer`}
      onClick={() => onView(feedback)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(feedback);
        }
      }}
      aria-label={`View feedback titled ${feedback.subject}`}
    >
      <td className="px-2 sm:px-4 py-4 text-md text-gray-500">
        {feedback.opening_date
          ? format(new Date(feedback.opening_date), "dd/MM/yyyy")
          : "No date"}
      </td>
      <td className="px-2 sm:px-4 py-4">
        <h3 className="font-semibold text-md text-blue-900 truncate max-w-xs">
          {feedback.subject || "N/A"}
        </h3>
      </td>
      <td className="px-2 sm:px-4 py-4">
        <p className="text-gray-700 mt-1 line-clamp-2 text-md">
          {stripHtml(feedback.description)}
        </p>
      </td>
      <td className="px-2 sm:px-4 py-4">
        <span className="px-2 py-1 rounded-full text-md font-medium">
          {feedback.status}
        </span>
      </td>
    </tr>
  );
}