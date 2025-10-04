// 'use client';

// import {
//   ArcElement,
//   BarElement,
//   CategoryScale,
//   Chart as ChartJS,
//   Filler,
//   Legend,
//   LinearScale,
//   LineElement,
//   PointElement,
//   Tooltip,
// } from 'chart.js';
// import {
//   Activity,
//   Briefcase,
//   Building2,
//   CheckCircle,
//   Clock,
//   Download,
//   Target,
//   UserCheck,
//   Users
// } from 'lucide-react';
// import { useMemo, useState } from 'react';
// import { Bar, Doughnut, Line } from 'react-chartjs-2';

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   LineElement,
//   PointElement,
//   Filler,
// );

// interface JobApplicant {
//   id: string;
//   name: string;
//   email: string;
//   job_title: string;
//   client: string;
//   status: 'Applied' | 'Tagged' | 'Shortlisted' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
//   appliedDate: string;
//   lastUpdated: string;
// }

// interface JobOpening {
//   id: string;
//   title: string;
//   client: string;
//   location: string;
//   status: 'Open' | 'Offered' | 'Joined' | 'Cancelled';
//   positions: number;
//   createdDate: string;
// }

// interface MetricData {
//   month: string;
//   tagged: number;
//   interviews: number;
//   offers: number;
//   joined: number;
// }

// const dummyApplicants: JobApplicant[] = [
//   { id: '1', name: 'John Doe', email: 'john@example.com', job_title: 'Software Engineer', client: 'TechCorp', status: 'Applied', appliedDate: '2025-09-15', lastUpdated: '2025-09-15' },
//   { id: '2', name: 'Jane Smith', email: 'jane@example.com', job_title: 'Product Manager', client: 'InnovateLtd', status: 'Hired', appliedDate: '2025-08-10', lastUpdated: '2025-10-01' },
//   { id: '3', name: 'Alice Johnson', email: 'alice@example.com', job_title: 'Data Analyst', client: 'DataVision', status: 'Interview', appliedDate: '2025-09-20', lastUpdated: '2025-09-28' },
//   { id: '4', name: 'Bob Wilson', email: 'bob@example.com', job_title: 'UX Designer', client: 'DesignHub', status: 'Shortlisted', appliedDate: '2025-09-25', lastUpdated: '2025-09-27' },
//   { id: '5', name: 'Emma Brown', email: 'emma@example.com', job_title: 'DevOps Engineer', client: 'CloudSys', status: 'Offered', appliedDate: '2025-08-15', lastUpdated: '2025-09-30' },
//   { id: '6', name: 'Michael Lee', email: 'michael@example.com', job_title: 'Software Engineer', client: 'TechCorp', status: 'Tagged', appliedDate: '2025-09-18', lastUpdated: '2025-09-22' },
//   { id: '7', name: 'Sarah Davis', email: 'sarah@example.com', job_title: 'Marketing Manager', client: 'InnovateLtd', status: 'Rejected', appliedDate: '2025-08-20', lastUpdated: '2025-09-05' },
//   { id: '8', name: 'David Miller', email: 'david@example.com', job_title: 'Data Scientist', client: 'DataVision', status: 'Interview', appliedDate: '2025-09-22', lastUpdated: '2025-09-29' },
//   { id: '9', name: 'Laura Taylor', email: 'laura@example.com', job_title: 'Product Manager', client: 'TechCorp', status: 'Shortlisted', appliedDate: '2025-09-12', lastUpdated: '2025-09-25' },
//   { id: '10', name: 'James White', email: 'james@example.com', job_title: 'Software Engineer', client: 'CloudSys', status: 'Hired', appliedDate: '2025-08-05', lastUpdated: '2025-09-28' },
//   { id: '11', name: 'Emily Clark', email: 'emily@example.com', job_title: 'Data Engineer', client: 'DataVision', status: 'Offered', appliedDate: '2025-09-10', lastUpdated: '2025-09-30' },
//   { id: '12', name: 'Chris Martin', email: 'chris@example.com', job_title: 'UX Designer', client: 'DesignHub', status: 'Interview', appliedDate: '2025-09-28', lastUpdated: '2025-10-02' },
//   { id: '13', name: 'Sophia Garcia', email: 'sophia@example.com', job_title: 'DevOps Engineer', client: 'CloudSys', status: 'Tagged', appliedDate: '2025-09-19', lastUpdated: '2025-09-24' },
//   { id: '14', name: 'Oliver Martinez', email: 'oliver@example.com', job_title: 'Software Engineer', client: 'TechCorp', status: 'Shortlisted', appliedDate: '2025-09-16', lastUpdated: '2025-09-26' },
//   { id: '15', name: 'Isabella Rodriguez', email: 'isabella@example.com', job_title: 'Marketing Manager', client: 'InnovateLtd', status: 'Applied', appliedDate: '2025-09-30', lastUpdated: '2025-09-30' },
// ];

