import { useState } from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineQrcode,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineLockClosed,
  HiOutlineInformationCircle,
  HiOutlineCash,
  HiOutlineX,
} from "react-icons/hi";

export default function RazorpayModal({
  isOpen,
  onClose,
  course,
  user,
  orderData,
  onSuccess,
  onFailure,
}) {
  const [selectedMethod, setSelectedMethod] = useState("upi"); // "upi", "card", "netbanking"
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("student@oksbi");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [paymentStatus, setPaymentStatus] = useState(null); // null, "success", "failed"
  const [failureReason, setFailureReason] = useState("");

  if (!isOpen || !course) return null;

  const price = course.price || 0;
  const instructorShare = (price * 0.8).toFixed(2);
  const adminShare = (price * 0.2).toFixed(2);
  const amountInINR = (price * 83).toLocaleString("en-IN"); // Approx INR conversion for display

  const handlePaySuccess = async () => {
    setProcessing(true);
    setPaymentStatus(null);

    // Simulate 1.2s gateway processing delay for realism
    setTimeout(async () => {
      setProcessing(false);
      setPaymentStatus("success");

      const paymentResponse = {
        razorpay_order_id:
          orderData?.orderId || `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        razorpay_payment_id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        razorpay_signature: `sig_${Date.now()}_verified`,
      };

      setTimeout(() => {
        onSuccess(paymentResponse);
      }, 1200);
    }, 1200);
  };

  const handlePayFailure = () => {
    setProcessing(true);
    setPaymentStatus(null);

    setTimeout(() => {
      setProcessing(false);
      setPaymentStatus("failed");
      setFailureReason("Bank Gateway Error: Transaction declined by issuing bank (ERR_INSUFFICIENT_FUNDS_OR_TIMEOUT)");

      if (onFailure) {
        onFailure({
          error: "PAYMENT_DECLINED",
          message: "Transaction declined by issuing bank or payment gateway",
        });
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-5 flex items-center justify-between shadow-md relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-700 font-extrabold text-xl shadow">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wide text-base">Razorpay</span>
                <span className="text-[10px] bg-blue-500/60 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Trusted Gateway
                </span>
              </div>
              <p className="text-xs text-blue-200 flex items-center gap-1">
                <HiOutlineLockClosed className="h-3.5 w-3.5" />
                256-Bit SSL End-to-End Secure Payment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={processing}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        {/* Payment Details & Revenue Split Summary */}
        <div className="bg-indigo-50/70 p-4 border-b border-indigo-100/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
                {course.title}
              </h3>
              <p className="text-xs text-gray-500">
                Instructor: <span className="font-medium text-gray-800">{course.instructor || "Instructor"}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-indigo-700">
                ${price}
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                ≈ ₹{amountInINR} INR
              </span>
            </div>
          </div>

          {/* Revenue Split Banner (80% / 20%) */}
          <div className="bg-white/90 rounded-xl p-2.5 border border-indigo-100 text-xs flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <HiOutlineCash className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>80% Instructor Share:</span>
              <span className="font-bold">${instructorShare}</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
              <HiOutlineShieldCheck className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <span>20% Admin:</span>
              <span className="font-bold">${adminShare}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Status Overlay if completed or failed */}
          {paymentStatus === "success" && (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <HiOutlineCheckCircle className="h-14 w-14 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-emerald-900">Payment Successful!</h4>
              <p className="text-xs text-emerald-700">
                Transaction ID: <span className="font-mono font-bold">pay_{Date.now()}</span>
              </p>
              <p className="text-xs text-gray-600">
                $ {instructorShare} credited to Instructor & $ {adminShare} to Admin. Activating course access...
              </p>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <HiOutlineXCircle className="h-12 w-12 text-rose-600 mx-auto" />
              <h4 className="text-base font-bold text-rose-900">Payment Failed</h4>
              <p className="text-xs text-rose-700 font-medium">
                {failureReason}
              </p>
              <button
                onClick={() => setPaymentStatus(null)}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline inline-block"
              >
                Try Again
              </button>
            </div>
          )}

          {!paymentStatus && (
            <>
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("upi")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    selectedMethod === "upi"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <HiOutlineQrcode className="h-5 w-5" />
                  UPI / QR
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    selectedMethod === "card"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <HiOutlineCreditCard className="h-5 w-5" />
                  Cards
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("netbanking")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    selectedMethod === "netbanking"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <HiOutlineCash className="h-5 w-5" />
                  Net Banking
                </button>
              </div>

              {/* Method Details */}
              {selectedMethod === "upi" && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Instant UPI (Google Pay, PhonePe, Paytm)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>⚡ Instant Auto-Approve</span>
                    <span className="text-emerald-600 font-bold">Zero Gateway Fee</span>
                  </div>
                </div>
              )}

              {selectedMethod === "card" && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        maxLength={4}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "netbanking" && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-700">
                    Select Popular Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Action Buttons: Pay Success or Failure simulation */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handlePaySuccess}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Contacting Razorpay Gateway...
                    </span>
                  ) : (
                    <span>Pay ${price} (Complete Payment)</span>
                  )}
                </button>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePayFailure}
                    disabled={processing}
                    className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 py-2 rounded-xl text-xs font-semibold transition border border-rose-200"
                  >
                    Test Payment Failure
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <HiOutlineShieldCheck className="h-4 w-4 text-blue-600" />
            <span>PCI-DSS Level 1 Certified</span>
          </div>
          <span>LearnHub Razorpay Gateway</span>
        </div>
      </div>
    </div>
  );
}
