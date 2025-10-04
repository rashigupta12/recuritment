'use client'
import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import {
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Building2,
  Target,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
  Eye,
  MessageSquare,
  FileText,
} from 'lucide-react';

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
);

// Data Types
interface Client {
  id: string;
  name: string;
  industry: string;
  activeJobs: number;
}

interface JobOpening {
  id: string;
  title: string;
  clientId: string;
  status: 'Open' | 'Offered' | 'Joined' | 'Cancelled';
  recruiterId: string;
  candidatesApplied: number;
  openedDate: string;
}

interface Recruiter {
  id: string;
  name: string;
  email: string;
  performance: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
}

interface Candidate {
  id: string;
  name: string;
  jobId: string;
  recruiterId: string;
  stage: 'Applied' | 'Tagged' | 'Shortlisted' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  appliedDate: string;
  lastUpdated: string;
}

interface MetricTrend {
  period: string;
  tagged: number;
  interviewed: number;
  offered: number;
  hired: number;
  avgTimeToOffer: number;
  avgTimeToJoin: number;
}

// Sample Data
const clients: Client[] = [
  { id: 'c1', name: 'TechCorp Solutions', industry: 'Technology', activeJobs: 12 },
  { id: 'c2', name: 'Global Finance Inc', industry: 'Finance', activeJobs: 8 },
  { id: 'c3', name: 'HealthCare Plus', industry: 'Healthcare', activeJobs: 6 },
  { id: 'c4', name: 'Retail Giants', industry: 'Retail', activeJobs: 10 },
  { id: 'c5', name: 'EduTech Innovations', industry: 'Education', activeJobs: 5 },
];

const recruiters: Recruiter[] = [
  { id: 'r1', name: 'Sarah Johnson', email: 'sarah.j@company.com', performance: 'Excellent' },
  { id: 'r2', name: 'Michael Chen', email: 'michael.c@company.com', performance: 'Good' },
  { id: 'r3', name: 'Emily Rodriguez', email: 'emily.r@company.com', performance: 'Excellent' },
  { id: 'r4', name: 'James Wilson', email: 'james.w@company.com', performance: 'Good' },
  { id: 'r5', name: 'Lisa Anderson', email: 'lisa.a@company.com', performance: 'Average' },
];

const jobOpenings: JobOpening[] = [
  { id: 'j1', title: 'Senior Software Engineer', clientId: 'c1', status: 'Open', recruiterId: 'r1', candidatesApplied: 45, openedDate: '2025-09-01' },
  { id: 'j2', title: 'Product Manager', clientId: 'c1', status: 'Open', recruiterId: 'r2', candidatesApplied: 32, openedDate: '2025-09-05' },
  { id: 'j3', title: 'Financial Analyst', clientId: 'c2', status: 'Offered', recruiterId: 'r1', candidatesApplied: 28, openedDate: '2025-08-20' },
  { id: 'j4', title: 'Data Scientist', clientId: 'c1', status: 'Open', recruiterId: 'r3', candidatesApplied: 56, openedDate: '2025-09-10' },
  { id: 'j5', title: 'Nurse Practitioner', clientId: 'c3', status: 'Joined', recruiterId: 'r2', candidatesApplied: 22, openedDate: '2025-08-15' },
  { id: 'j6', title: 'Marketing Manager', clientId: 'c4', status: 'Open', recruiterId: 'r4', candidatesApplied: 38, openedDate: '2025-09-08' },
  { id: 'j7', title: 'DevOps Engineer', clientId: 'c1', status: 'Open', recruiterId: 'r1', candidatesApplied: 41, openedDate: '2025-09-12' },
  { id: 'j8', title: 'UX Designer', clientId: 'c5', status: 'Cancelled', recruiterId: 'r5', candidatesApplied: 15, openedDate: '2025-08-25' },
];