// const dummyJobs: JobOpening[] = [
//   { id: '1', title: 'Software Engineer', client: 'TechCorp', location: 'Bangalore', status: 'Open', positions: 3, createdDate: '2025-08-01' },
//   { id: '2', title: 'Product Manager', client: 'InnovateLtd', location: 'Mumbai', status: 'Open', positions: 2, createdDate: '2025-08-05' },
//   { id: '3', title: 'Data Analyst', client: 'DataVision', location: 'Delhi', status: 'Open', positions: 1, createdDate: '2025-08-10' },
//   { id: '4', title: 'UX Designer', client: 'DesignHub', location: 'Pune', status: 'Offered', positions: 1, createdDate: '2025-08-15' },
//   { id: '5', title: 'DevOps Engineer', client: 'CloudSys', location: 'Hyderabad', status: 'Joined', positions: 2, createdDate: '2025-07-20' },
//   { id: '6', title: 'Data Scientist', client: 'DataVision', location: 'Chennai', status: 'Open', positions: 1, createdDate: '2025-08-20' },
//   { id: '7', title: 'Marketing Manager', client: 'InnovateLtd', location: 'Kolkata', status: 'Cancelled', positions: 1, createdDate: '2025-08-01' },
// ];

// const monthlyMetrics: MetricData[] = [
//   { month: 'Jun', tagged: 8, interviews: 5, offers: 3, joined: 2 },
//   { month: 'Jul', tagged: 12, interviews: 8, offers: 5, joined: 3 },
//   { month: 'Aug', tagged: 15, interviews: 11, offers: 7, joined: 5 },
//   { month: 'Sep', tagged: 18, interviews: 13, offers: 9, joined: 6 },
//   { month: 'Oct', tagged: 10, interviews: 7, offers: 4, joined: 2 },
// ];

// export default function RecruiterDashboard() {
//   const [selectedClient, setSelectedClient] = useState<string>('All');
//   const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');

//   const clients = useMemo(() => Array.from(new Set(dummyJobs.map(j => j.client))), []);
//   const filteredApplicants = useMemo(() => selectedClient === 'All' ? dummyApplicants : dummyApplicants.filter(a => a.client === selectedClient), [selectedClient]);
//   const filteredJobs = useMemo(() => selectedClient === 'All' ? dummyJobs : dummyJobs.filter(j => j.client === selectedClient), [selectedClient]);

//   const activeClients = useMemo(() => {
//     const clientsWithOpenJobs = new Set(dummyJobs.filter(j => j.status === 'Open').map(j => j.client));
//     return clientsWithOpenJobs.size;
//   }, []);

//   const kpiMetrics = useMemo(() => {
//     const total = filteredApplicants.length;
//     const tagged = filteredApplicants.filter(a => a.status === 'Tagged').length;
//     const interviews = filteredApplicants.filter(a => a.status === 'Interview').length;
//     const offered = filteredApplicants.filter(a => a.status === 'Offered').length;
//     const hired = filteredApplicants.filter(a => a.status === 'Hired').length;
//     return {
//       totalApplicants: total,
//       taggedToInterview: tagged > 0 ? ((interviews / tagged) * 100).toFixed(1) : '0',
//       interviewToOffer: interviews > 0 ? ((offered / interviews) * 100).toFixed(1) : '0',
//       offerToJoin: offered > 0 ? ((hired / offered) * 100).toFixed(1) : '0',
//       avgTimeToOffer: 12,
//       avgTimeToJoin: 18,
//     };
//   }, [filteredApplicants]);

