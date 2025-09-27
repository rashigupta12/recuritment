'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Building,
  Phone,
  Mail,
  UserPlus,
  Briefcase,
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Type definitions
interface Lead {
  id: number;
  name: string;
  contact: string;
  stage: string;
  dealValue: number;
  lastActivity: string;
  priority: string;
}

interface OnboardingItem {
  id: number;
  company: string;
  contact: string;
  contractValue: number;
  status: string;
  nextStep: string;
  dueDate: string;
}

interface Requirement {
  id: number;
  company: string;
  positions: number;
  totalBudget: number;
  assignedTo: string;
  priority: string;
  deadline: string;
}

interface ChartDataPoint {
  month: string;
  leads: number;
  conversions: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down';
  subtitle?: string;
}

interface LeadCardProps {
  lead: Lead;
}

interface OnboardingCardProps {
  item: OnboardingItem;
}

interface RequirementCardProps {
  requirement: Requirement;
}

interface MiniChartProps {
  data: ChartDataPoint[];
  type?: 'bar';
}

// Mock data - in real app, this would come from your API
const mockData = {
  stats: {
    totalLeads: 124,
    leadsThisMonth: 18,
    conversionRate: 24.5,
    totalDealValue: 2840000,
    onboardedClients: 8,
    activeRequirements: 15,
    averageDealSize: 355000,
    monthlyGrowth: 12.3
  },
  recentLeads: [
    {
      id: 1,
      name: "TechCorp Solutions",
      contact: "Rajesh Kumar",
      stage: "Negotiation",
      dealValue: 450000,
      lastActivity: "2024-01-15",
      priority: "high"
    },
    {
      id: 2,
      name: "Global Industries",
      contact: "Priya Sharma",
      stage: "Proposal",
      dealValue: 280000,
      lastActivity: "2024-01-14",
      priority: "medium"
    },
    {
      id: 3,
      name: "StartupXYZ",
      contact: "Amit Singh",
      stage: "Discovery",
      dealValue: 150000,
      lastActivity: "2024-01-13",
      priority: "low"
    }
  ],
  onboardingPipeline: [
    {
      id: 1,
      company: "DataTech Ltd",
      contact: "Sarah Johnson",
      contractValue: 520000,
      status: "Contract Signed",
      nextStep: "Initial Setup",
      dueDate: "2024-01-20"
    },
    {
      id: 2,
      company: "CloudFirst Inc",
      contact: "Michael Chen",
      contractValue: 380000,
      status: "Documentation",
      nextStep: "Team Assignment",
      dueDate: "2024-01-18"
    }
  ],
  requirementsSummary: [
    {
      id: 1,
      company: "TechCorp Solutions",
      positions: 12,
      totalBudget: 2400000,
      assignedTo: "Team A",
      priority: "High",
      deadline: "2024-02-15"
    },
    {
      id: 2,
      company: "Global Industries",
      positions: 8,
      totalBudget: 1600000,
      assignedTo: "Team B",
      priority: "Medium",
      deadline: "2024-02-28"
    }
  ],
  chartData: {
    monthlyLeads: [
      { month: 'Jul', leads: 15, conversions: 3 },
      { month: 'Aug', leads: 22, conversions: 5 },
      { month: 'Sep', leads: 18, conversions: 4 },
      { month: 'Oct', leads: 28, conversions: 7 },
      { month: 'Nov', leads: 24, conversions: 6 },
      { month: 'Dec', leads: 31, conversions: 8 },
      { month: 'Jan', leads: 18, conversions: 4 }
    ],
    pipelineDistribution: [
      { stage: 'Discovery', count: 25, value: 1250000 },
      { stage: 'Proposal', count: 18, value: 2340000 },
      { stage: 'Negotiation', count: 12, value: 1890000 },
      { stage: 'Contract', count: 8, value: 1450000 }
    ]
  }
};

