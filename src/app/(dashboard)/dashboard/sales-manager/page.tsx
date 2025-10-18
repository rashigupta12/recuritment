// /*eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import {
//   ArrowDownRight,
//   ArrowUpRight,
//   Briefcase,
//   Calendar,
//   CheckCircle,
//   DollarSign,
//   FileText,
//   Target,
//   TrendingUp,
//   UserPlus,
//   Users
// } from 'lucide-react';
// import React, { useState } from 'react';

// // Type definitions
// interface Lead {
//   id: number;
//   name: string;
//   contact: string;
//   stage: string;
//   dealValue: number;
//   lastActivity: string;
//   priority: string;
// }

// interface OnboardingItem {
//   id: number;
//   company: string;
//   contact: string;
//   contractValue: number;
//   status: string;
//   nextStep: string;
//   dueDate: string;
// }

// interface Requirement {
//   id: number;
//   company: string;
//   positions: number;
//   totalBudget: number;
//   assignedTo: string;
//   priority: string;
//   deadline: string;
// }

// interface ChartDataPoint {
//   month: string;
//   leads: number;
//   conversions: number;
// }



// interface StatCardProps {
//   title: string;
//   value: string | number;
//   change?: number;
//   icon: React.ComponentType<any>;
//   trend?: 'up' | 'down';
//   subtitle?: string;
// }

// interface LeadCardProps {
//   lead: Lead;
// }

// interface OnboardingCardProps {
//   item: OnboardingItem;
// }

// interface RequirementCardProps {
//   requirement: Requirement;
// }

// interface MiniChartProps {
//   data: ChartDataPoint[];
//   type?: 'bar';
// }

// // Mock data - in real app, this would come from your API
// const mockData = {
//   stats: {
//     totalLeads: 124,
//     leadsThisMonth: 18,
//     conversionRate: 24.5,
//     totalDealValue: 2840000,
//     onboardedClients: 8,
//     activeRequirements: 15,
//     averageDealSize: 355000,
//     monthlyGrowth: 12.3
//   },
//   recentLeads: [
//     {
//       id: 1,
//       name: "TechCorp Solutions",
//       contact: "Rajesh Kumar",
//       stage: "Negotiation",
//       dealValue: 450000,
//       lastActivity: "2024-01-15",
//       priority: "high"
//     },
//     {
//       id: 2,
//       name: "Global Industries",
//       contact: "Priya Sharma",
//       stage: "Proposal",
//       dealValue: 280000,
//       lastActivity: "2024-01-14",
//       priority: "medium"
//     },
//     {
//       id: 3,
//       name: "StartupXYZ",
//       contact: "Amit Singh",
//       stage: "Discovery",
//       dealValue: 150000,
//       lastActivity: "2024-01-13",
//       priority: "low"
//     }
//   ],
//   onboardingPipeline: [
//     {
//       id: 1,
//       company: "DataTech Ltd",
//       contact: "Sarah Johnson",
//       contractValue: 520000,
//       status: "Contract Signed",
//       nextStep: "Initial Setup",
//       dueDate: "2024-01-20"
//     },
//     {
//       id: 2,
//       company: "CloudFirst Inc",
//       contact: "Michael Chen",
//       contractValue: 380000,
//       status: "Documentation",
//       nextStep: "Team Assignment",
//       dueDate: "2024-01-18"
//     }
//   ],
//   requirementsSummary: [
//     {
//       id: 1,
//       company: "TechCorp Solutions",
//       positions: 12,
//       totalBudget: 2400000,
//       assignedTo: "Team A",
//       priority: "High",
//       deadline: "2024-02-15"
//     },
//     {
//       id: 2,
//       company: "Global Industries",
//       positions: 8,
//       totalBudget: 1600000,
//       assignedTo: "Team B",
//       priority: "Medium",
//       deadline: "2024-02-28"
//     }
//   ],
//   chartData: {
//     monthlyLeads: [
//       { month: 'Jul', leads: 15, conversions: 3 },
//       { month: 'Aug', leads: 22, conversions: 5 },
//       { month: 'Sep', leads: 18, conversions: 4 },
//       { month: 'Oct', leads: 28, conversions: 7 },
//       { month: 'Nov', leads: 24, conversions: 6 },
//       { month: 'Dec', leads: 31, conversions: 8 },
//       { month: 'Jan', leads: 18, conversions: 4 }
//     ],
//     pipelineDistribution: [
//       { stage: 'Discovery', count: 25, value: 1250000 },
//       { stage: 'Proposal', count: 18, value: 2340000 },
//       { stage: 'Negotiation', count: 12, value: 1890000 },
//       { stage: 'Contract', count: 8, value: 1450000 }
//     ]
//   }
// };