//   const exportCSV = () => {
//     const csvRows = [];
//     csvRows.push('Name,Email,Job Title,Client,Status,Applied Date,Last Updated');
//     filteredApplicants.forEach(a => {
//       csvRows.push(`${a.name},${a.email},${a.job_title},${a.client},${a.status},${a.appliedDate},${a.lastUpdated}`);
//     });
//     const csvContent = csvRows.join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `recruiter-report-${selectedClient}-${new Date().toISOString().split('T')[0]}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   // Client-wise breakdown data
//   const clientBreakdown = useMemo(() => {
//     return clients.map(client => {
//       const clientApplicants = dummyApplicants.filter(a => a.client === client);
//       const clientJobs = dummyJobs.filter(j => j.client === client);
//       return {
//         name: client,
//         openJobs: clientJobs.filter(j => j.status === 'Open').length,
//         totalCandidates: clientApplicants.length,
//         interviewed: clientApplicants.filter(a => a.status === 'Interview').length,
//         hired: clientApplicants.filter(a => a.status === 'Hired').length,
//       };
//     });
//   }, [clients]);

//   // Job Status Doughnut Chart
//   const jobStatusData = useMemo(() => {
//     const statusCounts = filteredJobs.reduce((acc, job) => {
//       acc[job.status] = (acc[job.status] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);
//     return {
//       labels: ['Open', 'Offered', 'Joined', 'Cancelled'],
//       datasets: [{
//         data: [
//           statusCounts['Open'] || 0,
//           statusCounts['Offered'] || 0,
//           statusCounts['Joined'] || 0,
//           statusCounts['Cancelled'] || 0,
//         ],
//         backgroundColor: ['#818CF8', '#FBBF24', '#34D399', '#F87171'],
//         borderColor: '#FFFFFF',
//         borderWidth: 2,
//       }],
//     };
//   }, [filteredJobs]);

//   // Candidate Pipeline by Client
//   const candidatePipelineData = useMemo(() => {
//     const clientGroups = selectedClient === 'All' ? clients : [selectedClient];
//     const statusOrder = ['Applied', 'Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired'];
//     return {
//       labels: clientGroups,
//       datasets: statusOrder.map((status, idx) => {
//         const colors = ['#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#34D399'];
//         return {
//           label: status,
//           data: clientGroups.map(client => {
//             const clientApplicants = dummyApplicants.filter(a =>
//               (selectedClient === 'All' ? a.client === client : true)
//             );
//             return clientApplicants.filter(a => a.status === status).length;
//           }),
//           backgroundColor: colors[idx],
//           borderColor: '#FFFFFF',
//           borderWidth: 1,
//         };
//       }),
//     };
//   }, [selectedClient, clients]);

//   // Recruitment Funnel
//   const funnelData = useMemo(() => {
//     const stages = [
//       { label: 'Applied', count: filteredApplicants.length },
//       { label: 'Tagged', count: filteredApplicants.filter(a => ['Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired'].includes(a.status)).length },
//       { label: 'Interview', count: filteredApplicants.filter(a => ['Interview', 'Offered', 'Hired'].includes(a.status)).length },
//       { label: 'Offered', count: filteredApplicants.filter(a => ['Offered', 'Hired'].includes(a.status)).length },
//       { label: 'Hired', count: filteredApplicants.filter(a => a.status === 'Hired').length },
//     ];
//     return {
//       labels: stages.map(s => s.label),
//       datasets: [{
//         label: 'Candidates',
//         data: stages.map(s => s.count),
//         backgroundColor: ['#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#34D399'],
//         borderColor: '#FFFFFF',
//         borderWidth: 2,
//       }],
//     };
//   }, [filteredApplicants]);

//   // Recruitment Trend
//   const trendData = useMemo(() => ({
//     labels: monthlyMetrics.map(m => m.month),
//     datasets: [
//       {
//         label: 'Tagged',
//         data: monthlyMetrics.map(m => m.tagged),
//         borderColor: '#818CF8',
//         backgroundColor: 'rgba(129,140,248,0.1)',
//         fill: true,
//         tension: 0.4,
//         borderWidth: 2,
//         pointRadius: 4,
//         pointBackgroundColor: '#818CF8',
//       },
//       {
//         label: 'Interviews',
//         data: monthlyMetrics.map(m => m.interviews),
//         borderColor: '#FBBF24',
//         backgroundColor: 'rgba(251,191,36,0.1)',
//         fill: true,
//         tension: 0.4,
//         borderWidth: 2,
//         pointRadius: 4,
//         pointBackgroundColor: '#FBBF24',
//       },
//       {
//         label: 'Offers',
//         data: monthlyMetrics.map(m => m.offers),
//         borderColor: '#A78BFA',
//         backgroundColor: 'rgba(167,139,250,0.1)',
//         fill: true,
//         tension: 0.4,
//         borderWidth: 2,
//         pointRadius: 4,
//         pointBackgroundColor: '#A78BFA',
//       },
//       {
//         label: 'Joined',
//         data: monthlyMetrics.map(m => m.joined),
//         borderColor: '#34D399',
//         backgroundColor: 'rgba(52,211,153,0.1)',
//         fill: true,
//         tension: 0.4,
//         borderWidth: 2,
//         pointRadius: 4,
//         pointBackgroundColor: '#34D399',
//       },
//     ],
//   }), []);

