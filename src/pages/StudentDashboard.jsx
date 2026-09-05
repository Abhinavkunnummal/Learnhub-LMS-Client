import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ChatModal from "../components/ChatModal";
import {
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import { SiGooglemeet } from "react-icons/si";
import MeetCountdown from "../components/MeetCountdown";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [meetSessions, setMeetSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollRes, certRes, meetRes] = await Promise.all([
        api.get("/enrollments/my-courses"),
        api.get("/certificates/my-certificates"),
        api.get("/meet-sessions/my-sessions").catch(() => ({ data: { sessions: [] } })),
      ]);
      setEnrollments(enrollRes.data.enrollments);
      setCertificates(certRes.data.certificates);
      setMeetSessions(meetRes.data?.sessions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = enrollments.filter((e) => e.isCompleted).length;
  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.progress, 0) /
            enrollments.length
        )
      : 0;

  const stats = [
    {
      icon: HiOutlineBookOpen,
      label: "Enrolled Courses",
      value: enrollments.length,
      color: "indigo",
    },
    {
      icon: HiOutlineCheckCircle,
      label: "Completed",
      value: completedCount,
      color: "green",
    },
    {
      icon: HiOutlineChartBar,
      label: "Avg. Progress",
      value: `${averageProgress}%`,
      color: "purple",
    },
    {
      icon: HiOutlineAcademicCap,
      label: "Certificates",
      value: certificates.length,
      color: "yellow",
    },
  ];

  const colorMap = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-gray-900 dark:text-white">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm sm:text-base">
          Continue your learning journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 rounded-xl p-3 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm"
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${colorMap[stat.color]}`}
            >
              <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Google Meet Reviews & Tests for Student */}
      {meetSessions.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <SiGooglemeet className="h-5 w-5 text-emerald-600" />
              Upcoming Oral Reviews & Tests (Google Meet)
            </h2>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {meetSessions.length} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {meetSessions.map((s) => (
              <MeetCountdown key={s._id} session={s} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h2>
          <Link
            to="/courses"
            className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Browse More →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 sm:p-12 text-center border border-gray-100 dark:border-zinc-800 shadow-sm">
            <HiOutlineBookOpen className="h-12 sm:h-16 w-12 sm:w-16 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 dark:text-zinc-400 mb-4 text-sm">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              to="/courses"
              className="inline-block bg-indigo-600 text-white px-5 sm:px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition text-sm shadow-sm"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 dark:border-zinc-700">
                      {enrollment.course?.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📚</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/courses/${enrollment.course?._id}`}
                        className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base block hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      >
                        {enrollment.course?.title || "Course"}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                        By {enrollment.course?.instructor?.name || "Instructor"}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5 sm:h-2">
                          <div
                            className={`h-1.5 sm:h-2 rounded-full transition-all ${
                              enrollment.isCompleted
                                ? "bg-green-500"
                                : "bg-indigo-600"
                            }`}
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">
                          {enrollment.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                  <Link
                    to={`/courses/${enrollment.course?._id}`}
                    className="flex-1 text-center bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 py-1.5 rounded-lg text-xs font-semibold transition border border-indigo-100 dark:border-indigo-900"
                  >
                    Continue
                  </Link>
                  {enrollment.course?.instructor && (
                    <button
                      onClick={() =>
                        setSelectedChat({
                          courseId: enrollment.course._id,
                          courseTitle: enrollment.course.title,
                          instructor: enrollment.course.instructor,
                        })
                      }
                      className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      title="Chat with instructor"
                    >
                      <HiOutlineChatAlt2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Certificates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-4 sm:p-5 border border-indigo-100 dark:border-zinc-700 shadow-sm"
              >
                <HiOutlineAcademicCap className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 dark:text-indigo-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base truncate">
                  {cert.course?.title || "Course"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-1 truncate font-mono">
                  {cert.certificateId}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-zinc-500">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Chat Modal */}
      {selectedChat && (
        <ChatModal
          isOpen={!!selectedChat}
          onClose={() => setSelectedChat(null)}
          courseId={selectedChat.courseId}
          courseTitle={selectedChat.courseTitle}
          otherUserId={selectedChat.instructor?._id || selectedChat.instructor}
          otherUserName={selectedChat.instructor?.name || "Instructor"}
          otherUserRole="instructor"
        />
      )}
    </div>
  );
}