const candidates: Candidate[] = [
  { id: 'cand1', name: 'John Doe', jobId: 'j1', recruiterId: 'r1', stage: 'Interview', appliedDate: '2025-09-15', lastUpdated: '2025-09-28' },
  { id: 'cand2', name: 'Jane Smith', jobId: 'j1', recruiterId: 'r1', stage: 'Shortlisted', appliedDate: '2025-09-16', lastUpdated: '2025-09-25' },
  { id: 'cand3', name: 'Bob Johnson', jobId: 'j2', recruiterId: 'r2', stage: 'Tagged', appliedDate: '2025-09-18', lastUpdated: '2025-09-22' },
  { id: 'cand4', name: 'Alice Brown', jobId: 'j3', recruiterId: 'r1', stage: 'Offered', appliedDate: '2025-09-10', lastUpdated: '2025-10-01' },
  { id: 'cand5', name: 'Charlie Davis', jobId: 'j4', recruiterId: 'r3', stage: 'Interview', appliedDate: '2025-09-20', lastUpdated: '2025-09-30' },
  { id: 'cand6', name: 'Diana Evans', jobId: 'j5', recruiterId: 'r2', stage: 'Hired', appliedDate: '2025-08-20', lastUpdated: '2025-09-15' },
  { id: 'cand7', name: 'Frank Miller', jobId: 'j1', recruiterId: 'r1', stage: 'Rejected', appliedDate: '2025-09-14', lastUpdated: '2025-09-26' },
  { id: 'cand8', name: 'Grace Lee', jobId: 'j6', recruiterId: 'r4', stage: 'Shortlisted', appliedDate: '2025-09-22', lastUpdated: '2025-10-02' },
  { id: 'cand9', name: 'Henry Wilson', jobId: 'j4', recruiterId: 'r3', stage: 'Tagged', appliedDate: '2025-09-25', lastUpdated: '2025-09-28' },
  { id: 'cand10', name: 'Iris Taylor', jobId: 'j7', recruiterId: 'r1', stage: 'Applied', appliedDate: '2025-09-28', lastUpdated: '2025-09-28' },
  ...Array.from({ length: 90 }, (_, i) => ({
    id: `cand${i + 11}`,
    name: `Candidate ${i + 11}`,
    jobId: jobOpenings[i % jobOpenings.length].id,
    recruiterId: recruiters[i % recruiters.length].id,
    stage: ['Applied', 'Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired', 'Rejected'][i % 7] as any,
    appliedDate: `2025-09-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    lastUpdated: `2025-10-0${Math.floor(Math.random() * 4) + 1}`,
  })),
];

const monthlyTrends: MetricTrend[] = [
  { period: 'Jul', tagged: 85, interviewed: 42, offered: 18, hired: 12, avgTimeToOffer: 14, avgTimeToJoin: 21 },
  { period: 'Aug', tagged: 92, interviewed: 48, offered: 22, hired: 15, avgTimeToOffer: 13, avgTimeToJoin: 19 },
  { period: 'Sep', tagged: 108, interviewed: 55, offered: 26, hired: 18, avgTimeToOffer: 12, avgTimeToJoin: 18 },
  { period: 'Oct', tagged: 98, interviewed: 51, offered: 24, hired: 16, avgTimeToOffer: 13, avgTimeToJoin: 20 },
];

export default function RecruitmentManagerDashboard() {
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('All');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [drillDownView, setDrillDownView] = useState<string | null>(null);

  // Filtered Data
  const filteredJobs = useMemo(() => {
    return jobOpenings.filter(job => {
      const clientMatch = selectedClient === 'All' || job.clientId === selectedClient;
      const recruiterMatch = selectedRecruiter === 'All' || job.recruiterId === selectedRecruiter;
      return clientMatch && recruiterMatch;
    });
  }, [selectedClient, selectedRecruiter]);

  const filteredCandidates = useMemo(() => {
    const jobIds = filteredJobs.map(j => j.id);
    return candidates.filter(c => {
      const jobMatch = jobIds.includes(c.jobId);
      const recruiterMatch = selectedRecruiter === 'All' || c.recruiterId === selectedRecruiter;
      return jobMatch && recruiterMatch;
    });
  }, [filteredJobs, selectedRecruiter]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const activeClients = selectedClient === 'All' 
      ? clients.filter(c => filteredJobs.some(j => j.clientId === c.id)).length
      : 1;
    
    const totalJobs = filteredJobs.length;
    const openJobs = filteredJobs.filter(j => j.status === 'Open').length;
    const totalApplicants = filteredCandidates.length;
    const tagged = filteredCandidates.filter(c => ['Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired'].includes(c.stage)).length;
    const shortlisted = filteredCandidates.filter(c => ['Shortlisted', 'Interview', 'Offered', 'Hired'].includes(c.stage)).length;
    const interviewed = filteredCandidates.filter(c => ['Interview', 'Offered', 'Hired'].includes(c.stage)).length;
    const offered = filteredCandidates.filter(c => ['Offered', 'Hired'].includes(c.stage)).length;
    const hired = filteredCandidates.filter(c => c.stage === 'Hired').length;
    const rejected = filteredCandidates.filter(c => c.stage === 'Rejected').length;
    
    const taggedToInterviewRatio = tagged > 0 ? ((interviewed / tagged) * 100).toFixed(1) : '0';
    const interviewToOfferRatio = interviewed > 0 ? ((offered / interviewed) * 100).toFixed(1) : '0';
    const offerToJoinRatio = offered > 0 ? ((hired / offered) * 100).toFixed(1) : '0';
    const rejectionRate = totalApplicants > 0 ? ((rejected / totalApplicants) * 100).toFixed(1) : '0';

    return {
      activeClients,
      totalJobs,
      openJobs,
      totalApplicants,
      tagged,
      shortlisted,
      interviewed,
      offered,
      hired,
      rejected,
      taggedToInterviewRatio,
      interviewToOfferRatio,
      offerToJoinRatio,
      rejectionRate,
    };
  }, [filteredJobs, filteredCandidates, selectedClient]);

  // Chart Data
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
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      }],
    };
  }, [filteredJobs]);

  const candidatePipelineData = useMemo(() => {
    const stages = ['Applied', 'Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired', 'Rejected'];
    const stageCounts = stages.map(stage => 
      filteredCandidates.filter(c => c.stage === stage).length
    );

    return {
      labels: stages,
      datasets: [{
        label: 'Candidates',
        data: stageCounts,
        backgroundColor: [
          '#94A3B8',
          '#3B82F6',
          '#8B5CF6',
          '#F59E0B',
          '#10B981',
          '#059669',
          '#EF4444',
        ],
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 6,
      }],
    };
  }, [filteredCandidates]);

  const clientJobsData = useMemo(() => {
    const clientData = clients.map(client => {
      const clientJobs = filteredJobs.filter(j => j.clientId === client.id);
      return {
        client: client.name,
        count: clientJobs.length,
      };
    }).filter(d => d.count > 0);

    return {
      labels: clientData.map(d => d.client),
      datasets: [{
        label: 'Job Openings',
        data: clientData.map(d => d.count),
        backgroundColor: '#6366F1',
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 6,
      }],
    };
  }, [filteredJobs]);

  const recruiterPerformanceData = useMemo(() => {
    const recruiterStats = recruiters.map(recruiter => {
      const recruiterCandidates = candidates.filter(c => c.recruiterId === recruiter.id);
      return {
        name: recruiter.name,
        tagged: recruiterCandidates.filter(c => ['Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired'].includes(c.stage)).length,
        shortlisted: recruiterCandidates.filter(c => ['Shortlisted', 'Interview', 'Offered', 'Hired'].includes(c.stage)).length,
        offered: recruiterCandidates.filter(c => ['Offered', 'Hired'].includes(c.stage)).length,
        hired: recruiterCandidates.filter(c => c.stage === 'Hired').length,
      };
    }).sort((a, b) => b.hired - a.hired);

    return {
      labels: recruiterStats.map(r => r.name.split(' ')[0]),
      datasets: [
        {
          label: 'Hired',
          data: recruiterStats.map(r => r.hired),
          backgroundColor: '#10B981',
          borderColor: '#FFFFFF',
          borderWidth: 1,
        },
        {
          label: 'Offered',
          data: recruiterStats.map(r => r.offered),
          backgroundColor: '#F59E0B',
          borderColor: '#FFFFFF',
          borderWidth: 1,
        },
        {
          label: 'Shortlisted',
          data: recruiterStats.map(r => r.shortlisted),
          backgroundColor: '#8B5CF6',
          borderColor: '#FFFFFF',
          borderWidth: 1,
        },
        {
          label: 'Tagged',
          data: recruiterStats.map(r => r.tagged),
          backgroundColor: '#3B82F6',
          borderColor: '#FFFFFF',
          borderWidth: 1,
        },
      ],
    };
  }, []);

  const trendData = useMemo(() => ({
    labels: monthlyTrends.map(m => m.period),
    datasets: [
      {
        label: 'Tagged',
        data: monthlyTrends.map(m => m.tagged),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
      },
      {
        label: 'Interviewed',
        data: monthlyTrends.map(m => m.interviewed),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#F59E0B',
      },
      {
        label: 'Offered',
        data: monthlyTrends.map(m => m.offered),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#8B5CF6',
      },
      {
        label: 'Hired',
        data: monthlyTrends.map(m => m.hired),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
      },
    ],
  }), []);

  const conversionMetricsData = useMemo(() => ({
    labels: monthlyTrends.map(m => m.period),
    datasets: [
      {
        label: 'Tagged to Interview %',
        data: monthlyTrends.map(m => ((m.interviewed / m.tagged) * 100).toFixed(1)),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Interview to Offer %',
        data: monthlyTrends.map(m => ((m.offered / m.interviewed) * 100).toFixed(1)),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Offer to Join %',
        data: monthlyTrends.map(m => ((m.hired / m.offered) * 100).toFixed(1)),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
      },
    ],
  }), []);

  const funnelData = useMemo(() => {
    const stages = [
      { label: 'Applied', count: kpis.totalApplicants, color: '#94A3B8' },
      { label: 'Tagged', count: kpis.tagged, color: '#3B82F6' },
      { label: 'Shortlisted', count: kpis.shortlisted, color: '#8B5CF6' },
      { label: 'Interview', count: kpis.interviewed, color: '#F59E0B' },
      { label: 'Offered', count: kpis.offered, color: '#10B981' },
      { label: 'Hired', count: kpis.hired, color: '#059669' },
    ];

    return {
      labels: stages.map(s => s.label),
      datasets: [{
        label: 'Candidates',
        data: stages.map(s => s.count),
        backgroundColor: stages.map(s => s.color),
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }, [kpis]);

  const exportData = () => {
    const csvRows = [];
    csvRows.push('Metric,Value');
    csvRows.push(`Active Clients,${kpis.activeClients}`);
    csvRows.push(`Total Job Openings,${kpis.totalJobs}`);
    csvRows.push(`Open Jobs,${kpis.openJobs}`);
    csvRows.push(`Total Applicants,${kpis.totalApplicants}`);
    csvRows.push(`Tagged Candidates,${kpis.tagged}`);
    csvRows.push(`Shortlisted,${kpis.shortlisted}`);
    csvRows.push(`Interviewed,${kpis.interviewed}`);
    csvRows.push(`Offers Made,${kpis.offered}`);
    csvRows.push(`Hires Completed,${kpis.hired}`);
    csvRows.push(`Rejected,${kpis.rejected}`);
    csvRows.push(`Tagged to Interview Ratio,${kpis.taggedToInterviewRatio}%`);
    csvRows.push(`Interview to Offer Ratio,${kpis.interviewToOfferRatio}%`);
    csvRows.push(`Offer to Join Ratio,${kpis.offerToJoinRatio}%`);
    csvRows.push(`Rejection Rate,${kpis.rejectionRate}%`);
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen ">
      <div className="max-w-[1600px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="h-7 w-7 text-white" />
              </div>
              Recruitment Manager Dashboard
            </h1>
            <p className="text-slate-600 mt-1.5">
              Comprehensive overview of recruitment activities, performance, and pipeline metrics
            </p>
          </div>
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <section className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white font-medium"
              >
                <option value="All">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <select
                value={selectedRecruiter}
                onChange={(e) => setSelectedRecruiter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white font-medium"
              >
                <option value="All">All Recruiters</option>
                {recruiters.map(recruiter => (
                  <option key={recruiter.id} value={recruiter.id}>{recruiter.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {(['week', 'month', 'year'] as const).map(period => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      timePeriod === period
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <KpiCard icon={<Building2 />} value={kpis.activeClients} label="Active Clients" color="indigo" />
          <KpiCard icon={<Briefcase />} value={kpis.totalJobs} label="Total Jobs" color="blue" />
          <KpiCard icon={<UserPlus />} value={kpis.totalApplicants} label="Total Applicants" color="slate" />
          <KpiCard icon={<Eye />} value={kpis.shortlisted} label="Shortlisted" color="purple" />
          <KpiCard icon={<MessageSquare />} value={kpis.interviewed} label="Interviewed" color="amber" />
          <KpiCard icon={<FileText />} value={kpis.offered} label="Offers Made" color="orange" />
          <KpiCard icon={<CheckCircle2 />} value={kpis.hired} label="Hires" color="emerald" trend="+12%" />
        </section>

        {/* Conversion Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Tagged → Interview"
            value={`${kpis.taggedToInterviewRatio}%`}
            icon={<TrendingUp />}
            color="blue"
            subtitle={`${kpis.interviewed} of ${kpis.tagged} tagged`}
          />
          <MetricCard
            label="Interview → Offer"
            value={`${kpis.interviewToOfferRatio}%`}
            icon={<Target />}
            color="amber"
            subtitle={`${kpis.offered} of ${kpis.interviewed} interviewed`}
          />
          <MetricCard
            label="Offer → Join"
            value={`${kpis.offerToJoinRatio}%`}
            icon={<Award />}
            color="emerald"
            subtitle={`${kpis.hired} of ${kpis.offered} offered`}
          />
          <MetricCard
            label="Rejection Rate"
            value={`${kpis.rejectionRate}%`}
            icon={<XCircle />}
            color="red"
            subtitle={`${kpis.rejected} candidates rejected`}
          />
        </section>

        {/* Main Charts Row 1 */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Recruitment Funnel */}
          <div className="xl:col-span-2 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Recruitment Funnel"
              subtitle="Organization-wide candidate flow from application to hire"
              icon={<Target className="h-5 w-5 text-indigo-600" />}
            />
            <div className="h-80 mt-5">
              <Bar
                data={funnelData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const total = kpis.totalApplicants;
                          const value = context.parsed.x;
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${value} candidates (${percentage}%)`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: '#f1f5f9' },
                      border: { display: false },
                      ticks: { font: { size: 11 }, color: '#64748b' }
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { font: { size: 12, weight: 600 }, color: '#475569' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Job Status Distribution */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Jobs by Status"
              subtitle="Current job opening distribution"
              icon={<Briefcase className="h-5 w-5 text-blue-600" />}
            />
            <div className="h-80 flex items-center justify-center mt-4">
              <Doughnut
                data={jobStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '60%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        font: { size: 12, weight: 600 },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#475569'
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Main Charts Row 2 */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Candidate Pipeline */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Candidate Pipeline by Stage"
              subtitle="Distribution across all recruitment stages"
              icon={<Users className="h-5 w-5 text-purple-600" />}
            />
            <div className="h-80 mt-5">
              <Bar
                data={candidatePipelineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.parsed.y;
                          const total = filteredCandidates.length;
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${value} candidates (${percentage}%)`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f1f5f9' },
                      border: { display: false },
                      ticks: { font: { size: 11 }, color: '#64748b' }
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { font: { size: 11, weight: 600 }, color: '#475569' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Active Clients Overview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Jobs by Client"
              subtitle="Job openings distribution across clients"
              icon={<Building2 className="h-5 w-5 text-indigo-600" />}
            />
            <div className="h-80 mt-5">
              <Bar
                data={clientJobsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f1f5f9' },
                      border: { display: false },
                      ticks: { 
                        font: { size: 11 }, 
                        color: '#64748b',
                        stepSize: 2
                      }
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { 
                        font: { size: 11, weight: 600 }, 
                        color: '#475569',
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Trends Section */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Activity Trends */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Monthly Activity Trends"
              subtitle="Recruitment activity over time"
              icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            />
            <div className="h-80 mt-5">
              <Line
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 15,
                        font: { size: 12, weight: 600 },
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
                      ticks: { font: { size: 11 }, color: '#64748b' }
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { font: { size: 11, weight: 600 }, color: '#64748b' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Conversion Metrics Trend */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Conversion Ratio Trends"
              subtitle="Stage conversion rates over time"
              icon={<Target className="h-5 w-5 text-amber-600" />}
            />
            <div className="h-80 mt-5">
              <Line
                data={conversionMetricsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 15,
                        font: { size: 12, weight: 600 },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#475569'
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: '#f1f5f9' },
                      border: { display: false },
                      ticks: {
                        font: { size: 11 },
                        color: '#64748b',
                        callback: (value) => value + '%'
                      }
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { font: { size: 11, weight: 600 }, color: '#64748b' }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Recruiter Performance */}
        <section className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
          <SectionHeader
            title="Recruiter Performance Comparison"
            subtitle="Individual recruiter metrics and achievements"
            icon={<Award className="h-5 w-5 text-emerald-600" />}
          />
          <div className="h-96 mt-5">
            <Bar
              data={recruiterPerformanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      padding: 15,
                      font: { size: 12, weight: 600 },
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: '#475569'
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    stacked: false,
                    grid: { color: '#f1f5f9' },
                    border: { display: false },
                    ticks: { font: { size: 11 }, color: '#64748b' }
                  },
                  x: {
                    stacked: false,
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { size: 11, weight: 600 }, color: '#475569' }
                  }
                }
              }}
            />
          </div>
        </section>

        {/* Detailed Tables */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Top Recruiters Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Recruiter Leaderboard"
              subtitle="Top performing recruiters"
              icon={<Award className="h-5 w-5 text-amber-600" />}
            />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-3 font-semibold text-slate-700">Rank</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Recruiter</th>
                    <th className="text-center p-3 font-semibold text-slate-700">Hires</th>
                    <th className="text-center p-3 font-semibold text-slate-700">Offers</th>
                    <th className="text-center p-3 font-semibold text-slate-700">Tagged</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recruiters.map((recruiter, index) => {
                    const recruiterCandidates = candidates.filter(c => c.recruiterId === recruiter.id);
                    const hired = recruiterCandidates.filter(c => c.stage === 'Hired').length;
                    const offered = recruiterCandidates.filter(c => ['Offered', 'Hired'].includes(c.stage)).length;
                    const tagged = recruiterCandidates.filter(c => ['Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired'].includes(c.stage)).length;
                    
                    return (
                      <tr key={recruiter.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{recruiter.name}</div>
                          <div className="text-xs text-slate-500">{recruiter.email}</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                            {hired}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-700 font-bold">
                            {offered}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold">
                            {tagged}
                          </span>
                        </td>
                        <td className="p-3">
                          <PerformanceBadge performance={recruiter.performance} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Overview Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
            <SectionHeader
              title="Client Overview"
              subtitle="Active clients and their job openings"
              icon={<Building2 className="h-5 w-5 text-indigo-600" />}
            />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-3 font-semibold text-slate-700">Client Name</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Industry</th>
                    <th className="text-center p-3 font-semibold text-slate-700">Active Jobs</th>
                    <th className="text-center p-3 font-semibold text-slate-700">Candidates</th>
                    <th className="text-center p-3 font-semibold text-slate-700">Hired</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map(client => {
                    const clientJobs = jobOpenings.filter(j => j.clientId === client.id);
                    const clientJobIds = clientJobs.map(j => j.id);
                    const clientCandidates = candidates.filter(c => clientJobIds.includes(c.jobId));
                    const clientHired = clientCandidates.filter(c => c.stage === 'Hired').length;
                    
                    return (
                      <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{client.name}</div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {client.industry}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold">
                            {clientJobs.length}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 text-purple-700 font-bold">
                            {clientCandidates.length}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                            {clientHired}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Time Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TimeMetricCard
            label="Avg Time to Offer"
            value="13 days"
            trend="-8%"
            trendPositive={true}
            icon={<Clock />}
          />
          <TimeMetricCard
            label="Avg Time to Join"
            value="19 days"
            trend="-5%"
            trendPositive={true}
            icon={<Clock />}
          />
          <TimeMetricCard
            label="Avg Interview Duration"
            value="5 days"
            trend="+2%"
            trendPositive={false}
            icon={<Clock />}
          />
          <TimeMetricCard
            label="Avg Response Time"
            value="2 days"
            trend="-12%"
            trendPositive={true}
            icon={<Clock />}
          />
        </section>
      </div>
    </main>
  );
}

// Component Definitions
interface KpiCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'indigo' | 'blue' | 'slate' | 'purple' | 'amber' | 'orange' | 'emerald';
  trend?: string;
}

function KpiCard({ icon, value, label, color, trend }: KpiCardProps) {
  const colorStyles = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border-2 ${colorStyles[color].border} hover:shadow-xl transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${colorStyles[color].bg} flex items-center justify-center ${colorStyles[color].text}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <p className="text-sm text-slate-600 font-semibold">{label}</p>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'emerald' | 'red';
  subtitle: string;
}

function MetricCard({ label, value, icon, color, subtitle }: MetricCardProps) {
  const colorStyles = {
    blue: { bg: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    amber: { bg: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
    emerald: { bg: 'from-emerald-500 to-green-600', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    red: { bg: 'from-red-500 to-rose-600', iconBg: 'bg-red-50', iconText: 'text-red-600' },
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${colorStyles[color].iconBg} flex items-center justify-center ${colorStyles[color].iconText}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-600">{label}</div>
        <div className={`text-4xl font-bold bg-gradient-to-r ${colorStyles[color].bg} bg-clip-text text-transparent`}>
          {value}
        </div>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

function SectionHeader({ title, subtitle, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="mt-0.5">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function PerformanceBadge({ performance }: { performance: string }) {
  const styles = {
    'Excellent': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Good': 'bg-blue-50 text-blue-700 border-blue-200',
    'Average': 'bg-amber-50 text-amber-700 border-amber-200',
    'Needs Improvement': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${styles[performance as keyof typeof styles]}`}>
      {performance === 'Excellent' && <CheckCircle2 className="h-3.5 w-3.5" />}
      {performance === 'Needs Improvement' && <AlertCircle className="h-3.5 w-3.5" />}
      {performance}
    </span>
  );
}

interface TimeMetricCardProps {
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  icon: React.ReactNode;
}

function TimeMetricCard({ label, value, trend, trendPositive, icon }: TimeMetricCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trendPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          <TrendingUp className={`h-3 w-3 ${!trendPositive && 'rotate-180'}`} />
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <p className="text-sm text-slate-600 font-medium">{label}</p>
      </div>
    </div>
  );
}