import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import WalletView from "../components/WalletView";
import {
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [walletBalance, setWalletBalance] = useState(user?.wallet || 0);
  const roleFilterRef = useRef(roleFilter);

  // Keep ref in sync
  useEffect(() => {
    roleFilterRef.current = roleFilter;
  }, [roleFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data.stats);

      const walletRes = await api.get("/wallet/my-wallet");
      if (walletRes.data && typeof walletRes.data.balance === "number") {
        setWalletBalance(walletRes.data.balance);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilterRef.current) params.set("role", roleFilterRef.current);

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  // Re-fetch users when role filter changes
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, fetchUsers]);

  const handleApproveInstructor = async (userId) => {
    try {
      await api.put(`/users/${userId}/approve`);
      toast.success("Instructor approved!");
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-white">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your learning platform</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
            <HiOutlineUsers className="h-7 w-7 text-indigo-600 dark:text-indigo-400 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalUsers}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Total Users</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
            <HiOutlineBookOpen className="h-7 w-7 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCourses}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Courses</p>
          </div>
          <div
            onClick={() => setActiveTab("wallet")}
            className="bg-emerald-50 dark:bg-emerald-950/60 rounded-xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800 shadow-sm cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition"
          >
            <HiOutlineCurrencyDollar className="h-7 w-7 text-emerald-600 dark:text-emerald-400 mb-2" />
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              ${walletBalance.toFixed(2)}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-400">
              Platform Wallet (20%) →
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
            <HiOutlineChartBar className="h-7 w-7 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalEnrollments}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Enrollments</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
            <HiOutlineAcademicCap className="h-7 w-7 text-yellow-600 dark:text-yellow-400 mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCertificates}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Certificates</p>
          </div>
        </div>
      )}

      {/* Pending Instructors */}
      {stats?.pendingInstructors > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/60 border border-yellow-200 dark:border-yellow-800/80 rounded-xl p-4 sm:p-5 mb-8">
          <div className="flex items-center gap-3">
            <HiOutlineShieldCheck className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                {stats.pendingInstructors} instructor(s) pending approval
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Go to the Users tab to review and approve them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-zinc-900 rounded-xl p-1 border border-gray-200 dark:border-zinc-800 mb-8 w-full sm:w-fit overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "wallet", label: "Platform Wallet (20% Share)" },
          { id: "users", label: "User Management" },
          { id: "popular", label: "Popular Courses" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <WalletView userRole="admin" />
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Role */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Users by Role</h3>
            {stats.usersByRole.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-800 last:border-0"
              >
                <span className="capitalize text-gray-700 dark:text-zinc-300">{item._id}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Enrollments</h3>
            {stats.recentEnrollments.length === 0 ? (
              <p className="text-gray-500 dark:text-zinc-400 text-sm">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentEnrollments.map((e) => (
                  <div
                    key={e._id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {e.student?.name || "Student"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {e.course?.title || "Course"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 ml-3 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Courses */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 lg:col-span-2 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Popular Courses</h3>
            {stats.popularCourses.length === 0 ? (
              <p className="text-gray-500 dark:text-zinc-400 text-sm">No courses yet</p>
            ) : (
              <div className="space-y-3">
                {stats.popularCourses.map((course, i) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg font-bold text-gray-300 dark:text-zinc-600">
                        #{i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">
                          by {course.instructor?.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap ml-3">
                      {course.enrolledStudents?.length || 0} students
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-sm hover:bg-indigo-700 transition"
                >
                  Search
                </button>
              </form>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {users.map((u) => (
              <div
                key={u._id}
                className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                      {u.name}
                    </p>
                    <span
                      className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${
                        u.role === "admin"
                          ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300"
                          : u.role === "instructor"
                          ? "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300"
                          : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {u.role}
                    </span>
                    {u.role === "instructor" && !u.isApproved && (
                      <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 truncate">
                    {u.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {u.role === "instructor" && !u.isApproved && (
                    <button
                      onClick={() => handleApproveInstructor(u._id)}
                      className="bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900 transition flex items-center gap-1 border border-green-200 dark:border-green-800"
                    >
                      <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                  )}
                  {u.role !== "admin" && (
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                      title="Delete User"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tab */}
      {activeTab === "popular" && stats && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Monthly Enrollments
          </h3>
          {stats.monthlyEnrollments.length === 0 ? (
            <p className="text-gray-500 dark:text-zinc-400 text-sm">No enrollment data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.monthlyEnrollments.map((item) => (
                <div
                  key={`${item._id.year}-${item._id.month}`}
                  className="flex items-center gap-3 sm:gap-4 py-3 border-b border-gray-100 dark:border-zinc-800 last:border-0"
                >
                  <span className="text-sm text-gray-700 dark:text-zinc-300 whitespace-nowrap min-w-[120px]">
                    {new Date(
                      item._id.year,
                      item._id.month - 1
                    ).toLocaleString("default", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-zinc-700 rounded-full h-2 min-w-0">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (item.count /
                            Math.max(
                              ...stats.monthlyEnrollments.map((m) => m.count)
                            )) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white w-8 text-right text-sm">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
