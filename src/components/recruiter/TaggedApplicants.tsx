

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
//     refreshTrigger?: number; // ✅ New prop to trigger refresh
// }

// export default function TaggedApplicants({ jobId, ownerEmail, todoData, refreshTrigger }: Props) {
//     const [applicants, setApplicants] = useState<JobApplicant[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     // const [showMultipleApplicantsForm, setShowMultipleApplicantsForm] = useState(false);
//     const [selectedApplicants, setSelectedApplicants] = useState<JobApplicant[]>([]);
//     const [showEmailPopup, setShowEmailPopup] = useState(false);
//     const handleSelectApplicant = (name: string) => {
//         setSelectedApplicants(prev => {
//             const applicant = applicants.find(app => app.name === name);
//             if (prev.find(app => app.name === name)) {
//                 return prev.filter(app => app.name !== name);
//             } else if (applicant) {
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
//         // Implement view logic here - maybe open a modal or navigate to detail page
//     };

//     // Handle edit applicant
//     // const handleEditApplicant = (applicant: Job Applicant) => {
//     //     console.log('Edit applicant:', applicant);
//     //     // Implement edit logic here
//     // };

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
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h2 className="text-xl font-semibold text-gray-900">Tagged Applicants</h2>
//                     <p className="text-gray-600 text-sm">
//                         Job: {jobId} | Total: {applicants.length} applicants
//                     </p>
//                 </div>
//                 {/* <button
//                     onClick={() => setShowMultipleApplicantsForm(true)}
//                     className="px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
//                 >
//                     + Add
//                 </button> */}
//                 <div className="flex items-center justify-between">
//     <div>
//         <h2 className="text-xl font-semibold text-gray-900">Tagged Applicants</h2>
//         <p className="text-gray-600 text-sm">
//             Job: {jobId} | Total: {applicants.length} applicants
//         </p>
//     </div>
//     {selectedApplicants.length > 0 && (
//         <button
//             onClick={() => setShowEmailPopup(true)}
//             className="px-4 py-2 text-red-900 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
//         >
//             📧 Sendasdfgggggggfshglkj,hmhcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc ({selectedApplicants.length})
//         </button>
//     )}
// </div>

//             </div>



//             <ApplicantsTable
//                 applicants={applicants}
//                 selectedApplicants={[]}
//                 onSelectApplicant={(name: string) => {
//                     console.log('Selected applicant:', name);
//                     // Implement selection logic if needed
//                 }}
//             />
//             {/* {showMultipleApplicantsForm && (
//                 <MultipleApplicantsForm
//                     initialJobId={jobId}
                    
//                 />
//             )} */}

//             {/* Debug info - remove in production */}
//             {/* <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
//                 <p className="font-medium">Debug Info:</p>
//                 <p>Job ID: {jobId}</p>
//                 <p>Owner Email: {ownerEmail}</p>
//                 <p>Applicants Count: {applicants.length}</p>
//             </div> */}
//             {showEmailPopup && (
//     <EmailSendingPopup
//         isOpen={showEmailPopup}
//         onClose={() => setShowEmailPopup(false)}
//         selectedApplicants={selectedApplicants}
//         currentUserEmail={ownerEmail} // or get from user session
//         jobId={jobId}
//         onEmailSent={() => {
//             setSelectedApplicants([]);
//             // Optional: show success message
//         }}
//     />
// )}
//         </div>
        
//     );
// }




