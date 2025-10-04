// /*eslint-disable @typescript-eslint/no-explicit-any*/
// 'use client';

// import { useEffect, useState } from 'react';
// import { frappeAPI } from '@/lib/api/frappeClient';
// import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable';
// import EmailSendingPopup from './EmailSendingPopup';

// interface JobApplicant {
//     name: string;
//     applicant_name?: string;
//     email_id?: string;
//     phone_number?: string;
//     country?: string;
//     job_title?: string;
//     designation?: string;
//     status?: string;
//     resume_attachment?: string;
//     custom_experience?: Array<{
//         company_name: string;
//         designation: string;
//         start_date: string;
//         end_date: string;
//         current_company: number;
//     }>;
//     custom_education?: Array<{
//         degree: string;
//         specialization: string;
//         institution: string;
//         year_of_passing: number;
//         percentagecgpa: number;
//     }>;
// }

// interface Props {
//     jobId: string;
//     ownerEmail: string;
//     todoData?: any;
//     refreshTrigger?: number;
// }

// export default function TaggedApplicants({ jobId, ownerEmail, todoData, refreshTrigger }: Props) {
//     const [applicants, setApplicants] = useState<JobApplicant[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [selectedApplicants, setSelectedApplicants] = useState<JobApplicant[]>([]);
//     const [showEmailPopup, setShowEmailPopup] = useState(false);

//     // Handle applicant selection
//     const handleSelectApplicant = (name: string) => {
//         setSelectedApplicants(prev => {
//             const applicant = applicants.find(app => app.name === name);
//             if (prev.find(app => app.name === name)) {
//                 // If already selected, remove it
//                 return prev.filter(app => app.name !== name);
//             } else if (applicant) {
//                 // If not selected, add it
//                 return [...prev, applicant];
//             }
//             return prev;
//         });
//     };

//     useEffect(() => {
//         const fetchApplicants = async () => {
//             try {
//                 setLoading(true);

//                 // Step 1: Get the list of applicant names/IDs
//                 const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
//                 console.log('📦 Initial API Response:', response);

//                 const applicantNames = response.data || [];
//                 console.log('📊 Applicant names:', applicantNames);

//                 if (applicantNames.length === 0) {
//                     setApplicants([]);
//                     setLoading(false);
//                     return;
//                 }

//                 // Step 2: Fetch full details for each applicant
//                 const applicantsPromises = applicantNames.map(async (applicant: any) => {
//                     try {
//                         console.log(`📥 Fetching details for applicant: ${applicant.name}`);
//                         const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
//                         console.log(`✅ Applicant details for ${applicant.name}:`, applicantDetail.data);

//                         // Debug: Check if resume_attachment exists in the response
//                         if (applicantDetail.data) {
//                             console.log(`📎 Resume attachment for ${applicant.name}:`, {
//                                 hasResume: !!applicantDetail.data.resume_attachment,
//                                 resumeValue: applicantDetail.data.resume_attachment,
//                                 fullData: applicantDetail.data
//                             });
//                         }

//                         return applicantDetail.data;
//                     } catch (err) {
//                         console.error(`❌ Error fetching details for ${applicant.name}:`, err);
//                         // Return basic data if detailed fetch fails
//                         return {
//                             name: applicant.name,
//                             email_id: applicant.email_id || 'Not available'
//                         };
//                     }
//                 });

//                 // Wait for all applicant details to be fetched
//                 const applicantsData = await Promise.all(applicantsPromises);
//                 console.log('🎉 All applicants data:', applicantsData);

//                 // Debug: Check resume attachments in final data
//                 console.log('🔍 Resume Attachment Summary:');
//                 applicantsData.forEach((applicant, index) => {
//                     if (applicant) {
//                         console.log(`Applicant ${index + 1}: ${applicant.applicant_name || applicant.name}`, {
//                             hasResume: !!applicant.resume_attachment,
//                             resumeValue: applicant.resume_attachment,
//                             resumeType: typeof applicant.resume_attachment
//                         });
//                     }
//                 });

//                 setApplicants(applicantsData.filter(applicant => applicant !== null));

