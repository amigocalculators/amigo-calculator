'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Building2, Users, Loader2 } from 'lucide-react';

type EnquiryType = 'wholesale' | 'corporate';

const emptyForm = { companyName: '', contactPerson: '', email: '', phone: '', quantity: '', message: '', website: '' };

export default function BulkOrdersClient() {
  const [enquiryType, setEnquiryType] = useState<EnquiryType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryType) {
      toast.error('Please choose Wholesale or Corporate first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/bulk-order-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryType, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit enquiry');
      toast.success('Enquiry sent! We will get back to you soon.');
      setForm(emptyForm);
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0efef]">
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Bulk Orders</h1>
          <p className="text-gray-600">Wholesale and corporate enquiries — get custom pricing for bulk purchases.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          <button
            type="button"
            onClick={() => setEnquiryType('wholesale')}
            className={`p-6 rounded-lg border-2 text-left bg-white shadow-sm transition hover:shadow-md ${
              enquiryType === 'wholesale' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
          >
            <Building2 className="w-8 h-8 text-blue-600 mb-3" />
            <h2 className="text-lg font-bold mb-1">Wholesale Enquiry</h2>
            <p className="text-sm text-gray-600">Retailers &amp; distributors buying in bulk for resale.</p>
          </button>
          <button
            type="button"
            onClick={() => setEnquiryType('corporate')}
            className={`p-6 rounded-lg border-2 text-left bg-white shadow-sm transition hover:shadow-md ${
              enquiryType === 'corporate' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
          >
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h2 className="text-lg font-bold mb-1">Corporate Enquiry</h2>
            <p className="text-sm text-gray-600">Businesses &amp; institutions buying for internal use or gifting.</p>
          </button>
        </div>

        {enquiryType && !submitted && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 space-y-4">
            {/* Honeypot — hidden from real users, bots that auto-fill every field will trip it */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Organization Name *</label>
                <input required name="companyName" value={form.companyName} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input required name="contactPerson" value={form.contactPerson} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input required type="tel" pattern="[0-9]{10}" name="phone" value={form.phone} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
              <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 500 units, or 50-100/month"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} name="message" value={form.message} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Sending...' : 'Submit Enquiry'}
            </button>
          </form>
        )}

        {submitted && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Thanks — we&apos;ve received your enquiry!</h2>
            <p className="text-gray-600 mb-4">Our team will get back to you shortly.</p>
            <button
              onClick={() => { setSubmitted(false); setEnquiryType(null); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Submit another enquiry
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
