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
  ownerEmail: string; // only show applicants created by this owner
}

export default function TaggedApplicants({ jobId, ownerEmail }: Props) {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        // Pass ownerEmail to filter applicants created by this owner
        const response: any = await frappeAPI.getTaggedApplicantsByJobId(jobId, ownerEmail);
        const data: JobApplicant[] = response.data || [];
        setApplicants(data);
      } catch (err: any) {
        console.error('Error fetching tagged applicants:', err);
        setError('Failed to fetch tagged applicants. Please try again later.');
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    if (jobId && ownerEmail) fetchApplicants();
  }, [jobId, ownerEmail]);

  const handleViewApplicant = (applicant: JobApplicant) => {
    console.log('View applicant:', applicant.name);
  };

  const handleEditApplicant = (applicant: JobApplicant) => {
    console.log('Edit applicant:', applicant.name);
  };

  if (loading) return <p className="text-gray-500">Loading applicants...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!applicants.length) return <p className="text-gray-500">No tagged applicants found for this job.</p>;

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <ApplicantsTable
        applicants={applicants}
        onViewApplicant={handleViewApplicant}
        onEditApplicant={handleEditApplicant}
      />
    </div>
  );
}
