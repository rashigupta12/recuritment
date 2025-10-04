/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
} from "chart.js";
import {
  Briefcase,
  Building2,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler
);

interface JobApplicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  client: string;
  status:
    | "Applied"
    | "Tagged"
    | "Shortlisted"
    | "AssessmentStage"
    | "InterviewStage"
    | "Offered"
    | "OfferRejected"
    | "Rejected"
    | "Joined";
  appliedDate: string;
  lastUpdated: string;
  recruiter: string;
}

interface JobOpening {
  id: string;
  title: string;
  client: string;
  location: string;
  status: "Open" | "Offered" | "Joined" | "Cancelled";
  positions: number;
  createdDate: string;
  recruiter: string;
}

interface MetricData {
  month: string;
  tagged: number;
  interviews: number;
  offers: number;
  joined: number;
}

interface Recruiter {
  id: string;
  name: string;
  email: string;
  team: string;
}

// Extended dummy data with recruiter information
const recruiters: Recruiter[] = [
  { id: "1", name: "John Recruiter", email: "john@company.com", team: "Tech" },
  { id: "2", name: "Sarah Manager", email: "sarah@company.com", team: "Non-Tech" },
  { id: "3", name: "Mike Coordinator", email: "mike@company.com", team: "Tech" },
  { id: "4", name: "All Recruiters", email: "all@company.com", team: "All" },
];

const dummyApplicants: JobApplicant[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    job_title: "Software Engineer",
    client: "TechCorp",
    status: "Applied",
    appliedDate: "2025-09-15",
    lastUpdated: "2025-09-15",
    recruiter: "1",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    job_title: "Product Manager",
    client: "InnovateLtd",
    status: "Joined",
    appliedDate: "2025-08-10",
    lastUpdated: "2025-10-01",
    recruiter: "1",
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: "alice@example.com",
    job_title: "Data Analyst",
    client: "DataVision",
    status: "InterviewStage",
    appliedDate: "2025-09-20",
    lastUpdated: "2025-09-28",
    recruiter: "2",
  },
  {
    id: "4",
    name: "Bob Wilson",
    email: "bob@example.com",
    job_title: "UX Designer",
    client: "DesignHub",
    status: "Shortlisted",
    appliedDate: "2025-09-25",
    lastUpdated: "2025-09-27",
    recruiter: "2",
  },
  {
    id: "5",
    name: "Emma Brown",
    email: "emma@example.com",
    job_title: "DevOps Engineer",
    client: "CloudSys",
    status: "Offered",
    appliedDate: "2025-08-15",
    lastUpdated: "2025-09-30",
    recruiter: "3",
  },
  {
    id: "6",
    name: "Michael Lee",
    email: "michael@example.com",
    job_title: "Software Engineer",
    client: "TechCorp",
    status: "Tagged",
    appliedDate: "2025-09-18",
    lastUpdated: "2025-09-22",
    recruiter: "1",
  },
  {
    id: "7",
    name: "Sarah Davis",
    email: "sarah@example.com",
    job_title: "Marketing Manager",
    client: "InnovateLtd",
    status: "OfferRejected",
    appliedDate: "2025-08-20",
    lastUpdated: "2025-09-05",
    recruiter: "2",
  },
  {
    id: "8",
    name: "David Miller",
    email: "david@example.com",
    job_title: "Data Scientist",
    client: "DataVision",
    status: "AssessmentStage",
    appliedDate: "2025-09-22",
    lastUpdated: "2025-09-29",
    recruiter: "3",
  },
  {
    id: "9",
    name: "Laura Taylor",
    email: "laura@example.com",
    job_title: "Product Manager",
    client: "TechCorp",
    status: "AssessmentStage",
    appliedDate: "2025-09-12",
    lastUpdated: "2025-09-25",
    recruiter: "1",
  },
  {
    id: "10",
    name: "James White",
    email: "james@example.com",
    job_title: "Software Engineer",
    client: "CloudSys",
    status: "Rejected",
    appliedDate: "2025-08-05",
    lastUpdated: "2025-09-28",
    recruiter: "3",
  },
];