//             } catch (err: any) {
//                 console.error('❌ Error in fetchApplicants:', err);
//                 console.error('Error details:', err.response || err.message);
//                 setError('Failed to fetch tagged applicants. Please try again later.');
//                 setApplicants([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (jobId && ownerEmail) {
//             fetchApplicants();
//         } else {
//             setLoading(false);
//             setError('Job ID or owner email not provided');
//             console.log('❌ Missing data:', { jobId, ownerEmail });
//         }
//     }, [jobId, ownerEmail, refreshTrigger]);

//     // Add debug when selected applicants change
//     useEffect(() => {
//         console.log('🔄 Selected Applicants Updated:', {
//             count: selectedApplicants.length,
//             applicants: selectedApplicants.map(app => ({
//                 name: app.applicant_name || app.name,
//                 hasResume: !!app.resume_attachment,
//                 resumeValue: app.resume_attachment
//             }))
//         });
//     }, [selectedApplicants]);

//     // Handle view applicant
//     const handleViewApplicant = (applicant: JobApplicant) => {
//         console.log('View applicant:', applicant);
//         // Implement view logic here
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <span className="ml-2 text-gray-600">Loading applicants...</span>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                 <p className="text-red-800 font-medium">Error</p>
//                 <p className="text-red-600 text-sm mt-1">{error}</p>
//             </div>
//         );
//     }

//     if (!applicants.length) {
//         return (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//                 <p className="text-yellow-800">No tagged applicants found for this job.</p>
//                 <p className="text-yellow-600 text-sm mt-1">
//                     Job: {jobId} | Owner: {ownerEmail}
//                 </p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
//             {/* Single Header Section */}
//             <div className="flex items-center justify-between mb-6">
//                 <div>
//                     <h2 className="text-xl font-semibold text-gray-900">Tagged Applicants</h2>
//                     <p className="text-gray-600 text-sm">
//                         Job: {jobId} | Total: {applicants.length} applicants
//                         {selectedApplicants.length > 0 && ` | Selected: ${selectedApplicants.length}`}
//                     </p>
//                     {/* Debug info */}
//                     <p className="text-xs text-gray-500 mt-1">
//                         Applicants with resumes: {applicants.filter(app => app.resume_attachment).length}
//                     </p>
//                 </div>

//                 {/* Send Email Button - Only shows when applicants are selected */}
//                 {selectedApplicants.length > 0 && (
//                     <button
//                         onClick={() => setShowEmailPopup(true)}
//                         className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
//                     >
//                         📧 Send ({selectedApplicants.length})
//                     </button>
//                 )}
//             </div>

//             {/* Applicants Table with proper selection handler */}
//            <ApplicantsTable
//     applicants={applicants}
//     showCheckboxes={true}  // ✅ This enables the checkboxes
//     selectedApplicants={selectedApplicants.map(app => app.name)}  // ✅ Pass selected names
//     onSelectApplicant={handleSelectApplicant}  // ✅ Use the proper handler
// />
//             {/* Email Sending Popup */}
//             {showEmailPopup && (
//                 <EmailSendingPopup
//                     isOpen={showEmailPopup}
//                     onClose={() => setShowEmailPopup(false)}
//                     selectedApplicants={selectedApplicants}
//                     currentUserEmail={ownerEmail}
//                     jobId={jobId}
//                     onEmailSent={() => {
//                         setSelectedApplicants([]);
//                         setShowEmailPopup(false);
//                         // Optional: Add a success toast here
//                         console.log('Email sent successfully!');
//                     }}
//                 />
//             )}
//         </div>
//     );
// }

/*eslint-disable @typescript-eslint/no-explicit-any*/
/*eslint-disable @typescript-eslint/no-explicit-any*/
/*eslint-disable @typescript-eslint/no-explicit-any*/
/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { frappeAPI } from "@/lib/api/frappeClient";
import { ApplicantsTable } from "@/components/recruiter/ApplicantsTable";
import EmailSendingPopup from "./EmailSendingPopup";
import { Award, User, X, Search, AlertCircle, CheckCircle } from "lucide-react";

interface JobApplicant {
  name: string;
  applicant_name?: string;
  email_id?: string;
  phone_number?: string;
  country?: string;
  job_title?: string;
  designation?: string;
  status?: string;
  resume_attachment?: string;
  custom_experience?: Array<{
    company_name: string;
    designation: string;
    start_date: string;
    end_date: string;
    current_company: number;
  }>;
  custom_education?: Array<{
    degree: string;
    specialization: string;
    institution: string;
    year_of_passing: number;
    percentagecgpa: number;
  }>;
}