// // Utility functions
// const formatCurrency = (amount: number): string => {
//   if (amount >= 10000000) {
//     return `₹${(amount / 10000000).toFixed(1)}Cr`;
//   } else if (amount >= 100000) {
//     return `₹${(amount / 100000).toFixed(1)}L`;
//   } else if (amount >= 1000) {
//     return `₹${(amount / 1000).toFixed(0)}K`;
//   }
//   return `₹${amount}`;
// };

// const formatDate = (dateString: string): string => {
//   return new Date(dateString).toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short'
//   });
// };

// const getPriorityColor = (priority: string): string => {
//   switch (priority.toLowerCase()) {
//     case 'high': return 'text-red-600 bg-red-50 border-red-200';
//     case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//     case 'low': return 'text-green-600 bg-green-50 border-green-200';
//     default: return 'text-gray-600 bg-gray-50 border-gray-200';
//   }
// };

// const getStageColor = (stage: string): string => {
//   switch (stage.toLowerCase()) {
//     case 'discovery': return 'bg-blue-50 text-blue-700 border-blue-200';
//     case 'proposal': return 'bg-purple-50 text-purple-700 border-purple-200';
//     case 'negotiation': return 'bg-orange-50 text-orange-700 border-orange-200';
//     case 'contract': return 'bg-green-50 text-green-700 border-green-200';
//     default: return 'bg-gray-50 text-gray-700 border-gray-200';
//   }
// };

// // Components
// const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend = 'up', subtitle }) => (
//   <div className="bg-white p-3 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
//     <div className="flex items-center justify-between mb-4">
//       <div className="flex items-center space-x-2">
//         <div className=" bg-blue-50 rounded-lg">
//           <Icon className="h-5 w-5 text-blue-600" />
//         </div>
//         <h3 className="text-lg font-medium text-gray-600">{title}</h3>
//       </div>
//       {change && (
//         <div className={`flex items-center space-x-1 text-md ${
//           trend === 'up' ? 'text-green-600' : 'text-red-600'
//         }`}>
//           {trend === 'up' ? (
//             <ArrowUpRight className="h-4 w-4" />
//           ) : (
//             <ArrowDownRight className="h-4 w-4" />
//           )}
//           <span>{change}%</span>
//         </div>
//       )}
//     </div>
//     <div className="space-y-1">
//       <div className="text-2xl font-bold text-gray-900">{value}</div>
//       {subtitle && (
//         <div className="text-md text-gray-500">{subtitle}</div>
//       )}
//     </div>
//   </div>
// );

// const LeadCard: React.FC<LeadCardProps> = ({ lead }) => (
//   <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
//     <div className="flex items-start justify-between mb-3">
//       <div className="flex-1">
//         <h4 className="font-semibold text-gray-900 text-md">{lead.name}</h4>
//         <p className="text-sm text-gray-600 mt-1">{lead.contact}</p>
//       </div>
//       <div className={`px-2 py-1 rounded-full text-sm capitalize border ${getPriorityColor(lead.priority)}`}>
//         {lead.priority}
//       </div>
//     </div>
    
//     <div className="flex items-center justify-between mb-2">
//       <span className={`px-2 py-1 rounded-full text-sm border ${getStageColor(lead.stage)}`}>
//         {lead.stage}
//       </span>
//       <span className="text-lg font-semibold text-green-600">
//         {formatCurrency(lead.dealValue)}
//       </span>
//     </div>
    
//     <div className="text-sm text-gray-500">
//       Last activity: {formatDate(lead.lastActivity)}
//     </div>
//   </div>
// );

// const OnboardingCard: React.FC<OnboardingCardProps> = ({ item }) => (
//   <div className="bg-white p-4 rounded-lg border border-gray-200">
//     <div className="flex items-start justify-between mb-3">
//       <div className="flex-1">
//         <h4 className="font-semibold text-gray-900 text-lg">{item.company}</h4>
//         <p className="text-md text-gray-600">{item.contact}</p>
//       </div>
//       <span className="text-lg font-semibold text-green-600">
//         {formatCurrency(item.contractValue)}
//       </span>
//     </div>
    
//     <div className="space-y-2">
//       <div className="flex items-center justify-between text-md">
//         <span className="text-gray-500">Status:</span>
//         <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{item.status}</span>
//       </div>
//       <div className="flex items-center justify-between text-xs">
//         <span className="text-gray-500">Next:</span>
//         <span className="font-medium">{item.nextStep}</span>
//       </div>
//       <div className="flex items-center justify-between text-xs">
//         <span className="text-gray-500">Due:</span>
//         <span className="text-orange-600 font-medium">{formatDate(item.dueDate)}</span>
//       </div>
//     </div>
//   </div>
// );

