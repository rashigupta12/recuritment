/*eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  ActiveElement,
  ArcElement,
  BarElement,
  CategoryScale,
  ChartEvent,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import {
  Briefcase,
  Building2,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ChartDataLabels
);

interface JobApplicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  client: string;
  status:
    | 'Applied'
    | 'Tagged'
    | 'Shortlisted'
    | 'AssessmentStage'
    | 'InterviewStage'
    | 'Offered'
    | 'OfferRejected'
    | 'Rejected'
    | 'Joined';
  appliedDate: string;
  lastUpdated: string;
}

interface JobOpening {
  id: string;
  title: string;
  client: string;
  location: string;
  status: 'Open' | 'Offered' | 'Joined' | 'Cancelled';
  positions: number;
  createdDate: string;
}

interface MetricData {
  month: string;
  tagged: number;
  interviews: number;
  offers: number;
  joined: number;
}

const dummyApplicants: JobApplicant[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', job_title: 'Software Engineer', client: 'TechCorp', status: 'Applied', appliedDate: '2025-09-15', lastUpdated: '2025-09-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', job_title: 'Product Manager', client: 'InnovateLtd', status: 'Joined', appliedDate: '2025-08-10', lastUpdated: '2025-10-01' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com', job_title: 'Data Analyst', client: 'DataVision', status: 'InterviewStage', appliedDate: '2025-09-20', lastUpdated: '2025-09-28' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com', job_title: 'UX Designer', client: 'DesignHub', status: 'Shortlisted', appliedDate: '2025-09-25', lastUpdated: '2025-09-27' },
  { id: '5', name: 'Emma Brown', email: 'emma@example.com', job_title: 'DevOps Engineer', client: 'CloudSys', status: 'Offered', appliedDate: '2025-08-15', lastUpdated: '2025-09-30' },
  { id: '6', name: 'Michael Lee', email: 'michael@example.com', job_title: 'Software Engineer', client: 'TechCorp', status: 'Tagged', appliedDate: '2025-09-18', lastUpdated: '2025-09-22' },
  { id: '7', name: 'Sarah Davis', email: 'sarah@example.com', job_title: 'Marketing Manager', client: 'InnovateLtd', status: 'OfferRejected', appliedDate: '2025-08-20', lastUpdated: '2025-09-05' },
  { id: '8', name: 'David Miller', email: 'david@example.com', job_title: 'Data Scientist', client: 'DataVision', status: 'AssessmentStage', appliedDate: '2025-09-22', lastUpdated: '2025-09-29' },
  { id: '9', name: 'Laura Taylor', email: 'laura@example.com', job_title: 'Product Manager', client: 'TechCorp', status: 'AssessmentStage', appliedDate: '2025-09-12', lastUpdated: '2025-09-25' },
  { id: '10', name: 'James White', email: 'james@example.com', job_title: 'Software Engineer', client: 'CloudSys', status: 'Rejected', appliedDate: '2025-08-05', lastUpdated: '2025-09-28' },
];

const dummyJobs: JobOpening[] = [
  { id: '1', title: 'Software Engineer', client: 'TechCorp', location: 'Bangalore', status: 'Open', positions: 3, createdDate: '2025-08-01' },
  { id: '2', title: 'Product Manager', client: 'InnovateLtd', location: 'Mumbai', status: 'Open', positions: 2, createdDate: '2025-08-05' },
  { id: '3', title: 'Data Analyst', client: 'DataVision', location: 'Delhi', status: 'Open', positions: 1, createdDate: '2025-08-10' },
  { id: '4', title: 'UX Designer', client: 'DesignHub', location: 'Pune', status: 'Offered', positions: 1, createdDate: '2025-08-15' },
  { id: '5', title: 'DevOps Engineer', client: 'CloudSys', location: 'Hyderabad', status: 'Joined', positions: 2, createdDate: '2025-07-20' },
];

const monthlyMetrics: MetricData[] = [
  { month: 'Jul', tagged: 12, interviews: 8, offers: 5, joined: 3 },
  { month: 'Aug', tagged: 15, interviews: 11, offers: 7, joined: 5 },
  { month: 'Sep', tagged: 18, interviews: 13, offers: 9, joined: 6 },
  { month: 'Oct', tagged: 10, interviews: 7, offers: 4, joined: 2 },
];

export default function RecruiterDashboard() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');

  const clients = useMemo(() => ['All', ...Array.from(new Set(dummyJobs.map(j => j.client)))], []);
  const filteredApplicants = useMemo(
    () => (selectedClient === 'All'
      ? dummyApplicants
      : dummyApplicants.filter(a => a.client === selectedClient)),
    [selectedClient]
  );
  const filteredJobs = useMemo(
    () => (selectedClient === 'All'
      ? dummyJobs
      : dummyJobs.filter(j => j.client === selectedClient)),
    [selectedClient]
  );

  const activeClients = useMemo(() => {
    const clientsWithOpenJobs = new Set(dummyJobs.filter(j => j.status === 'Open').map(j => j.client));
    return clientsWithOpenJobs.size;
  }, []);

  const kpiMetrics = useMemo(() => {
    const total = filteredApplicants.length;
    const tagged = filteredApplicants.filter(a => a.status === 'Tagged').length;
    const interviews = filteredApplicants.filter(a => a.status === 'InterviewStage').length;
    const offered = filteredApplicants.filter(a => a.status === 'Offered').length;
    const joined = filteredApplicants.filter(a => a.status === 'Joined').length;
    return {
      totalApplicants: total,
      taggedToInterview: tagged > 0 ? ((interviews / tagged) * 100).toFixed(1) : '0',
      interviewToOffer: interviews > 0 ? ((offered / interviews) * 100).toFixed(1) : '0',
      offerToJoin: offered > 0 ? ((joined / offered) * 100).toFixed(1) : '0',
    };
  }, [filteredApplicants]);

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push('Name,Email,Job Title,Client,Status,Applied Date,Last Updated');
    filteredApplicants.forEach(a => {
      csvRows.push(`${a.name},${a.email},${a.job_title},${a.client},${a.status},${a.appliedDate},${a.lastUpdated}`);
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruiter-applicants-${selectedClient}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const candidateStatusOrder = [
    'Applied',
    'Tagged',
    'Shortlisted',
    'AssessmentStage',
    'InterviewStage',
    'Offered',
    'OfferRejected',
    'Rejected',
    'Joined'
  ];

  const candidatePipelineData = useMemo(() => {
    const clientGroups = selectedClient === 'All'
      ? clients.filter(c => c !== 'All')
      : [selectedClient];
    const colors = [
      '#E0E7FF', '#C7D2FE', '#A5B4FC', '#FBBF24', '#818CF8',
      '#6366F1', '#F59E0B', '#EF4444', '#10B981'
    ];
    return {
      labels: clientGroups,
      datasets: candidateStatusOrder.map((status, idx) => ({
        label: status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        data: clientGroups.map(client => {
          const clientApplicants = dummyApplicants.filter(a => a.client === client);
          return clientApplicants.filter(a => a.status === status).length;
        }),
        backgroundColor: colors[idx % colors.length],
        borderColor: '#FFFFFF',
        borderWidth: 1,
      })),
    };
  }, [selectedClient, clients]);

  const funnelStages = [
    'Tagged',
    'Shortlisted',
    'AssessmentStage',
    'InterviewStage',
    'Offered',
    'OfferRejected',
    'Rejected',
    'Joined'
  ];

  const funnelData = useMemo(() => {
    return {
      labels: funnelStages.map(s =>
        s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Stage', ' Stage')
      ),
      datasets: [{
        label: 'Candidates',
        data: funnelStages.map(stage => filteredApplicants.filter(a => a.status === stage).length),
        backgroundColor: [
          '#E0E7FF', '#C7D2FE', '#A5B4FC', '#FBBF24', '#818CF8', '#F59E0B', '#EF4444', '#10B981'
        ],
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }, [filteredApplicants]);

  const jobStatusData = useMemo(() => {
    const statusCounts = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      labels: ['Open', 'Offered', 'Joined', 'Cancelled'],
      datasets: [{
        data: [
          statusCounts['Open'] || 0,
          statusCounts['Offered'] || 0,
          statusCounts['Joined'] || 0,
          statusCounts['Cancelled'] || 0,
        ],
        backgroundColor: ['#6366F1', '#F59E0B', '#10B981', '#EF4444'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      }],
    };
  }, [filteredJobs]);

  const trendData = useMemo(() => ({
    labels: monthlyMetrics.map(m => m.month),
    datasets: [
      {
        label: 'Tagged',
        data: monthlyMetrics.map(m => m.tagged),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#6366F1',
      },
      {
        label: 'Interviews',
        data: monthlyMetrics.map(m => m.interviews),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#F59E0B',
      },
      {
        label: 'Offers',
        data: monthlyMetrics.map(m => m.offers),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139,92,246,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#8B5CF6',
      },
      {
        label: 'Joined',
        data: monthlyMetrics.map(m => m.joined),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#10B981',
      },
    ],
  }), []);

  const handleJobStatusClick = (elements: any[]) => {
    if (!elements.length) return;
    const clickedIndex = elements[0].index;
    const status = jobStatusData.labels[clickedIndex];
    router.push(`/jobs/status/${status.toLowerCase()}`);
  };

  const handleCandidatePipelineClick = (elements: any[]) => {
    if (!elements.length) return;
    const datasetIndex = elements[0].datasetIndex;
    const clientIndex = elements[0].index;
    const client = candidatePipelineData.labels[clientIndex];
    const status = candidatePipelineData.datasets[datasetIndex].label;
    router.push(`/candidates?client=${client}&status=${status.toLowerCase()}`);
  };

  const chartHover = (event: ChartEvent, elements: ActiveElement[]) => {
    const nativeEvent = event.native as unknown as MouseEvent;
    const target = nativeEvent?.target as HTMLElement;
    if (target) target.style.cursor = elements[0] ? 'pointer' : 'default';
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full mx-auto space-y-4">
        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Recruitment Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">Monitor performance and track hiring progress</p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-all text-xs font-medium"
            onClick={exportCSV}
          >
            <Download className="h-3.5 w-3.5" />
            Export Data
          </button>
        </div>

        {/* Filters - Compact */}
        <section className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Clients:</span>
            </div>
            
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white"
            >
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 ml-auto">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-md">
                {(['week', 'month', 'year'] as const).map(period => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setTimePeriod(period)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      timePeriod === period
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards - Compact Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard 
            icon={<Building2 className="h-4 w-4" />} 
            value={activeClients} 
            label="Active Clients" 
            color="violet"
          />
           <KpiCard 
            icon={<Briefcase className="h-4 w-4" />} 
            value={filteredJobs.filter(j => j.status === 'Open').length} 
            label="Open Positions" 
            color="amber"
          />
          <KpiCard 
            icon={<Users className="h-4 w-4" />} 
            value={kpiMetrics.totalApplicants} 
            label="Total cv uploaded" 
            trend="+5.8%" 
            color="indigo"
          />
         
          <KpiCard 
            icon={<UserCheck className="h-4 w-4" />} 
            value={filteredApplicants.filter(a => a.status === 'Joined').length} 
            label="Successfully Joined" 
            trend="+3.2%" 
            color="emerald"
          />
          
        </section>

        {/* Main Charts - Optimized Layout */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Trends Chart */}
          <div className="xl:col-span-2 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader title="Recruitment Trends" subtitle="Monthly performance overview" />
            <div className="h-64 mt-3">
              <Line 
                data={trendData} 
                options={{
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      display: true, 
                      position: 'top',
                      labels: { 
                        padding: 8, 
                        font: { size: 11 }, 
                        usePointStyle: true, 
                        pointStyle: 'circle',
                        color: '#475569'
                      } 
                    }
                  },
                  scales: { 
                    y: { 
                      beginAtZero: true, 
                      grid: { color: '#f1f5f9' }, 
                      border: { display: false },
                      ticks: { 
                        font: { size: 10 }, 
                        color: '#64748b' 
                      } 
                    }, 
                    x: { 
                      grid: { display: false }, 
                      border: { display: false },
                      ticks: { 
                        font: { size: 10 }, 
                        color: '#64748b' 
                      } 
                    } 
                  }
                }} 
              />
            </div>
          </div>
          
          {/* Job Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader title="Job Status" subtitle="Current distribution" />
            {/* <div className="h-64 flex items-center justify-center cursor-pointer mt-2"> */}