//   return (
//     <main className="min-h-screen  to-indigo-50 ">
//       <div className="w-full mx-auto space-y-4">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Recruitment Command Center</h1>
//             <p className="text-sm text-slate-600 mt-1">Real-time insights • Performance metrics • Client analytics</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
//               {(['week', 'month', 'year'] as const).map(period => (
//                 <button
//                   key={period}
//                   onClick={() => setTimePeriod(period)}
//                   className={`px-4 py-1.5 rounded-md font-medium text-xs transition-all ${
//                     timePeriod === period
//                       ? 'bg-indigo-500 text-white shadow-sm'
//                       : 'text-slate-600 hover:bg-slate-100'
//                   }`}
//                 >
//                   {period.charAt(0).toUpperCase() + period.slice(1)}
//                 </button>
//               ))}
//             </div>
//             <button
//               onClick={exportCSV}
//               className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-semibold"
//             >
//               <Download className="h-4 w-4" />
//               Export
//             </button>
//           </div>
//         </div>

//         {/* Top KPI Cards */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
//           <MetricCard icon={<Users className="h-5 w-5" />} value={kpiMetrics.totalApplicants} label="Total Candidates" color="indigo" />
//           <MetricCard icon={<Briefcase className="h-5 w-5" />} value={filteredJobs.filter(j => j.status === 'Open').length} label="Open Positions" color="amber" />
//           <MetricCard icon={<UserCheck className="h-5 w-5" />} value={filteredApplicants.filter(a => a.status === 'Hired').length} label="Hires" color="emerald" />
//           <MetricCard icon={<Building2 className="h-5 w-5" />} value={activeClients} label="Active Clients" color="purple" />
//           <MetricCard icon={<Target className="h-5 w-5" />} value={`${kpiMetrics.taggedToInterview}%`} label="Tag→Interview" color="blue" />
//           <MetricCard icon={<Activity className="h-5 w-5" />} value={`${kpiMetrics.interviewToOffer}%`} label="Interview→Offer" color="rose" />
//           <MetricCard icon={<Clock className="h-5 w-5" />} value={`${kpiMetrics.avgTimeToOffer}d`} label="Time to Offer" color="teal" />
//           <MetricCard icon={<CheckCircle className="h-5 w-5" />} value={`${kpiMetrics.offerToJoin}%`} label="Offer→Join" color="green" />
//         </div>

//         {/* Client Pills */}
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
//           <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Filter by Client</h3>
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => setSelectedClient('All')}
//               className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
//                 selectedClient === 'All'
//                   ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
//                   : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//               }`}
//             >
//               All Clients
//             </button>
//             {clients.map(client => (
//               <button
//                 key={client}
//                 onClick={() => setSelectedClient(client)}
//                 className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
//                   selectedClient === client
//                     ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
//                     : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                 }`}
//               >
//                 {client}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Main Charts Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           {/* Trend Chart */}
//           <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-200">
//             <h3 className="text-base font-semibold text-slate-800 mb-4">Recruitment Performance Trend</h3>
//             <div className="h-64">
//               <Line data={trendData} options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 animation: { duration: 800 },
//                 plugins: {
//                   legend: {
//                     display: true,
//                     position: 'bottom',
//                     labels: { padding: 12, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle' }
//                   }
//                 },
//                 scales: {
//                   y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 }, color: '#64748B' } },
//                   x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#64748B' } }
//                 }
//               }} />
//             </div>
//           </div>

//           {/* Job Status Doughnut */}
//           <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
//             <h3 className="text-base font-semibold text-slate-800 mb-4">Job Status Distribution</h3>
//             <div className="h-64 flex items-center justify-center">
//               <Doughnut
//                 data={jobStatusData}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   cutout: '65%',
//                   animation: { duration: 800 },
//                   plugins: {
//                     legend: {
//                       position: 'bottom',
//                       labels: { padding: 10, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle' }
//                     }
//                   }
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Pipeline and Funnel */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           {/* Candidate Pipeline */}
//           <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
//             <h3 className="text-base font-semibold text-slate-800 mb-4">Candidate Pipeline by Stage</h3>
//             <div className="h-64">
//               <Bar
//                 data={candidatePipelineData}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   animation: { duration: 800 },
//                   plugins: {
//                     legend: { position: 'bottom', labels: { padding: 10, font: { size: 10 } } },
//                   },
//                   scales: {
//                     x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: '#64748B' } },
//                     y: { stacked: true, beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1, font: { size: 10 }, color: '#64748B' } }
//                   }
//                 }}
//               />
//             </div>
//           </div>