interface Props {
  jobId: string;
  ownerEmail: string;
  todoData?: any;
  refreshTrigger?: number;
}

interface AssessmentResponse {
  message?: {
    status?: string;
    created_assessments?: string[];
    name?: string;
  };
  name?: string;
  data?: {
    name?: string;
    id?: string;
  };
}

export default function TaggedApplicants({
  jobId,
  ownerEmail,
  todoData,
  refreshTrigger,
}: Props) {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicants, setSelectedApplicants] = useState<JobApplicant[]>(
    []
  );
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] =
    useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [assessmentSuccess, setAssessmentSuccess] = useState<string | null>(
    null
  );
  const [scheduledOn, setScheduledOn] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");
  const [assessmentLink, setAssessmentLink] = useState<string>("");
  const [assessmentRound, setAssessmentRound] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const router = useRouter();

  // Handle applicant selection
  const handleSelectApplicant = (name: string) => {
    setSelectedApplicants((prev) => {
      const applicant = applicants.find((app) => app.name === name);
      if (prev.find((app) => app.name === name)) {
        return prev.filter((app) => app.name !== name);
      } else if (applicant) {
        return [...prev, applicant];
      }
      return prev;
    });
  };

  // Handler for select all
  const handleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants([...applicants]);
    }
  };

  // Handle search filter
  useEffect(() => {
    let filtered = applicants;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (applicant) =>
          applicant.applicant_name?.toLowerCase().includes(query) ||
          false ||
          applicant.email_id?.toLowerCase().includes(query) ||
          false ||
          applicant.job_title?.toLowerCase().includes(query) ||
          false
      );
    }

    setFilteredApplicants(filtered);
  }, [applicants, searchQuery]);

  // useEffect(() => {
  //   const fetchApplicants = async () => {
  //     try {
  //       setLoading(true);

  //       const response: any = await frappeAPI.getTaggedApplicantsByJobId(
  //         jobId,
  //         ownerEmail
  //       );
  //       console.log("📦 Initial API Response:", response);

  //       const applicantNames = response.data || [];
  //       console.log("📊 Applicant names:", applicantNames);

  //       if (applicantNames.length === 0) {
  //         setApplicants([]);
  //         setFilteredApplicants([]);
  //         setLoading(false);
  //         return;
  //       }

  //       const applicantsPromises = applicantNames.map(
  //         async (applicant: any) => {
  //           try {
  //             console.log(
  //               `📥 Fetching details for applicant: ${applicant.name}`
  //             );
  //             const applicantDetail = await frappeAPI.getApplicantBYId(
  //               applicant.name
  //             );
  //             console.log(
  //               `✅ Applicant details for ${applicant.name}:`,
  //               applicantDetail.data
  //             );

  //             if (applicantDetail.data) {
  //               console.log(`📎 Resume attachment for ${applicant.name}:`, {
  //                 hasResume: !!applicantDetail.data.resume_attachment,
  //                 resumeValue: applicantDetail.data.resume_attachment,
  //                 fullData: applicantDetail.data,
  //               });
  //             }

  //             return applicantDetail.data;
  //           } catch (err) {
  //             console.error(
  //               `❌ Error fetching details for ${applicant.name}:`,
  //               err
  //             );
  //             return {
  //               name: applicant.name,
  //               email_id: applicant.email_id || "Not available",
  //             };
  //           }
  //         }
  //       );

  //       const applicantsData = await Promise.all(applicantsPromises);
  //       console.log("🎉 All applicants data:", applicantsData);

  //       console.log("🔍 Resume Attachment Summary:");
  //       applicantsData.forEach((applicant, index) => {
  //         if (applicant) {
  //           console.log(
  //             `Applicant ${index + 1}: ${
  //               applicant.applicant_name || applicant.name
  //             }`,
  //             {
  //               hasResume: !!applicant.resume_attachment,
  //               resumeValue: applicant.resume_attachment,
  //               resumeType: typeof applicant.resume_attachment,
  //             }
  //           );
  //         }
  //       });

  //       setApplicants(applicantsData.filter((applicant) => applicant !== null));
  //       setFilteredApplicants(
  //         applicantsData.filter((applicant) => applicant !== null)
  //       );
  //     } catch (err: any) {
  //       console.error("❌ Error in fetchApplicants:", err);
  //       console.error("Error details:", err.response || err.message);
  //       setError("Failed to fetch applicants. Please try again later.");
  //       setApplicants([]);
  //       setFilteredApplicants([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (jobId && ownerEmail) {
  //     fetchApplicants();
  //   } else {
  //     setLoading(false);
  //     setError("Job ID or owner email not provided");
  //     console.log("❌ Missing data:", { jobId, ownerEmail });
  //   }
  // }, [jobId, ownerEmail, refreshTrigger, refreshKey]);
