/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import FeedbackList from "../feedback/FeedBackList";
import FeedbackForm from "../feedback/FeedbackForm";
import FeedbackDetails from "../feedback/FeedBackDetails";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { showToast } from "@/lib/toast/showToast";

// Types
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

// FIXED: Use a single state to track which modal is active
type ModalState = "none" | "list" | "form" | "details";

const FeedbackComponent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { user } = useAuth();
  
  // CRITICAL FIX: Single state for modal management
  const [activeModal, setActiveModal] = useState<ModalState>("none");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch feedbacks for the current user
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

      const feedbacks = await Promise.all(feedbackPromises);
      setFeedbacks(feedbacks);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      showToast.error("Failed to load feedbacks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeModal === "list") {
      fetchFeedbacks();
    }
  }, [activeModal, user?.email]);

  const handleSubmitFeedback = async (feedbackData: Partial<FeedbackItem>) => {
    try {
      const apiData = {
        ...feedbackData,
        customer: user?.email,
        subject: feedbackData.subject,
        description: feedbackData.description,
        issue_type: feedbackData.issue_type,
        priority: feedbackData.priority,
        status: "Open",
      };

      Object.keys(apiData as Record<string, any>).forEach(
        (key) =>
          (apiData as Record<string, any>)[key] === undefined &&
          delete (apiData as Record<string, any>)[key]
      );

      await frappeAPI.createFeedback(apiData);

      showToast.success("Feedback submitted successfully!");
      
      // Return to list after submission
      setActiveModal("list");
      await fetchFeedbacks();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast.error("Failed to submit feedback. Please try again.");
      throw error;
    }
  };

  // FIXED: Simple state transitions
  const handleNewFeedback = () => {
    console.log("Opening new feedback form");
    setSelectedFeedback(null);
    setActiveModal("form");
  };

  const handleViewFeedback = (feedback: FeedbackItem) => {
    console.log("Viewing feedback:", feedback.name);
    setSelectedFeedback(feedback);
    setActiveModal("details");
  };

  const handleCloseDetails = () => {
    setSelectedFeedback(null);
    setActiveModal("list");
  };

  const handleCloseForm = () => {
    setSelectedFeedback(null);
    setActiveModal("list");
  };

  const handleCloseList = () => {
    setSelectedFeedback(null);
    setActiveModal("none");
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Trigger clicked - opening list");
    setActiveModal("list");
  };

  return (
    <>
      <div
        className={className}
        onClick={handleTriggerClick}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveModal("list");
          }
        }}
      >
        {children}
      </div>

      {/* FIXED: Simpler conditional rendering */}
      <FeedbackList
        isOpen={activeModal === "list"}
        onClose={handleCloseList}
        feedbacks={feedbacks}
        loading={loading}
        onViewFeedback={handleViewFeedback}
        onNewFeedback={handleNewFeedback}
      />
      
      <FeedbackForm
        isOpen={activeModal === "form"}
        onClose={handleCloseForm}
        onSubmit={handleSubmitFeedback}
      />
      
      {selectedFeedback && (
        <FeedbackDetails
          feedback={selectedFeedback}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

export default FeedbackComponent;