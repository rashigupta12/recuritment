'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Opportunity {
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

interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const Quotation = () => {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [quotationData, setQuotationData] = useState({
    quotation_number: `QUO-${Date.now()}`,
    valid_till: '',
    terms_conditions: 'Payment terms: 30 days\nDelivery: As per agreement\nTaxes: As applicable',
    notes: '',
  });
  const [items, setItems] = useState<QuotationItem[]>([
    { id: 1, description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  useEffect(() => {
    // Retrieve opportunity data from sessionStorage
    const storedOpportunity = sessionStorage.getItem('selectedOpportunity');
    if (storedOpportunity) {
      const parsedOpportunity = JSON.parse(storedOpportunity);
      setOpportunity(parsedOpportunity);
      console.log('Opportunity data:', parsedOpportunity);
      
      // Set default valid till date (30 days from now)
      const validTill = new Date();
      validTill.setDate(validTill.getDate() + 30);
      setQuotationData(prev => ({
        ...prev,
        valid_till: validTill.toISOString().split('T')[0]
      }));
    } else {
      // If no opportunity data, redirect back to opportunities
      router.push('/dashboard/sales-manager/opportunity');
    }
  }, [router]);

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems([...items, { id: newId, description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: keyof QuotationItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Calculate total when quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.18; // 18% tax
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quotationPayload = {
      ...quotationData,
      opportunity: opportunity,
      items: items,
      subtotal: calculateSubtotal(),
      tax: calculateTax(calculateSubtotal()),
      grand_total: calculateGrandTotal()
    };
    
    console.log('Quotation Data:', quotationPayload);
    // Here you would typically send this data to your API
    // await frappeAPI.createQuotation(quotationPayload);
  };

  if (!opportunity) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading opportunity data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Quotation</h1>
            <p className="text-gray-600 mt-1">Generate quotation for {opportunity.customer_name}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <p className="text-gray-900 font-medium">{opportunity.customer_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <p className="text-gray-900">{opportunity.contact_person} ({opportunity.job_title})</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{opportunity.email_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-900">{opportunity.contact_mobile}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <p className="text-gray-900">{opportunity.industry}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <p className="text-gray-900">
                {[opportunity.city, opportunity.state, opportunity.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quotation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
              <input
                type="text"
                value={quotationData.quotation_number}
                onChange={(e) => setQuotationData({...quotationData, quotation_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Till</label>
              <input
                type="date"
                value={quotationData.valid_till}
                onChange={(e) => setQuotationData({...quotationData, valid_till: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">{opportunity.currency || 'INR'}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-left py-2 px-2 w-24">Quantity</th>
                  <th className="text-left py-2 px-2 w-32">Unit Price</th>
                  <th className="text-left py-2 px-2 w-32">Total</th>
                  <th className="text-left py-2 px-2 w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </td>
                    <td className="py-2 px-2">
                      <span className="font-medium">{item.total.toFixed(2)}</span>
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Subtotal:</span>
                <span className="font-medium">{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Tax (18%):</span>
                <span className="font-medium">{calculateTax(calculateSubtotal()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Grand Total:</span>
                <span>{calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
          <textarea
            value={quotationData.terms_conditions}
            onChange={(e) => setQuotationData({...quotationData, terms_conditions: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter terms and conditions"
          />
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={quotationData.notes}
            onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes (optional)"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate Quotation
          </button>
        </div>
      </form>
    </div>
  );
};

export default Quotation;