/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { frappeAPI } from "@/lib/api/frappeClient";
import { AlertTriangle, CheckCircle, Mail, Search, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import BulkApplicantForm from "./MultipleApplicantsForm";
import { showToast } from "@/lib/toast/showToast";

interface ExistingApplicant {
  name: string;
  job_title: string;
  designation: string;
  custom_company_name: string;
  status: string;
  email_id: string;
  phone_number: string;
  applicant_name: string;
  country: string;
  resume_attachment: string;
  custom_latest_cv_timestamp?: string;
}

interface ApplicantSearchAndTagProps {
  initialJobId?: string;
  initialJobTitle?: string;
  onFormSubmitSuccess?: () => void;
  currentUserEmail?: string;
}

export default function ApplicantSearchAndTag({
  initialJobId,
  initialJobTitle,
  onFormSubmitSuccess,
  currentUserEmail,
}: ApplicantSearchAndTagProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [existingApplicants, setExistingApplicants] = useState<
    ExistingApplicant[]
  >([]);
  const [alreadyTaggedJob, setAlreadyTaggedJob] = useState<string | null>(null);
  const [prefilledApplicantData, setPrefilledApplicantData] = useState<any[]>(
    []
  );
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [latestCVTimestamp, setLatestCVTimestamp] = useState<string | null>(
    null
  );
  const [showCVUpdateForm, setShowCVUpdateForm] = useState(false);
  const [triggerCVUpdateScroll, setTriggerCVUpdateScroll] = useState(false); // New state for CV update scroll
  const formRef = useRef<HTMLDivElement>(null); // Ref for the form container

  const currentJobTitle = initialJobTitle || initialJobId || "";

  // Scroll to form when triggered by Update CV
  useEffect(() => {
    if (triggerCVUpdateScroll && showBulkForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setTriggerCVUpdateScroll(false); // Reset to prevent re-scrolling
    }
  }, [triggerCVUpdateScroll, showBulkForm]);

  const handleRequestCVUpdate = async () => {
    if (!prefilledApplicantData || prefilledApplicantData.length === 0) return;

    const applicantData = prefilledApplicantData[0];
    const candidateName = applicantData.applicant_name || "Candidate";
    const firstName = candidateName.split(" ")[0];

    setIsSendingEmail(true);

    try {
      const emailData = {
        from_email: currentUserEmail || "",
        to_email: applicantData.email_id,
        subject: `Your Profile Has Been Shortlisted for the ${currentJobTitle} Position`,
        message: `Hi ${firstName},

Good news! Your profile has been shortlisted for the ${currentJobTitle} position with ${
          process.env.NEXT_PUBLIC_COMPANY_NAME || "our company"
        }.

To proceed, please share your updated CV at the earliest.

Also, stay connected with us and explore new opportunities by following HEVHire on LinkedIn: https://www.linkedin.com/company/hevhire

Looking forward to your response.

Best regards,
${process.env.NEXT_PUBLIC_COMPANY_NAME || "HEVHire Team"}`,
        job_id: currentJobTitle,
        username: currentUserEmail,
        applicants: [
          {
            name: applicantData.name,
            applicant_name: applicantData.applicant_name,
            email_id: applicantData.email_id,
            designation: applicantData.designation,
            resume_attachment: applicantData.resume_attachment,
          },
        ],
      };

      const response = await fetch("/api/mails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      showToast.success("CV update request sent successfully!");
    } catch (error: any) {
      showToast.error(`Failed to send email: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUpdateCV = () => {

    setShowCVUpdateForm(true);
    setShowBulkForm(true);
    setTriggerCVUpdateScroll(true); // Trigger scroll for Update CV
  };

  const handleSubmit = async (overrideWarning = false) => {
    if (!prefilledApplicantData || prefilledApplicantData.length === 0) return;

    setIsSubmitting(true);

    try {
      const payload = {
        applicant_name: prefilledApplicantData[0].applicant_name,
        email_id: prefilledApplicantData[0].email_id,
        phone_number: prefilledApplicantData[0].phone_number,
        country: prefilledApplicantData[0].country,
        job_title: initialJobId,
        designation: prefilledApplicantData[0].designation,
        status: "Tagged",
        resume_attachment: prefilledApplicantData[0].resume_attachment,
        custom_experience: prefilledApplicantData[0].custom_experience,
        custom_education: prefilledApplicantData[0].custom_education,
      };

      const response = await frappeAPI.createApplicants(payload);

      if (response.data) {
        showToast.success("Applicant tagged successfully!");
        setShowWarning(false);
        setShowBulkForm(false);
        setShowCVUpdateForm(false);
        setPrefilledApplicantData([]);
        setSearchEmail("");
        setExistingApplicants([]);
        if (onFormSubmitSuccess) {
          onFormSubmitSuccess();
        }
      }
    } catch (error: any) {

      showToast.error(`Failed to tag applicant: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchApplicant = async () => {
    if (!searchEmail) {
      setSearchError("Please enter email address");
      return;
    }

    if (!searchEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setSearchError("Please enter a valid email address");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setExistingApplicants([]);
    setPrefilledApplicantData([]);
    setAlreadyTaggedJob(null);
    setLatestCVTimestamp(null);
    setShowCVUpdateForm(false);
    // Only reset showBulkForm if not updating CV
    if (!showCVUpdateForm) {
      setShowBulkForm(false);
    }

    try {

      const response = await frappeAPI.searchApplicants(searchEmail);

      if (response && response.data) {
        const applicants: ExistingApplicant[] = response.data.map(
          (item: any) => ({
            name: item.name,
            job_title: item.job_title,
            designation: item.designation,
            custom_company_name: item.custom_company_name,
            status: item.status,
            email_id: item.email_id,
            phone_number: item.phone_number,
            applicant_name: item.applicant_name,
            country: item.country,
            resume_attachment: item.resume_attachment,
            custom_latest_cv_timestamp: item.custom_latest_cv_timestamp,
          })
        );

        setExistingApplicants(applicants);

        try {
          const timestampResponse = await frappeAPI.getlatestCVTimestamp(
            searchEmail
          );
          if (timestampResponse?.data && timestampResponse.data.length > 0) {
            setLatestCVTimestamp(
              timestampResponse.data[0].custom_latest_cv_timestamp
            );
          }
        } catch (error) {
          console.error("Error fetching latest CV timestamp:", error);
        }

        if (initialJobId) {
          const alreadyTagged = applicants.find(
            (app) => app.job_title === initialJobId
          );
          if (alreadyTagged) {
            setAlreadyTaggedJob(currentJobTitle);
            setIsSearching(false);
            return;
          }
        }

        if (applicants.length > 0) {
          setShowWarning(true);
          const firstApplicant = applicants[0];
          const prefilledData = [
            {
              name: firstApplicant.name,
              applicant_name: firstApplicant.applicant_name || "",
              email_id: firstApplicant.email_id || searchEmail,
              phone_number: firstApplicant.phone_number || "",
              country: firstApplicant.country || "India",
              job_title: currentJobTitle,
              designation: firstApplicant.designation || "",
              resume_attachment: firstApplicant.resume_attachment || "",
              custom_experience: [],
              custom_education: [],
            },
          ];

          setPrefilledApplicantData(prefilledData);
          // Only show form for new CV update if explicitly requested
          if (showCVUpdateForm) {
            setShowBulkForm(true);
            // Scroll to form when showing for CV update
            if (formRef.current) {
              formRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }
        } else {
          // No existing applicant found - create new one
          const emptyData = [
            {
              applicant_name: "",
              email_id: searchEmail,
              phone_number: "",
              country: "India",
              job_title: currentJobTitle,
              designation: "",
              resume_attachment: "",
              custom_experience: [],
              custom_education: [],
            },
          ];

          setPrefilledApplicantData(emptyData);
          setShowBulkForm(true);
          // Scroll to form for new applicant
          if (formRef.current) {
            formRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      } else {
        // No data returned - create new applicant
        const emptyData = [
          {
            applicant_name: "",
            email_id: searchEmail,
            phone_number: "",
            country: "India",
            job_title: currentJobTitle,
            designation: "",
            resume_attachment: "",
            custom_experience: [],
            custom_education: [],
          },
        ];

        setPrefilledApplicantData(emptyData);
        setShowBulkForm(true);
        // Scroll to form for new applicant
        if (formRef.current) {
          console.log("Scrolling to form for new applicant");
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError(`Failed to search applicant: ${error.message}`);

      // On error, still allow creating new applicant
      const emptyData = [
        {
          applicant_name: "",
          email_id: searchEmail,
          phone_number: "",
          country: "India",
          job_title: currentJobTitle,
          designation: "",
          resume_attachment: "",
          custom_experience: [],
          custom_education: [],
        },
      ];

      setPrefilledApplicantData(emptyData);
      setShowBulkForm(true);
      // Scroll to form on error
      if (formRef.current) {
        console.log("Scrolling to form on search error");
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleBulkFormSuccess = () => {
    setShowBulkForm(false);
    setPrefilledApplicantData([]);
    setSearchEmail("");
    setExistingApplicants([]);
    setShowCVUpdateForm(false);
    setTriggerCVUpdateScroll(false); // Reset scroll trigger

    if (onFormSubmitSuccess) {
      onFormSubmitSuccess();
    }
  };

  return (
    <div className="space-y-6 p-2 py-0">
      <div className="bg-white rounded-lg shadow-md px-6 pb-2">
        {/* <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Applicant
        </h2> */}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="flex items-center gap-2">
            <div className="flex relative w-[90%]">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="email@example.com"
                onKeyPress={(e) => {
                  if (e.key === "Enter") searchApplicant();
                }}
              />
            </div>
            <button
              onClick={searchApplicant}
              disabled={isSearching}
              className={`w-[10%] min-w-[40px] py-2 px-2 rounded-md text-white font-medium flex items-center justify-center ${
                isSearching
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
          </div>
          {searchError && (
            <p className="text-red-600 text-sm mt-2">{searchError}</p>
          )}
        </div>


        {!existingApplicants.length && showBulkForm && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-blue-800">
              <Search className="w-4 h-4" />
              <span className="font-medium">New Applicant</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              No existing applicant found with this email. Please fill the form
              below to create a new application.
            </p>
          </div>
        )}
      </div>

      {existingApplicants.length > 0 && (
        <div>
          {latestCVTimestamp && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Latest CV Uploaded:</span>
                <span className="text-sm">
                  {new Date(latestCVTimestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          )}
          {alreadyTaggedJob ? (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Candidate Already Exists</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                This applicant is already tagged to the current job opening.
              </p>
            </div>
          ) : (
            <div className="flex justify-end mb-2 gap-2">
              <button
                onClick={handleRequestCVUpdate}
                disabled={isSendingEmail}
                className={`px-4 py-2 text-white rounded-md flex gap-2 items-center ${
                  isSendingEmail
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Request CV Update
                  </>
                )}
              </button>

              <button
                onClick={handleUpdateCV}
                className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-md flex gap-2 items-center"
              >
                <Upload className="w-4 h-4" />
                Update CV
              </button>

              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded-md flex gap-2 items-center ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Tagging...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Tag This
                  </>
                )}
              </button>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Existing Applications ({existingApplicants.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {existingApplicants.map((applicant, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {applicant.job_title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {applicant.designation}
                      </p>
                      <p className="text-xs text-gray-500">
                        {applicant.custom_company_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {applicant.email_id}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        applicant.status === "Tagged"
                          ? "bg-blue-100 text-blue-800"
                          : applicant.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : applicant.status === "Joined"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {applicant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showBulkForm && (
        <div ref={formRef} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {existingApplicants.length > 0 && showCVUpdateForm
              ? "Update Applicant CV"
              : existingApplicants.length > 0
              ? "Update Applicant Details"
              : "Create New Applicant"}
          </h3>
          <BulkApplicantForm
            initialJobId={initialJobId}
            prefilledData={prefilledApplicantData}
            isExistingApplicant={
              existingApplicants.length > 0 && showCVUpdateForm
            }
            onFormSubmitSuccess={handleBulkFormSuccess}
          />
        </div>
      )}
    </div>
  );
}
