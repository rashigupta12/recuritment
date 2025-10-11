/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/contexts/AuthContext";
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
import {
  Briefcase,
  Building2,
  Download,
  Filter,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register ChartJS components
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

// Type Definitions
interface JobApplicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  client: string;
  status:
    | "Tagged"
    | "Shortlisted"
    | "Assessment"
    | "Interview"
    | "InterviewRejected"
    | "Offered"
    | "OfferDrop"
    | "Joined";
  appliedDate: string;
  lastUpdated: string;
}

interface JobOpening {
  id: string;
  title: string;
  client: string;
  location: string;
  status: "Open" | "Closed" | "Cancelled";
  positions: number;
  createdDate: string;
}

interface TrendData {
  period: string;
  totalCVUploaded: number;
  open: number;
  tagged: number;
  shortlisted: number;
  assessment: number;
  interview: number;
  interviewReject: number;
  offered: number;
  offerDrop: number;
  joined: number;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string>("All");
  const [trendPeriod, setTrendPeriod] = useState<"week" | "month" | "quarter">(
    "month"
  );
  const { user } = useAuth();
  const [apiData, setApiData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Fetch dashboard data once and trends data for all periods
  useEffect(() => {
    const fetchData = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const [dashboardResponse, weekTrends, monthTrends, quarterTrends] =
            await Promise.all([
              frappeAPI.makeAuthenticatedRequest(
                "GET",
                `/method/recruitment_app.rec_dashboard.get_recruiter_dashboard_both?email=${user.email}`
              ),
              frappeAPI.makeAuthenticatedRequest(
                "GET",
                `/method/recruitment_app.recruiter_trends.get_recruiter_trends_granular?email=${user.email}&time_period=week`
              ),
              frappeAPI.makeAuthenticatedRequest(
                "GET",
                `/method/recruitment_app.recruiter_trends.get_recruiter_trends_granular?email=${user.email}&time_period=month`
              ),
              frappeAPI.makeAuthenticatedRequest(
                "GET",
                `/method/recruitment_app.recruiter_trends.get_recruiter_trends_granular?email=${user.email}&time_period=quarter`
              ),
            ]);
          setApiData({
            ...dashboardResponse.message,
            trends_data: monthTrends.message, // Default to month
          });
          setTrendsData({
            week: weekTrends.message,
            month: monthTrends.message,
            quarter: quarterTrends.message,
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user?.email]);

  // Get clients from API data
  const clients = useMemo(() => {
    if (!apiData) return ["All"];
    const clientsSet = new Set<string>();

    const applicantKeys = [
      "tagged_applicants_by_company",
      "shortlisted_applicants_by_company",
      "assessment_stage_applicants_by_company",
      "interview_stage_applicants_by_company",
      "interview_reject_applicants_by_company",
      "offered_applicants_by_company",
      "offer_drop_applicants_by_company",
      "joined_applicants_by_company",
    ];

    applicantKeys.forEach((key) => {
      const companies = apiData[key]?.applicants_by_company;
      if (companies) {
        Object.keys(companies).forEach((company) => clientsSet.add(company));
      }
    });

    if (apiData.jobs_opening_by_company?.jobs_by_status) {
      Object.values(apiData.jobs_opening_by_company.jobs_by_status).forEach(
        (jobs: any) => {
          if (Array.isArray(jobs)) {
            jobs.forEach((job) => {
              if (job.company) clientsSet.add(job.company);
            });
          }
        }
      );
    }

    return ["All", ...Array.from(clientsSet).sort()];
  }, [apiData]);

  // Transform API data to match component structure
  const transformedApplicants = useMemo((): JobApplicant[] => {
    if (!apiData) return [];
    const allApplicants: JobApplicant[] = [];
    const statusMapping: Record<string, JobApplicant["status"]> = {
      tagged_applicants_by_company: "Tagged",
      shortlisted_applicants_by_company: "Shortlisted",
      assessment_stage_applicants_by_company: "Assessment",
      interview_stage_applicants_by_company: "Interview",
      interview_reject_applicants_by_company: "InterviewRejected",
      offered_applicants_by_company: "Offered",
      offer_drop_applicants_by_company: "OfferDrop",
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
              status: status,
              appliedDate: new Date().toISOString().split("T")[0],
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          });
        }
      );
    });
    return allApplicants;
  }, [apiData]);

  const transformedJobs = useMemo((): JobOpening[] => {
    if (!apiData?.jobs_opening_by_company?.jobs_by_status) return [];
    const jobs: JobOpening[] = [];

    Object.entries(apiData.jobs_opening_by_company.jobs_by_status).forEach(
      ([status, jobList]: [string, any]) => {
        if (Array.isArray(jobList)) {
          jobList.forEach((job: any) => {
            jobs.push({
              id: job.name,
              title: job.job_title,
              client: job.company,
              location: "N/A",
              status: status as JobOpening["status"],
              positions: 1,
              createdDate: job.creation
                ? new Date(job.creation).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            });
          });
        }
      }
    );
    return jobs;
  }, [apiData]);

  // Calculate select width
  const selectWidth = useMemo(() => {
    if (!clients.length) return "200px";
    const maxLength = Math.max(...clients.map((client) => client.length));
    const baseWidth = 120;
    const charWidth = 8;
    const calculatedWidth = baseWidth + maxLength * charWidth;
    return `${Math.min(Math.max(calculatedWidth, 150), 400)}px`;
  }, [clients]);

  // Filtering
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
    return selectedClient === "All" ? clients.length - 1 : 1;
  }, [clients, selectedClient]);

  const kpiMetrics = useMemo(() => {
    const total = filteredApplicants.length;
    const tagged = filteredApplicants.filter((a) => a.status === "Tagged").length;
    const interviews = filteredApplicants.filter(
      (a) => a.status === "Interview"
    ).length;
    const offered = filteredApplicants.filter((a) => a.status === "Offered").length;
    const joined = filteredApplicants.filter((a) => a.status === "Joined").length;

    return {
      totalApplicants: total,
      taggedToInterview: tagged > 0 ? ((interviews / tagged) * 100).toFixed(1) : "0",
      interviewToOffer: interviews > 0 ? ((offered / interviews) * 100).toFixed(1) : "0",
      offerToJoin: offered > 0 ? ((joined / offered) * 100).toFixed(1) : "0",
    };
  }, [filteredApplicants]);

  // Trends Data
  const processedTrendsData = useMemo((): TrendData[] => {
    const currentTrends = trendsData[trendPeriod];
    if (!currentTrends?.trends) return [];

    const periodInfo = currentTrends.period_info;
    const existingTrends = currentTrends.trends;

    const trendsMap = new Map<string, TrendData>(
      existingTrends.map((trend: TrendData) => [trend.period, trend])
    );

    const allPeriods: string[] = [];

    if (periodInfo?.type === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const currentDate = new Date(periodInfo.current_date);
      const startDate = new Date(periodInfo.start_date);
      const startDay = startDate.getDay();
      const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + mondayOffset);

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        allPeriods.push(`${days[i]} ${date.getDate()}`);
      }
    } else if (periodInfo?.type === "month") {
      const currentDate = new Date(periodInfo.current_date);
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const totalDays = lastDay.getDate();

      let weekNum = 1;
      let startDay = 1;

      while (startDay <= totalDays) {
        const endDay = Math.min(startDay + 6, totalDays);
        allPeriods.push(`Week ${weekNum} (${startDay}-${endDay})`);
        startDay = endDay + 1;
        weekNum++;
      }
    } else if (periodInfo?.type === "quarter") {
      const currentDate = new Date(periodInfo.current_date);
      const currentMonth = currentDate.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      for (let i = 0; i < 3; i++) {
        allPeriods.push(monthNames[quarterStartMonth + i]);
      }
    }

    const normalizedTrends: TrendData[] = allPeriods.map((period) => {
      const existingData = trendsMap.get(period);
      if (existingData) {
        return existingData;
      }
      return {
        period,
        totalCVUploaded: 0,
        open: 0,
        tagged: 0,
        shortlisted: 0,
        assessment: 0,
        interview: 0,
        interviewReject: 0,
        offered: 0,
        offerDrop: 0,
        joined: 0,
      };
    });

    return normalizedTrends;
  }, [trendsData, trendPeriod]);

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(
      "Company Name,Job Title,Open Positions,CV's Uploaded,Tagged,Shortlisted,Assessment,Interview,Interview Rejected,Offered,Offer Drop,Rejected,Joined"
    );
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
          assessment: 0,
          interview: 0,
          interviewRejected: 0,
          offered: 0,
          offerDrop: 0,
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
    Object.entries(companyData).forEach(([company, jobs]) => {
      Object.entries(jobs).forEach(([jobTitle, stats]: [string, any]) => {
        const openPositions = filteredJobs.filter(
          (j) =>
            j.client === company && j.title === jobTitle && j.status === "Open"
        ).length;
        csvRows.push(
          `${company},${jobTitle},${openPositions},${stats.cvUploaded},${stats.tagged},${stats.shortlisted},${stats.assessment},${stats.interview},${stats.interviewRejected},${stats.offered},${stats.offerDrop},${stats.rejected},${stats.joined}`
        );
      });
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recruiter-dashboard-${selectedClient}-${trendPeriod}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const candidateStatusOrder: JobApplicant["status"][] = [
    "Tagged",
    "Shortlisted",
    "Assessment",
    "Interview",
    "InterviewRejected",
    "Offered",
    "OfferDrop",
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
      "#10B981",
    ];
    return {
      labels: clientGroups,
      datasets: candidateStatusOrder.map((status, idx) => ({
        label: status
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim(),
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

  const funnelStages: JobApplicant["status"][] = [
    "Tagged",
    "Shortlisted",
    "Assessment",
    "Interview",
    "InterviewRejected",
    "Offered",
    "OfferDrop",
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
            .trim()
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
  }, [filteredApplicants]);

  const jobStatusData = useMemo(() => {
    const statusCounts = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, { Open: 0, Closed: 0, Cancelled: 0 } as Record<string, number>);
    return {
      labels: ["Open", "Closed", "Cancelled"],
      datasets: [
        {
          data: [
            statusCounts["Open"],
            statusCounts["Closed"],
            statusCounts["Cancelled"],
          ],
          backgroundColor: ["#6366F1", "#10B981", "#EF4444"],
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [filteredJobs]);

  const trendData = useMemo(
    () => ({
      labels: processedTrendsData.map((m: TrendData) => m.period),
      datasets: [
        {
          label: "Total CV's Uploaded",
          data: processedTrendsData.map((m: TrendData) => m.totalCVUploaded),
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
          data: processedTrendsData.map((m: TrendData) => m.tagged),
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
          data: processedTrendsData.map((m: TrendData) => m.shortlisted),
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
          data: processedTrendsData.map((m: TrendData) => m.assessment),
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
          data: processedTrendsData.map((m: TrendData) => m.interview),
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
          data: processedTrendsData.map((m: TrendData) => m.interviewReject),
          borderColor: "#818CF8",
          backgroundColor: "rgba(129,140,248,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#818CF8",
        },
        {
          label: "Offered",
          data: processedTrendsData.map((m: TrendData) => m.offered),
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139,92,246,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#8B5CF6",
        },
        {
          label: "Offer Drop",
          data: processedTrendsData.map((m: TrendData) => m.offerDrop),
          borderColor: "#D97706",
          backgroundColor: "rgba(217,119,6,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#D97706",
        },
        {
          label: "Joined",
          data: processedTrendsData.map((m: TrendData) => m.joined),
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
    [processedTrendsData]
  );

  const handleFunnelClick = (elements: any[]) => {
    if (!elements.length) return;
    const clickedIndex = elements[0].index;
    const labels = funnelData.labels;
    const statusMap: Record<string, string> = {
      Tagged: "tagged",
      Shortlisted: "shortlisted",
      Assessment: "assessment",
      Interview: "interview",
      "Interview Rejected": "interviewrejected",
      Offered: "offered",
      "Offer Drop": "offerdrop",
      Joined: "joined",
    };
    const clickedLabel = labels[clickedIndex].trim();
    if (clickedLabel === "Total CV's Uploaded") {
      router.push(`/dashboard/recruiter/viewapplicant`);
    } else {
      const status = statusMap[clickedLabel] || "all";
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
            <h1 className="text-2xl font-bold text-slate-800">
              Recruiter Dashboard
            </h1>
            <p className="text-md text-slate-500 mt-0.5">
              Monitor performance and track hiring progress
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-md font-medium text-slate-600">
                  Customers:
                </span>
              </div>
              <select
                ref={selectRef}
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{ width: selectWidth }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white min-w-[150px] max-w-[150px] transition-all duration-200"
              >
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
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
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={<Building2 className="h-4 w-4" />}
            value={activeClients}
            label="Active Customers"
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
              <SectionHeader
                title="Applicant Funnel"
                subtitle="Stage-wise breakdown"
              />
            </div>
            <div className="h-80 mt-4 overflow-hidden">
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
                  onClick: (event, elements) => handleFunnelClick(elements),
                }}
              />
            </div>
          </div>

          {/* Job Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <SectionHeader
                title="Job Status"
                subtitle="Current distribution"
              />
            </div>
            <div className="h-64 flex items-center justify-center cursor-pointer mt-2">
              <Doughnut
                data={{
                  ...jobStatusData,
                  datasets: jobStatusData.datasets.map((dataset) => ({
                    ...dataset,
                    borderWidth: 0,
                    borderColor: "transparent",
                  })),
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    datalabels: {
                      display: true,
                      color: "#ffffff",
                      font: {
                        weight: "bold",
                        size: 14,
                      },
                      formatter: (value, context) => {
                        return value > 0 ? value : "";
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const dataset = context.dataset.data as number[];
                          const total = dataset.reduce(
                            (acc, curr) => acc + curr,
                            0
                          );
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

        {/* Recruitment Trends Section */}
        <section className="grid grid-cols-1 gap-4">
          <div className="xl:col-span-2 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <SectionHeader
                title="Recruitment Trends"
                subtitle={`${
                  trendPeriod.charAt(0).toUpperCase() + trendPeriod.slice(1)
                }ly breakdown`}
              />
              <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-md">
                {(["week", "month", "quarter"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setTrendPeriod(period)}
                    className={`px-2 py-1 rounded text-md font-medium transition-all
                      ${
                        trendPeriod === period
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
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
  return (
    <div
      className={`group bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md transition-all ${
        label === "Active Clients" ? "cursor-pointer" : ""
      }`}
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