// const RequirementCard: React.FC<RequirementCardProps> = ({ requirement }) => (
//   <div className="bg-white p-4 rounded-lg border border-gray-200">
//     <div className="flex items-start justify-between mb-3">
//       <div className="flex-1">
//         <h4 className="font-semibold text-gray-900 text-lg">{requirement.company}</h4>
//         <div className="flex items-center space-x-2 mt-1">
//           <Users className="h-3 w-3 text-gray-400" />
//           <span className="text-md text-gray-600">{requirement.positions} positions</span>
//         </div>
//       </div>
//       <div className={`px-2 py-1 rounded-full text-md border ${getPriorityColor(requirement.priority)}`}>
//         {requirement.priority}
//       </div>
//     </div>
    
//     <div className="space-y-2">
//       <div className="flex items-center justify-between text-md">
//         <span className="text-gray-500">Budget:</span>
//         <span className="font-semibold text-green-600">{formatCurrency(requirement.totalBudget)}</span>
//       </div>
//       <div className="flex items-center justify-between text-md">
//         <span className="text-gray-500">Assigned:</span>
//         <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{requirement.assignedTo}</span>
//       </div>
//       <div className="flex items-center justify-between text-md">
//         <span className="text-gray-500">Deadline:</span>
//         <span className="text-red-600 font-medium">{formatDate(requirement.deadline)}</span>
//       </div>
//     </div>
//   </div>
// );

// const MiniChart: React.FC<MiniChartProps> = ({ data, type = 'bar' }) => {
//   if (type === 'bar') {
//     const maxValue = Math.max(...data.map((d: ChartDataPoint) => d.leads));
//     return (
//       <div className="flex items-end space-x-1 h-20 mt-20">
//         {data.slice(-6).map((item: ChartDataPoint, index: number) => (
//           <div key={index} className="flex-1 flex flex-col items-center">
//             <div 
//               className="w-full bg-blue-200 rounded-t"
//               style={{ height: `${(item.leads / maxValue) * 60}px`, minHeight: '4px' }}
//             ></div>
//             <div 
//               className="w-full bg-green-200 rounded-b"
//               style={{ height: `${(item.conversions / maxValue) * 60}px`, minHeight: '2px' }}
//             ></div>
//             <span className="text-md text-gray-500 mt-1">{item.month}</span>
//           </div>
//         ))}
//       </div>
//     );
//   }
//   return <div>Chart placeholder</div>;
// };

// export default function SalesManagerDashboard() {
//   const [data, setData] = useState(mockData);
//   // const [activeTab, setActiveTab] = useState('overview');

//   return (
//     <div className="space-y-6 w-full mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
//           <p className="text-gray-600 mt-1">Track leads, onboarding, and requirements</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
//             <Calendar className="h-4 w-4 inline mr-2" />
//             This Month
//           </button>
//           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
//             <TrendingUp className="h-4 w-4 inline mr-2" />
//             View Reports
//           </button>
//         </div>
//       </div>

//       {/* Key Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Total Leads"
//           value={data.stats.totalLeads}
//           change={data.stats.monthlyGrowth}
//           icon={Target}
//           subtitle={`+${data.stats.leadsThisMonth} this month`}
//         />
//         <StatCard
//           title="Conversion Rate"
//           value={`${data.stats.conversionRate}%`}
//           change={2.1}
//           icon={TrendingUp}
//           subtitle="Above industry avg"
//         />
//         <StatCard
//           title="Total Deal Value"
//           value={formatCurrency(data.stats.totalDealValue)}
//           change={15.7}
//           icon={DollarSign}
//           subtitle="Active pipeline"
//         />
//         <StatCard
//           title="Onboarded Clients"
//           value={data.stats.onboardedClients}
//           change={8.3}
//           icon={CheckCircle}
//           subtitle="This quarter"
//         />
//       </div>

//       {/* Performance Overview */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-semibold text-gray-900">Lead Performance</h2>
//             <div className="flex space-x-2">
//               <span className="flex items-center text-md text-gray-600">
//                 <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
//                 Leads
//               </span>
//               <span className="flex items-center text-md text-gray-600">
//                 <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
//                 Conversions
//               </span>
//             </div>
//           </div>
//           <MiniChart data={data.chartData.monthlyLeads} type="bar" />
//         </div>

//         <div className="bg-white p-6 rounded-xl border border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
//           <div className="space-y-3">
//             <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
//               <div className="flex items-center">
//                 <UserPlus className="h-4 w-4 text-blue-600 mr-3" />
                