const dummyJobs: JobOpening[] = [
  {
    id: "1",
    title: "Software Engineer",
    client: "TechCorp",
    location: "Bangalore",
    status: "Open",
    positions: 3,
    createdDate: "2025-08-01",
    recruiter: "1",
  },
  {
    id: "2",
    title: "Product Manager",
    client: "InnovateLtd",
    location: "Mumbai",
    status: "Open",
    positions: 2,
    createdDate: "2025-08-05",
    recruiter: "1",
  },
  {
    id: "3",
    title: "Data Analyst",
    client: "DataVision",
    location: "Delhi",
    status: "Open",
    positions: 1,
    createdDate: "2025-08-10",
    recruiter: "2",
  },
  {
    id: "4",
    title: "UX Designer",
    client: "DesignHub",
    location: "Pune",
    status: "Offered",
    positions: 1,
    createdDate: "2025-08-15",
    recruiter: "2",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    client: "CloudSys",
    location: "Hyderabad",
    status: "Joined",
    positions: 2,
    createdDate: "2025-07-20",
    recruiter: "3",
  },
];

const monthlyMetrics: MetricData[] = [
  { month: "Jul", tagged: 45, interviews: 32, offers: 18, joined: 12 },
  { month: "Aug", tagged: 52, interviews: 38, offers: 22, joined: 15 },
  { month: "Sep", tagged: 65, interviews: 45, offers: 28, joined: 19 },
  { month: "Oct", tagged: 38, interviews: 25, offers: 15, joined: 8 },
];

