/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Dummy data interfaces
interface JobApplicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  status: 'Open' | 'Shortlisted' | 'Assessment Stage' | 'Interview Stage' | 'Closed' | 'Rejected' | 'Hired';
}

interface JobOpening {
  id: string;
  title: string;
  department: string;
  status: 'Open' | 'Closed';
  applicants: number;
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

// Dummy data
const dummyApplicants: JobApplicant[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', job_title: 'Software Engineer', status: 'Open' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', job_title: 'Product Manager', status: 'Shortlisted' },
  { id: '3', name: 'Alice Johnson', email: 'alice.j@example.com', job_title: 'Data Analyst', status: 'Assessment Stage' },
  { id: '4', name: 'Bob Wilson', email: 'bob.wilson@example.com', job_title: 'UX Designer', status: 'Interview Stage' },
  { id: '5', name: 'Emma Brown', email: 'emma.brown@example.com', job_title: 'DevOps Engineer', status: 'Hired' },
  { id: '6', name: 'Michael Lee', email: 'michael.lee@example.com', job_title: 'Software Engineer', status: 'Rejected' },
  { id: '7', name: 'Sarah Davis', email: 'sarah.davis@example.com', job_title: 'Marketing Manager', status: 'Closed' },
  { id: '8', name: 'David Miller', email: 'david.miller@example.com', job_title: 'Data Scientist', status: 'Shortlisted' },
  { id: '9', name: 'Laura Taylor', email: 'laura.taylor@example.com', job_title: 'Product Manager', status: 'Assessment Stage' },
  { id: '10', name: 'James White', email: 'james.white@example.com', job_title: 'Software Engineer', status: 'Open' },
];