//                 <span className="text-md font-medium">Add New Lead</span>
//               </div>
//               <ArrowUpRight className="h-4 w-4 text-blue-600" />
//             </button>
//             <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
//               <div className="flex items-center">
//                 <FileText className="h-4 w-4 text-green-600 mr-3" />
//                 <span className="text-md font-medium">Create Requirement</span>
//               </div>
//               <ArrowUpRight className="h-4 w-4 text-green-600" />
//             </button>
//             <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
//               <div className="flex items-center">
//                 <Briefcase className="h-4 w-4 text-purple-600 mr-3" />
//                 <span className="text-md font-medium">View Onboarding</span>
//               </div>
//               <ArrowUpRight className="h-4 w-4 text-purple-600" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Detailed Sections */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Leads */}
//         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
//             <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
//               View All
//             </button>
//           </div>
//           <div className="space-y-3">
//             {data.recentLeads.map(lead => (
//               <LeadCard key={lead.id} lead={lead} />
//             ))}
//           </div>
//         </div>

//         {/* Onboarding Pipeline */}
//         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-900">Onboarding</h2>
//             <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
//               View All
//             </button>
//           </div>
//           <div className="space-y-3">
//             {data.onboardingPipeline.map(item => (
//               <OnboardingCard key={item.id} item={item} />
//             ))}
//           </div>
//         </div>

//         {/* Active Requirements */}
//         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
//             <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
//               View All
//             </button>
//           </div>
//           <div className="space-y-3">
//             {data.requirementsSummary.map(req => (
//               <RequirementCard key={req.id} requirement={req} />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Additional Insights */}
//       {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-xl border border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h2>
//           <div className="space-y-3">
//             {data.chartData.pipelineDistribution.map((stage, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className={`w-3 h-3 rounded-full ${
//                     index === 0 ? 'bg-blue-500' : 
//                     index === 1 ? 'bg-purple-500' : 
//                     index === 2 ? 'bg-orange-500' : 'bg-green-500'
//                   }`}></div>
//                   <span className="text-sm font-medium">{stage.stage}</span>
//                   <span className="text-xs text-gray-500">({stage.count})</span>
//                 </div>
//                 <span className="text-sm font-semibold text-gray-900">
//                   {formatCurrency(stage.value)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl border border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Average Deal Size</span>
//               <span className="text-lg font-semibold">{formatCurrency(data.stats.averageDealSize)}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Active Requirements</span>
//               <span className="text-lg font-semibold">{data.stats.activeRequirements}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Success Rate</span>
//               <span className="text-lg font-semibold text-green-600">87%</span>
//             </div>
//             <div className="pt-3 border-t">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-600">This Month Growth</span>
//                 <span className="text-green-600 font-semibold flex items-center">
//                   <ArrowUpRight className="h-4 w-4 mr-1" />
//                   +{data.stats.monthlyGrowth}%
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div> */}
//     </div>
//   );
// }
// 'use client';

// import {
//   Construction,
//   Target,
//   TrendingUp,
//   Users
// } from 'lucide-react';

// export default function SalesManagerDashboard() {
//   return (
//     <div className="min-h-screen flex  justify-center ">
//       <div className="max-w-4xl w-full">
//         {/* Header */}
//         <div className="text-center ">
        
          
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Sales Manager Dashboard
//           </h1>
//           <p className="text-xl text-gray-600 mb-2">
//             We &apos;re building something amazing for you
//           </p>
//           <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-8 ">
//           <div className="text-center mb-4">
//             <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
//               <Construction className="h-4 w-4 mr-2" />
//               Under Construction
//             </div>
            
//             <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
//               Powerful Sales Insights Coming Soon
//             </h2>
//             {/* <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
//               We're crafting a comprehensive dashboard to help you track leads, manage onboarding, 
//               and monitor requirements with beautiful visualizations and real-time analytics.
//             </p> */}
//           </div>

//           {/* Features Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
//               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
//                 <Target className="h-6 w-6 text-blue-600" />
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Lead Management</h3>
//               <p className="text-gray-600 text-sm">
//                 Track and convert leads with advanced pipeline management
//               </p>
//             </div>

//             <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
//               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
//                 <Users className="h-6 w-6 text-green-600" />
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Client Onboarding</h3>
//               <p className="text-gray-600 text-sm">
//                 Streamline client onboarding with automated workflows
//               </p>
//             </div>

//             <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
//               <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
//                 <TrendingUp className="h-6 w-6 text-purple-600" />
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Performance Analytics</h3>
//               <p className="text-gray-600 text-sm">
//                 Get deep insights with interactive charts and reports
//               </p>
//             </div>
//           </div>

