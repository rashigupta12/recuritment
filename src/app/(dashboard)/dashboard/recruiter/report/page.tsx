'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText } from 'lucide-react';
import { frappeAPI } from '@/lib/api/frappeClient';

interface Applicant {
  name: string;
  applicant_name: string;
  email_id: string;
  phone_number: string;
  country: string;
  job_title: string;
  designation: string;
  status: string;
  resume_attachment: string;
  custom_experience: Array<{
    company_name: string;
    designation: string;
    start_date: string;
    end_date: string;
    current_company: number;
  }>;
  custom_education: Array<{
    degree: string;
    specialization: string;
    institution: string;
    year_of_passing: number;
    percentagecgpa: number;
  }>;
  creation: string;
  owner: string;
}

interface JobOpening {
  name: string;
  job_title: string;
  status: string;
  creation: string;
}

interface ReportData {
  totalOpenings: number;
  totalApplicants: number;
  jobOpenings: JobOpening[];
  applicants: Applicant[];
}

const ReportPage: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('2025-10-04');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        const session = await frappeAPI.checkSession();
        if (!session.authenticated || !session.user?.email) {
          setError('Please log in to view the report.');
          setIsAuthenticated(false);
          router.push('/login');
          return;
        }

        setIsAuthenticated(true);
        setUserEmail(session.user.email);

        const [applicants, jobOpenings] = await Promise.all([
          fetchApplicantsData(session.user.email, { to_date: toDate }),
          fetchJobOpeningsData(),
        ]);

        setReportData({
          totalOpenings: jobOpenings.length,
          totalApplicants: applicants.length,
          jobOpenings,
          applicants,
        });
      } catch (err: any) {
        console.error('Fetch error:', err);
        let errorMessage = 'An error occurred while fetching report data.';
        if (err.message.includes('Session expired') || err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = 'Session expired. Please log in again.';
          setIsAuthenticated(false);
          router.push('/login');
        } else if (err.response?.status === 404 || err?.exc_type === 'DoesNotExistError') {
          errorMessage = 'Resource not found. Please verify the API endpoint or contact support.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router, toDate]);

  const fetchApplicantsData = async (email: string, filters: { from_date?: string; to_date?: string } = {}) => {
    const fields = [
      'name', 'applicant_name', 'email_id', 'phone_number', 'country',
      'job_title', 'designation', 'status', 'resume_attachment',
      'custom_experience', 'custom_education', 'creation', 'owner'
    ];
    let baseFilters: any[] = [['owner', '=', email]];
    if (filters.from_date || filters.to_date) {
      if (filters.from_date) baseFilters.push(['creation', '>=', filters.from_date]);
      if (filters.to_date) baseFilters.push(['creation', '<=', filters.to_date]);
    }
    const url = `/resource/Job Applicant?fields=${JSON.stringify(fields)}&filters=${JSON.stringify(baseFilters)}&limit_page_length=0&order_by=creation desc`;
    const response = await frappeAPI.makeAuthenticatedRequest('GET', url);
    return response.data as Applicant[];
  };

  const fetchJobOpeningsData = async (filters: { from_date?: string; to_date?: string } = {}) => {
    const fields = ['name', 'job_title', 'status', 'creation'];
    let baseFilters: any[] = [['status', '!=', 'Closed']];
    if (filters.from_date || filters.to_date) {
      if (filters.from_date) baseFilters.push(['creation', '>=', filters.from_date]);
      if (filters.to_date) baseFilters.push(['creation', '<=', filters.to_date]);
    }
    const url = `/resource/Job Opening?fields=${JSON.stringify(fields)}&filters=${JSON.stringify(baseFilters)}&limit_page_length=0&order_by=creation desc`;
    const response = await frappeAPI.makeAuthenticatedRequest('GET', url);
    return response.data as JobOpening[];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setError('User email not found. Please log in again.');
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [applicants, jobOpenings] = await Promise.all([
        fetchApplicantsData(userEmail, { from_date: fromDate, to_date: toDate }),
        fetchJobOpeningsData({ from_date: fromDate, to_date: toDate }),
      ]);
      setReportData({
        totalOpenings: jobOpenings.length,
        totalApplicants: applicants.length,
        jobOpenings,
        applicants,
      });
    } catch (err: any) {
      console.error('Fetch error:', err);
      let errorMessage = 'Failed to fetch report data.';
      if (err.message.includes('Session expired') || err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Session expired. Please log in again.';
        setIsAuthenticated(false);
        router.push('/login');
      } else if (err.response?.status === 404 || err?.exc_type === 'DoesNotExistError') {
        errorMessage = 'Resource not found. Please verify the API endpoint or contact support.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    const formatRow = (item: any) => {
      return headers.map(header => {
        const value = item[header];
        if (['custom_experience', 'custom_education'].includes(header) && Array.isArray(value)) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${(value || '').toString().replace(/"/g, '""')}"`;
      });
    };

    const csvContent = [
      headers,
      ...data.map(formatRow),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJobOpenings = () => {
    if (!reportData?.jobOpenings) return;
    const headers = ['name', 'job_title', 'status', 'creation'];
    downloadCSV(reportData.jobOpenings, 'job_openings_report.csv', headers);
  };

  const handleDownloadApplicants = () => {
    if (!reportData?.applicants) return;
    const headers = [
      'name', 'applicant_name', 'email_id', 'phone_number', 'country',
      'job_title', 'designation', 'status', 'resume_attachment',
      'custom_experience', 'custom_education', 'creation', 'owner'
    ];
    downloadCSV(reportData.applicants, 'applicants_report.csv', headers);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl mb-4 text-gray-600">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 text-sm">Please log in to view the report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Recruitment Report
        </h1>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="mb-6 border-b border-gray-200 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="from_date" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="from_date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm"
              />
            </div>
            <div>
              <label htmlFor="to_date" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="to_date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Report
              </>
            )}
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('not found') && (
                  <div className="mt-2 text-sm text-red-600">
                    <p className="font-medium mb-1">Possible issues:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Verify the Frappe API base URL in your environment variables</li>
                      <li>Ensure the Job Applicant and Job Opening resources exist in your Frappe system</li>
                      <li>Contact your system administrator for API access details</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Section */}
        {reportData && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Report Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-md border border-gray-200 p-4">
                  <p className="text-sm font-medium text-gray-600">Total Job Openings</p>
                  <p className="text-xl font-semibold text-gray-800">{reportData.totalOpenings}</p>
                </div>
                <div className="bg-white rounded-md border border-gray-200 p-4">
                  <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                  <p className="text-xl font-semibold text-gray-800">{reportData.totalApplicants}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadJobOpenings}
                disabled={!reportData.jobOpenings.length}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Job Openings CSV
              </button>
              <button
                onClick={handleDownloadApplicants}
                disabled={!reportData.applicants.length}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Applicants CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;