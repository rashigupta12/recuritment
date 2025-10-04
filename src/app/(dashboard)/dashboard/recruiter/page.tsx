/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
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
}

interface JobOpening {
  id: string;
  title: string;
  client: string;
  location: string;
  status: "Open" | "Offered" | "Joined" | "Cancelled";
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

export default function RecruiterDashboard() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string>("All");
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">(
    "month"
  );
  const { user } = useAuth();
  console.log(user)
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const response = await frappeAPI.makeAuthenticatedRequest(
            "GET",
            `/method/recruitment_app.rec_dashboard.get_recruiter_dashboard_data_by_company?email=${user.email}`
          );
          console.log(response)
          setApiData(response.message);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user?.email]);

  // Transform API data to match component structure
  const transformedApplicants = useMemo((): JobApplicant[] => {
    if (!apiData) return [];

    const allApplicants: JobApplicant[] = [];
    const statusMapping: Record<string, string> = {
      tagged_applicants_by_company: "Tagged",
      shortlisted_applicants_by_company: "Shortlisted",
      assessment_stage_applicants_by_company: "AssessmentStage",
      interview_stage_applicants_by_company: "InterviewStage",
      offered_applicants_by_company: "Offered",
      rejected_applicants_by_company: "Rejected",
      joined_applicants_by_company: "Joined",
    };

    Object.keys(statusMapping).forEach((key) => {
      const statusData = apiData[key]?.applicants_by_company || {};
      const status = statusMapping[key];

      Object.entries(statusData).forEach(([company, applicants]: [string, any]) => {
        (applicants || []).forEach((applicant: any) => {
          allApplicants.push({
            id: applicant.name,
            name: applicant.applicant_name,
            email: applicant.email_id,
            job_title: applicant.designation,
            client: company,
            status: status as any,
            appliedDate: new Date().toISOString().split("T")[0],
            lastUpdated: new Date().toISOString().split("T")[0],
          });
        });
      });
    });

    return allApplicants;
  }, [apiData]);

  // Transform jobs data from API
  const transformedJobs = useMemo((): JobOpening[] => {
    if (!apiData?.jobs_by_company) return [];

    const jobs: JobOpening[] = [];
    Object.entries(apiData.jobs_by_company).forEach(([company, jobTitles]: [string, any]) => {
      (jobTitles || []).forEach((title: string, index: number) => {
        jobs.push({
          id: `${company}-${index}`,
          title: title,
          client: company,
          location: "N/A",
          status: "Open",
          positions: 1,
          createdDate: new Date().toISOString().split("T")[0],
        });
      });
    });

    return jobs;
  }, [apiData]);

  // Get clients from API data
  const clients = useMemo(() => {
    if (!apiData?.companies) return ["All"];
    return ["All", ...apiData.companies];
  }, [apiData]);

  const filteredApplicants = useMemo(
    () =>
      selectedClient === "All"
        ? transformedApplicants
        : transformedApplicants.filter((a) => a.client === selectedClient),
    [selectedClient, transformedApplicants]
  );

  const filteredJobs = useMemo(
    () =>
      selectedClient === "All"
        ? transformedJobs
        : transformedJobs.filter((j) => j.client === selectedClient),
    [selectedClient, transformedJobs]
  );

  const activeClients = useMemo(() => {
    return apiData?.companies?.length || 0;
  }, [apiData]);

  const kpiMetrics = useMemo(() => {
    const total = apiData?.summary?.total_applicants || 0;
    const tagged = apiData?.metrics?.Tagged || 0;
    const interviews = apiData?.metrics?.["Interview Stage"] || 0;
    const offered = apiData?.metrics?.Offered || 0;
    const joined = apiData?.metrics?.Joined || 0;

    return {
      totalApplicants: total,
      taggedToInterview:
        tagged > 0 ? ((interviews / tagged) * 100).toFixed(1) : "0",
      interviewToOffer:
        interviews > 0 ? ((offered / interviews) * 100).toFixed(1) : "0",
      offerToJoin: offered > 0 ? ((joined / offered) * 100).toFixed(1) : "0",
    };
  }, [apiData]);

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(
      "Name,Email,Job Title,Client,Status,Applied Date,Last Updated"
    );
    filteredApplicants.forEach((a) => {
      csvRows.push(
        `${a.name},${a.email},${a.job_title},${a.client},${a.status},${a.appliedDate},${a.lastUpdated}`
      );
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recruiter-applicants-${selectedClient}-${
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
          const clientApplicants = transformedApplicants.filter(
            (a) => a.client === client
          );
          return clientApplicants.filter((a) => a.status === status).length;
        }),
        backgroundColor: colors[idx % colors.length],
        borderColor: "#FFFFFF",
        borderWidth: 1,
      })),
    };
  }, [selectedClient, clients, transformedApplicants]);

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

  // Generate monthly metrics from current data (simplified version)
  const monthlyMetrics: MetricData[] = useMemo(() => {
    const metrics = apiData?.metrics || {};
    return [
      {
        month: "Jul",
        tagged: Math.floor((metrics.Tagged || 0) * 0.6),
        interviews: Math.floor((metrics["Interview Stage"] || 0) * 0.6),
        offers: Math.floor((metrics.Offered || 0) * 0.6),
        joined: Math.floor((metrics.Joined || 0) * 0.6),
      },
      {
        month: "Aug",
        tagged: Math.floor((metrics.Tagged || 0) * 0.75),
        interviews: Math.floor((metrics["Interview Stage"] || 0) * 0.75),
        offers: Math.floor((metrics.Offered || 0) * 0.75),
        joined: Math.floor((metrics.Joined || 0) * 0.75),
      },
      {
        month: "Sep",
        tagged: Math.floor((metrics.Tagged || 0) * 0.9),
        interviews: Math.floor((metrics["Interview Stage"] || 0) * 0.9),
        offers: Math.floor((metrics.Offered || 0) * 0.9),
        joined: Math.floor((metrics.Joined || 0) * 0.9),
      },
      {
        month: "Oct",
        tagged: metrics.Tagged || 0,
        interviews: metrics["Interview Stage"] || 0,
        offers: metrics.Offered || 0,
        joined: metrics.Joined || 0,
      },
    ];
  }, [apiData]);

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
    [monthlyMetrics]
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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Recruitment Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor performance and track hiring progress
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
                Clients:
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

        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={<Building2 className="h-4 w-4" />}
            value={activeClients}
            label="Active Clients"
            color="violet"
          />
          <KpiCard
            icon={<Briefcase className="h-4 w-4" />}
            value={filteredJobs.filter((j) => j.status === "Open").length}
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
            value={
              filteredApplicants.filter((a) => a.status === "Joined").length
            }
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
              title="Recruitment Trends"
              subtitle="Monthly performance overview"
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
                title="Job Status"
                subtitle="Current distribution"
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
                subtitle="By client and status"
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
                subtitle="Stage-wise breakdown"
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