//           {/* Progress Section */}
//           <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
//             <div className="flex items-center justify-between mb-4">
//               <span className="font-semibold">Development Progress</span>
//               <span className="font-bold">65%</span>
//             </div>
//             <div className="w-full bg-white/20 rounded-full h-3 mb-2">
//               <div 
//                 className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
//                 style={{ width: '65%' }}
//               ></div>
//             </div>
//             {/* <p className="text-blue-100 text-sm">
//               Estimated completion: 2 weeks
//             </p> */}
//           </div>
//         </div>

       
//       </div>
//     </div>
//   );
// }



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

// Type Definition
interface Lead {
  id: string;
  stage:
    | "Prospecting"
    | "Lead Qualification"
    | "Needs Analysis / Discovery"
    | "Presentation / Proposal"
    | "Contract"
    | "Onboarded"
    | "Follow-Up / Relationship Management";
  deal_value: number;
  created_date: string;
}

interface TrendData {
  period: string;
  total_leads: number;
  total_deal_value: number;
  converted_leads: number;
  prospecting: number;
  lead_qualification: number;
  needs_analysis: number;
  presentation: number;
  contract: number;
  onboarded: number;
  followup: number;
}

export default function SalesManagerDashboard() {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<string>("All");
 const [trendPeriod, setTrendPeriod] = useState<"week" | "month" | "quarter">("week");
const [apiData, setApiData] = useState<any>(null);
const [trendsData, setTrendsData] = useState<Record<string, any>>({});
    const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Fetch dashboard data
useEffect(() => {
  const fetchData = async () => {
    if (!user?.email) {
      console.warn("No user email available, skipping API call");
      setLoading(false);
      return;
    }
    try {
      console.log("Fetching data with email:", user.email);
      setLoading(true);
      const [dashboardResponse, weekTrends, monthTrends, quarterTrends] = await Promise.all([
        frappeAPI.makeAuthenticatedRequest(
          "GET",
          `/method/recruitment_app.sales_manager_dashboard.get_lead_dashboard_data?lead_owner=${user.email}`
        ),
        frappeAPI.makeAuthenticatedRequest(
          "GET",
          `/method/recruitment_app.sales_manager_dashboard.get_lead_trends_data?lead_owner=${user.email}&time_period=week`
        ),
        frappeAPI.makeAuthenticatedRequest(
          "GET",
          `/method/recruitment_app.sales_manager_dashboard.get_lead_trends_data?lead_owner=${user.email}&time_period=month`
        ),
        frappeAPI.makeAuthenticatedRequest(
          "GET",
          `/method/recruitment_app.sales_manager_dashboard.get_lead_trends_data?lead_owner=${user.email}&time_period=quarter`
        ),
      ]);
      console.log("Dashboard Response:", dashboardResponse);
      console.log("Week Trends Response:", weekTrends);
      console.log("Month Trends Response:", monthTrends);
      console.log("Quarter Trends Response:", quarterTrends);
      if (!dashboardResponse.message) {
        console.error("Invalid dashboard response structure:", dashboardResponse);
        return;
      }
      setApiData(dashboardResponse.message)
      setTrendsData({
        week: weekTrends.message,
        month: monthTrends.message,
        quarter: quarterTrends.message,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      console.log("Loading state set false");
    }
  };
  fetchData();
}, [user?.email]);

  // Get stages from API data
 const stages = useMemo(() => {
  if (!apiData?.leads_by_stage?.stage_counts) return ["All"];
  
  // Define the desired stage order
  const stageOrder: string[] = [
    "Prospecting",
    "Lead Qualification",
    "Needs Analysis / Discovery",
    "Presentation / Proposal",
    "Contract",
    "Onboarded",
    "Follow-Up / Relationship Management",
  ];
  
  // Get stages from API, filter to only those in stageOrder, and prepend "All"
  const apiStages = Object.keys(apiData.leads_by_stage.stage_counts);
  const orderedStages = stageOrder.filter((stage) => apiStages.includes(stage));
  
  return ["All", ...orderedStages];
}, [apiData]);

  // Transform API data to match component structure
  const transformedLeads = useMemo((): Lead[] => {
    if (!apiData?.leads_by_stage?.leads_by_stage) return [];
    const allLeads: Lead[] = [];
    Object.entries(apiData.leads_by_stage.leads_by_stage).forEach(
      ([stage, leadIds]: [string, any]) => {
        (leadIds || []).forEach((leadId: string) => {
          allLeads.push({
            id: leadId,
            stage: stage as Lead["stage"],
            deal_value: apiData.metrics.average_deal_size || 0, // Using average as individual deal values not provided
            created_date: new Date().toISOString().split("T")[0],
          });
        });
      }
    );
    return allLeads;
  }, [apiData]);

  // Calculate select width
  const selectWidth = useMemo(() => {
    if (!stages.length) return "200px";
    const maxLength = Math.max(...stages.map((stage) => stage.length));
    const baseWidth = 120;
    const charWidth = 8;
    const calculatedWidth = baseWidth + maxLength * charWidth;
    return `${Math.min(Math.max(calculatedWidth, 150), 400)}px`;
  }, [stages]);

  // Filtering
  const filteredLeads = useMemo(
    () =>
      selectedStage === "All"
        ? transformedLeads
        : transformedLeads.filter((l) => l.stage === selectedStage),
    [selectedStage, transformedLeads]
  );

 const kpiMetrics = useMemo(() => {
  const totalLeads = filteredLeads.length;
  const totalDealValue = filteredLeads.reduce((sum, lead) => sum + lead.deal_value, 0);
  const convertedLeads = filteredLeads.filter(
    (lead) => lead.stage === "Onboarded" || lead.stage === "Contract"
  ).length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : 0;

  return {
    totalLeads,
    totalDealValue,
    convertedLeads,
    conversionRate,
  };
}, [filteredLeads]);

  // Trends Data
const processedTrendsData = useMemo((): TrendData[] => {
  const currentTrends = trendsData[trendPeriod];
  if (!currentTrends?.trends) {
    console.warn(`No trends data for ${trendPeriod}`);
    return [];
  }

  const periodInfo = currentTrends.period_info;
  const existingTrends = currentTrends.trends;

  const trendsMap = new Map<string, TrendData>(
    existingTrends.map((trend: TrendData) => [trend.period, trend])
  );

  let allPeriods: string[] = [];

  if (periodInfo?.type === "week") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const startDate = new Date(periodInfo.start_date || periodInfo.current_date || Date.now());
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
    const currentDate = new Date(periodInfo.current_date || Date.now());
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    let weekNum = 1;
    let startDay = 1;

    while (startDay <= lastDay) {
      const endDay = Math.min(startDay + 6, lastDay);
      allPeriods.push(`Week ${weekNum} (${startDay}-${endDay})`);
      startDay = endDay + 1;
      weekNum++;
    }
  } else if (periodInfo?.type === "quarter") {
    const currentDate = new Date(periodInfo.current_date || Date.now());
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

  // If API provides periods, ensure they match expected count
  const apiPeriods = existingTrends.map((trend: TrendData) => trend.period);
  if (apiPeriods.length > 0 && apiPeriods.length >= allPeriods.length) {
    allPeriods = apiPeriods;
  }

  const normalizedTrends: TrendData[] = allPeriods.map((period) => {
    const existingData = trendsMap.get(period);
    if (existingData) {
      return existingData;
    }
    return {
      period,
      total_leads: 0,
      total_deal_value: 0,
      converted_leads: 0,
      prospecting: 0,
      lead_qualification: 0,
      needs_analysis: 0,
      presentation: 0,
      contract: 0,
      onboarded: 0,
      followup: 0,
    };
  });

  console.log(`Processed Trends Data (${trendPeriod}):`, normalizedTrends);
  console.log(`API Periods (${trendPeriod}):`, apiPeriods);
  console.log(`Generated Periods (${trendPeriod}):`, allPeriods);
  console.log(`Number of Weeks (${trendPeriod}):`, allPeriods.length);
  return normalizedTrends;
}, [trendsData, trendPeriod]);

  

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(
      "Stage,Total Leads,Total Deal Value,Onboarded & Contracted Leads,Prospecting,Lead Qualification,Needs Analysis / Discovery,Presentation / Proposal,Contract,Onboarded,Follow-Up / Relationship Management"
    );
    const stageData: Record<string, any> = {};
    filteredLeads.forEach((lead) => {
      if (!stageData[lead.stage]) {
        stageData[lead.stage] = {
          totalLeads: 0,
          totalDealValue: 0,
          convertedLeads: lead.stage === "Onboarded" ? 1 : 0,
          prospecting: lead.stage === "Prospecting" ? 1 : 0,
          lead_qualification: lead.stage === "Lead Qualification" ? 1 : 0,
          needs_analysis: lead.stage === "Needs Analysis / Discovery" ? 1 : 0,
          presentation: lead.stage === "Presentation / Proposal" ? 1 : 0,
          contract: lead.stage === "Contract" ? 1 : 0,
          onboarded: lead.stage === "Onboarded" ? 1 : 0,
          followup: lead.stage === "Follow-Up / Relationship Management" ? 1 : 0,
        };
      }
      stageData[lead.stage].totalLeads++;
      stageData[lead.stage].totalDealValue += lead.deal_value;
      if (lead.stage === "Onboarded") stageData[lead.stage].convertedLeads++;
    });
    Object.entries(stageData).forEach(([stage, stats]) => {
      csvRows.push(
        `${stage},${stats.totalLeads},${stats.totalDealValue},${stats.convertedLeads},${stats.prospecting},${stats.lead_qualification},${stats.needs_analysis},${stats.presentation},${stats.contract},${stats.onboarded},${stats.followup}`
      );
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-dashboard-${selectedStage}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const funnelStages: Lead["stage"][] = [
    "Prospecting",
    "Lead Qualification",
    "Needs Analysis / Discovery",
    "Presentation / Proposal",
    "Contract",
    "Onboarded",
    "Follow-Up / Relationship Management",
  ];

  const funnelData = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const stageData = funnelStages.map(
      (stage) => filteredLeads.filter((l) => l.stage === stage).length
    );
    return {
      labels: ["Total Leads", ...funnelStages],
      datasets: [
        {
          label: "Leads",
          data: [totalLeads, ...stageData],
          backgroundColor: [
            "#6366F1", // Total Leads
            "#FBBF24", // Prospecting
            "#A5B4FC", // Lead Qualification
            "#818CF8", // Needs Analysis / Discovery
            "#8B5CF6", // Presentation / Proposal
            "#EF4444", // Contract
            "#10B981", // Onboarded
            "#EC4899", // Follow-Up / Relationship Management
          ],
          borderColor: "#FFFFFF",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [filteredLeads]);

  const leadStatusData = useMemo(() => {
    const statusCounts = filteredLeads.reduce(
      (acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] || 0) + 1;
        return acc;
      },
      {
        Prospecting: 0,
        "Lead Qualification": 0,
        "Needs Analysis / Discovery": 0,
        "Presentation / Proposal": 0,
        Contract: 0,
        Onboarded: 0,
        "Follow-Up / Relationship Management": 0,
      } as Record<string, number>
    );
    return {
      labels: funnelStages,
      datasets: [
        {
          data: funnelStages.map((stage) => statusCounts[stage] || 0),
          backgroundColor: [
            "#FBBF24", // Prospecting
            "#A5B4FC", // Lead Qualification
            "#818CF8", // Needs Analysis / Discovery
            "#8B5CF6", // Presentation / Proposal
            "#EF4444", // Contract
            "#10B981", // Onboarded
            "#EC4899", // Follow-Up / Relationship Management
          ],
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [filteredLeads]);

 const trendData = useMemo(() => {
  const data = {
    labels: processedTrendsData.map((m: TrendData) => m.period),
    datasets: [
      // {
      //   label: "Total Leads",
      //   data: processedTrendsData.map((m: TrendData) => m.total_leads),
      //   borderColor: "#ec4899",
      //   backgroundColor: "rgba(236,72,153,0.08)",
      //   fill: true,
      //   tension: 0.4,
      //   borderWidth: 2,
      //   pointRadius: 3,
      //   pointBackgroundColor: "#ec4899",
      // },
      // {
      //   label: "Onboarded & Contracted Leads",
      //   data: processedTrendsData.map((m: TrendData) => m.converted_leads),
      //   borderColor: "#10B981",
      //   backgroundColor: "rgba(16,185,129,0.08)",
      //   fill: true,
      //   tension: 0.4,
      //   borderWidth: 2,
      //   pointRadius: 3,
      //   pointBackgroundColor: "#10B981",
      // },
      // {
      //   label: "Total Deal Value",
      //   data: processedTrendsData.map((m: TrendData) => m.total_deal_value / 1000000),
      //   borderColor: "#6366F1",
      //   backgroundColor: "rgba(99,102,241,0.08)",
      //   fill: true,
      //   tension: 0.4,
      //   borderWidth: 2,
      //   pointRadius: 3,
      //   pointBackgroundColor: "#6366F1",
      // },
      {
        label: "Prospecting",
        data: processedTrendsData.map((m: TrendData) => m.prospecting),
        borderColor: "#FBBF24",
        backgroundColor: "rgba(251,191,36,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#FBBF24",
      },
      {
        label: "Lead Qualification",
        data: processedTrendsData.map((m: TrendData) => m.lead_qualification),
        borderColor: "#A5B4FC",
        backgroundColor: "rgba(165,180,252,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#A5B4FC",
      },
      {
        label: "Needs Analysis / Discovery",
        data: processedTrendsData.map((m: TrendData) => m.needs_analysis),
        borderColor: "#818CF8",
        backgroundColor: "rgba(129,140,248,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#818CF8",
      },
      {
        label: "Presentation / Proposal",
        data: processedTrendsData.map((m: TrendData) => m.presentation),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139,92,246,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#8B5CF6",
      },
      {
        label: "Contract",
        data: processedTrendsData.map((m: TrendData) => m.contract),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239,68,68,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#EF4444",
      },
      {
        label: "Onboarded",
        data: processedTrendsData.map((m: TrendData) => m.onboarded),
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#10B981",
      },
      {
        label: "Follow-Up / Relationship Management",
        data: processedTrendsData.map((m: TrendData) => m.followup),
        borderColor: "#D97706",
        backgroundColor: "rgba(217,119,6,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#D97706",
      },
    ],
  };
  console.log("Trend Data:", data);
  return data;
}, [processedTrendsData]);

  useEffect(() => {
  console.log("Processed Trends Data:", processedTrendsData);
  console.log("Trend Data Object:", trendData);
  console.log("Number of datasets:", trendData.datasets?.length);
  console.log("Number of labels:", trendData.labels?.length);
}, [processedTrendsData, trendData]);

  const handleFunnelClick = (elements: any[]) => {
    if (!elements.length) return;
    const clickedIndex = elements[0].index;
    const labels = funnelData.labels;
    const statusMap: Record<string, string> = {
      Prospecting: "prospecting",
      "Lead Qualification": "lead_qualification",
      "Needs Analysis / Discovery": "needs_analysis",
      "Presentation / Proposal": "presentation",
      Contract: "contract",
      Onboarded: "onboarded",
      "Follow-Up / Relationship Management": "followup",
    };
    const clickedLabel = labels[clickedIndex].trim();
    if (clickedLabel === "Total Leads") {
      router.push(`/dashboard/sales/viewleads`);
    } else {
      const stage = statusMap[clickedLabel] || "all";
      router.push(`/dashboard/sales/viewleads?stage=${stage}`);
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
              Sales Manager Dashboard
            </h1>
            <p className="text-md text-slate-500 mt-0.5">
              Monitor sales performance and track lead progress
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-md font-medium text-slate-600">
                  Stages:
                </span>
              </div>
              <select
                ref={selectRef}
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                style={{ width: selectWidth }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white min-w-[150px] max-w-[150px] transition-all duration-200"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
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
            value={kpiMetrics.totalLeads}
            label="Total Leads"
            color="violet"
          />
           <KpiCard
    icon={<Briefcase className="h-4 w-4" />}
    value={(kpiMetrics.totalDealValue / 100000).toFixed(2)}
    label="Total Deal Value (L)"
    color="amber"
  />
          <KpiCard
            icon={<Users className="h-4 w-4" />}
            value={kpiMetrics.convertedLeads}
            label="Onboarded & Contracted Leads"
            color="indigo"
          />
          <KpiCard
            icon={<UserCheck className="h-4 w-4" />}
            value={`${kpiMetrics.conversionRate}%`}
            label="Conversion Rate"
            color="emerald"
          />
        </section>

        {/* Main Charts */}
        <section className="grid grid-cols-1 xl:grid-cols-1 gap-4">
          {/* Lead Funnel */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center">
              <SectionHeader
                title="Lead Funnel"
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
                    padding: { left: 10, right: 40, top: 0, bottom: 0 },
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
                      max: Math.ceil(
                        Math.max(...(funnelData.datasets[0]?.data || [0])) * 1.1
                      ),
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        stepSize: Math.ceil(
                          Math.max(...(funnelData.datasets[0]?.data || [0])) / 5
                        ),
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

          {/* Lead Status */}
          {/* <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <SectionHeader
                title="Lead Status"
                subtitle="Current distribution"
              />
            </div>
            <div className="h-64 flex items-center justify-center cursor-pointer mt-2">
              <Doughnut
                data={{
                  ...leadStatusData,
                  datasets: leadStatusData.datasets.map((dataset) => ({
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
          </div> */}
        </section>

        {/* Sales Trends Section */}
      <section className="grid grid-cols-1 gap-4">
  <div className="xl:col-span-2 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
    <div className="flex justify-between items-center mb-2">
      <SectionHeader
        title="Sales Trends"
        subtitle={`${trendPeriod.charAt(0).toUpperCase() + trendPeriod.slice(1)}ly breakdown`}
      />
      <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-md">
        {(["week", "month", "quarter"] as const).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setTrendPeriod(period)}
            className={`px-2 py-1 rounded text-md font-medium transition-all
              ${trendPeriod === period ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
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
                return context.dataIndex === datasetLength - 1 && value > 0
                  ? context.dataset.label === "Total Deal Value"
                    ? `${value.toFixed(2)}M`
                    : value
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
  color: "indigo" | "amber" | "emerald" | "violet";
}

function KpiCard({ icon, value, label, color }: CardProps) {
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