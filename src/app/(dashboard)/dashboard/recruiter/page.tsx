/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useState } from 'react';
import { Users, Briefcase, Calendar, Activity, FileText, Award } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Updated JobApplicant interface with diversity fields
interface JobApplicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  status: 'Open' | 'Shortlisted' | 'Assessment Stage' | 'Interview Stage' | 'Closed' | 'Rejected' | 'Hired';
  joined?: boolean;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'; // Added for diversity
  ethnicity?: 'Asian' | 'Black' | 'Hispanic' | 'White' | 'Other'; // Added for diversity
  ageGroup?: '18-24' | '25-34' | '35-44' | '45+'; // Added for diversity
  location?: string; // Added for diversity (geographic diversity)
}

// JobOpening interface (unchanged)
interface JobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  department: string;
  status: 'Open' | 'Closed';
  applicants: number;
  positions: number;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
}

// Updated dummyApplicants with diverse data
const dummyApplicants: JobApplicant[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', job_title: 'Software Engineer', status: 'Open', gender: 'Male', ethnicity: 'White', ageGroup: '25-34', location: 'USA' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', job_title: 'Product Manager', status: 'Hired', joined:false, gender: 'Female', ethnicity: 'Asian', ageGroup: '35-44', location: 'India' },
  { id: '3', name: 'Alice Johnson', email: 'alice.j@example.com', job_title: 'Data Analyst', status: 'Assessment Stage', gender: 'Female', ethnicity: 'Black', ageGroup: '18-24', location: 'Canada' },
  { id: '4', name: 'Bob Wilson', email: 'bob.wilson@example.com', job_title: 'UX Designer', status: 'Interview Stage', gender: 'Male', ethnicity: 'Hispanic', ageGroup: '45+', location: 'Mexico' },
  { id: '5', name: 'Emma Brown', email: 'emma.brown@example.com', job_title: 'DevOps Engineer', status: 'Hired', joined: true, gender: 'Non-binary', ethnicity: 'Other', ageGroup: '25-34', location: 'UK' },
  { id: '6', name: 'Michael Lee', email: 'michael.lee@example.com', job_title: 'Software Engineer', status: 'Rejected', gender: 'Male', ethnicity: 'Asian', ageGroup: '35-44', location: 'China' },
  { id: '7', name: 'Sarah Davis', email: 'sarah.davis@example.com', job_title: 'Marketing Manager', status: 'Closed', gender: 'Female', ethnicity: 'White', ageGroup: '45+', location: 'Australia' },
  { id: '8', name: 'David Miller', email: 'david.miller@example.com', job_title: 'Data Scientist', status: 'Shortlisted', gender: 'Male', ethnicity: 'Black', ageGroup: '25-34', location: 'South Africa' },
  { id: '9', name: 'Laura Taylor', email: 'laura.taylor@example.com', job_title: 'Product Manager', status: 'Assessment Stage', gender: 'Female', ethnicity: 'Hispanic', ageGroup: '18-24', location: 'Spain' },
  { id: '10', name: 'James White', email: 'james.white@example.com', job_title: 'Software Engineer', status: 'Hired',joined:true, gender: 'Prefer not to say', ethnicity: 'Other', ageGroup: '35-44', location: 'Germany' },
  { id: '11', name: 'Emily Clark', email: 'emily.clark@example.com', job_title: 'Data Engineer', status: 'Hired', joined: false, gender: 'Female', ethnicity: 'Asian', ageGroup: '25-34', location: 'Japan' },
];

// Updated dummyJobOpenings to align with applicant data
const dummyJobOpenings: JobOpening[] = [
  { id: '1', title: 'Software Engineer', company: 'TechCorp', location: 'Bangalore, India', experience: '2-5 years', department: 'Engineering', status: 'Open', applicants: 3, positions: 3 },
  { id: '2', title: 'Product Manager', company: 'Innovate Ltd', location: 'Mumbai, India', experience: '3-7 years', department: 'Product', status: 'Open', applicants: 2, positions: 2 },
  { id: '3', title: 'Data Analyst', company: 'DataVision', location: 'Delhi, India', experience: '1-3 years', department: 'Analytics', status: 'Open', applicants: 1, positions: 1 },
  { id: '4', title: 'UX Designer', company: 'DesignHub', location: 'Pune, India', experience: '2-4 years', department: 'Design', status: 'Closed', applicants: 1, positions: 1 },
  { id: '5', title: 'DevOps Engineer', company: 'CloudSys', location: 'Hyderabad, India', experience: '4-8 years', department: 'Engineering', status: 'Open', applicants: 1, positions: 2 },
  { id: '6', title: 'Data Scientist', company: 'DataVision', location: 'Chennai, India', experience: '2-5 years', department: 'Analytics', status: 'Open', applicants: 1, positions: 1 },
  { id: '7', title: 'Marketing Manager', company: 'Innovate Ltd', location: 'Kolkata, India', experience: '5-10 years', department: 'Marketing', status: 'Closed', applicants: 1, positions: 1 },
  { id: '8', title: 'Data Engineer', company: 'TechCorp', location: 'Bangalore, India', experience: '3-6 years', department: 'Engineering', status: 'Open', applicants: 1, positions: 1 },
];

