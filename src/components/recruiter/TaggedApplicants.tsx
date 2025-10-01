
// /*eslint-disable @typescript-eslint/no-explicit-any*/
// 'use client';

// import { use, useEffect, useState } from 'react';
// import { frappeAPI } from '@/lib/api/frappeClient';
// import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable';

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
//     todoData?: any; // Keep as optional for backward compatibility
// }

// export default function TaggedApplicants({ jobId, ownerEmail, todoData }: Props) {

//     console.log("160");
    
//     const [applicants, setApplicants] = useState<JobApplicant[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);

//     // useEffect(() => {
//     //     const fetchApplicants = async () => {
//     //         try {
//     //             setLoading(true);

//     //             // Use jobId and ownerEmail from props
//     //             if (!jobId || !ownerEmail) {
//     //                 setError('Job ID or owner information not found');
//     //                 setApplicants([]);
//     //                 return;
//     //             }

//     //             console.log('Fetching applicants for:', { jobId, ownerEmail });

//     //             // Use the correct API function with jobId and owner email
//     //             const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
//     //             const data: JobApplicant[] = response.data || [];

//     //             console.log('Fetched applicants:', data);
//     //             setApplicants(data);
//     //         } catch (err: any) {
//     //             console.error('Error fetching tagged applicants:', err);
//     //             setError('Failed to fetch tagged applicants. Please try again later.');
//     //             setApplicants([]);
//     //         } finally {
//     //             setLoading(false);
//     //         }
//     //     };

//     //     if (jobId && ownerEmail) {
//     //         fetchApplicants();
//     //     } else {
//     //         setLoading(false);
//     //         setError('Job ID or owner email not provided');
//     //     }
//     // }, [jobId, ownerEmail]);
// useEffect(() => {
       
//     const fetchApplicants = async () => {
//             console.log("204");

//         try {
//             setLoading(true);

//             // if (!jobId || !ownerEmail) {
//             //     setError('Job ID or owner information not found');
//             //     setApplicants([]);
//             //     return;
//             // }
//             console.log("207 job id ",jobId," owner email ",ownerEmail);

//             console.log('🔍 Fetching applicants for:', { jobId, ownerEmail });

//             const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
            
//             // Add these logs
//             console.log('📦 Full API Response:', response);
//             console.log('📊 Response data:', response.data);
//             console.log('📈 Applicants count:', response.data?.length || 0);

//             const data: JobApplicant[] = response.data || [];
//             setApplicants(data);
//         } catch (err: any) {
//             console.error('❌ Error fetching tagged applicants:', err);
//             console.error('Error details:', err.response || err.message);
//             setError('Failed to fetch tagged applicants. Please try again later.');
//             setApplicants([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (jobId && ownerEmail) {
//         fetchApplicants();
//     } else {
//         setLoading(false);
//         setError('Job ID or owner email not provided');
//     }
//      fetchApplicants();
// }, [jobId, ownerEmail]);

// // useEffect(() => {

//     const handleViewApplicant = (applicant: JobApplicant) => {
//         console.log('View applicant:', applicant.name);
//         // Implement view logic here
//     };

//     const handleEditApplicant = (applicant: JobApplicant) => {
//         console.log('Edit applicant:', applicant.name);
//         // Implement edit logic here
//     };

//     if (loading) return <p className="text-gray-500">Loading applicants...</p>;
//     if (error) return <p className="text-red-500">{error}</p>;
//     if (!applicants.length) return <p className="text-gray-500">No tagged applicants found for this job.</p>;

//     return (
//         <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
//             <div className="mb-4">
//                 <h2 className="text-xl font-semibold text-gray-900">Tagged Applicants</h2>
//                 <p className="text-gray-600 text-sm">
//                     Job: {jobId} | Total: {applicants.length} applicants
//                 </p>
//             </div>
//             <ApplicantsTable
//                 applicants={applicants} 
//                 selectedApplicants={[]} 
//                 onSelectApplicant={function (name: string): void {
//                     throw new Error('Function not implemented.');
//                 }}
//             />
//         </div>
//     );
// }




/*eslint-disable @typescript-eslint/no-explicit-any*/
'use client';

import { useEffect, useState } from 'react';
import { frappeAPI } from '@/lib/api/frappeClient';
import { ApplicantsTable } from '@/components/recruiter/ApplicantsTable';

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
}

export default function TaggedApplicants({ jobId, ownerEmail, todoData }: Props) {
    const [applicants, setApplicants] = useState<JobApplicant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                setLoading(true);
                console.log("🔍 Fetching applicants for:", { jobId, ownerEmail });

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
    }, [jobId, ownerEmail]);

    // Handle view applicant
    const handleViewApplicant = (applicant: JobApplicant) => {
        console.log('View applicant:', applicant);
        // Implement view logic here - maybe open a modal or navigate to detail page
    };

    // Handle edit applicant
    // const handleEditApplicant = (applicant: Job Applicant) => {
    //     console.log('Edit applicant:', applicant);
    //     // Implement edit logic here
    // };

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
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tagged Applicants</h2>
                <p className="text-gray-600 text-sm">
                    Job: {jobId} | Total: {applicants.length} applicants
                </p>
            </div>
            
            <ApplicantsTable
                applicants={applicants} 
                selectedApplicants={[]} 
                onSelectApplicant={(name: string) => {
                    console.log('Selected applicant:', name);
                    // Implement selection logic if needed
                }}
            />
            
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