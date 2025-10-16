/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import {
  ArcElement,
  BarElement,
  CategoryScale,
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
  phone: string;
  job_title: string;
  client: string;
  status: string;
  appliedDate: string;
  lastUpdated: string;
  recruiter: string;
}

interface JobOpening {
  id: string;
  title: string;
  client: string;
  location: string;
  status: string;
  positions: number;
  createdDate: string;
  recruiter: string;
}

interface MetricData {
  month: string;
  totalCVUploaded: number;
  open: number;
  tagged: number;
  shortlisted: number;
  assessment: number;
  interview: number;
  offered: number;
  joined: number;
}

interface Recruiter {
  id: string;
  name: string;
  email: string;
}

interface RecruiterPerformance {
  recruiter_name: string;
  recruiter_id: string;
  open: number;
  tagged: number;
  shortlisted: number;
  assessment: number;
  interview: number;
  offered: number;
  joined: number;
  total_applicants: number;
}

interface DashboardData {
  success: boolean;
  clients: string[];
  recruiters: Recruiter[];
  team_metrics: {
    totalRecruiters: number;
    totalApplicants: number;
    totalJobs: number;
    openPositions: number;
    joined: number;
  };
  funnel_data: {
    labels: string[];
    data: number[];
  };
  job_status_data: {
    labels: string[];
    data: number[];
  };
  monthly_trends: MetricData[];
  recruiter_performance: RecruiterPerformance[];
  applicants: JobApplicant[];
  jobs: JobOpening[];
}

const API_BASE_URL =
  "/method/recruitment_app.project_manager.get_manager_dashboard_data";

