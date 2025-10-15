// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState } from "react";
// import { X, AlertCircle } from "lucide-react";
// import { frappeAPI } from "@/lib/api/frappeClient";
// import { toast } from "sonner";

// interface InterviewScheduleData {
//   schedule_date: string;
//   interview_round: string;
//   interview_panel_name?: string;
//   mode_of_interview: 'Virtual' | 'In Person';
// }

// interface InterviewScheduleModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   applicantName: string;
//   applicantId: string;
//   selectedApplicants: any[];
//   jobTitle?: string;
//   selectedStatus: string;
//   onSuccess: () => void;
//   loading?: boolean;
//   error?: string | null;
// }

// export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
//   isOpen,
//   onClose,
//   applicantName,
//   applicantId,
//   selectedApplicants,
//   jobTitle = "",
//   selectedStatus,
//   onSuccess,
//   loading = false,
//   error,
// }) => {
//   const [formData, setFormData] = useState<InterviewScheduleData>({
//     schedule_date: '',
//     interview_round: '',
//     interview_panel_name: '',
//     mode_of_interview: 'Virtual',
//   });
//   const [localError, setLocalError] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   if (!isOpen) return null;

//   const handleSubmit = async () => {
//     if (!formData.schedule_date || !formData.interview_round || !formData.mode_of_interview) {
//       setLocalError('Please fill in all required fields (Schedule Date, Interview Round, Mode)');
//       return;
//     }

//     // Validate date is not in the past
//     const selectedDate = new Date(formData.schedule_date);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     if (selectedDate < today) {
//       setLocalError('Schedule date cannot be in the past');
//       return;
//     }

//     setLocalError(null);
//     setIsSubmitting(true);

//     try {
//       const failedApplicants: string[] = [];

//       for (const applicant of selectedApplicants) {
//         try {
//           // Create Interview record via Frappe API
//           const interviewPayload = {
//             job_applicant: applicant.name,
//             job_title: jobTitle,
//             scheduled_on: formData.schedule_date,
//             interview_round: formData.interview_round,
//             interview_panel_name: formData.interview_panel_name || "",
//             mode_of_interview: formData.mode_of_interview,
//           };

//           await frappeAPI.createInterview(interviewPayload);
//           console.log(`Interview created for ${applicant.name}`);

//           // Update applicant status
//           const updateData = {
//             status: selectedStatus,
//             custom_schedule_date: formData.schedule_date,
//             custom_interview_round: formData.interview_round,
//             custom_interview_panel_name: formData.interview_panel_name || "",
//             custom_mode_of_interview: formData.mode_of_interview,
//           };

//           await frappeAPI.updateApplicantStatus(applicant.name, updateData);
//           console.log(`Status updated for ${applicant.name}`);
//         } catch (err: any) {
//           console.error(`Failed to process interview for ${applicant.name}:`, err);
//           failedApplicants.push(applicant.applicant_name || applicant.name);
//         }
//       }

//       if (failedApplicants.length > 0) {
//         toast.warning(
//           `Interview scheduled for some applicants. Failed for: ${failedApplicants.join(", ")}`
//         );
//       } else {
//         toast.success("Interview scheduled successfully for all applicants!");
//       }

//       onSuccess();
//       handleClose();
//     } catch (err: any) {
//       console.error("Interview scheduling error:", err);
//       const errorMessage = err.message || "Failed to schedule interview";
//       setLocalError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     setFormData({
//       schedule_date: '',
//       interview_round: '',
//       interview_panel_name: '',
//       mode_of_interview: 'Virtual',
//     });
//     setLocalError(null);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
//           <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
//           <button
//             onClick={handleClose}
//             disabled={isSubmitting}
//             className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//             aria-label="Close modal"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Applicant Info - Auto-filled */}
//         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//           <p className="text-sm text-gray-700">
//             <span className="font-semibold">Applicant:</span> {applicantName}
//           </p>
//           <p className="text-sm text-gray-700">
//             <span className="font-semibold">ID:</span> {applicantId}
//           </p>
//           <p className="text-sm text-gray-700">
//             <span className="font-semibold">Selected:</span> {selectedApplicants.length} applicant(s)
//           </p>
//         </div>

//         {/* Error Message */}
//         {(localError || error) && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
//             <AlertCircle className="h-4 w-4 flex-shrink-0" />
//             <p className="text-sm">{localError || error}</p>
//           </div>
//         )}

//         {/* Form Fields */}
//         <div className="space-y-4 mb-6">
//           {/* Schedule Date */}
//           <div>
//             <label htmlFor="schedule-date" className="block text-gray-700 font-semibold mb-2 text-sm">
//               Schedule Date <span className="text-red-500">*</span>
//             </label>
//             <input
//               id="schedule-date"
//               type="date"
//               value={formData.schedule_date}
//               onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900 text-sm transition-all"
//               min={new Date().toISOString().split('T')[0]}
//               required
//               disabled={isSubmitting}
//             />
//           </div>

//           {/* Interview Round */}
//           <div>
//             <label htmlFor="interview-round" className="block text-gray-700 font-semibold mb-2 text-sm">
//               Interview Round <span className="text-red-500">*</span>
//             </label>
//             <input
//               id="interview-round"
//               type="text"
//               value={formData.interview_round}
//               onChange={(e) => setFormData({ ...formData, interview_round: e.target.value })}
//               placeholder="e.g., Round 1, Technical, HR"
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900 text-sm transition-all"
//               required
//               disabled={isSubmitting}
//             />
//           </div>

//           {/* Interview Panel Name (Optional) */}
//           <div>
//             <label htmlFor="interview-panel" className="block text-gray-700 font-semibold mb-2 text-sm">
//               Interview Panel Name <span className="text-gray-400 font-normal">(Optional)</span>
//             </label>
//             <input
//               id="interview-panel"
//               type="text"
//               value={formData.interview_panel_name || ''}
//               onChange={(e) => setFormData({ ...formData, interview_panel_name: e.target.value })}
//               placeholder="e.g., John Doe, Jane Smith"
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900 text-sm transition-all"
//               disabled={isSubmitting}
//             />
//           </div>

//           {/* Mode of Interview */}
//           <div>
//             <label htmlFor="mode-interview" className="block text-gray-700 font-semibold mb-2 text-sm">
//               Mode of Interview <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="mode-interview"
//               value={formData.mode_of_interview}
//               onChange={(e) => setFormData({ ...formData, mode_of_interview: e.target.value as 'Virtual' | 'In Person' })}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900 text-sm transition-all"
//               required
//               disabled={isSubmitting}
//             >
//               <option value="Virtual">Virtual</option>
//               <option value="In Person">In Person</option>
//             </select>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
//           <button
//             onClick={handleClose}
//             disabled={isSubmitting}
//             className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//             aria-label="Cancel"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
//             aria-label="Schedule interview"
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="animate-spin">⏳</span>
//                 Scheduling...
//               </>
//             ) : (
//               'Schedule Interview'
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };