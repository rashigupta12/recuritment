/*eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useAuth } from '@/contexts/AuthContext';
import { frappeAPI } from '@/lib/api/frappeClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Opportunity {
  custom_expected_revenue: any;
  custom_expected_hiring_volume: any;
  email_id: string;
  name: string;
  contact_person: string;
  contact_mobile: string;
  job_title: string;
  customer_name: string;
  industry: string;
  website: string;
  title: string;
  no_of_employees: number;
  contact_email: string;
  currency: string;
  city: string;
  state: string;
  country: string;
  budget: number;
  revenue: number;
}

const Allopportunities = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Function to fetch opportunities + linked leads
  const fetchLeads = async (email: string) => {
    try {
      setLoading(true);

      // 1. Fetch all opportunities
      const response = await frappeAPI.getAllOpportunity(email);
     
      const oppList = response.data || [];
      console.log(oppList)

      // 2. Fetch details for each opportunity
      const detailedOpportunities = await Promise.all(
        oppList.map(async (opp: { name: string }) => {
          try {
            const oppDetails = await frappeAPI.getOpportunityBYId(opp.name);
            
            return {
              ...oppDetails.data,
            };
          } catch (err) {
            console.error(`Error fetching details for opp ${opp.name}:`, err);
            return null;
          }
        })
      );

      setOpportunities(detailedOpportunities.filter(Boolean));
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when user loads
  useEffect(() => {
    if (user?.email) {
      fetchLeads(user.email);
    }
  }, [user]);

  // Handle create quotation
  const handleCreateQuotation = (opportunity: Opportunity) => {
    // Store opportunity data in sessionStorage or pass as query params
    sessionStorage.setItem('selectedOpportunity', JSON.stringify(opportunity));
    router.push('/dashboard/sales-manager/quotation');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading opportunities...</p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No opportunities found.</div>
        <p className="text-gray-400 mt-2">Start by creating your first opportunity.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Opportunities</h1>
        <p className="text-gray-600 mt-1">Manage and track your sales opportunities</p>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hiring Volumne
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opportunities.map((opportunity, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {opportunity.contact_person || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {opportunity.job_title || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {opportunity.contact_mobile  || 'N/A'}
                      </div>
                        <div className="text-sm text-gray-500">
                        {opportunity.contact_email || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.customer_name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {opportunity.industry || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {opportunity.no_of_employees ? `${opportunity.no_of_employees} employees` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {opportunity.website}
                  </div>


                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {opportunity.city || 'N/A'}, {opportunity.state || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {opportunity.country || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    
                    {/* `{opportunity.custom_expected_revenue || 'N/A'} */}
                    {opportunity.custom_expected_revenue
            ? `₹${opportunity.custom_expected_revenue.toLocaleString()}`
            : "No budget"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.custom_expected_hiring_volume || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleCreateQuotation(opportunity)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Quotation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className="lg:hidden space-y-4">
        {opportunities.map((opportunity, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {opportunity.contact_person || 'Unknown Contact'}
                </h3>
                <p className="text-sm text-gray-600">
                  {opportunity.job_title || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => handleCreateQuotation(opportunity)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
              >
                Quote
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Company:</span>
                <span className="text-sm font-medium text-gray-900">
                  {opportunity.customer_name || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Industry:</span>
                <span className="text-sm text-gray-700">
                  {opportunity.industry || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Location:</span>
                <span className="text-sm text-gray-700">
                  {[opportunity.city, opportunity.state, opportunity.country]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Budget:</span>
                <span className="text-sm font-medium text-green-600">
                  {opportunity.budget ? 
                    `${opportunity.currency || ''} ${opportunity.budget.toLocaleString()}` : 
                    'N/A'
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Revenue:</span>
                <span className="text-sm font-medium text-blue-600">
                  {opportunity.revenue ? 
                    `${opportunity.currency || ''} ${opportunity.revenue.toLocaleString()}` : 
                    'N/A'
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Contact:</span>
                <span className="text-sm text-gray-700">
                  {opportunity.contact_mobile || opportunity.contact_email || 'N/A'}
                </span>
              </div>

              {opportunity.website && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Website:</span>
                  <a 
                    href={opportunity.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit
                  </a>
                </div>
              )}

              {opportunity.no_of_employees && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Employees:</span>
                  <span className="text-sm text-gray-700">
                    {opportunity.no_of_employees}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Allopportunities;