export default function ManagerDashboard() {
  const [selectedClient, setSelectedClient] = useState<string>("All");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("All");
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "quarter">(
    "month"
  );
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
 const fetchDashboardData = async () => {
  setLoading(true);
  setError(null);

  try {
    const params = new URLSearchParams();

    if (selectedClient !== "All") {
      params.append("client", selectedClient);
    }

    if (selectedRecruiter !== "All") {
      params.append("recruiter", selectedRecruiter);
    }

    params.append("time_period", timePeriod);

    const url = `${API_BASE_URL}?${params.toString()}`;
    
    console.log("Fetching from URL:", url);
    
    // Assuming frappeAPI returns data directly
    const result = await frappeAPI.makeAuthenticatedRequest("GET", url);

    console.log("API Result:", result);

    if (result && result.message && result.message.success) {
      setDashboardData(result.message);
    } else {
      throw new Error(result?.message?.error || "Invalid API response");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
    setError(errorMessage);
    console.error("Error fetching dashboard data:", err);
  } finally {
    setLoading(false);
  }
};
  // Fetch data when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [selectedClient, selectedRecruiter, timePeriod]);

  const clients = useMemo(() => {
    return dashboardData?.clients || ["All Clients"];
  }, [dashboardData]);

  const recruiters = useMemo(() => {
    if (!dashboardData?.recruiters) return [];
    return [
      { id: "All", name: "All Recruiters", email: "all@company.com" },
      ...dashboardData.recruiters,
    ];
  }, [dashboardData]);

  const currentRecruiterName = useMemo(() => {
    if (selectedRecruiter === "All") return "All Recruiters";
    return (
      recruiters.find((r) => r.id === selectedRecruiter)?.name || "Recruiter"
    );
  }, [selectedRecruiter, recruiters]);

  const activeClients = useMemo(() => {
    return clients.filter((c) => c !== "All").length;
  }, [clients]);

  const teamMetrics = useMemo(() => {
    if (!dashboardData) {
      return {
        totalRecruiters: 0,
        totalApplicants: 0,
        totalJobs: 0,
        openPositions: 0,
        joined: 0,
      };
    }
    return dashboardData.team_metrics;
  }, [dashboardData]);

  const exportCSV = () => {
    if (!dashboardData?.applicants) return;

    const csvRows = [];
    csvRows.push(
      "Name,Email,Phone,Job Title,Client,Status,Applied Date,Last Updated,Recruiter"
    );

    dashboardData.applicants.forEach((a) => {
      const recruiterName =
        recruiters.find((r) => r.id === a.recruiter)?.name || "Unknown";
      csvRows.push(
        `${a.name},${a.email},${a.phone},${a.job_title},${a.client},${a.status},${a.appliedDate},${a.lastUpdated},${recruiterName}`
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

  const funnelData = useMemo(() => {
    if (!dashboardData?.funnel_data) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: dashboardData.funnel_data.labels,
      datasets: [
        {
          label: "Candidates",
          data: dashboardData.funnel_data.data,
          backgroundColor: [
            "#6366F1",
            "#94A3B8",
            "#E0E7FF",
            "#C7D2FE",
            "#A5B4FC",
            "#FBBF24",
            "#818CF8",
            "#8B5CF6",
            "#F59E0B",
            "#10B981",
          ],
          borderColor: "#FFFFFF",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [dashboardData]);

  const jobStatusData = useMemo(() => {
    if (!dashboardData?.job_status_data) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: dashboardData.job_status_data.labels,
      datasets: [
        {
          data: dashboardData.job_status_data.data,
          backgroundColor: ["#6366F1", "#F59E0B", "#10B981", "#EF4444"],
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [dashboardData]);

  const recruiterPerformanceData = useMemo(() => {
    if (!dashboardData?.recruiter_performance) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const performanceData = dashboardData.recruiter_performance;

    return {
      labels: performanceData.map((r) => r.recruiter_name),
      datasets: [
        {
          label: "Candidates Joined",
          data: performanceData.map((r) => r.joined),
          backgroundColor: "#10B981",
          borderColor: "#10B981",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Offers Made",
          data: performanceData.map((r) => r.offered),
          backgroundColor: "#F59E0B",
          borderColor: "#F59E0B",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "In Interview",
          data: performanceData.map((r) => r.interview),
          backgroundColor: "#6366F1",
          borderColor: "#6366F1",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [dashboardData]);

  const trendData = useMemo(() => {
    if (!dashboardData?.monthly_trends) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const monthlyMetrics = dashboardData.monthly_trends;

    return {
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
          label: "Open",
          data: monthlyMetrics.map((m) => m.open),
          borderColor: "#94A3B8",
          backgroundColor: "rgba(148,163,184,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#94A3B8",
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
          data: monthlyMetrics.map((m) => m.assessment),
          borderColor: "#FBBF24",
          backgroundColor: "rgba(251,191,36,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#FBBF24",
        },
        {
          label: "Interview",
          data: monthlyMetrics.map((m) => m.interview),
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245,158,11,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#F59E0B",
        },
        {
          label: "Offered",
          data: monthlyMetrics.map((m) => m.offered),
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
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

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
             className="px-3 py-1.5 border border-slate-200 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white min-w-[150px] max-w-[150px] transition-all duration-200"
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
            <div className="h-80 mt-4 overflow-hidden">
              {/* <Bar
                data={funnelData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  layout: {
                    padding: { left: 10, right: 10, top: 0, bottom: 0 },
                  },
                  plugins: {
                    legend: { display: false },
                    datalabels: {
                      anchor: "end",
                      align: "end",
                      color: "#1e293b",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                      formatter: (value) => (value > 0 ? value : ""),
                    },
                    tooltip: {
                      titleFont: { size: 12 },
                      bodyFont: { size: 12 },
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        font: { size: 12 },
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
              /> */}

              <Bar
                data={funnelData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  layout: {
                    padding: { left: 10, right: 10, top: 0, bottom: 0 },
                  },
                  plugins: {
                    legend: { display: false },
                    datalabels: {
                      anchor: "end",
                      align: "end",
                      color: "#1e293b",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                      formatter: (value) => (value > 0 ? value : ""),
                    },
                    tooltip: {
                      titleFont: { size: 12 },
                      bodyFont: { size: 12 },
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 30,
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        stepSize: 10,
                        font: { size: 12 },
                        color: "#64748b",
                      },
                    },
                    y: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: {
                        font: { size: 11 },
                        color: "#475569",
                        callback: function (
                          value: number | string,
                       
                        ) {
                          // Convert value to number to use as array index
                          const labelIndex = Number(value);
                          const label =
                            funnelData.labels?.[labelIndex]?.toString() || "";
                          if (label.length > 20) {
                            return label.substring(0, 17) + "...";
                          }
                          return label;
                        },
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
        display: true,
        anchor: "end",
        align: "top",
        color: "#1e293b",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value) => (value > 0 ? value : ""),
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
        min: 0,
        max: 30, // Force the scale to show 0-30 range
        ticks: {
          stepSize: 10, // This will create 0, 10, 20, 30
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

function KpiCard({ icon, value, label,  color }: CardProps) {
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
        <div className="flex items-center gap-1 text-5xl font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
          <span>{value}</span>
        </div>
      </div>
      <div>
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
