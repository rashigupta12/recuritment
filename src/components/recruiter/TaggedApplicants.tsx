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
'use client';

import { useEffect, useState } from 'react';
import { frappeAPI } from '@/lib/api/frappeClient';
import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable';
import EmailSendingPopup from './EmailSendingPopup';

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

export default function TaggedApplicants({ jobId, ownerEmail, todoData, refreshTrigger }: Props) {
    const [applicants, setApplicants] = useState<JobApplicant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApplicants, setSelectedApplicants] = useState<JobApplicant[]>([]);
    const [showEmailPopup, setShowEmailPopup] = useState(false);

    // Handle applicant selection
    const handleSelectApplicant = (name: string) => {
        setSelectedApplicants(prev => {
            const applicant = applicants.find(app => app.name === name);
            if (prev.find(app => app.name === name)) {
                // If already selected, remove it
                return prev.filter(app => app.name !== name);
            } else if (applicant) {
                // If not selected, add it
                return [...prev, applicant];
            }
            return prev;
        });
    };

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                setLoading(true);

                // Step 1: Get the list of applicant names/IDs
                const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
                console.log('📦 Initial API Response:', response);

                const applicantNames = response.data || [];
                console.log('📊 Applicant names:', applicantNames);

                if (applicantNames.length === 0) {
                    setApplicants([]);
                    setLoading(false);
                    return;
                }

                // Step 2: Fetch full details for each applicant
                const applicantsPromises = applicantNames.map(async (applicant: any) => {
                    try {
                        console.log(`📥 Fetching details for applicant: ${applicant.name}`);
                        const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
                        console.log(`✅ Applicant details for ${applicant.name}:`, applicantDetail.data);
                        
                        // Debug: Check if resume_attachment exists in the response
                        if (applicantDetail.data) {
                            console.log(`📎 Resume attachment for ${applicant.name}:`, {
                                hasResume: !!applicantDetail.data.resume_attachment,
                                resumeValue: applicantDetail.data.resume_attachment,
                                fullData: applicantDetail.data
                            });
                        }
                        
                        return applicantDetail.data;
                    } catch (err) {
                        console.error(`❌ Error fetching details for ${applicant.name}:`, err);
                        // Return basic data if detailed fetch fails
                        return {
                            name: applicant.name,
                            email_id: applicant.email_id || 'Not available'
                        };
                    }
                });

                // Wait for all applicant details to be fetched
                const applicantsData = await Promise.all(applicantsPromises);
                console.log('🎉 All applicants data:', applicantsData);

                // Debug: Check resume attachments in final data
                console.log('🔍 Resume Attachment Summary:');
                applicantsData.forEach((applicant, index) => {
                    if (applicant) {
                        console.log(`Applicant ${index + 1}: ${applicant.applicant_name || applicant.name}`, {
                            hasResume: !!applicant.resume_attachment,
                            resumeValue: applicant.resume_attachment,
                            resumeType: typeof applicant.resume_attachment
                        });
                    }
                });

                setApplicants(applicantsData.filter(applicant => applicant !== null));

            } catch (err: any) {
                console.error('❌ Error in fetchApplicants:', err);
                console.error('Error details:', err.response || err.message);
                setError('Failed to fetch tagged applicants. Please try again later.');
                setApplicants([]);
            } finally {
                setLoading(false);
            }
        };

        if (jobId && ownerEmail) {
            fetchApplicants();
        } else {
            setLoading(false);
            setError('Job ID or owner email not provided');
            console.log('❌ Missing data:', { jobId, ownerEmail });
        }
    }, [jobId, ownerEmail, refreshTrigger]);

    // Add debug when selected applicants change
    useEffect(() => {
        console.log('🔄 Selected Applicants Updated:', {
            count: selectedApplicants.length,
            applicants: selectedApplicants.map(app => ({
                name: app.applicant_name || app.name,
                hasResume: !!app.resume_attachment,
                resumeValue: app.resume_attachment
            }))
        });
    }, [selectedApplicants]);

    // Handle view applicant
    const handleViewApplicant = (applicant: JobApplicant) => {
        console.log('View applicant:', applicant);
        // Implement view logic here
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading applicants...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (!applicants.length) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800">No tagged applicants found for this job.</p>
                <p className="text-yellow-600 text-sm mt-1">
                    Job: {jobId} | Owner: {ownerEmail}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            {/* Single Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Tagged Applicants</h2>
                    <p className="text-gray-600 text-sm">
                        Job: {jobId} | Total: {applicants.length} applicants
                        {selectedApplicants.length > 0 && ` | Selected: ${selectedApplicants.length}`}
                    </p>
                    {/* Debug info */}
                    <p className="text-xs text-gray-500 mt-1">
                        Applicants with resumes: {applicants.filter(app => app.resume_attachment).length}
                    </p>
                </div>
                
                {/* Send Email Button - Only shows when applicants are selected */}
                {selectedApplicants.length > 0 && (
                    <button
                        onClick={() => setShowEmailPopup(true)}
                        className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        📧 Send ({selectedApplicants.length})
                    </button>
                )}
            </div>

            {/* Applicants Table with proper selection handler */}
           <ApplicantsTable
    applicants={applicants}
    showCheckboxes={true}  // ✅ This enables the checkboxes
    selectedApplicants={selectedApplicants.map(app => app.name)}  // ✅ Pass selected names
    onSelectApplicant={handleSelectApplicant}  // ✅ Use the proper handler
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
                        // Optional: Add a success toast here
                        console.log('Email sent successfully!');
                    }}
                />
            )}
        </div>
    );
}