// Replace the current useEffect with this improved version
useEffect(() => {
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching applicants - refreshTrigger:', refreshTrigger);
      console.log('📋 Job ID:', jobId, 'Owner Email:', ownerEmail);

      const response: any = await frappeAPI.getTaggedApplicantsByJobId(
        jobId,
        ownerEmail
      );
      console.log("📦 API Response:", response);

      const applicantNames = response.data || [];
      console.log("📊 Applicant names found:", applicantNames.length);

      if (applicantNames.length === 0) {
        console.log('ℹ️ No applicants found for this job');
        setApplicants([]);
        setFilteredApplicants([]);
        setLoading(false);
        return;
      }

      // Fetch detailed information for each applicant
      const applicantsPromises = applicantNames.map(async (applicant: any) => {
        try {
          console.log(`📥 Fetching details for: ${applicant.name}`);
          const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
          
          if (applicantDetail.data) {
            console.log(`✅ Successfully fetched: ${applicant.name}`, {
              name: applicantDetail.data.applicant_name || applicantDetail.data.name,
              hasResume: !!applicantDetail.data.resume_attachment,
              status: applicantDetail.data.status
            });
            return applicantDetail.data;
          }
          return null;
        } catch (err) {
          console.error(`❌ Error fetching ${applicant.name}:`, err);
          return {
            name: applicant.name,
            email_id: applicant.email_id || "Not available",
            applicant_name: applicant.applicant_name || "Unknown",
            status: applicant.status || "Unknown"
          };
        }
      });

      const applicantsData = await Promise.all(applicantsPromises);
      const validApplicants = applicantsData.filter(applicant => applicant !== null);
      
      console.log("🎉 Final applicants data:", {
        totalFetched: validApplicants.length,
        applicants: validApplicants.map(app => ({
          name: app.applicant_name || app.name,
          status: app.status,
          hasResume: !!app.resume_attachment
        }))
      });

      setApplicants(validApplicants);
      setFilteredApplicants(validApplicants);
      
    } catch (err: any) {
      console.error("❌ Error in fetchApplicants:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError("Failed to fetch applicants. Please try again later.");
      setApplicants([]);
      setFilteredApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  if (jobId && ownerEmail) {
    console.log('🚀 Starting data fetch...');
    fetchApplicants();
  } else {
    console.log('❌ Missing required data:', { jobId, ownerEmail });
    setLoading(false);
    setError("Job ID or owner email not provided");
  }
}, [jobId, ownerEmail, refreshTrigger]); // ✅ refreshTrigger is in dependencies

// Add this useEffect to debug when refreshTrigger changes
useEffect(() => {
  console.log('🔄 refreshTrigger changed:', refreshTrigger);
  console.log('📊 Current applicants count:', applicants.length);
}, [refreshTrigger]);

// Add this useEffect to debug when applicants change
useEffect(() => {
  console.log('👥 Applicants list updated:', {
    count: applicants.length,
    applicants: applicants.map(app => ({
      name: app.applicant_name || app.name,
      status: app.status
    }))
  });
}, [applicants]);
  useEffect(() => {
    console.log("🔄 Selected Applicants Updated:", {
      count: selectedApplicants.length,
      applicants: selectedApplicants.map((app) => ({
        name: app.applicant_name || app.name,
        hasResume: !!app.resume_attachment,
        resumeValue: app.resume_attachment,
      })),
    });
  }, [selectedApplicants]);

  // Handler to open the status update modal
  const handleOpenStatusModal = () => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one applicant.");
      return;
    }
    setIsStatusModalOpen(true);
    setSelectedStatus("");
    setModalError(null);
  };

  // Handler to close the status modal
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedStatus("");
    setModalError(null);
  };

  // Handler to open the assessment modal
  const handleOpenAssessmentModal = () => {
    if (selectedApplicants.length === 0) {
      setAssessmentError(
        "Please select at least one applicant to start the assessment."
      );
      setAssessmentSuccess(null);
      return;
    }
    const allShortlisted = selectedApplicants.every(
      (applicant) => applicant.status?.toLowerCase() === "shortlisted"
    );
    if (!allShortlisted) {
      setAssessmentError(
        'Assessment can only be created for applicants with "Shortlisted" status.'
      );
      setAssessmentSuccess(null);
      return;
    }
    setIsAssessmentModalOpen(true);
    setModalError(null);
  };

  // Handler to close the assessment modal
  const handleCloseAssessmentModal = () => {
    setIsAssessmentModalOpen(false);
    setScheduledOn("");
    setFromTime("");
    setToTime("");
    setAssessmentLink("");
    setAssessmentRound("");
    setModalError(null);
  };

  // Handler for starting assessment
