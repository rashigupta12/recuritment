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
import ChartDataLabels from "chartjs-plugin-datalabels";

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
    | "InterviewRejected"
    | "Offered"
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
  totalCVUploaded: number;
  tagged: number;
  shortlisted: number;
  assessmentStage: number;
  interviews: number;
  interviewRejected: number; // Added
  offers: number;
  joined: number;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string>("All");
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "quarter">("month");
  const { user } = useAuth();
  console.log(user);
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
          console.log(response);
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

  // Transform API data to match component structure
  const transformedApplicants = useMemo((): JobApplicant[] => {
    if (!apiData) return [];

    const allApplicants: JobApplicant[] = [];
    const statusMapping: Record<string, string> = {
      tagged_applicants_by_company: "Tagged",
      shortlisted_applicants_by_company: "Shortlisted",
      assessment_stage_applicants_by_company: "AssessmentStage",
      interview_stage_applicants_by_company: "InterviewStage",
      interview_rejected_applicants_by_company: "InterviewRejected", // Added
      offered_applicants_by_company: "Offered",
      rejected_applicants_by_company: "Rejected",
      joined_applicants_by_company: "Joined",
    };

    Object.keys(statusMapping).forEach((key) => {
      const statusData = apiData[key]?.applicants_by_company || {};
      const status = statusMapping[key];

      Object.entries(statusData).forEach(
        ([company, applicants]: [string, any]) => {
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
        }
      );
    });

    return allApplicants;
  }, [apiData]);

  // Transform jobs data from API
  const transformedJobs = useMemo((): JobOpening[] => {
    if (!apiData?.jobs_by_company) return [];

    const jobs: JobOpening[] = [];
    Object.entries(apiData.jobs_by_company).forEach(
      ([company, jobTitles]: [string, any]) => {
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
      }
    );

    return jobs;
  }, [apiData]);

  // Get clients from API data
  const clients = useMemo(() => {
    if (!apiData?.companies) return ["All"];
    return ["All", ...apiData.companies];
  }, [apiData]);

  const filteredApplicants = useMemo(
    () =>
      (selectedClient === "All"
        ? transformedApplicants
        : transformedApplicants.filter((a) => a.client === selectedClient)
      ).filter((a) => filterByTimePeriod(a.appliedDate)),
    [selectedClient, transformedApplicants, timePeriod]
  );

  const filteredJobs = useMemo(
    () =>
      (selectedClient === "All"
        ? transformedJobs
        : transformedJobs.filter((j) => j.client === selectedClient)
      ).filter((j) => filterByTimePeriod(j.createdDate)),
    [selectedClient, transformedJobs, timePeriod]
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

    // Header row
    csvRows.push(
      "Company Name,Job Title,Open Positions,CV's Uploaded,Tagged,Shortlisted,Assessment Stage,Interview Stage,Interview Rejected,Offered,Rejected,Joined"
    );

    // Group data by company and job title
    const companyData: Record<string, Record<string, any>> = {};

    filteredApplicants.forEach((a) => {
      if (!companyData[a.client]) {
        companyData[a.client] = {};
      }
      if (!companyData[a.client][a.job_title]) {
        companyData[a.client][a.job_title] = {
          cvUploaded: 0,
          tagged: 0,
          shortlisted: 0,
          assessmentStage: 0,
          interviewStage: 0,
          interviewRejected: 0, // Corrected to camelCase
          offered: 0,
          rejected: 0,
          joined: 0,
        };
      }

      companyData[a.client][a.job_title].cvUploaded++;

      const statusKey = a.status.charAt(0).toLowerCase() + a.status.slice(1);
      if (companyData[a.client][a.job_title][statusKey] !== undefined) {
        companyData[a.client][a.job_title][statusKey]++;
      }
    });

    // Add job data
    Object.entries(companyData).forEach(([company, jobs]) => {
      Object.entries(jobs).forEach(([jobTitle, stats]: [string, any]) => {
        const openPositions = filteredJobs.filter(
          (j) =>
            j.client === company && j.title === jobTitle && j.status === "Open"
        ).length;

        csvRows.push(
          `${company},${jobTitle},${openPositions},${stats.cvUploaded},${stats.tagged},${stats.shortlisted},${stats.assessmentStage},${stats.interviewStage},${stats.interviewRejected},${stats.offered},${stats.rejected},${stats.joined}`
        );
      });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recruiter-dashboard-${selectedClient}-${timePeriod}-${
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
    "InterviewRejected",
    "Offered",
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
          const clientApplicants = filteredApplicants.filter(
            (a) => a.client === client
          );
          return clientApplicants.filter((a) => a.status === status).length;
        }),
        backgroundColor: colors[idx % colors.length],
        borderColor: "#FFFFFF",
        borderWidth: 1,
      })),
    };
  }, [selectedClient, clients, filteredApplicants]);

  const funnelStages = [
    "Tagged",
    "Shortlisted",
    "Assessment",
    "Interview",
    "InterviewRejected",
    "Offered",
    "Offer Drop",
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

  // Generate monthly metrics from current data filtered by selected company
  const monthlyMetrics: MetricData[] = useMemo(() => {
    const monthLabels =
      timePeriod === "week"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : timePeriod === "month"
        ? ["Week 1", "Week 2", "Week 3", "Week 4"]
        : ["Month 1", "Month 2", "Month 3"];

    // Get counts for selected company or all companies
    const getStatusCount = (status: string) => {
      return filteredApplicants.filter((a) => a.status === status).length;
    };

    const totalCVCount = filteredApplicants.length;
    const taggedCount = getStatusCount("Tagged");
    const shortlistedCount = getStatusCount("Shortlisted");
    const assessmentCount = getStatusCount("AssessmentStage");
    const interviewCount = getStatusCount("InterviewStage");
    const interviewRejectedCount = getStatusCount("InterviewRejected"); // Added
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
        interviewRejected: Math.floor(interviewRejectedCount * factor), // Added
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
          label: "Interview Rejected",
          data: monthlyMetrics.map((m) => m.interviewRejected),
          borderColor: "#818CF8",
          backgroundColor: "rgba(129,140,248,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#818CF8",
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

  const handleFunnelClick = (elements: any[]) => {
    if (!elements.length) return;
    const clickedIndex = elements[0].index;
    const labels = funnelData.labels;
    console.log("Clicked label:", labels[clickedIndex]); // Debug log
    const statusMap: Record<string, string> = {
      "Tagged": "tagged",
      "Shortlisted": "shortlisted",
      "Assessment Stage": "assessmentstage",
      "Interview Stage": "interviewstage",
      "Interview Rejected": "interviewRejected", // Corrected to camelCase
      "Offered": "offered",
      "Offer Drop": "offerdrop",
      "Joined": "joined",
    };
    const clickedLabel = labels[clickedIndex].trim(); // Remove any trailing spaces
    if (clickedLabel === "Total CV's Uploaded") {
      router.push(`/dashboard/recruiter/todos`); // Direct navigation for Total CV's Uploaded
    } else {
      const status = statusMap[clickedLabel] || "all"; // Fallback to "all" if no match
      console.log("Mapped status:", status); // Debug log
      router.push(`/dashboard/recruiter/viewapplicant?status=${status}`);
    }
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
              Recruiter Analytics
            </h1>
            <p className="text-md text-slate-500 mt-0.5">
              Monitor performance and track hiring progress
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
                Clients:
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
            label="Total CV's uploaded"
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
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Applicant Funnel */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center">
              <SectionHeader title="Applicant Funnel" subtitle="Stage-wise breakdown" />
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
                        callback: function (value) {
                          return value;
                        },
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
                  onClick: (event, elements) => handleFunnelClick(elements),
                }}
              />
            </div>
          </div>

          {/* Job Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <SectionHeader title="Job Status" subtitle="Current distribution" />
            </div>

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
                          const dataset = context.dataset.data as number[];
                          const total = dataset.reduce((acc, curr) => acc + curr, 0);
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
                  onClick: (event, elements) => {
                    handleJobStatusClick(elements);
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Recruitment Trends */}
        <section className="grid grid-cols-1 gap-4">
          <div className="xl:col-span-2 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <SectionHeader
              title="Recruitment Trends"
              subtitle="Performance overview"
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
                        return context.dataIndex === datasetLength - 1 && value > 0
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

  const router = useRouter();
  const handleCardClick = () => {
    switch (label) {
      case "Active Clients":
        router.push("/dashboard/recruiter/todos");
        break;
      case "Open Positions":
        router.push("/dashboard/recruiter/todos");
        break;
      case "Total CV's uploaded":
        router.push("/dashboard/recruiter/viewapplicant");
        break;
      case "Successfully Joined":
        router.push("/dashboard/recruiter/viewapplicant?status=joined");
        break;
    }
  };
  return (
    <div
      className={`group bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md transition-all ${label === "Active Clients" ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
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