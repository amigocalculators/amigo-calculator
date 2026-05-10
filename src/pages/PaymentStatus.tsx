import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Clock,
  ShoppingBag,
  AlertTriangle,
  Info,
} from "lucide-react";

const PaymentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For initial loading state

  useEffect(() => {
    if (location.state?.paymentDetails) {
      setPaymentDetails(location.state.paymentDetails);
    }
    setIsLoading(false); // Stop loading once state is checked
  }, [location]);

  const downloadInvoice = () => {
    if (!paymentDetails) return;

    const invoiceContent = `
Mitra Agro Enterprises Limited
-------------------------------
Invoice
-------------------------------
Order ID:     ${paymentDetails.orderId}
Payment ID:   ${paymentDetails.paymentId || "N/A"}
Amount:       ₹${Number(paymentDetails.amount).toFixed(2)}
Payment Date: ${
      paymentDetails.date
        ? new Date(paymentDetails.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
    }
Status:       ${paymentDetails.status?.toUpperCase()}
Method:       ${paymentDetails.method || "N/A"}
-------------------------------
Thank you for your business!
    `;
    // Basic styling for the text file
    const styledInvoiceContent = invoiceContent
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    const blob = new Blob([styledInvoiceContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-MitraAgro-${paymentDetails.orderId}.txt`;
    document.body.appendChild(a); // Required for Firefox
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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Payment Information Missing
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              We couldn't retrieve the details for this payment. This might be
              due to a navigation error or incomplete data.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/orders")} // Or a more relevant page
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                View My Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess =
    paymentDetails.status?.toLowerCase() === "success" ||
    paymentDetails.status?.toLowerCase() === "successful";

  // Enhanced Order Status - This should ideally come from your backend or be more dynamic
  const orderJourney = [
    {
      name: "Payment",
      status: isSuccess ? "completed" : "failed",
      time: paymentDetails.date
        ? new Date(paymentDetails.date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      icon: CreditCard,
    },
    {
      name: "Order Confirmed",
      status: isSuccess ? "completed" : "pending",
      time: isSuccess ? "Shortly after payment" : "N/A",
      icon: Package,
    },
    {
      name: "Processing",
      status: isSuccess ? "in_progress" : "pending",
      time: isSuccess ? "Typically 1-2 business days" : "N/A",
      icon: Clock,
    },
    {
      name: "Shipped",
      status: "pending",
      time: isSuccess ? "Updates via email/SMS" : "N/A",
      icon: Truck,
    },
    {
      name: "Delivered",
      status: "pending",
      time: isSuccess ? "Track your package" : "N/A",
      icon: ShoppingBag,
    },
  ];

  const getStatusAttributes = (status) => {
    switch (status) {
      case "completed":
        return {
          color: "text-green-600 bg-green-100 border-green-500",
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        };
      case "in_progress":
        return {
          color: "text-blue-600 bg-blue-100 border-blue-500",
          icon: <Clock className="w-5 h-5 text-blue-600 animate-pulse" />,
        };
      case "failed":
        return {
          color: "text-red-600 bg-red-100 border-red-500",
          icon: <XCircle className="w-5 h-5 text-red-600" />,
        };
      default:
        return {
          color: "text-gray-500 bg-gray-100 border-gray-400",
          icon: <Info className="w-5 h-5 text-gray-500" />,
        }; // Pending
    }
  };

  return (
    <div className="pt-16 pb-12 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div
            className={`p-6 md:p-10 text-center ${
              isSuccess
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            <div className="flex justify-center mb-6">
              {isSuccess ? (
                <CheckCircle className="w-20 h-20 text-white transform transition-transform hover:scale-110" />
              ) : (
                <XCircle className="w-20 h-20 text-white transform transition-transform hover:scale-110" />
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              {isSuccess ? "Payment Successful!" : "Payment Failed"}
            </h1>
            <p className="mt-3 text-lg text-white/90">
              {isSuccess
                ? "Thank you for your purchase! Your order is being processed."
                : paymentDetails.failureReason ||
                  "There was an issue with your payment. Please check the details or try another method."}
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Payment Details Section */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                Payment Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  { label: "Order ID", value: paymentDetails.orderId },
                  {
                    label: "Payment ID",
                    value: paymentDetails.paymentId || "N/A",
                  },
                  {
                    label: "Amount Paid",
                    value: `₹${Number(paymentDetails.amount).toFixed(2)}`,
                    highlight: true,
                  },
                  {
                    label: "Payment Method",
                    value: paymentDetails.method || "N/A",
                  },
                  {
                    label: "Date & Time",
                    value: paymentDetails.date
                      ? new Date(paymentDetails.date).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : new Date().toLocaleString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }),
                  },
                  {
                    label: "Status",
                    value: paymentDetails.status?.toUpperCase(),
                    statusClass: isSuccess
                      ? "text-green-700 font-semibold"
                      : "text-red-700 font-semibold",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between py-2 border-b border-gray-200 last:border-b-0 sm:last:border-b-0"
                  >
                    <span className="text-gray-600">{item.label}:</span>
                    <span
                      className={`font-medium text-gray-800 ${
                        item.highlight ? "text-lg" : ""
                      } ${item.statusClass || ""}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Journey Section (for successful payments) */}
            {isSuccess && (
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                  Order Journey
                </h2>
                <div className="space-y-6">
                  {orderJourney.map((step, index) => {
                    const { color, icon: StepIcon } = getStatusAttributes(
                      step.status
                    );
                    const isLastStep = index === orderJourney.length - 1;
                    return (
                      <div key={step.name} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${color}`}
                          >
                            {StepIcon}
                          </div>
                          {!isLastStep && (
                            <div
                              className={`w-0.5 h-12 mt-1 ${
                                step.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                          )}
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              step.status === "completed"
                                ? "text-gray-800"
                                : "text-gray-600"
                            }`}
                          >
                            {step.name}
                          </h3>
                          <p className="text-xs text-gray-500">{step.time}</p>
                          {step.status === "in_progress" && (
                            <p className="text-xs text-blue-600 mt-1">
                              This is the current step.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <button
                  onClick={downloadInvoice}
                  disabled={!paymentDetails}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>

                {/* {isSuccess ? (
                  <button
                    onClick={() => navigate('/orders')} // Or your specific orders page
                    className="w-full border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    View My Orders
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/checkout')} // Or relevant page to retry payment
                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-md"
                  >
                    <CreditCard className="w-5 h-5" />
                    Try Payment Again
                  </button>
                )} */}
              </div>
              <button
                onClick={() => navigate("/")}
                className="w-full mt-4 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center gap-2"
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
};

export default PaymentStatus;