// Utility functions
const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short'
  });
};

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStageColor = (stage: string): string => {
  switch (stage.toLowerCase()) {
    case 'discovery': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'proposal': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'negotiation': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'contract': return 'bg-green-50 text-green-700 border-green-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// Components
const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend = 'up', subtitle }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      {change && (
        <div className={`flex items-center space-x-1 text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          <span>{change}%</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-500">{subtitle}</div>
      )}
    </div>
  </div>
);

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
        <p className="text-xs text-gray-600 mt-1">{lead.contact}</p>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(lead.priority)}`}>
        {lead.priority}
      </div>
    </div>
    
    <div className="flex items-center justify-between mb-2">
      <span className={`px-2 py-1 rounded-full text-xs border ${getStageColor(lead.stage)}`}>
        {lead.stage}
      </span>
      <span className="text-sm font-semibold text-green-600">
        {formatCurrency(lead.dealValue)}
      </span>
    </div>
    
    <div className="text-xs text-gray-500">
      Last activity: {formatDate(lead.lastActivity)}
    </div>
  </div>
);

const OnboardingCard: React.FC<OnboardingCardProps> = ({ item }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-sm">{item.company}</h4>
        <p className="text-xs text-gray-600">{item.contact}</p>
      </div>
      <span className="text-sm font-semibold text-green-600">
        {formatCurrency(item.contractValue)}
      </span>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Status:</span>
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{item.status}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Next:</span>
        <span className="font-medium">{item.nextStep}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Due:</span>
        <span className="text-orange-600 font-medium">{formatDate(item.dueDate)}</span>
      </div>
    </div>
  </div>
);

const RequirementCard: React.FC<RequirementCardProps> = ({ requirement }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-sm">{requirement.company}</h4>
        <div className="flex items-center space-x-2 mt-1">
          <Users className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600">{requirement.positions} positions</span>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(requirement.priority)}`}>
        {requirement.priority}
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Budget:</span>
        <span className="font-semibold text-green-600">{formatCurrency(requirement.totalBudget)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Assigned:</span>
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{requirement.assignedTo}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Deadline:</span>
        <span className="text-red-600 font-medium">{formatDate(requirement.deadline)}</span>
      </div>
    </div>
  </div>
);

const MiniChart: React.FC<MiniChartProps> = ({ data, type = 'bar' }) => {
  if (type === 'bar') {
    const maxValue = Math.max(...data.map((d: ChartDataPoint) => d.leads));
    return (
      <div className="flex items-end space-x-1 h-20">
        {data.slice(-6).map((item: ChartDataPoint, index: number) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-200 rounded-t"
              style={{ height: `${(item.leads / maxValue) * 60}px`, minHeight: '4px' }}
            ></div>
            <div 
              className="w-full bg-green-200 rounded-b"
              style={{ height: `${(item.conversions / maxValue) * 60}px`, minHeight: '2px' }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{item.month}</span>
          </div>
        ))}
      </div>
    );
  }
  return <div>Chart placeholder</div>;
};

export default function SalesManagerDashboard() {
  const [data, setData] = useState(mockData);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Track leads, onboarding, and requirements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Calendar className="h-4 w-4 inline mr-2" />
            This Month
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            <TrendingUp className="h-4 w-4 inline mr-2" />
            View Reports
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={data.stats.totalLeads}
          change={data.stats.monthlyGrowth}
          icon={Target}
          subtitle={`+${data.stats.leadsThisMonth} this month`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.stats.conversionRate}%`}
          change={2.1}
          icon={TrendingUp}
          subtitle="Above industry avg"
        />
        <StatCard
          title="Total Deal Value"
          value={formatCurrency(data.stats.totalDealValue)}
          change={15.7}
          icon={DollarSign}
          subtitle="Active pipeline"
        />
        <StatCard
          title="Onboarded Clients"
          value={data.stats.onboardedClients}
          change={8.3}
          icon={CheckCircle}
          subtitle="This quarter"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Lead Performance</h2>
            <div className="flex space-x-2">
              <span className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
                Leads
              </span>
              <span className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
                Conversions
              </span>
            </div>
          </div>
          <MiniChart data={data.chartData.monthlyLeads} type="bar" />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Add New Lead</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-green-600 mr-3" />
                <span className="text-sm font-medium">Create Requirement</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 text-purple-600 mr-3" />
                <span className="text-sm font-medium">View Onboarding</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {data.recentLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>

        {/* Onboarding Pipeline */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Onboarding</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {data.onboardingPipeline.map(item => (
              <OnboardingCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Active Requirements */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {data.requirementsSummary.map(req => (
              <RequirementCard key={req.id} requirement={req} />
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h2>
          <div className="space-y-3">
            {data.chartData.pipelineDistribution.map((stage, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-purple-500' : 
                    index === 2 ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <span className="text-xs text-gray-500">({stage.count})</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(stage.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Deal Size</span>
              <span className="text-lg font-semibold">{formatCurrency(data.stats.averageDealSize)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Requirements</span>
              <span className="text-lg font-semibold">{data.stats.activeRequirements}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-lg font-semibold text-green-600">87%</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">This Month Growth</span>
                <span className="text-green-600 font-semibold flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{data.stats.monthlyGrowth}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}