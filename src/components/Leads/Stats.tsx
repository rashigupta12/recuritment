
// components/Leads/LeadsStats.tsx
import { Building2, IndianRupee, Users } from "lucide-react";
import { Lead } from "@/stores/leadStore";

interface LeadsStatsProps {
  leads: Lead[];
}

export const LeadsStats = ({ leads }: LeadsStatsProps) => {
  const totalLeads = leads.length;
  const uniqueCompanies = new Set(leads.map((l) => l.company_name)).size;
  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.custom_budgetinr || 0), 0);
  const expectedHires = leads.reduce((sum, lead) => sum + (lead.custom_expected_hiring_volume || 0), 0);

  const statCards = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Companies",
      value: uniqueCompanies,
      icon: Building2,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      title: "Expected Hires",
      value: expectedHires,
      icon: Users,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4 mt-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <IconComponent className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
