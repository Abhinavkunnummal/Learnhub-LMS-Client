import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import ChatModal from "../components/ChatModal";
import { openRealRazorpayCheckout } from "../utils/razorpay";
import {
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePlay,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineChatAlt,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import { SiGooglemeet } from "react-icons/si";
import VideoPlayer from "../components/VideoPlayer";
import GoogleMeetSection from "../components/GoogleMeetSection";
import CourseAiAssistant from "../components/CourseAiAssistant";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (user) checkEnrollment();
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.course);

      const lessonsRes = await api.get(`/lessons/course/${id}`);
      setLessons(lessonsRes.data.lessons);
    } catch (error) {
      toast.error("Course not found");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await api.get(`/enrollments/check/${id}`);
      setEnrollment(res.data.enrollment);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setEnrolling(true);

    try {
      if (course.price === 0) {
        // Free course direct enrollment
        await api.post("/enrollments", { courseId: id });
        toast.success("Enrolled successfully! 🎉");
        checkEnrollment();
        setEnrolling(false);
      } else {
        // Paid course -> create order and launch REAL Razorpay Popup
        const orderRes = await api.post("/payments/create-order", {
          courseId: id,
        });

        const { orderId, amount, currency, keyId } = orderRes.data;

        openRealRazorpayCheckout({
          orderId,
          amount,
          currency: currency || "INR",
          keyId: keyId || "rzp_test_xtiSLuJgiyFtFD",
          course: {
            id: course._id,
            title: course.title,
            price: course.price,
            instructor: course.instructor?.name || "Instructor",
          },
          user,
          onSuccess: async (paymentResponse) => {
            // 1. SUCCESS LOGIC
            try {
              toast.loading("Verifying payment with gateway...", {
                id: "verify-toast",
              });
              await api.post("/payments/verify", {
                courseId: id,
                ...paymentResponse,
              });
              toast.dismiss("verify-toast");
              toast.success(
                `🎉 Payment of $${course.price} Successful! (80% credited to Instructor, 20% to Admin)`
              );
              checkEnrollment();
            } catch (err) {
              toast.dismiss("verify-toast");
              toast.error(
                err.response?.data?.message || "Payment verification failed"
              );
            } finally {
              setEnrolling(false);
            }
          },
          onFailure: (error) => {
            setEnrolling(false);
            if (error?.cancelled) {
              // 2. BACK / CANCEL LOGIC
              toast.error(
                "⚠️ Payment Cancelled: You closed the payment window. No charges were made."
              );
            } else {
              // 3. FAILURE LOGIC
              toast.error(
                `❌ Payment Failed: ${error?.message || "Transaction was declined by bank."}`
              );
            }
          },
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment initiation failed");
      setEnrolling(false);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <HiOutlinePlay className="h-5 w-5" />;
      case "quiz":
        return <HiOutlineQuestionMarkCircle className="h-5 w-5" />;
      default:
        return <HiOutlineDocumentText className="h-5 w-5" />;
    }
  };

  const isLessonCompleted = (lessonId) => {
    return enrollment?.completedLessons?.includes(lessonId) || false;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-48 sm:h-64 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 min-h-screen transition-colors">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {course.category}
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {course.level}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                {course.title}
              </h1>

              <p className="text-indigo-100 text-sm sm:text-lg mb-4 sm:mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <HiOutlineStar className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                  <span>
                    {course.rating.average > 0
                      ? course.rating.average.toFixed(1)
                      : "New"}
                    {course.rating.count > 0 &&
                      ` (${course.rating.count} reviews)`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineUsers className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineClock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">
                    By {course.instructor?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Enrollment Card & Media Preview */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 text-gray-900 dark:text-white shadow-xl order-first lg:order-last overflow-hidden border border-gray-100 dark:border-zinc-800">
              {/* Short Preview Video or Thumbnail */}
              {course.previewVideo ? (
                <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-black relative shadow-inner">
                  <VideoPlayer
                    url={course.previewVideo}
                    poster={course.thumbnail || undefined}
                    previewMode={false}
                    className="w-full h-full rounded-none shadow-none"
                  />
                  <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded pointer-events-none z-10">
                    Course Preview
                  </div>
                </div>
              ) : course.thumbnail ? (
                <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>

              {enrollment ? (
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-950/60 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-800 dark:text-zinc-200">Progress</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {lessons.length > 0 && (
                    <Link
                      to={`/learn/${course._id}/lesson/${lessons[0]._id}`}
                      className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                    >
                      {enrollment.progress > 0
                        ? "Continue Learning"
                        : "Start Course"}
                    </Link>
                  )}

                  {enrollment.isCompleted && (
                    <Link
                      to={`/certificate/${course._id}`}
                      className="block w-full text-center bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                    >
                      View Certificate
                    </Link>
                  )}

                  {/* Chat with Instructor Button */}
                  <button
                    type="button"
                    onClick={() => setShowChatModal(true)}
                    className="w-full bg-indigo-50 dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-300 py-2.5 rounded-xl font-semibold hover:bg-indigo-100 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <HiOutlineChatAlt2 className="h-4 w-4" />
                    Chat with Instructor
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {enrolling
                    ? "Processing..."
                    : course.price === 0
                    ? "Enroll Free"
                    : `Pay $${course.price} with Razorpay`}
                </button>
              )}

              <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <HiOutlineCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  Full lifetime access
                </li>
                <li className="flex items-center gap-2">
                  <HiOutlineCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  Certificate of completion
                </li>
                <li className="flex items-center gap-2">
                  <HiOutlineCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  {lessons.length} lessons
                </li>
                {course.previewVideo && (
                  <li className="flex items-center gap-2">
                    <HiOutlineCheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                    Short intro preview included
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-zinc-900 rounded-xl p-1 border border-gray-200 dark:border-zinc-800 mb-6 sm:mb-8 w-full sm:w-fit overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "lessons", label: `Lessons (${lessons.length})` },
            { id: "reviews", label: "Google Meet Reviews & Tests", icon: SiGooglemeet },
            { id: "discussions", label: "Discussions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.icon && <tab.icon className="h-4 w-4 text-emerald-500" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                  About This Course
                </h2>
                <p className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                  {course.description}
                </p>
              </div>

              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-3 py-1 rounded-full text-xs sm:text-sm border border-gray-200 dark:border-zinc-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                  <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {course.instructor?.name?.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {course.instructor?.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Instructor</p>
                </div>
              </div>
              {course.instructor?.bio && (
                <p className="text-sm text-gray-600 dark:text-zinc-300">
                  {course.instructor.bio}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Lessons */}
        {activeTab === "lessons" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            {lessons.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-gray-500 dark:text-zinc-400">
                No lessons yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition"
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isLessonCompleted(lesson._id)
                          ? "bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400"
                          : "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {isLessonCompleted(lesson._id) ? (
                        <HiOutlineCheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-zinc-500 flex-shrink-0">
                          {getLessonIcon(lesson.type)}
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                          {lesson.title}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 capitalize">
                        {lesson.type}{" "}
                        {lesson.duration > 0 && `• ${lesson.duration} min`}
                      </p>
                    </div>

                    {enrollment && (
                      <Link
                        to={`/learn/${course._id}/lesson/${lesson._id}`}
                        className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 whitespace-nowrap"
                      >
                        {isLessonCompleted(lesson._id) ? "Review" : "Start"}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Google Meet Reviews & Tests */}
        {activeTab === "reviews" && (
          <GoogleMeetSection
            courseId={id}
            courseTitle={course.title}
            isInstructor={course.instructor?._id === user?._id || user?.role === "admin"}
            enrolledStudents={course.enrolledStudents || []}
          />
        )}

        {/* Discussions */}
        {activeTab === "discussions" && (
          <DiscussionsSection courseId={id} user={user} />
        )}
      </div>

      {/* Instructor Direct Chat Modal */}
      {course?.instructor && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          courseId={course._id}
          courseTitle={course.title}
          otherUserId={course.instructor._id}
          otherUserName={course.instructor.name}
          otherUserRole="instructor"
        />
      )}

      {/* AI Course Doubt Assistant */}
      <CourseAiAssistant
        courseId={id}
        courseTitle={course.title}
      />
    </div>
  );
}

function DiscussionsSection({ courseId, user }) {
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      const res = await api.get(`/discussions/course/${courseId}`);
      setDiscussions(res.data.discussions);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post("/discussions", {
        content: newComment,
        course: courseId,
      });
      setNewComment("");
      fetchDiscussions();
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <HiOutlineChatAlt className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Discussions
        </h3>
      </div>

      {user && (
        <form onSubmit={handlePost} className="mb-6 sm:mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or start a discussion..."
            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 sm:px-6 py-2 rounded-xl text-sm font-medium transition shadow-sm"
            >
              Post Comment
            </button>
          </div>
        </form>
      )}

      {discussions.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-zinc-400 py-6 sm:py-8 text-sm">
          No discussions yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {discussions.map((disc) => (
            <div
              key={disc._id}
              className="border border-gray-100 dark:border-zinc-800 rounded-xl p-3 sm:p-4 bg-gray-50/50 dark:bg-zinc-800/40"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {disc.author?.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {disc.author?.name}
                    {disc.author?.role === "instructor" && (
                      <span className="ml-2 text-[10px] sm:text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 sm:px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        Instructor
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 dark:text-zinc-500">
                    {new Date(disc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-zinc-300 ml-9 sm:ml-11 text-sm">
                {disc.content}
              </p>
              <div className="ml-9 sm:ml-11 mt-2 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  ❤️ {disc.likes?.length || 0}
                </button>
                <span>{disc.replyCount || 0} replies</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