//           {/* Recruitment Funnel */}
//           <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
//             <h3 className="text-base font-semibold text-slate-800 mb-4">Recruitment Funnel</h3>
//             <div className="h-64">
//               <Bar
//                 data={funnelData}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   indexAxis: 'y',
//                   animation: { duration: 800 },
//                   plugins: {
//                     legend: { display: false },
//                   },
//                   scales: {
//                     x: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1, font: { size: 10 }, color: '#64748B' } },
//                     y: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#64748B' } }
//                   }
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Client Breakdown Table */}
//         <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
//           <h3 className="text-base font-semibold text-slate-800 mb-4">Client-wise Breakdown</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-slate-200">
//                   <th className="text-left py-3 px-4 font-semibold text-slate-600">Client</th>
//                   <th className="text-center py-3 px-4 font-semibold text-slate-600">Open Jobs</th>
//                   <th className="text-center py-3 px-4 font-semibold text-slate-600">Total Candidates</th>
//                   <th className="text-center py-3 px-4 font-semibold text-slate-600">Interviewed</th>
//                   <th className="text-center py-3 px-4 font-semibold text-slate-600">Hired</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {clientBreakdown.map((client, idx) => (
//                   <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
//                     <td className="py-3 px-4 font-medium text-slate-800">{client.name}</td>
//                     <td className="py-3 px-4 text-center">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs">
//                         {client.openJobs}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-center">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
//                         {client.totalCandidates}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-center">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold text-xs">
//                         {client.interviewed}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-center">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs">
//                         {client.hired}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

// interface MetricCardProps {
//   icon: React.ReactNode;
//   value: string | number;
//   label: string;
//   color: string;
// }

// function MetricCard({ icon, value, label, color }: MetricCardProps) {
//   const colorMap: Record<string, string> = {
//     indigo: 'from-indigo-500 to-indigo-600',
//     amber: 'from-amber-500 to-amber-600',
//     emerald: 'from-emerald-500 to-emerald-600',
//     purple: 'from-purple-500 to-purple-600',
//     blue: 'from-blue-500 to-blue-600',
//     rose: 'from-rose-500 to-rose-600',
//     teal: 'from-teal-500 to-teal-600',
//     green: 'from-green-500 to-green-600',
//   };

//   return (
//     <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all">
//       <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white mb-3 shadow-sm`}>
//         {icon}
//       </div>
//       <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
//       <div className="text-xs text-slate-600 font-medium">{label}</div>
//     </div>
//   );
// }
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