/*eslint-disable @typescript-eslint/no-explicit-any*/
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
    const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0); // Local refresh trigger
    const router = useRouter();

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
    }, [jobId, ownerEmail,  refreshTrigger, refreshKey]);

    // Handle view applicant
    const handleViewApplicant = (applicant: JobApplicant) => {
        console.log('View applicant:', applicant);
        // Implement view logic here
    };

    // Handler for checkbox changes
    const handleCheckboxChange = (applicantId: string) => {
        setSelectedApplicants((prev) => {
            const newSelected = [...prev];
            const index = newSelected.indexOf(applicantId);
            if (index > -1) {
                newSelected.splice(index, 1);
            } else {
                newSelected.push(applicantId);
            }
            return newSelected;
        });
    };

    // Handler for select all
    const handleSelectAll = () => {
        if (selectedApplicants.length === applicants.length) {
            setSelectedApplicants([]);
        } else {
            setSelectedApplicants(applicants.map((applicant) => applicant.name));
        }
    };

    // Handler to open the status update modal
    const handleOpenStatusModal = () => {
        if (selectedApplicants.length === 0) {
            toast.error('Please select at least one applicant.');
            return;
        }
        setIsStatusModalOpen(true);
        setSelectedStatus('');
        setModalError(null);
    };

    // Handler to close the status modal
    const handleCloseStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedStatus('');
        setModalError(null);
    };

    // Handler for confirming status change
    const handleConfirmStatusChange = async () => {
        if (!selectedStatus) {
            setModalError('Please select a status.');
            return;
        }
        if (!ownerEmail) {
            toast.error('Owner email not found. Please try again.');
            setIsStatusModalOpen(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Selected applicants for status update:', selectedApplicants);
            const failedUpdates: string[] = [];
            for (const name of selectedApplicants) {
                if (!name) {
                    console.warn('Skipping update: name is undefined or empty');
                    failedUpdates.push('Unknown (missing name)');
                    continue;
                }
                try {
                    console.log(`Sending PUT request to update status for ${name} to ${selectedStatus}`);
                    await frappeAPI.updateApplicantStatus(name, { status: selectedStatus });
                } catch (err: any) {
                    console.error(`Failed to update status for ${name}:`, err);
                    if (err?.exc_type === 'DoesNotExistError' || err.response?.status === 404) {
                        failedUpdates.push(name);
                    } else {
                        throw err; // Rethrow other errors
                    }
                }
            }

            // Refresh applicants list
            const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
            const applicantNames = response.data || [];
            const applicantsPromises = applicantNames.map(async (applicant: any) => {
                try {
                    const applicantDetail = await frappeAPI.getApplicantBYId(applicant.name);
                    return applicantDetail.data;
                } catch (err) {
                    console.error(`Error fetching details for ${applicant.name}:`, err);
                    return {
                        name: applicant.name,
                        email_id: applicant.email_id || 'Not available'
                    };
                }
            });

            const applicantsData = await Promise.all(applicantsPromises);
            setApplicants(applicantsData.filter(applicant => applicant !== null));
            setSelectedApplicants([]);
            setSelectedStatus('');
            setIsStatusModalOpen(false);
            setRefreshKey((prev) => prev + 1); // Trigger local refresh

            if (failedUpdates.length > 0) {
                toast.warning(
                    `Status updated for some applicants. Failed for: ${failedUpdates.join(', ')}. Applicant records may not exist or the endpoint may be incorrect.`
                );
            } else {
                toast.success('Applicant status updated successfully.');
            }
        } catch (err: any) {
            console.error('Status update error:', err);
            let errorMessage = 'Failed to update applicant statuses.';
            if (err.response?.status === 401 || err.response?.status === 403) {
                errorMessage = 'Session expired or insufficient permissions. Please try again.';
                router.push('/login');
            } else if (err.response?.status === 404 || err?.exc_type === 'DoesNotExistError') {
                errorMessage = 'Job Applicant resource not found. Please verify the API endpoint or contact support.';
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
            <div className="flex items-center justify-between mb-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Tagged Applicants</h2>
                    <p className="text-gray-600 text-sm">
                        Job: {jobId} | Total: {applicants.length} applicants
                        {selectedApplicants.length > 0 && ` | Selected: ${selectedApplicants.length}`}
                    </p>
                </div>
                <button
                    onClick={handleOpenStatusModal}
                    disabled={selectedApplicants.length === 0}
                    className={`px-3 py-1 text-white font-medium rounded-lg transition-colors ${
                        selectedApplicants.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    Update Status
                </button>
                
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

            <ApplicantsTable
                applicants={applicants}
                selectedApplicants={selectedApplicants}
                onSelectApplicant={handleCheckboxChange}
                showCheckboxes={true}
                showStatus={true}
            />

            {/* Status Update Modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 id="status-modal-title" className="text-2xl font-bold text-gray-800 mb-4">
                            Confirm Status Change
                        </h2>
                        {modalError && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-center">
                                <p>{modalError}</p>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-gray-600 mb-2">Select New Status</label>
                            <select
                                className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="Open">Open</option>
                                <option value="Assessment Stage">Assessment Stage</option>
                                <option value="Closed">Closed</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Hired">Hired</option>
                            </select>
                        </div>
                        <p className="text-gray-600 mb-4">
                            {selectedStatus
                                ? `You are about to change the status of the following applicants to ${selectedStatus}:`
                                : 'Selected Applicants:'}
                        </p>
                        <ul className="list-disc list-inside mb-4">
                            {selectedApplicants.map((name) => {
                                const applicant = applicants.find((a) => a.name === name);
                                return (
                                    <li key={name} className="text-gray-600 flex justify-between">
                                        <span>{applicant?.applicant_name || name}</span>
                                        <span>{applicant?.email_id}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCloseStatusModal}
                                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmStatusChange}
                                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug info - remove in production */}
            {/* <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <p className="font-medium">Debug Info:</p>
                <p>Job ID: {jobId}</p>
                <p>Owner Email: {ownerEmail}</p>
                <p>Applicants Count: {applicants.length}</p>
            </div> */}
        </div>
    );
}