// Handler for starting assessment
  const handleStartAssessment = async () => {
    if (
      !scheduledOn ||
      !fromTime ||
      !toTime ||
      !assessmentLink ||
      !assessmentRound
    ) {
      setModalError("Please fill in all assessment details.");
      return;
    }

    const fromTimeDate = new Date(`${fromTime}`);
    const toTimeDate = new Date(`${toTime}`);
    if (fromTimeDate >= toTimeDate) {
      setModalError("From time must be earlier than to time.");
      return;
    }

    try {
      setAssessmentError(null);
      setAssessmentSuccess(null);

      const payload = {
        applicants: selectedApplicants.map((app) => app.name),
        scheduled_on: scheduledOn,
        from_time: fromTime,
        to_time: toTime,
        assessment_link: assessmentLink,
        assessment_round: assessmentRound,
      };

      const response = await frappeAPI.createbulkAssessment(payload);

      console.log("API Response:", response);

      if (!response) {
        throw new Error("No response received from the API.");
      }

      let assessmentIds: string;
      if (
        response.message?.created_assessments &&
        Array.isArray(response.message.created_assessments)
      ) {
        assessmentIds = response.message.created_assessments.join(", ");
      } else if (response.message?.name) {
        assessmentIds = response.message.name;
      } else if (response.name) {
        assessmentIds = response.name;
      } else if (response.data && (response.data.name || response.data.id)) {
        assessmentIds = response.data.name || response.data.id;
      } else {
        throw new Error(
          "Invalid response structure: Missing assessment ID(s)."
        );
      }

      // Update status to "Assessment Stage" for all selected applicants
      const statusUpdatePromises = selectedApplicants.map(async (applicant) => {
        try {
          await frappeAPI.updateApplicantStatus(applicant.name, {
            status: "Assessment Stage",
          });
          console.log(`✅ Status updated to "Assessment Stage" for ${applicant.name}`);
        } catch (err: any) {
          console.error(`❌ Failed to update status for ${applicant.name}:`, err);
          throw new Error(`Failed to update status for ${applicant.applicant_name || applicant.name}`);
        }
      });

      await Promise.all(statusUpdatePromises);

      // Refresh applicants list
      const refreshResponse: any = await frappeAPI.getTaggedApplicantsByJobId(
        jobId,
        ownerEmail
      );
      const applicantNames = refreshResponse.data || [];
      const applicantsPromises = applicantNames.map(async (applicant: any) => {
        try {
          const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
          return applicantDetail.data;
        } catch (err) {
          console.error(`Error fetching details for ${applicant.name}:`, err);
          return {
            name: applicant.name,
            email_id: applicant.email_id || "Not available",
          };
        }
      });

      const applicantsData = await Promise.all(applicantsPromises);
      setApplicants(applicantsData.filter((applicant) => applicant !== null));
      setFilteredApplicants(
        applicantsData.filter((applicant) => applicant !== null)
      );

      setAssessmentSuccess(
        `Assessment(s) created successfully with ID(s): ${assessmentIds}. Applicant status updated to "Assessment Stage".`
      );
      toast.success(
        `Assessment created and status updated to "Assessment Stage" successfully!`
      );

      setIsAssessmentModalOpen(false);
      setSelectedApplicants([]);
      setScheduledOn("");
      setFromTime("");
      setToTime("");
      setAssessmentLink("");
      setAssessmentRound("");
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      console.error("Assessment creation error:", {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        rawResponse: err.response,
      });
      let errorMessage =
        "Failed to create assessment. Please try again or contact support.";
      if (err.message.includes("Missing assessment ID")) {
        errorMessage =
          "Invalid response from API: Missing assessment ID(s). Please contact support.";
      } else if (err.message.includes("Failed to update status")) {
        errorMessage = `Assessment created but ${err.message}. Please update status manually.`;
      } else if (err.response?.status === 404) {
        errorMessage =
          "Assessment API endpoint not found. Please verify the Frappe method or contact support.";
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Unauthorized access. Please log in again.";
        router.push("/login");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setAssessmentError(errorMessage);
      toast.error(errorMessage);
      setIsAssessmentModalOpen(false);
    }
  };

  // Helper function for status colors
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shortlisted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "assessment stage":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hired":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Handler for confirming status change
  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) {
      setModalError("Please select a status.");
      return;
    }
    if (!ownerEmail) {
      toast.error("Owner email not found. Please try again.");
      setIsStatusModalOpen(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Selected applicants for status update:", selectedApplicants);
      const failedUpdates: string[] = [];
      for (const applicant of selectedApplicants) {
        const name = applicant.name;
        if (!name) {
          console.warn("Skipping update: name is undefined or empty");
          failedUpdates.push("Unknown (missing name)");
          continue;
        }
        try {
          console.log(
            `Sending PUT request to update status for ${name} to ${selectedStatus}`
          );
          await frappeAPI.updateApplicantStatus(name, {
            status: selectedStatus,
          });
        } catch (err: any) {
          console.error(`Failed to update status for ${name}:`, err);
          if (
            err?.exc_type === "DoesNotExistError" ||
            err.response?.status === 404
          ) {
            failedUpdates.push(name);
          } else {
            throw err;
          }
        }
      }

      const response: any = await frappeAPI.getTaggedApplicantsByJobId(
        jobId,
        ownerEmail
      );
      const applicantNames = response.data || [];
      const applicantsPromises = applicantNames.map(async (applicant: any) => {
        try {
          const applicantDetail = await frappeAPI.getApplicantBYId(
            applicant.name
          );
          return applicantDetail.data;
        } catch (err) {
          console.error(`Error fetching details for ${applicant.name}:`, err);
          return {
            name: applicant.name,
            email_id: applicant.email_id || "Not available",
          };
        }
      });

      const applicantsData = await Promise.all(applicantsPromises);
      setApplicants(applicantsData.filter((applicant) => applicant !== null));
      setFilteredApplicants(
        applicantsData.filter((applicant) => applicant !== null)
      );
      setSelectedApplicants([]);
      setSelectedStatus("");
      setIsStatusModalOpen(false);
      setRefreshKey((prev) => prev + 1);

      if (failedUpdates.length > 0) {
        toast.warning(
          `Status updated for some applicants. Failed for: ${failedUpdates.join(
            ", "
          )}. Applicant records may not exist or the endpoint may be incorrect.`
        );
      } else {
        toast.success("Applicant status updated successfully.");
      }
    } catch (err: any) {
      console.error("Status update error:", err);
      let errorMessage = "Failed to update applicant statuses.";
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage =
          "Session expired or insufficient permissions. Please try again.";
        router.push("/login");
      } else if (
        err.response?.status === 404 ||
        err?.exc_type === "DoesNotExistError"
      ) {
        errorMessage =
          "Job Applicant resource not found. Please verify the API endpoint or contact support.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      setIsStatusModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 bg-gray-50 min-h-[200px] rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 font-medium text-lg">
          Loading applicants...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 font-semibold text-lg">Error</p>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!applicants.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center shadow-sm">
        <p className="text-yellow-800 font-semibold text-lg">
          No applicants found
        </p>
        <p className="text-yellow-600 text-sm mt-2">
          Job: {jobId} | Owner: {ownerEmail}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-xl pt-100 p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="relative flex flex-row items-center gap-4 sm:flex-col sm:items-start">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            All Applicants
          </h2>
          <p className="text-gray-500 text-sm absolute right-0">
            Job: {jobId} | Total: {applicants.length} applicants
            {selectedApplicants.length > 0 &&
              ` | Selected: ${selectedApplicants.length}`}
          </p>
        </div>
        <div className="flex items-center gap-80 w-full justsm:w-auto mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm bg-gray-50 hover:bg-white"
            />
          </div>
          {selectedApplicants.length > 0 && (
            <div className="flex justify-between gap-3 items-center flex-nowrap">
              <button
                onClick={() => setShowEmailPopup(true)}
                className="px-3 py-3 text-white bg-green-600 rounded-lg text-sm font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap w-[120px]"
              >
                📧 Send ({selectedApplicants.length})
              </button>
              <button
                onClick={handleOpenStatusModal}
                className="px-3 py-3 text-white bg-blue-700 rounded-lg text-sm font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap w-[140px]"
              >
                Update Status ({selectedApplicants.length})
              </button>
              
              <button
                onClick={handleOpenAssessmentModal}
                className="px-3 py-3 text-white bg-blue-700 rounded-lg text-sm font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap w-[180px]"
              >
                Create Assessment ({selectedApplicants.length})
              </button>
             
            </div>
          )}
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Error</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}
      {assessmentError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-red-800 font-semibold text-sm">
              Assessment Error
            </p>
            <p className="text-red-600 text-xs mt-1">{assessmentError}</p>
          </div>
        </div>
      )}
      {assessmentSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-green-800 font-semibold text-sm">Success</p>
            <p className="text-green-600 text-xs mt-1">{assessmentSuccess}</p>
          </div>
        </div>
      )}

      {/* Applicants Table */}
      <ApplicantsTable
        applicants={filteredApplicants}
        showCheckboxes={true}
        selectedApplicants={selectedApplicants.map((app) => app.name)}
        onSelectApplicant={handleSelectApplicant}
        showStatus={true}
      />

      {/* Email Sending Popup */}
      {showEmailPopup && (
        <EmailSendingPopup
          isOpen={showEmailPopup}
          onClose={() => setShowEmailPopup(false)}
          selectedApplicants={selectedApplicants}
          currentUserEmail={ownerEmail}
          jobId={jobId}
          onEmailSent={() => {
            setSelectedApplicants([]);
            setShowEmailPopup(false);
            toast.success("Email sent successfully!");
          }}
        />
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-modal-title"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2
                id="status-modal-title"
                className="text-xl font-bold text-gray-900 flex items-center gap-2"
              >
                <Award className="h-5 w-5 text-blue-600" />
                Confirm Status Change
              </h2>
              <button
                onClick={handleCloseStatusModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{modalError}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Select New Status
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Select status"
              >
                <option value="" disabled>
                  Select a status...
                </option>
                <option value="Open">Open</option>
                <option value="tagged">Tagged</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Assessment Stage">Assessment Stage</option>
                <option value="Interview Stage">Interview Stage</option>
                <option value="offered">Offered</option>
                <option value="offer rejected">Offer Rejected</option>
                <option value="Rejected">Rejected</option>
                <option value="joined">Joined</option>
              </select>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 font-medium mb-2 text-sm">
                Selected Applicants ({selectedApplicants.length})
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedApplicants.map((applicant) => (
                  <div
                    key={applicant.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {applicant.applicant_name || applicant.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {applicant.email_id}
                        </p>
                      </div>
                    </div>
                    {selectedStatus && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedStatus
                        )}`}
                      >
                        {selectedStatus}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleCloseStatusModal}
                className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={!selectedStatus}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                aria-label="Confirm status change"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {isAssessmentModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-modal-title"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2
                id="assessment-modal-title"
                className="text-xl font-bold text-gray-900 flex items-center gap-2"
              >
                Create Assessment
              </h2>
              <button
                onClick={handleCloseAssessmentModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{modalError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Date of Assessment
                </label>
                <input
                  type="date"
                  value={scheduledOn}
                  onChange={(e) => setScheduledOn(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Start Time
                </label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  End Time
                </label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="url"
                  value={assessmentLink}
                  onChange={(e) => setAssessmentLink(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-sm"
                  placeholder="Assessment Link"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={assessmentRound}
                  onChange={(e) => setAssessmentRound(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-gray-50 text-gray-900 text-sm"
                  placeholder="Assessment Round"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={handleCloseAssessmentModal}
                className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAssessment}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Confirm assessment creation"
              >
                Create Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