const dummyActivities: Activity[] = [
  { id: '1', action: 'John Doe moved to Assessment Stage', timestamp: '2025-10-01 10:30 AM' },
  { id: '2', action: 'Software Engineer job opened', timestamp: '2025-09-30 3:15 PM' },
  { id: '3', action: 'Jane Smith shortlisted', timestamp: '2025-09-29 9:00 AM' },
];

const dummyEvents: Event[] = [
  { id: '1', title: 'Interview with John Doe', date: '2025-10-02 10:00 AM' },
  { id: '2', title: 'Assessment for Jane Smith', date: '2025-10-03 2:00 PM' },
];

// QuickStats component
const QuickStats: React.FC<{ applicants: JobApplicant[] }> = ({ applicants }) => {
  const totalApplicants = applicants.length;
  const pendingActions = applicants.filter((a) => a.status === 'Open' || a.status === 'Shortlisted' || a.status === 'Assessment Stage' || a.status === 'Interview Stage').length;
  const recentStatusChanges = dummyActivities.length;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-blue-600" />
        Quick Stats
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Total Applicants</p>
          <p className="text-2xl font-bold text-gray-900">{totalApplicants}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Pending Actions</p>
          <p className="text-2xl font-bold text-gray-900">{pendingActions}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Recent Status Changes</p>
          <p className="text-2xl font-bold text-gray-900">{recentStatusChanges}</p>
        </div>
      </div>
    </div>
  );
};

