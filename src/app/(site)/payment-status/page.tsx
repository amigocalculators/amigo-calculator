'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, XCircle, Download, ArrowLeft, Package, Truck, CreditCard, Clock, ShoppingBag, AlertTriangle, Info,
} from 'lucide-react';

interface PaymentDetails {
  status: string;
  paymentId?: string;
  orderId: string;
  amount: number;
  method?: string;
  date?: string;
  failureReason?: string;
}

export default function PaymentStatusPage() {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('paymentDetails');
    if (stored) {
      setPaymentDetails(JSON.parse(stored));
      sessionStorage.removeItem('paymentDetails');
    }
    setIsLoading(false);
  }, []);

  const downloadInvoice = () => {
    if (!paymentDetails) return;
    const content = `
Mitra Agro Enterprises Limited
-------------------------------
Invoice
-------------------------------
Order ID:     ${paymentDetails.orderId}
Payment ID:   ${paymentDetails.paymentId || 'N/A'}
Amount:       ₹${Number(paymentDetails.amount).toFixed(2)}
Payment Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Status:       ${paymentDetails.status?.toUpperCase()}
Method:       ${paymentDetails.method || 'N/A'}
-------------------------------
Thank you for your business!
    `.trim();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-Amigo-${paymentDetails.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Information Missing</h1>
            <p className="text-gray-600 mb-8 text-lg">We couldn&apos;t retrieve the details for this payment.</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = ['success', 'successful'].includes(paymentDetails.status?.toLowerCase());

  const orderJourney = [
    { name: 'Payment', status: isSuccess ? 'completed' : 'failed', icon: CreditCard },
    { name: 'Order Confirmed', status: isSuccess ? 'completed' : 'pending', icon: Package },
    { name: 'Processing', status: isSuccess ? 'in_progress' : 'pending', icon: Clock },
    { name: 'Shipped', status: 'pending', icon: Truck },
    { name: 'Delivered', status: 'pending', icon: ShoppingBag },
  ];

  const getStatusAttrs = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'text-green-600 bg-green-100 border-green-500', icon: <CheckCircle className="w-5 h-5 text-green-600" /> };
      case 'in_progress': return { color: 'text-blue-600 bg-blue-100 border-blue-500', icon: <Clock className="w-5 h-5 text-blue-600 animate-pulse" /> };
      case 'failed': return { color: 'text-red-600 bg-red-100 border-red-500', icon: <XCircle className="w-5 h-5 text-red-600" /> };
      default: return { color: 'text-gray-500 bg-gray-100 border-gray-400', icon: <Info className="w-5 h-5 text-gray-500" /> };
    }
  };

  return (
    <div className="pt-16 pb-12 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className={`p-6 md:p-10 text-center ${isSuccess ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
            <div className="flex justify-center mb-6">
              {isSuccess ? <CheckCircle className="w-20 h-20 text-white" /> : <XCircle className="w-20 h-20 text-white" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
            </h1>
            <p className="mt-3 text-lg text-white/90">
              {isSuccess
                ? 'Thank you for your purchase! Your order is being processed.'
                : paymentDetails.failureReason || 'There was an issue with your payment. Please try again.'}
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Payment Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  { label: 'Order ID', value: paymentDetails.orderId },
                  { label: 'Payment ID', value: paymentDetails.paymentId || 'N/A' },
                  { label: 'Amount Paid', value: `₹${Number(paymentDetails.amount).toFixed(2)}`, highlight: true },
                  { label: 'Payment Method', value: paymentDetails.method || 'N/A' },
                  { label: 'Date & Time', value: new Date().toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Status', value: paymentDetails.status?.toUpperCase(), statusClass: isSuccess ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className={`font-medium text-gray-800 ${item.highlight ? 'text-lg' : ''} ${item.statusClass || ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Journey */}
            {isSuccess && (
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Order Journey</h2>
                <div className="space-y-6">
                  {orderJourney.map((step, index) => {
                    const { color, icon } = getStatusAttrs(step.status);
                    const isLast = index === orderJourney.length - 1;
                    return (
                      <div key={step.name} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${color}`}>{icon}</div>
                          {!isLast && <div className={`w-0.5 h-12 mt-1 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${step.status === 'completed' ? 'text-gray-800' : 'text-gray-600'}`}>{step.name}</h3>
                          {step.status === 'in_progress' && <p className="text-xs text-blue-600 mt-1">This is the current step.</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={downloadInvoice}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-5 h-5" />
                Download Invoice
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full mt-4 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
