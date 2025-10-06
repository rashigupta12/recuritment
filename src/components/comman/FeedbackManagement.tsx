/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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

interface FeedbackComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  
  const [activeView, setActiveView] = useState<"list" | "form" | "details">("list");
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
    if (open && activeView === "list") {
      fetchFeedbacks();
    }
  }, [open, activeView, user?.email]);

 const handleSubmitFeedback = async (feedbackData: Partial<FeedbackItem>) => {
  try {
    const apiData = {
      ...feedbackData,
      raised_by: user?.email,         // Map user email here
      status: "Open",                 // Set default status
      issue_type: "Query",            // Use backend-accepted issue_type
    };

    // Remove any undefined keys
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

  const handleCloseAll = () => {
    setSelectedFeedback(null);
    setActiveView("list");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {activeView === "list" && (
        <FeedbackList
          isOpen={true}
          onClose={handleCloseAll}
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
    </>
  );
};

export default FeedbackComponent;