// OfferLetterTracking component
const OfferLetterTracking: React.FC<{ applicants: JobApplicant[] }> = ({ applicants }) => {
  const hiredApplicants = applicants.filter((a) => a.status === 'Hired');
  const joinedCount = hiredApplicants.filter((a) => a.joined).length;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        Offer Letter Tracking
      </h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Offer Letters Sent: <span className="font-medium">{hiredApplicants.length}</span>
        </p>
        <p className="text-sm text-gray-600">
          Joined: <span className="font-medium">{joinedCount}</span> ({((joinedCount / hiredApplicants.length) * 100 || 0).toFixed(1)}%)
        </p>
      </div>
      {hiredApplicants.length === 0 ? (
        <p className="text-center text-gray-600">No offer letters sent.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hiredApplicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{applicant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{applicant.job_title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      applicant.joined ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {applicant.joined ? 'Joined' : 'Not Joined'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// DashboardCards component
const DashboardCards: React.FC<{ applicants: JobApplicant[]; jobOpenings: JobOpening[] }> = ({ applicants, jobOpenings }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold">Active Job Openings</h3>
      <p className="text-2xl">{jobOpenings.filter((job) => job.status === 'Open').length}</p>
    </div>
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold">In Assessment</h3>
      <p className="text-2xl">{applicants.filter((a) => a.status === 'Assessment Stage').length}</p>
    </div>
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold">Hired This Month</h3>
      <p className="text-2xl">{applicants.filter((a) => a.status === 'Hired').length}</p>
    </div>
  </div>
);

// JobOpeningsTable component
const JobOpeningsTable: React.FC<{ jobOpenings: JobOpening[] }> = ({ jobOpenings }) => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
    <div className="flex justify-between items-center p-6 border-b border-gray-100">
      <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-blue-600" />
        Job Openings
      </h2>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Create Job Opening
      </button>
    </div>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-blue-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Job Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Department</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Positions</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Applicants</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {jobOpenings.map((job) => (
          <tr key={job.id} className="hover:bg-blue-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.title}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.department}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  job.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {job.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.positions}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.applicants}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// StatusBarChart component with enhanced hover effects
const StatusBarChart: React.FC<{ applicants: JobApplicant[]; jobOpenings: JobOpening[] }> = ({ applicants, jobOpenings }) => {
  const statusCounts = applicants.reduce(
    (acc, applicant) => {
      acc[applicant.status] = (acc[applicant.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const data = {
    labels: ['Open', 'Shortlisted', 'Assessment Stage', 'Interview Stage', 'Hired', 'Closed', 'Rejected'],
    datasets: [
      {
        label: 'Applicants',
        data: [
          statusCounts['Open'] || 0,
          statusCounts['Shortlisted'] || 0,
          statusCounts['Assessment Stage'] || 0,
          statusCounts['Interview Stage'] || 0,
          statusCounts['Hired'] || 0,
          statusCounts['Closed'] || 0,
          statusCounts['Rejected'] || 0,
        ],
        backgroundColor: [
          '#E5E7EB',
          '#3B82F6',
          '#FBBF24',
          '#F59E0B',
          '#10B981',
          '#EF4444',
          '#DC2626',
        ],
        borderColor: ['#FFFFFF'],
        borderWidth: 1,
        hoverBackgroundColor: [
          '#D1D5DB',
          '#2563EB',
          '#D97706',
          '#D97706',
          '#059669',
          '#DC2626',
          '#B91C1C',
        ],
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const, 
        labels: { 
          font: { size: 14, family: 'Inter, sans-serif', weight: '500' }, 
          color: '#1F2937', 
          padding: 20, 
          boxWidth: 20, 
          usePointStyle: true 
        } 
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1F2937',
        titleFont: { size: 16, family: 'Inter, sans-serif', weight: '600' },
        bodyFont: { size: 14, family: 'Inter, sans-serif' },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw} applicants`,
        },
      },
      title: {
        display: true,
        text: 'Applicant Status Distribution Across Jobs',
        font: { size: 18, family: 'Inter, sans-serif', weight: '600' },
        color: '#1F2937',
        padding: { top: 10, bottom: 20 },
      },
      animation: { duration: 1200, easing: 'easeOutQuart' },
    },
    layout: { padding: { left: 20, right: 20, top: 20, bottom: 20 } },
    onHover: (event: any, chartElement: any) => {
      if (event.native) {
        const target = event.native.target as HTMLElement;
        if (chartElement.length > 0) {
          target.style.cursor = 'pointer';
        } else {
          target.style.cursor = 'default';
        }
      }
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 relative overflow-hidden group">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        Applicant Status Distribution
      </h3>
      <div className="h-[400px] flex items-center justify-center relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent rounded-lg group-hover:from-blue-100/30 transition-colors" />
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

// Enhanced CandidateStatusBarChart component with hover effects
const CandidateStatusBarChart: React.FC<{ applicants: JobApplicant[]; jobOpenings: JobOpening[] }> = ({ applicants, jobOpenings }) => {
  const jobStats = jobOpenings.map((job) => {
    const jobApplicants = applicants.filter((a) => a.job_title === job.title);
    return {
      company: job.company,
      title: job.title,
      vacancies: job.positions,
      location: job.location,
      experience: job.experience,
      totalCandidates: jobApplicants.length,
      shortlisted: jobApplicants.filter((a) => a.status === 'Shortlisted').length,
      assessment: jobApplicants.filter((a) => a.status === 'Assessment Stage').length,
      interview: jobApplicants.filter((a) => a.status === 'Interview Stage').length,
      offered: jobApplicants.filter((a) => a.status === 'Hired').length,
      rejected: jobApplicants.filter((a) => a.status === 'Rejected').length,
      joined: jobApplicants.filter((a) => a.status === 'Hired' && a.joined).length,
    };
  });

  const data = {
    labels: jobStats.map((job) => `${job.title} (${job.company})`), // Combine title and company for x-axis
    datasets: [
      {
        label: 'Total Candidates',
        data: jobStats.map((job) => job.totalCandidates),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
        hoverBackgroundColor: '#2563EB',
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
      {
        label: 'Shortlisted',
        data: jobStats.map((job) => job.shortlisted),
        backgroundColor: '#FBBF24',
        borderColor: '#D97706',
        borderWidth: 1,
        hoverBackgroundColor: '#D97706',
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
      {
        label: 'Assessment',
        data: jobStats.map((job) => job.assessment),
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        borderWidth: 1,
        hoverBackgroundColor: '#D97706',
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
      {
        label: 'Interview',
        data: jobStats.map((job) => job.interview),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        hoverBackgroundColor: '#059669',
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
      {
        label: 'Offered',
        data: jobStats.map((job) => job.offered),
        backgroundColor: '#34D399',
        borderColor: '#059669',
        borderWidth: 1,
        hoverBackgroundColor: '#059669',
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
      {
        label: 'Rejected',
        data: jobStats.map((job) => job.rejected),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
        hoverBackgroundColor: '#DC2626',
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
      {
        label: 'Joined',
        data: jobStats.map((job) => job.joined),
        backgroundColor: '#6EE7B7',
        borderColor: '#059669',
        borderWidth: 1,
        hoverBackgroundColor: '#059669',
        hoverBorderWidth: 2,
        hoverBorderColor: '#1F2937',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const, 
        labels: { 
          font: { size: 14, family: 'Inter, sans-serif' }, 
          color: '#1F2937' 
        } 
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const job = jobStats[context.dataIndex];
            return [
              `Company: ${job.company}`,
              `Job Title: ${job.title}`,
              `Vacancies: ${job.vacancies}`,
              `Location: ${job.location}`,
              `Experience: ${job.experience}`,
              `${context.label}: ${context.raw}`,
            ];
          },
        },
        backgroundColor: '#1F2937',
        titleFont: { size: 16, family: 'Inter, sans-serif', weight: '600' },
        bodyFont: { size: 14, family: 'Inter, sans-serif' },
        padding: 12,
        cornerRadius: 6,
      },
      title: {
        display: true,
        text: 'Candidate Status by Job Opening',
        font: { size: 18, family: 'Inter, sans-serif' },
        color: '#1F2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#1F2937' },
        title: { display: true, text: 'Number of Candidates', font: { size: 14, family: 'Inter, sans-serif' }, color: '#1F2937' },
      },
      x: {
        ticks: { color: '#1F2937' },
        title: { display: true, text: 'Job Titles (Company)', font: { size: 14, family: 'Inter, sans-serif' }, color: '#1F2937' },
      },
    },
    onHover: (event: any, chartElement: any) => {
      if (event.native) {
        const target = event.native.target as HTMLElement;
        if (chartElement.length > 0) {
          target.style.cursor = 'pointer';
        } else {
          target.style.cursor = 'default';
        }
      }
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 group">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        Candidate Status Breakdown
      </h3>
      <div className="h-[450px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

// DiversityCharts component
const DiversityCharts: React.FC<{ applicants: JobApplicant[] }> = ({ applicants }) => {
  const genderCounts = applicants.reduce(
    (acc, applicant) => {
      const gender = applicant.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const genderData = {
    labels: Object.keys(genderCounts),
    datasets: [
      {
        data: Object.values(genderCounts),
        backgroundColor: ['#3B82F6', '#FBBF24', '#10B981', '#EF4444'],
        borderColor: '#FFFFFF',
        borderWidth: 1,
      },
    ],
  };

  const ethnicityCounts = applicants.reduce(
    (acc, applicant) => {
      const ethnicity = applicant.ethnicity || 'Unknown';
      acc[ethnicity] = (acc[ethnicity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const ethnicityData = {
    labels: Object.keys(ethnicityCounts),
    datasets: [
      {
        data: Object.values(ethnicityCounts),
        backgroundColor: ['#3B82F6', '#FBBF24', '#10B981', '#EF4444', '#8B5CF6'],
        borderColor: '#FFFFFF',
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { font: { size: 14, family: 'Inter, sans-serif' }, color: '#1F2937' } },
      title: {
        display: true,
        font: { size: 18, family: 'Inter, sans-serif' },
        color: '#1F2937',
      },
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 mt-6">
      <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        Diversity Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Gender Distribution</h3>
          <Pie data={genderData} options={{ ...pieOptions, plugins: { ...pieOptions.plugins, title: { ...pieOptions.plugins.title, text: 'Gender Distribution' } } }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Ethnicity Distribution</h3>
          <Pie data={ethnicityData} options={{ ...pieOptions, plugins: { ...pieOptions.plugins, title: { ...pieOptions.plugins.title, text: 'Ethnicity Distribution' } } }} />
        </div>
      </div>
    </div>
  );
};

// Updated JobOpeningsBreakdown component with improved UI
const JobOpeningsBreakdown: React.FC<{ applicants: JobApplicant[]; jobOpenings: JobOpening[] }> = ({ applicants, jobOpenings }) => {
  const jobStats = jobOpenings.map((job) => {
    const jobApplicants = applicants.filter((applicant) => applicant.job_title === job.title);
    return {
      title: job.title,
      positions: job.positions,
      status: job.status,
      total: jobApplicants.length,
      open: jobApplicants.filter((a) => a.status === 'Open').length,
      shortlisted: jobApplicants.filter((a) => a.status === 'Shortlisted').length,
      assessment: jobApplicants.filter((a) => a.status === 'Assessment Stage').length,
      interview: jobApplicants.filter((a) => a.status === 'Interview Stage').length,
      hired: jobApplicants.filter((a) => a.status === 'Hired').length,
      closed: jobApplicants.filter((a) => a.status === 'Closed').length,
      rejected: jobApplicants.filter((a) => a.status === 'Rejected').length,
    };
  });

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Job Openings Breakdown
        </h2>
        
      </div>
      
      <div className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Job Title</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Positions</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Open</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Shortlisted</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Assessment</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Interview</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Hired</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Closed</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wider">Rejected</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobStats.map((job, index) => (
              <tr 
                key={job.title} 
                className={`hover:bg-blue-50 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {job.title}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">
                  {job.positions}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      job.status === 'Open' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center font-bold ">
                  {job.total}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className={`px-2 py-1 rounded ${job.open > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.open}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className={`px-2 py-1 rounded ${job.shortlisted > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.shortlisted}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className={`px-2 py-1 rounded ${job.assessment > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.assessment}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className={`px-2 py-1 rounded ${job.interview > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.interview}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className={`px-2 py-1 rounded ${job.hired > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.hired}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className={`px-2 py-1 rounded ${job.closed > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.closed}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className={`px-2 py-1 rounded ${job.rejected > 0 ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.rejected}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold">{jobStats.length}</span> job openings
        </div>
        <div className="flex gap-4">
          <span className="font-medium">Total Applicants: {applicants.length}</span>
          <span className="font-medium">Open Positions: {jobOpenings.filter(job => job.status === 'Open').length}</span>
        </div>
      </div>
    </div>
  );
};

// RecentActivity component
const RecentActivity: React.FC = () => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
    <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
      <Activity className="h-5 w-5 text-blue-600" />
      Recent Activity
    </h2>
    <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
      {dummyActivities.map((activity) => (
        <li key={activity.id} className="py-2">
          <p className="text-sm text-gray-900">{activity.action}</p>
          <p className="text-xs text-gray-500">{activity.timestamp}</p>
        </li>
      ))}
    </ul>
  </div>
);

// ScheduleOverview component
const ScheduleOverview: React.FC = () => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
    <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
      <Calendar className="h-5 w-5 text-blue-600" />
      Upcoming Schedule
    </h2>
    <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
      {dummyEvents.map((event) => (
        <li key={event.id} className="py-2">
          <p className="text-sm text-gray-900">{event.title}</p>
          <p className="text-xs text-gray-500">{event.date}</p>
        </li>
      ))}
    </ul>
  </div>
);

// AnalyticsCharts component
const AnalyticsCharts: React.FC<{ jobOpenings: JobOpening[] }> = ({ jobOpenings }) => {
  const data = {
    labels: jobOpenings.map((job) => job.title),
    datasets: [
      {
        label: 'Applicants',
        data: jobOpenings.map((job) => job.applicants),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 14, family: 'Inter, sans-serif' }, color: '#1F2937' } },
      title: {
        display: true,
        text: 'Applicants by Job Opening',
        font: { size: 18, family: 'Inter, sans-serif' },
        color: '#1F2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#1F2937' },
      },
      x: {
        ticks: { color: '#1F2937' },
      },
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        Applicants by Job
      </h2>
      <Bar data={data} options={options} />
    </div>
  );
};

// Main Dashboard Component
export default function RecruiterDashboard() {
  const [applicants] = useState<JobApplicant[]>(dummyApplicants);
  const [jobOpenings] = useState<JobOpening[]>(dummyJobOpenings);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Recruiter Dashboard
        </h1>

        {/* Overview Cards */}
        <DashboardCards applicants={applicants} jobOpenings={jobOpenings} />

        {/* Top Section: QuickStats and OfferLetterTracking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <ScheduleOverview />
            <div className='mt-2'>
              <RecentActivity/>
            </div>
             
          </div>
          <div className="lg:col-span-2"> 
            <OfferLetterTracking applicants={applicants} />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column: StatusBarChart */}
          <div className="lg:col-span-1">
            <StatusBarChart applicants={applicants} jobOpenings={jobOpenings} />
          </div>

          {/* Right Column: AnalyticsCharts */}
          <div className="lg:col-span-2">
            <CandidateStatusBarChart applicants={applicants} jobOpenings={jobOpenings} />
          </div>
        </div>

        {/* Job Openings Breakdown */}
        <JobOpeningsBreakdown applicants={applicants} jobOpenings={jobOpenings} />
      </div>
    </div>
  );
}