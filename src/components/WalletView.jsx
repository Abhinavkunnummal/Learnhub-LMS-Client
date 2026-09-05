import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineReceiptTax,
} from "react-icons/hi";

export default function WalletView({ userRole = "instructor" }) {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet/my-wallet");
      setWalletData(res.data);
    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > (walletData?.balance || 0)) {
      toast.error("Withdrawal amount exceeds available wallet balance");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await api.post("/wallet/withdraw", {
        amount,
        paymentDetails,
      });
      toast.success(res.data.message || "Withdrawal successful!");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setPaymentDetails("");
      fetchWallet();
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const balance = walletData?.balance || 0;
  const transactions = walletData?.transactions || [];
  const stats = walletData?.stats || {};

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-2">
              <HiOutlineCash className="h-5 w-5 text-emerald-400" />
              {userRole === "admin" ? "Platform Earnings Wallet (20% Share)" : "Instructor Earnings Wallet (80% Share)"}
            </div>
            <div className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              ${balance.toFixed(2)}
            </div>
            <p className="text-xs sm:text-sm text-indigo-200 mt-2">
              {userRole === "admin"
                ? "20% automated commission credited on every student course purchase."
                : "80% automated payout credited instantly on every enrolled course sale."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={balance <= 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <HiOutlineCreditCard className="h-5 w-5" />
              Request Withdrawal
            </button>
          </div>
        </div>

        {/* Quick Stats Grid inside card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-xs sm:text-sm">
          <div>
            <span className="text-indigo-200 block text-xs">Total Earnings</span>
            <span className="font-bold text-lg text-emerald-300">
              ${(stats.totalEarned || 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-indigo-200 block text-xs">Total Withdrawn</span>
            <span className="font-bold text-lg text-rose-300">
              ${(stats.totalSpent || 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-indigo-200 block text-xs">Total Transactions</span>
            <span className="font-bold text-lg text-white">
              {stats.totalTransactions || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <HiOutlineReceiptTax className="h-5 w-5 text-indigo-600" />
            Transaction & Payment History
          </h3>
          <button
            onClick={fetchWallet}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <span>↻</span> Refresh Live
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <HiOutlineCreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Sales, commissions, and withdrawals will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Type / Source</th>
                  <th className="px-5 py-3">Details / Student / Course</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {tx.type === "credit" ? (
                          <span className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
                            <HiOutlineArrowDown className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="p-1.5 rounded-full bg-rose-100 text-rose-700">
                            <HiOutlineArrowUp className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <div>
                          <span className="font-semibold capitalize text-xs text-gray-800 block">
                            {tx.source.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-mono">
                            {tx.paymentId?.substring(0, 14) || "TX"}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="font-bold text-gray-900">
                        {tx.description || tx.course?.title || "Transaction"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {tx.fromUser && (
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                            👤 Student: {tx.fromUser.name} ({tx.fromUser.email})
                          </span>
                        )}
                        {tx.course && (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                            📚 {tx.course.title}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold whitespace-nowrap">
                      <span
                        className={`text-sm ${
                          tx.type === "credit"
                            ? "text-emerald-600 font-extrabold"
                            : "text-rose-600 font-extrabold"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <HiOutlineCheckCircle className="h-3 w-3" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <HiOutlineCreditCard className="h-5 w-5 text-indigo-600" />
                Request Payout / Withdrawal
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Available Balance:{" "}
                  <span className="text-emerald-600 font-bold">
                    ${balance.toFixed(2)}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bank / UPI / PayPal Details
                </label>
                <textarea
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="Enter your Bank Account Number, IFSC, UPI ID, or PayPal Email for payout..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs resize-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing || !withdrawAmount}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {withdrawing ? "Processing..." : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