const dummyJobOpenings: JobOpening[] = [
  { id: '1', title: 'Software Engineer', department: 'Engineering', status: 'Open', applicants: 5 },
  { id: '2', title: 'Product Manager', department: 'Product', status: 'Open', applicants: 3 },
  { id: '3', title: 'Data Analyst', department: 'Analytics', status: 'Open', applicants: 2 },
  { id: '4', title: 'UX Designer', department: 'Design', status: 'Closed', applicants: 1 },
  { id: '5', title: 'DevOps Engineer', department: 'Engineering', status: 'Open', applicants: 4 },
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

// DashboardCards component
const DashboardCards: React.FC<{ applicants: JobApplicant[]; jobOpenings: JobOpening[] }> = ({ applicants, jobOpenings }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Total Applicants</h3>
      <p className="text-2xl">{applicants.length}</p>
    </div>
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Active Job Openings</h3>
      <p className="text-2xl">{jobOpenings.filter((job) => job.status === 'Open').length}</p>
    </div>
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">In Assessment</h3>
      <p className="text-2xl">{applicants.filter((a) => a.status === 'Assessment Stage').length}</p>
    </div>
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Hired This Month</h3>
      <p className="text-2xl">{applicants.filter((a) => a.status === 'Hired').length}</p>
    </div>
  </div>
);

// ApplicantsTable component
const ApplicantsTable: React.FC<{
  applicants: JobApplicant[];
  selectedApplicants: string[];
  onSelectApplicant: (id: string) => void;
}> = ({ applicants, selectedApplicants, onSelectApplicant }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-blue-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
            <input
              type="checkbox"
              className="rounded text-blue-600 focus:ring-blue-500"
              onChange={() =>
                applicants.forEach((applicant) => onSelectApplicant(applicant.id))
              }
              checked={selectedApplicants.length === applicants.length && applicants.length > 0}
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Job Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {applicants.map((applicant) => (
          <tr key={applicant.id} className="hover:bg-blue-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={selectedApplicants.includes(applicant.id)}
                onChange={() => onSelectApplicant(applicant.id)}
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{applicant.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{applicant.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{applicant.job_title}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  applicant.status === 'Hired'
                    ? 'bg-green-100 text-green-800'
                    : applicant.status === 'Rejected' || applicant.status === 'Closed'
                    ? 'bg-red-100 text-red-800'
                    : applicant.status === 'Shortlisted'
                    ? 'bg-blue-100 text-blue-800'
                    : applicant.status === 'Assessment Stage' || applicant.status === 'Interview Stage'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {applicant.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// JobOpeningsTable component
const JobOpeningsTable: React.FC<{ jobOpenings: JobOpening[] }> = ({ jobOpenings }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="flex justify-between items-center p-6">
      <h2 className="text-xl font-semibold text-blue-800">Job Openings</h2>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Create Job Opening
      </button>
    </div>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-blue-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Job Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Department</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Applicants</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {jobOpenings.map((job) => (
          <tr key={job.id} className="hover:bg-blue-50">
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

// StatusPieChart component
const StatusPieChart: React.FC<{ applicants: JobApplicant[] }> = ({ applicants }) => {
  const statusCounts = applicants.reduce(
    (acc, applicant) => {
      acc[applicant.status] = (acc[applicant.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const data = {
    labels: ['Open', 'Shortlisted', 'Assessment Stage', 'Interview Stage', 'Closed', 'Rejected', 'Hired'],
    datasets: [
      {
        data: [
          statusCounts['Open'] || 0,
          statusCounts['Shortlisted'] || 0,
          statusCounts['Assessment Stage'] || 0,
          statusCounts['Interview Stage'] || 0,
          statusCounts['Closed'] || 0,
          statusCounts['Rejected'] || 0,
          statusCounts['Hired'] || 0,
        ],
        backgroundColor: [
          '#E5E7EB', // Gray for Open
          '#3B82F6', // Blue for Shortlisted
          '#FBBF24', // Yellow for Assessment Stage
          '#F59E0B', // Amber for Interview Stage
          '#EF4444', // Red for Closed
          '#DC2626', // Darker red for Rejected
          '#10B981', // Green for Hired
        ],
        borderColor: ['#FFFFFF'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
          color: '#1F2937',
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 14, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">Applicant Status Distribution</h3>
      <div className="max-w-md mx-auto">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

// RecentActivity component
const RecentActivity: React.FC = () => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <h2 className="text-xl font-semibold text-blue-800 mb-4">Recent Activity</h2>
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
  <div className="bg-white shadow-md rounded-lg p-6 mt-6">
    <h2 className="text-xl font-semibold text-blue-800 mb-4">Upcoming Schedule</h2>
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
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 14, family: 'Inter, sans-serif' },
          color: '#1F2937',
        },
      },
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
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-blue-800 mb-4">Applicants by Job</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default function RecruiterDashboard() {
  const [applicants, setApplicants] = useState<JobApplicant[]>(dummyApplicants);
  const [filteredApplicants, setFilteredApplicants] = useState<JobApplicant[]>(dummyApplicants);
  const [jobOpenings] = useState<JobOpening[]>(dummyJobOpenings);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Handle search and status filter
  useEffect(() => {
    let filtered = applicants;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (applicant) =>
          applicant.name.toLowerCase().includes(query) ||
          applicant.email.toLowerCase().includes(query) ||
          applicant.job_title.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (applicant) => applicant.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredApplicants(filtered);
  }, [applicants, searchQuery, statusFilter]);

  // Handle checkbox selection
  const handleSelectApplicant = (id: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  // Handle opening the status update modal
  const handleUpdateStatus = () => {
    if (selectedApplicants.length === 0) {
      alert('Please select at least one applicant.');
      return;
    }
    setIsModalOpen(true);
    setSelectedStatus('');
    setModalError(null);
  };

  // Handle confirming status change
  const handleConfirmStatusChange = () => {
    if (!selectedStatus) {
      setModalError('Please select a status.');
      return;
    }
    setApplicants((prev) =>
      prev.map((applicant) =>
        selectedApplicants.includes(applicant.id) ? { ...applicant, status: selectedStatus } : applicant
      )
    );
    setFilteredApplicants((prev) =>
      prev.map((applicant) =>
        selectedApplicants.includes(applicant.id) ? { ...applicant, status: selectedStatus } : applicant
      )
    );
    setSelectedApplicants([]);
    setSelectedStatus('');
    setIsModalOpen(false);
    alert('Status updated successfully.');
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStatus('');
    setModalError(null);
  };

  // Placeholder for job opening actions
  const handleCreateJobOpening = () => {
    alert('Create job opening functionality would be implemented here.');
  };

  const handleEditJobOpening = (id: string) => {
    alert(`Edit job opening ${id} functionality would be implemented here.`);
  };

  // Placeholder for quick actions
  const handleCreateAssessment = () => {
    alert('Create assessment functionality would be implemented here.');
  };

  const handleExportData = () => {
    alert('Export data functionality would be implemented here.');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Recruiter Dashboard</h1>

        {/* Overview Cards */}
        <DashboardCards applicants={applicants} jobOpenings={jobOpenings} />

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px] text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Assessment Stage">Assessment Stage</option>
              <option value="Interview Stage">Interview Stage</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={selectedApplicants.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Update Status
            </button>
            <button
              onClick={handleCreateAssessment}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Assessment
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Export Data
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applicants Table */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Applicants</h2>
              {filteredApplicants.length === 0 ? (
                <p className="text-center text-gray-600">No applicants found.</p>
              ) : (
                <ApplicantsTable
                  applicants={filteredApplicants}
                  selectedApplicants={selectedApplicants}
                  onSelectApplicant={handleSelectApplicant}
                />
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <StatusPieChart applicants={applicants} />
            <ScheduleOverview />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobOpeningsTable jobOpenings={jobOpenings} />
          <RecentActivity />
        </div>
        <AnalyticsCharts jobOpenings={jobOpenings} />

        {/* Status Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 id="modal-title" className="text-2xl font-bold text-blue-800 mb-4">
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
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Assessment Stage">Assessment Stage</option>
                  <option value="Interview Stage">Interview Stage</option>
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
                {selectedApplicants.map((id) => {
                  const applicant = applicants.find((a) => a.id === id);
                  return (
                    <li key={id} className="text-gray-600 flex justify-between">
                      <span>{applicant?.name || id}</span>
                      <span>{applicant?.job_title || 'N/A'}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseModal}
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
      </div>
    </div>
  );
}