<div className="h-64 flex items-center justify-center cursor-pointer mt-2">
  <Doughnut
    data={jobStatusData}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: true,
          color: '#475569',
          font: { size: 11 },
          formatter: (value, ctx) => {
            const labels = ctx?.chart?.data?.labels;
            if (!labels || labels.length === 0) return '';
            
            const dataset = ctx.chart.data.datasets[0].data;
            // Properly handle the reduce with type safety
            const total = dataset.reduce((acc: number, curr: any) => {
              const numValue = typeof curr === 'number' ? curr : 0;
              return acc + numValue;
            }, 0);
            
            if (total === 0) return '';
            
            const label = labels[ctx.dataIndex];
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const dataset = context.dataset.data as number[];
              const total = dataset.reduce((acc, curr) => acc + curr, 0);
              const value = context.parsed;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${context.label}: ${percentage}%`;
            }
          }
        },
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, pointStyle: 'circle' }
        }
      }
    }}
  />
</div>

          
          </div>
        </section>

        {/* Pipeline Charts - Compact */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader title="Candidate Pipeline" subtitle="By client and status" />
            <div className="h-64 cursor-pointer mt-2">
              <Bar
                data={candidatePipelineData}
                options={{
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: {
                    legend: { 
                      position: 'top',
                      labels: { 
                        padding: 8, 
                        font: { size: 11 },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#475569'
                      } 
                    }
                  },
                  scales: {
                    x: { 
                      stacked: true, 
                      grid: { display: false }, 
                      border: { display: false },
                      ticks: { 
                        font: { size: 10 }, 
                        color: '#64748b' 
                      } 
                    },
                    y: { 
                      stacked: true, 
                      beginAtZero: true, 
                      grid: { color: '#f1f5f9' }, 
                      border: { display: false },
                      ticks: { 
                        stepSize: 1, 
                        font: { size: 10 }, 
                        color: '#64748b' 
                      } 
                    }
                  },
                  onClick: (_, elements) => handleCandidatePipelineClick(elements),
                  onHover: chartHover,
                }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader title="Recruitment Funnel" subtitle="Stage-wise breakdown" />
            <div className="h-64 mt-2">
              <Bar
                data={funnelData}
                options={{
                  responsive: true, 
                  maintainAspectRatio: false, 
                  indexAxis: 'y', 
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    x: { 
                      beginAtZero: true, 
                      grid: { color: '#f1f5f9' }, 
                      border: { display: false },
                      ticks: { 
                        stepSize: 1, 
                        font: { size: 10 }, 
                        color: '#64748b' 
                      } 
                    },
                    y: { 
                      grid: { display: false }, 
                      border: { display: false },
                      ticks: { 
                        font: { size: 11 }, 
                        color: '#475569' 
                      } 
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

interface CardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  color: 'indigo' | 'amber' | 'emerald' | 'violet';
}

function KpiCard({ icon, value, label, trend, color }: CardProps) {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    }
  };

  return (
    <div className="group bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${colorStyles[color].bg} flex items-center justify-center ${colorStyles[color].text}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-lg font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
}

function SectionHeader({ title, subtitle }: HeaderProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