interface JobApplicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  client: string;
  status: 'Applied' | 'Tagged' | 'Shortlisted' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
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
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', job_title: 'Product Manager', client: 'InnovateLtd', status: 'Hired', appliedDate: '2025-08-10', lastUpdated: '2025-10-01' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com', job_title: 'Data Analyst', client: 'DataVision', status: 'Interview', appliedDate: '2025-09-20', lastUpdated: '2025-09-28' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com', job_title: 'UX Designer', client: 'DesignHub', status: 'Shortlisted', appliedDate: '2025-09-25', lastUpdated: '2025-09-27' },
  { id: '5', name: 'Emma Brown', email: 'emma@example.com', job_title: 'DevOps Engineer', client: 'CloudSys', status: 'Offered', appliedDate: '2025-08-15', lastUpdated: '2025-09-30' },
  { id: '6', name: 'Michael Lee', email: 'michael@example.com', job_title: 'Software Engineer', client: 'TechCorp', status: 'Tagged', appliedDate: '2025-09-18', lastUpdated: '2025-09-22' },
  { id: '7', name: 'Sarah Davis', email: 'sarah@example.com', job_title: 'Marketing Manager', client: 'InnovateLtd', status: 'Rejected', appliedDate: '2025-08-20', lastUpdated: '2025-09-05' },
  { id: '8', name: 'David Miller', email: 'david@example.com', job_title: 'Data Scientist', client: 'DataVision', status: 'Interview', appliedDate: '2025-09-22', lastUpdated: '2025-09-29' },
  { id: '9', name: 'Laura Taylor', email: 'laura@example.com', job_title: 'Product Manager', client: 'TechCorp', status: 'Shortlisted', appliedDate: '2025-09-12', lastUpdated: '2025-09-25' },
  { id: '10', name: 'James White', email: 'james@example.com', job_title: 'Software Engineer', client: 'CloudSys', status: 'Hired', appliedDate: '2025-08-05', lastUpdated: '2025-09-28' },
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
  const filteredApplicants = useMemo(() => selectedClient === 'All' ? dummyApplicants : dummyApplicants.filter(a => a.client === selectedClient), [selectedClient]);
  const filteredJobs = useMemo(() => selectedClient === 'All' ? dummyJobs : dummyJobs.filter(j => j.client === selectedClient), [selectedClient]);

  const activeClients = useMemo(() => {
    const clientsWithOpenJobs = new Set(dummyJobs.filter(j => j.status === 'Open').map(j => j.client));
    return clientsWithOpenJobs.size;
  }, []);

  const kpiMetrics = useMemo(() => {
    const total = filteredApplicants.length;
    const tagged = filteredApplicants.filter(a => a.status === 'Tagged').length;
    const interviews = filteredApplicants.filter(a => a.status === 'Interview').length;
    const offered = filteredApplicants.filter(a => a.status === 'Offered').length;
    const hired = filteredApplicants.filter(a => a.status === 'Hired').length;
    return {
      totalApplicants: total,
      taggedToInterview: tagged > 0 ? ((interviews / tagged) * 100).toFixed(1) : '0',
      interviewToOffer: interviews > 0 ? ((offered / interviews) * 100).toFixed(1) : '0',
      offerToJoin: offered > 0 ? ((hired / offered) * 100).toFixed(1) : '0',
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

  const candidatePipelineData = useMemo(() => {
    const clientGroups = selectedClient === 'All'
      ? clients.filter(c => c !== 'All')
      : [selectedClient];
    const statusOrder = ['Applied', 'Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired'];
    return {
      labels: clientGroups,
      datasets: statusOrder.map((status, idx) => {
        const colors = ['#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#10B981'];
        return {
          label: status,
          data: clientGroups.map(client => {
            const clientApplicants = dummyApplicants.filter(a => a.client === client);
            return clientApplicants.filter(a => a.status === status).length;
          }),
          backgroundColor: colors[idx],
          borderColor: '#FFFFFF',
          borderWidth: 1,
        };
      }),
    };
  }, [selectedClient, clients]);

  const funnelData = useMemo(() => {
    const stages = [
      { label: 'Applied', count: filteredApplicants.length },
      { label: 'Tagged', count: filteredApplicants.filter(a => ['Tagged', 'Shortlisted', 'Interview', 'Offered', 'Hired'].includes(a.status)).length },
      { label: 'Interview', count: filteredApplicants.filter(a => ['Interview', 'Offered', 'Hired'].includes(a.status)).length },
      { label: 'Offered', count: filteredApplicants.filter(a => ['Offered', 'Hired'].includes(a.status)).length },
      { label: 'Hired', count: filteredApplicants.filter(a => a.status === 'Hired').length },
    ];
    return {
      labels: stages.map(s => s.label),
      datasets: [{
        label: 'Candidates',
        data: stages.map(s => s.count),
        backgroundColor: ['#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#10B981'],
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }, [filteredApplicants]);

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
            icon={<Users className="h-4 w-4" />} 
            value={kpiMetrics.totalApplicants} 
            label="Total Candidates" 
            trend="+5.8%" 
            color="indigo"
          />
          <KpiCard 
            icon={<Briefcase className="h-4 w-4" />} 
            value={filteredJobs.filter(j => j.status === 'Open').length} 
            label="Open Positions" 
            color="amber"
          />
          <KpiCard 
            icon={<UserCheck className="h-4 w-4" />} 
            value={filteredApplicants.filter(a => a.status === 'Hired').length} 
            label="Successfully Hired" 
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
            <div className="h-64 flex items-center justify-center cursor-pointer mt-2">
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
                        padding: 8, 
                        font: { size: 11 }, 
                        usePointStyle: true, 
                        pointStyle: 'circle',
                        color: '#475569'
                      } 
                    }
                  },
                  onClick: (_, elements) => handleJobStatusClick(elements),
                 onHover: (event, elements) => chartHover(event, elements),

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