export default function ManagerDashboard() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string>("All");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("4"); // "4" represents "All Recruiters"
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month");

  const clients = useMemo(
    () => ["All", ...Array.from(new Set(dummyJobs.map((j) => j.client)))],
    []
  );

  // Filter data based on selected client and recruiter
  const filteredApplicants = useMemo(() => {
    let filtered = dummyApplicants;
    
    if (selectedClient !== "All") {
      filtered = filtered.filter((a) => a.client === selectedClient);
    }
    
    if (selectedRecruiter !== "4") { // "4" is the ID for "All Recruiters"
      filtered = filtered.filter((a) => a.recruiter === selectedRecruiter);
    }
    
    return filtered;
  }, [selectedClient, selectedRecruiter]);

  const filteredJobs = useMemo(() => {
    let filtered = dummyJobs;
    
    if (selectedClient !== "All") {
      filtered = filtered.filter((j) => j.client === selectedClient);
    }
    
    if (selectedRecruiter !== "4") {
      filtered = filtered.filter((j) => j.recruiter === selectedRecruiter);
    }
    
    return filtered;
  }, [selectedClient, selectedRecruiter]);

  // Get current recruiter name for display
  const currentRecruiterName = useMemo(() => {
    if (selectedRecruiter === "4") return "All Recruiters";
    return recruiters.find(r => r.id === selectedRecruiter)?.name || "Recruiter";
  }, [selectedRecruiter]);

  const activeClients = useMemo(() => {
    const clientsWithOpenJobs = new Set(
      dummyJobs.filter((j) => j.status === "Open").map((j) => j.client)
    );
    return clientsWithOpenJobs.size;
  }, []);

  // Team performance metrics
  const teamMetrics = useMemo(() => {
    const totalRecruiters = selectedRecruiter === "4" ? recruiters.length - 1 : 1; // Exclude "All Recruiters"
    const totalApplicants = filteredApplicants.length;
    const totalJobs = filteredJobs.length;
    const openPositions = filteredJobs.filter(j => j.status === "Open").length;
    const joined = filteredApplicants.filter(a => a.status === "Joined").length;
    
    return {
      totalRecruiters,
      totalApplicants,
      totalJobs,
      openPositions,
      joined,
      avgApplicantsPerRecruiter: totalRecruiters > 0 ? Math.round(totalApplicants / totalRecruiters) : 0,
    };
  }, [filteredApplicants, filteredJobs, selectedRecruiter]);

  const kpiMetrics = useMemo(() => {
    const total = filteredApplicants.length;
    const tagged = filteredApplicants.filter(
      (a) => a.status === "Tagged"
    ).length;
    const interviews = filteredApplicants.filter(
      (a) => a.status === "InterviewStage"
    ).length;
    const offered = filteredApplicants.filter(
      (a) => a.status === "Offered"
    ).length;
    const joined = filteredApplicants.filter(
      (a) => a.status === "Joined"
    ).length;
    return {
      totalApplicants: total,
      taggedToInterview:
        tagged > 0 ? ((interviews / tagged) * 100).toFixed(1) : "0",
      interviewToOffer:
        interviews > 0 ? ((offered / interviews) * 100).toFixed(1) : "0",
      offerToJoin: offered > 0 ? ((joined / offered) * 100).toFixed(1) : "0",
    };
  }, [filteredApplicants]);

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(
      "Name,Email,Job Title,Client,Status,Applied Date,Last Updated,Recruiter"
    );
    filteredApplicants.forEach((a) => {
      const recruiterName = recruiters.find(r => r.id === a.recruiter)?.name || "Unknown";
      csvRows.push(
        `${a.name},${a.email},${a.job_title},${a.client},${a.status},${a.appliedDate},${a.lastUpdated},${recruiterName}`
      );
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manager-dashboard-${selectedClient}-${currentRecruiterName}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const candidateStatusOrder = [
    "Applied",
    "Tagged",
    "Shortlisted",
    "AssessmentStage",
    "InterviewStage",
    "Offered",
    "OfferRejected",
    "Rejected",
    "Joined",
  ];

  const candidatePipelineData = useMemo(() => {
    const clientGroups =
      selectedClient === "All"
        ? clients.filter((c) => c !== "All")
        : [selectedClient];
    const colors = [
      "#E0E7FF",
      "#C7D2FE",
      "#A5B4FC",
      "#FBBF24",
      "#818CF8",
      "#6366F1",
      "#F59E0B",
      "#EF4444",
      "#10B981",
    ];
    return {
      labels: clientGroups,
      datasets: candidateStatusOrder.map((status, idx) => ({
        label: status
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        data: clientGroups.map((client) => {
          let clientApplicants = dummyApplicants.filter(
            (a) => a.client === client
          );
          
          if (selectedRecruiter !== "4") {
            clientApplicants = clientApplicants.filter(a => a.recruiter === selectedRecruiter);
          }
          
          return clientApplicants.filter((a) => a.status === status).length;
        }),
        backgroundColor: colors[idx % colors.length],
        borderColor: "#FFFFFF",
        borderWidth: 1,
      })),
    };
  }, [selectedClient, selectedRecruiter, clients]);

  const funnelStages = [
    "Tagged",
    "Shortlisted",
    "AssessmentStage",
    "InterviewStage",
    "Offered",
    "OfferRejected",
    "Rejected",
    "Joined",
  ];

  const funnelData = useMemo(() => {
    return {
      labels: funnelStages.map((s) =>
        s
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .replace("Stage", " Stage")
      ),
      datasets: [
        {
          label: "Candidates",
          data: funnelStages.map(
            (stage) =>
              filteredApplicants.filter((a) => a.status === stage).length
          ),
          backgroundColor: [
            "#E0E7FF",
            "#C7D2FE",
            "#A5B4FC",
            "#FBBF24",
            "#818CF8",
            "#F59E0B",
            "#EF4444",
            "#10B981",
          ],
          borderColor: "#FFFFFF",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [filteredApplicants]);

  const jobStatusData = useMemo(() => {
    const statusCounts = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      labels: ["Open", "Offered", "Joined", "Cancelled"],
      datasets: [
        {
          data: [
            statusCounts["Open"] || 0,
            statusCounts["Offered"] || 0,
            statusCounts["Joined"] || 0,
            statusCounts["Cancelled"] || 0,
          ],
          backgroundColor: ["#6366F1", "#F59E0B", "#10B981", "#EF4444"],
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [filteredJobs]);

  // Recruiter performance data
  const recruiterPerformanceData = useMemo(() => {
    const recruiterList = selectedRecruiter === "4" 
      ? recruiters.filter(r => r.id !== "4") // Show all recruiters except "All"
      : recruiters.filter(r => r.id === selectedRecruiter); // Show only selected recruiter

    return {
      labels: recruiterList.map(r => r.name),
      datasets: [
        {
          label: "Candidates Joined",
          data: recruiterList.map(recruiter => 
            filteredApplicants.filter(a => a.recruiter === recruiter.id && a.status === "Joined").length
          ),
          backgroundColor: "#10B981",
          borderColor: "#10B981",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Offers Made",
          data: recruiterList.map(recruiter => 
            filteredApplicants.filter(a => a.recruiter === recruiter.id && a.status === "Offered").length
          ),
          backgroundColor: "#F59E0B",
          borderColor: "#F59E0B",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Active Candidates",
          data: recruiterList.map(recruiter => 
            filteredApplicants.filter(a => 
              a.recruiter === recruiter.id && 
              !["Rejected", "OfferRejected", "Joined"].includes(a.status)
            ).length
          ),
          backgroundColor: "#6366F1",
          borderColor: "#6366F1",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [filteredApplicants, selectedRecruiter]);

  const trendData = useMemo(
    () => ({
      labels: monthlyMetrics.map((m) => m.month),
      datasets: [
        {
          label: "Tagged",
          data: monthlyMetrics.map((m) => m.tagged),
          borderColor: "#6366F1",
          backgroundColor: "rgba(99,102,241,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#6366F1",
        },
        {
          label: "Interviews",
          data: monthlyMetrics.map((m) => m.interviews),
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245,158,11,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#F59E0B",
        },
        {
          label: "Offers",
          data: monthlyMetrics.map((m) => m.offers),
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139,92,246,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#8B5CF6",
        },
        {
          label: "Joined",
          data: monthlyMetrics.map((m) => m.joined),
          borderColor: "#10B981",
          backgroundColor: "rgba(16,185,129,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#10B981",
        },
      ],
    }),
    []
  );

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
    if (target) target.style.cursor = elements[0] ? "pointer" : "default";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Manager Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Team performance overview and analytics
            </p>
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

        {/* Filters */}
        <section className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">
                Filters:
              </span>
            </div>

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white"
            >
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>

            <select
              value={selectedRecruiter}
              onChange={(e) => setSelectedRecruiter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white"
            >
              {recruiters.map((recruiter) => (
                <option key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 ml-auto">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-md">
                {(["week", "month", "year"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setTimePeriod(period)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      timePeriod === period
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Overview KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={<Building2 className="h-4 w-4" />}
            value={activeClients}
            label="Active Clients"
            color="violet"
          />
          <KpiCard
            icon={<Users className="h-4 w-4" />}
            value={teamMetrics.totalRecruiters}
            label="Active Recruiters"
            color="indigo"
          />
          <KpiCard
            icon={<Briefcase className="h-4 w-4" />}
            value={teamMetrics.openPositions}
            label="Open Positions"
            color="amber"
          />
          <KpiCard
            icon={<Briefcase className="h-4 w-4" />}
            value={teamMetrics.totalApplicants}
            label="Total Cv Uploaded"
            color="amber"
          />
          <KpiCard
            icon={<UserCheck className="h-4 w-4" />}
            value={teamMetrics.joined}
            label="Successfully Joined"
            trend="+3.2%"
            color="emerald"
          />
        </section>

        {/* Main Charts */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Trends Chart */}
          <div className="xl:col-span-2 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader
              title="Team Recruitment Trends"
              subtitle={`Monthly performance for ${currentRecruiterName}`}
            />
            <div className="h-64 mt-3">
              <Line
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
                      labels: {
                        padding: 8,
                        font: { size: 11 },
                        usePointStyle: true,
                        pointStyle: "circle",
                        color: "#475569",
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        font: { size: 10 },
                        color: "#64748b",
                      },
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: {
                        font: { size: 10 },
                        color: "#64748b",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Job Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <SectionHeader
                title="Job Status Distribution"
                subtitle={`For ${currentRecruiterName}`}
              />
              <div className="bg-yellow-100 text-slate-700 text-xs px-3 py-2 rounded">
                <p>Total Jobs: {filteredJobs.length}</p>
                <p>
                  Open: {filteredJobs.filter((j) => j.status === "Open").length}
                </p>
                <p>
                  Offered:{" "}
                  {filteredJobs.filter((j) => j.status === "Offered").length}
                </p>
                <p>
                  Joined:{" "}
                  {filteredJobs.filter((j) => j.status === "Joined").length}
                </p>
              </div>
            </div>

            <div className="h-64 flex items-center justify-center cursor-pointer mt-2">
              <Doughnut
                data={jobStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const dataset = context.dataset.data as number[];
                          const total = dataset.reduce(
                            (acc, curr) => acc + curr,
                            0
                          );
                          const value = context.parsed;
                          const percentage =
                            total > 0
                              ? ((value / total) * 100).toFixed(1)
                              : "0";
                          return `${context.label}: ${percentage}%`;
                        },
                      },
                    },
                    legend: {
                      position: "bottom",
                      labels: { usePointStyle: true, pointStyle: "circle" },
                    },
                  },
                  onClick: (event, elements) => {
                    handleJobStatusClick(elements);
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Pipeline Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <SectionHeader
                title="Candidate Pipeline"
                subtitle={`By client and status for ${currentRecruiterName}`}
              />
              <div className="bg-yellow-100 text-slate-700 text-xs px-3 py-2 rounded">
                <p>Total Candidates: {filteredApplicants.length}</p>
                <p>
                  Assessment:{" "}
                  {
                    filteredApplicants.filter(
                      (a) => a.status === "AssessmentStage"
                    ).length
                  }
                </p>
                <p>
                  Interviews:{" "}
                  {
                    filteredApplicants.filter(
                      (a) => a.status === "InterviewStage"
                    ).length
                  }
                </p>
                <p>
                  Offers:{" "}
                  {
                    filteredApplicants.filter((a) => a.status === "Offered")
                      .length
                  }
                </p>
              </div>
            </div>

            <div className="h-64 cursor-pointer mt-2">
              <Bar
                data={candidatePipelineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        padding: 10,
                        font: { size: 11 },
                        usePointStyle: true,
                        pointStyle: "circle",
                        color: "#475569",
                      },
                    },
                  },
                  scales: {
                    x: {
                      stacked: true,
                      grid: { display: false },
                      border: { display: false },
                      ticks: {
                        font: { size: 10 },
                        color: "#64748b",
                      },
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        stepSize: 1,
                        font: { size: 10 },
                        color: "#64748b",
                      },
                    },
                  },
                  onClick: (_, elements) =>
                    handleCandidatePipelineClick(elements),
                  onHover: chartHover,
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center">
              <SectionHeader
                title="Recruitment Funnel"
                subtitle={`Stage-wise breakdown for ${currentRecruiterName}`}
              />
              <div className="bg-yellow-100 text-slate-700 text-sm px-4 py-2 rounded">
                <p>Conversion Rate: {kpiMetrics.offerToJoin}%</p>
                <p>
                  Total Joined:{" "}
                  {
                    filteredApplicants.filter((a) => a.status === "Joined")
                      .length
                  }
                </p>
              </div>
            </div>

            <div className="h-64 mt-4">
              <Bar
                data={funnelData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        stepSize: 1,
                        font: { size: 10 },
                        color: "#64748b",
                      },
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: {
                        font: { size: 11 },
                        color: "#475569",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Recruiter Performance Chart */}
        <section className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <SectionHeader
            title="Recruiter Performance"
            subtitle="Key metrics comparison across recruiters"
          />
          <div className="h-64 mt-4">
            <Bar
              data={recruiterPerformanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      padding: 8,
                      font: { size: 11 },
                      usePointStyle: true,
                      pointStyle: "circle",
                      color: "#475569",
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                      font: { size: 10 },
                      color: "#64748b",
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f1f5f9" },
                    border: { display: false },
                    ticks: {
                      stepSize: 1,
                      font: { size: 10 },
                      color: "#64748b",
                    },
                  },
                },
              }}
            />
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
  color: "indigo" | "amber" | "emerald" | "violet";
}

function KpiCard({ icon, value, label, trend, color }: CardProps) {
  const colorStyles = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
  };

  return (
    <div className="group bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <div
          className={`w-8 h-8 rounded-lg ${colorStyles[color].bg} flex items-center justify-center ${colorStyles[color].text}`}
        >
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