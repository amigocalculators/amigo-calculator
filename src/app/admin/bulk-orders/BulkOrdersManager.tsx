'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, Search } from 'lucide-react';

type Enquiry = {
  id: number;
  enquiry_type: 'wholesale' | 'corporate';
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  quantity: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-600',
};

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

export default function BulkOrdersManager({ initialEnquiries }: { initialEnquiries: Enquiry[] }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const supabase = createClient();

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    const { data, error } = await supabase.from('bulk_order_enquiries').update({ status }).eq('id', id).select().single();
    if (error) {
      alert(`Update failed: ${error.message}`);
    } else {
      setEnquiries((prev) => prev.map((e) => (e.id === id ? data : e)));
    }
    setUpdatingId(null);
  };

  const filtered = enquiries.filter(
    (e) =>
      e.company_name.toLowerCase().includes(search.toLowerCase()) ||
      e.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, contact or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No enquiries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Company / Contact</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((enquiry) => (
                <React.Fragment key={enquiry.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{enquiry.company_name}</p>
                      <p className="text-gray-500 text-xs">{enquiry.contact_person}</p>
                      <p className="text-gray-500 text-xs">{enquiry.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        enquiry.enquiry_type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {enquiry.enquiry_type === 'wholesale' ? 'Wholesale' : 'Corporate'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{enquiry.quantity || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={enquiry.status}
                          disabled={updatingId === enquiry.id}
                          onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                          className={`appearance-none pr-6 pl-2 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none disabled:opacity-60 capitalize ${statusColors[enquiry.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-white text-gray-900 capitalize">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                      {updatingId === enquiry.id && <p className="text-xs text-blue-600 mt-1">Updating…</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(enquiry.created_at).toLocaleDateString('en-IN')}<br />
                      {new Date(enquiry.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(expanded === enquiry.id ? null : enquiry.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {expanded === enquiry.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expanded === enquiry.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-1">Phone</p>
                            <p className="text-gray-600">{enquiry.phone}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Message</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{enquiry.message || '(no message)'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
