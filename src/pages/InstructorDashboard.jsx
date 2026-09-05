import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import WalletView from "../components/WalletView";
import ChatModal from "../components/ChatModal";
import {
  HiOutlinePlus,
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import { SiGooglemeet } from "react-icons/si";
import VideoPlayer from "../components/VideoPlayer";
import GoogleMeetSection from "../components/GoogleMeetSection";

const categories = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Music",
  "Photography",
  "Fitness",
  "Language",
  "Other",
];

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "Programming",
    level: "Beginner",
    price: 0,
    tags: "",
    thumbnail: "",
    previewVideo: "",
    isPublished: true,
  });
  const [creating, setCreating] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [activeTab, setActiveTab] = useState("courses"); // "courses", "wallet", "messages"
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [walletBalance, setWalletBalance] = useState(user?.wallet || 0);

  useEffect(() => {
    fetchCourses();
    fetchContacts();
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const res = await api.get("/wallet/my-wallet");
      if (res.data && typeof res.data.balance === "number") {
        setWalletBalance(res.data.balance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await api.get("/messages/contacts");
      setContacts(res.data.contacts || []);
    } catch (error) {
      console.error("Error loading chat contacts", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleFileUpload = async (file, field) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      if (field === "thumbnail") setUploadingThumb(true);
      if (field === "previewVideo") setUploadingVid(true);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data.file.url;
      setNewCourse((prev) => ({ ...prev, [field]: fileUrl }));
      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      if (field === "thumbnail") setUploadingThumb(false);
      if (field === "previewVideo") setUploadingVid(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/my-courses");
      setCourses(res.data.courses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/courses", {
        ...newCourse,
        tags: newCourse.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Course created and published!");
      setShowCreateModal(false);
      setNewCourse({
        title: "",
        description: "",
        category: "Programming",
        level: "Beginner",
        price: 0,
        tags: "",
        thumbnail: "",
        previewVideo: "",
        isPublished: true,
      });
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success("Course deleted");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const togglePublish = async (courseId, currentStatus) => {
    try {
      await api.put(`/courses/${courseId}`, { isPublished: !currentStatus });
      toast.success(currentStatus ? "Course unpublished" : "Course published");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to update course");
    }
  };

  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.enrolledStudents?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Check if instructor is pending approval
  const isPending = user && user.role === "instructor" && !user.isApproved;

  if (isPending) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineClock className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Account Pending Approval
          </h1>
          <p className="text-gray-500 mb-2 max-w-md mx-auto">
            Your instructor account has been created successfully. An admin
            needs to approve your account before you can start creating
            courses.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            This usually takes 1-2 business days. You'll be able to login and
            create courses once approved.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HiOutlineShieldCheck className="h-5 w-5 text-indigo-600" />
              What happens next?
            </h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <span>An admin reviews your instructor application</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <span>Once approved, you can login and create courses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <span>Add lessons, quizzes, and publish to students</span>
              </li>
            </ol>
          </div>

          <div className="mt-8">
            <Link
              to="/"
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Instructor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your courses, reviews, and students</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
        >
          <HiOutlinePlus className="h-5 w-5" />
          New Course
        </button>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
            activeTab === "courses"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <HiOutlineBookOpen className="h-5 w-5" />
          My Courses ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab("meet")}
          className={`pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
            activeTab === "meet"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <SiGooglemeet className="h-5 w-5 text-emerald-600" />
          Google Meet Reviews & Tests
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
            activeTab === "wallet"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <HiOutlineCurrencyDollar className="h-5 w-5" />
          Wallet & Earnings (80% Share)
        </button>

        <button
          onClick={() => {
            setActiveTab("messages");
            fetchContacts();
          }}
          className={`pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
            activeTab === "messages"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <HiOutlineChatAlt2 className="h-5 w-5" />
          Student Messages
          {contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Courses */}
      {activeTab === "courses" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
              <HiOutlineBookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Total Courses</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
              <HiOutlineUsers className="h-7 w-7 text-green-600 dark:text-green-400 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Total Students</p>
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
                Wallet (80% Share) →
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
              <HiOutlineStar className="h-7 w-7 text-yellow-600 dark:text-yellow-400 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {courses.filter((c) => c.isPublished).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Published</p>
            </div>
          </div>

          {/* Course List */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Courses</h2>
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                Manage lessons, thumbnails & video previews
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <HiOutlineBookOpen className="h-16 w-16 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-500 dark:text-zinc-400 mb-4">
                  Create your first course and start teaching
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
                >
                  Create Course
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 dark:border-zinc-700">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📚</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                            {course.title}
                          </h3>
                          {course.isPublished ? (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-950/80 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                              <HiOutlineCheckCircle className="h-3 w-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">
                              <HiOutlineXCircle className="h-3 w-3" />
                              Draft
                            </span>
                          )}
                          {course.previewVideo && (
                            <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                              Video Preview
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                          <span>{course.category}</span>
                          <span>{course.lessons?.length || 0} lessons</span>
                          <span>
                            {course.enrolledStudents?.length || 0} students
                          </span>
                          {course.price === 0 ? (
                            <span className="font-semibold text-green-600 dark:text-green-400">Free</span>
                          ) : (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">${course.price}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <button
                        onClick={() =>
                          togglePublish(course._id, course.isPublished)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          course.isPublished
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        to={`/instructor/courses/${course._id}/manage`}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <HiOutlinePencil className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Course"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: Wallet & Earnings */}
      {activeTab === "wallet" && (
        <WalletView userRole="instructor" />
      )}

      {/* TAB 3: Student Chats */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiOutlineChatAlt2 className="h-5 w-5 text-indigo-600" />
                Student Messages & Direct Chats
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Chat directly with students enrolled in your courses.
              </p>
            </div>
            <button
              onClick={fetchContacts}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Refresh
            </button>
          </div>

          {loadingContacts ? (
            <div className="py-12 text-center text-gray-400 text-sm animate-pulse">
              Loading student messages...
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineChatAlt2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 text-sm">
                No student messages yet
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                When students enroll in your courses and reach out, their chat threads will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {contacts.map((c, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedChat(c)}
                  className="flex items-center justify-between p-4 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {c.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {c.otherUser.name}
                        </p>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {c.courseTitle}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {c.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {c.unreadCount > 0 && (
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {c.unreadCount} new
                      </span>
                    )}
                    <button className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Google Meet Reviews & Tests */}
      {activeTab === "meet" && (
        <GoogleMeetSection isInstructor={true} availableCourses={courses} />
      )}

      {/* Direct Chat Modal */}
      {selectedChat && (
        <ChatModal
          isOpen={!!selectedChat}
          onClose={() => setSelectedChat(null)}
          courseId={selectedChat.courseId}
          courseTitle={selectedChat.courseTitle}
          otherUserId={selectedChat.otherUser._id}
          otherUserName={selectedChat.otherUser.name}
          otherUserRole="student"
        />
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Create New Course
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
              >
                <HiOutlineXCircle className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={handleCreateCourse}
              className="p-5 sm:p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCourse.category}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Level
                  </label>
                  <select
                    value={newCourse.level}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, level: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newCourse.tags}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, tags: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    placeholder="react, javascript, web"
                  />
                </div>
              </div>

              {/* Thumbnail upload section */}
              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  Course Thumbnail
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e.target.files?.[0], "thumbnail")
                    }
                    disabled={uploadingThumb}
                    className="block w-full text-xs text-gray-500 dark:text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200 cursor-pointer"
                  />
                </div>
                {uploadingThumb && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 animate-pulse">
                    Uploading thumbnail...
                  </p>
                )}
                {newCourse.thumbnail && (
                  <div className="relative rounded-lg overflow-hidden h-24 aspect-video bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <img
                      src={newCourse.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Short Video Preview upload section */}
              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  Short Preview / Promo Video (YouTube or MP4)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleFileUpload(e.target.files?.[0], "previewVideo")
                    }
                    disabled={uploadingVid}
                    className="block w-full text-xs text-gray-500 dark:text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 dark:file:bg-purple-950 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-200 cursor-pointer"
                  />
                </div>
                {uploadingVid && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 animate-pulse">
                    Uploading video...
                  </p>
                )}

                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-zinc-400 mb-1">
                    Or Video URL (Paste YouTube link or direct video)
                  </label>
                  <input
                    type="text"
                    value={newCourse.previewVideo}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        previewVideo: e.target.value,
                      })
                    }
                    placeholder="e.g. https://www.youtube.com/watch?v=... or /uploads/video.mp4"
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  />
                </div>

                {newCourse.previewVideo && (
                  <div className="rounded-lg overflow-hidden mt-2 shadow-sm">
                    <VideoPlayer url={newCourse.previewVideo} previewMode={true} />
                  </div>
                )}
              </div>

              {/* Publish immediately checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createIsPublished"
                  checked={newCourse.isPublished}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      isPublished: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-zinc-700 focus:ring-indigo-500"
                />
                <label
                  htmlFor="createIsPublished"
                  className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 font-medium"
                >
                  Publish immediately (visible to all students)
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || uploadingThumb || uploadingVid}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-sm shadow-sm"
                >
                  {creating ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
