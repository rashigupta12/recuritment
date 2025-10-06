'use client'
/*eslint-disable @typescript-eslint/no-explicit-any */
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
import ChartDataLabels from "chartjs-plugin-datalabels";
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
import { useEffect, useMemo, useState } from "react";
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
  totalCVUploaded: number;
  tagged: number;
  shortlisted: number;
  assessmentStage: number;
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

// Dummy data for demonstration
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
];

export default function ManagerDashboard() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string>("All");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("4");
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "quarter">("month");
  const [loading, setLoading] = useState(false);

  const clients = useMemo(
    () => ["All", ...Array.from(new Set(dummyJobs.map((j) => j.client)))],
    []
  );

  // Helper function to filter data by time period
  const filterByTimePeriod = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (timePeriod) {
      case "week":
        return diffDays <= 7;
      case "month":
        return diffDays <= 30;
      case "quarter":
        return diffDays <= 90;
      default:
        return true;
    }
  };

  const filteredApplicants = useMemo(() => {
    let filtered = dummyApplicants.filter((a) => filterByTimePeriod(a.appliedDate));
    
    if (selectedClient !== "All") {
      filtered = filtered.filter((a) => a.client === selectedClient);
    }
    
    if (selectedRecruiter !== "4") {
      filtered = filtered.filter((a) => a.recruiter === selectedRecruiter);
    }
    
    return filtered;
  }, [selectedClient, selectedRecruiter, timePeriod]);

  const filteredJobs = useMemo(() => {
    let filtered = dummyJobs.filter((j) => filterByTimePeriod(j.createdDate));
    
    if (selectedClient !== "All") {
      filtered = filtered.filter((j) => j.client === selectedClient);
    }
    
    if (selectedRecruiter !== "4") {
      filtered = filtered.filter((j) => j.recruiter === selectedRecruiter);
    }
    
    return filtered;
  }, [selectedClient, selectedRecruiter, timePeriod]);

  const currentRecruiterName = useMemo(() => {
    if (selectedRecruiter === "4") return "All Recruiters";
    return recruiters.find(r => r.id === selectedRecruiter)?.name || "Recruiter";
  }, [selectedRecruiter]);

  const activeClients = useMemo(() => {
    return clients.filter(c => c !== "All").length;
  }, [clients]);

  const teamMetrics = useMemo(() => {
    const totalRecruiters = selectedRecruiter === "4" ? recruiters.length - 1 : 1;
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
    };
  }, [filteredApplicants, filteredJobs, selectedRecruiter]);

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
    const totalApplicants = filteredApplicants.length;
    const stageData = funnelStages.map(
      (stage) => filteredApplicants.filter((a) => a.status === stage).length
    );

    return {
      labels: [
        "Total CV's Uploaded",
        ...funnelStages.map((s) =>
          s
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .replace("Stage", " Stage")
        ),
      ],
      datasets: [
        {
          label: "Candidates",
          data: [totalApplicants, ...stageData],
          backgroundColor: [
            "#6366F1",
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

  const recruiterPerformanceData = useMemo(() => {
    const recruiterList = selectedRecruiter === "4" 
      ? recruiters.filter(r => r.id !== "4")
      : recruiters.filter(r => r.id === selectedRecruiter);

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

  const monthlyMetrics: MetricData[] = useMemo(() => {
    const monthLabels =
      timePeriod === "week"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : timePeriod === "month"
        ? ["Week 1", "Week 2", "Week 3", "Week 4"]
        : ["Month 1", "Month 2", "Month 3"];

    const getStatusCount = (status: string) => {
      return filteredApplicants.filter((a) => a.status === status).length;
    };

    const totalCVCount = filteredApplicants.length;
    const taggedCount = getStatusCount("Tagged");
    const shortlistedCount = getStatusCount("Shortlisted");
    const assessmentCount = getStatusCount("AssessmentStage");
    const interviewCount = getStatusCount("InterviewStage");
    const offeredCount = getStatusCount("Offered");
    const joinedCount = getStatusCount("Joined");

    return monthLabels.map((label, index) => {
      const factor = (index + 1) / monthLabels.length;
      return {
        month: label,
        totalCVUploaded: Math.floor(totalCVCount * factor),
        tagged: Math.floor(taggedCount * factor),
        shortlisted: Math.floor(shortlistedCount * factor),
        assessmentStage: Math.floor(assessmentCount * factor),
        interviews: Math.floor(interviewCount * factor),
        offers: Math.floor(offeredCount * factor),
        joined: Math.floor(joinedCount * factor),
      };
    });
  }, [filteredApplicants, timePeriod]);

  const trendData = useMemo(
    () => ({
      labels: monthlyMetrics.map((m) => m.month),
      datasets: [
        {
          label: "Total CV's Uploaded",
          data: monthlyMetrics.map((m) => m.totalCVUploaded),
          borderColor: "#ec4899",
          backgroundColor: "rgba(236,72,153,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#ec4899",
        },
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
          label: "Shortlisted",
          data: monthlyMetrics.map((m) => m.shortlisted),
          borderColor: "#A5B4FC",
          backgroundColor: "rgba(165,180,252,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#A5B4FC",
        },
        {
          label: "Assessment",
          data: monthlyMetrics.map((m) => m.assessmentStage),
          borderColor: "#FBBF24",
          backgroundColor: "rgba(251,191,36,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#FBBF24",
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
    [monthlyMetrics]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Manager Dashboard
            </h1>
            <p className="text-md text-slate-500 mt-0.5">
              Team performance overview and analytics
            </p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-all text-md font-medium"
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
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-md font-medium text-slate-600">
                Filters:
              </span>
            </div>

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white"
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
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white"
            >
              {recruiters.map((recruiter) => (
                <option key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 ml-auto">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-md">
                {(["week", "month", "quarter"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setTimePeriod(period)}
                    className={`px-2 py-1 rounded text-md font-medium transition-all ${
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
          {/* <KpiCard
            icon={<Briefcase className="h-4 w-4" />}
            value={teamMetrics.openPositions}
            label="Open Positions"
            color="amber"
          /> */}
          <KpiCard
            icon={<Briefcase className="h-4 w-4" />}
            value={teamMetrics.totalApplicants}
            label="Total CV's Uploaded"
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
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Applicant Funnel */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader
              title="Recruitment Funnel"
              subtitle={`Stage-wise breakdown for ${currentRecruiterName}`}
            />
            <div className="h-64 mt-4">
              <Bar
                data={funnelData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  plugins: {
                    legend: { display: false },
                    datalabels: {
                      anchor: "end",
                      align: "end",
                      color: "#1e293b",
                      font: {
                        weight: "bold",
                        size: 14,
                      },
                      formatter: (value) => (value > 0 ? value : ""),
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        stepSize: 10,
                        font: { size: 14 },
                        color: "#64748b",
                      },
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: {
                        font: { size: 14 },
                        color: "#475569",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Job Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader
              title="Job Status Distribution"
              subtitle={`For ${currentRecruiterName}`}
            />
            <div className="h-64 flex items-center justify-center cursor-pointer mt-2">
              <Doughnut
                data={jobStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    datalabels: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.parsed;
                          return `${context.label}: ${value}`;
                        },
                      },
                    },
                    legend: {
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: { size: 14 },
                        padding: 24,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Recruitment Trends */}
        <section className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
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
                    datalabels: {
                      display: true,
                      align: "top",
                      anchor: "end",
                      color: "#1e293b",
                      font: {
                        weight: "bold",
                        size: 10,
                      },
                      formatter: (value, context) => {
                        const datasetLength = context.dataset.data.length;
                        return context.dataIndex === datasetLength - 1 &&
                          value > 0
                          ? value
                          : "";
                      },
                    },
                    legend: {
                      display: true,
                      position: "top",
                      labels: {
                        padding: 24,
                        font: { size: 14 },
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
                        stepSize: 10,
                        font: { size: 14 },
                        color: "#64748b",
                      },
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: {
                        font: { size: 14 },
                        color: "#64748b",
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
                      font: { size: 14 },
                      usePointStyle: true,
                      pointStyle: "circle",
                      color: "#475569",
                    },
                  },
                  datalabels: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                      font: { size: 14 },
                      color: "#64748b",
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f1f5f9" },
                    border: { display: false },
                    ticks: {
                      stepSize: 1,
                      font: { size: 14 },
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

        <div className="flex items-center gap-1  text-5xl font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
          <span>{value}</span>
        </div>
      </div>
      <div className="">
        <p className="text-md text-slate-500 font-medium">{label}</p>
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
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-md text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
