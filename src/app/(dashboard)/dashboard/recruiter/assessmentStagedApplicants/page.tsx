/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { frappeAPI } from '@/lib/api/frappeClient';
import { AssessmentStagedApplicantsTable } from '@/components/recruiter/AssesmentStagedApplicantsTable';

export interface JobApplicant {
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

interface ApiResponse {
  data: JobApplicant[];
}

interface ApplicantDetailResponse {
  data: JobApplicant;
}

export default function AssessmentStagedApplicants() {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchApplicants = async () => {
      try {
        setLoading(true);

        // Check user session
        const session = await frappeAPI.checkSession();
        if (!session.authenticated || !session.user?.email) {
          setError('Please log in to view applicants.');
          setIsAuthenticated(false);
          router.push('/login');
          return;
        }

        setIsAuthenticated(true);
        const email = session.user.email;

        // Fetch list of applicants
        const response = await frappeAPI.getAllApplicants(email);
        const result: ApiResponse = response;

        if (!result.data || result.data.length === 0) {
          setApplicants([]);
          return;
        }

        // Fetch details for each applicant and filter for Assessment Stage status
        const detailedApplicants: JobApplicant[] = [];
        const emailIdSet = new Set<string>();
        for (const applicant of result.data) {
          try {
            const id = applicant.name; // Use name as the unique identifier
            if (applicant.email_id && emailIdSet.has(applicant.email_id)) {
              console.warn(`Duplicate email_id detected: ${applicant.email_id}`);
              toast.warning(`Duplicate applicant email found: ${applicant.email_id}. This may indicate a data issue.`);
            } else if (applicant.email_id) {
              emailIdSet.add(applicant.email_id);
            }
            const detailResponse = await frappeAPI.getApplicantBYId(id);
            const detail: ApplicantDetailResponse = detailResponse;
            // Only include applicants with status "Assessment Stage" (case-insensitive)
            if (detail.data.status?.toLowerCase() === 'assessment stage') {
              detailedApplicants.push(detail.data);
            }
          } catch (detailErr: any) {
            console.error(`Error fetching details for ${applicant.name}:`, detailErr);
            if (applicant.status?.toLowerCase() === 'assessment stage') {
              detailedApplicants.push({
                ...applicant,
                applicant_name: 'Error fetching details',
              });
            }
          }
        }

        setApplicants(detailedApplicants);
      } catch (err: any) {
        console.error('Fetch error:', err);
        let errorMessage = 'An error occurred while fetching applicants.';
        if (err.message.includes('Session expired') || err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = 'Session expired. Please log in again.';
          setIsAuthenticated(false);
          router.push('/login');
        } else if (err.response?.status === 404) {
          errorMessage = 'Job Applicant resource not found. Please verify the API endpoint or contact support.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchApplicants();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-red-600">
          Please log in to view applicants.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Assessment Stage Applicants
          </h1>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            <p>{error}</p>
            {error.includes('not found') && (
              <p className="mt-2 text-sm">
                Possible issues:
                <ul className="list-disc list-inside">
                  <li>Verify the Frappe API base URL in your environment variables.</li>
                  <li>Ensure the Job Applicant resource exists in your Frappe system.</li>
                  <li>Contact your system administrator for API access details.</li>
                </ul>
              </p>
            )}
          </div>
        )}
        {applicants.length === 0 ? (
          <p className="text-center text-gray-600">No Assessment Stage applicants found.</p>
        ) : (
          <AssessmentStagedApplicantsTable applicants={applicants} />
        )}
      </div>
    </div>
  );
}