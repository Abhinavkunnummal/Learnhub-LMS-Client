import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import ChatModal from "../components/ChatModal";
import {
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineChatAlt2,
  HiOutlineArrowsExpand,
} from "react-icons/hi";
import { SiGooglemeet } from "react-icons/si";
import VideoPlayer from "../components/VideoPlayer";
import MeetCountdown from "../components/MeetCountdown";
import CourseAiAssistant from "../components/CourseAiAssistant";

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [meetSessions, setMeetSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId, lessonId]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonRes, lessonsRes, enrollRes, meetRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/lessons/${lessonId}`),
        api.get(`/lessons/course/${courseId}`),
        api.get(`/enrollments/check/${courseId}`),
        api.get(`/meet-sessions/course/${courseId}`).catch(() => ({ data: { sessions: [] } })),
      ]);

      setCourse(courseRes.data.course);
      setLesson(lessonRes.data.lesson);
      setLessons(lessonsRes.data.lessons);
      setEnrollment(enrollRes.data.enrollment);
      setMeetSessions(meetRes.data?.sessions || []);
    } catch {
      toast.error("Failed to load lesson");
      navigate(`/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async () => {
    try {
      await api.put("/enrollments/complete-lesson", {
        courseId,
        lessonId,
      });
      toast.success("Lesson completed! 🎉");
      fetchData();
    } catch {
      toast.error("Failed to mark as complete");
    }
  };

  const isCompleted = enrollment?.completedLessons?.includes(lessonId);
  const currentIndex = lessons.findIndex((l) => l._id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Find active or upcoming meeting session for this course
  const activeMeetSession = useMemo(() => {
    const now = Date.now();
    return meetSessions.find((s) => {
      if (s.status === "completed" || s.status === "cancelled") return false;
      if (s.status === "live") return true;
      const start = new Date(s.scheduledAt).getTime();
      const end = start + (s.duration || 45) * 60000;
      const diff = start - now;
      // Live now or starting within next 48 hours
      return (diff > 0 && diff <= 48 * 3600 * 1000) || (now >= start && now <= end);
    });
  }, [meetSessions]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 sm:h-12 bg-gray-200 rounded" />
          <div className="aspect-video bg-gray-200 rounded-xl" />
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!lesson || !course) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors">
      <div className={`${theaterMode ? "max-w-7xl" : "max-w-5xl"} mx-auto px-4 sm:px-6 py-6 sm:py-8 transition-all duration-300`}>
        {/* Breadcrumb & Theater Mode Toggle */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 min-w-0">
            <Link
              to={`/courses/${courseId}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-[150px] sm:max-w-none"
            >
              {course.title}
            </Link>
            <span className="flex-shrink-0">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {lesson.title}
            </span>
          </div>

          {lesson.type === "video" && lesson.videoUrl && (
            <button
              type="button"
              onClick={() => setTheaterMode(!theaterMode)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition shadow-xs ${
                theaterMode
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
              }`}
              title={theaterMode ? "Switch to standard size" : "Expand video to theater size"}
            >
              <HiOutlineArrowsExpand className="h-3.5 w-3.5" />
              <span>{theaterMode ? "Standard View" : "Theater Mode"}</span>
            </button>
          )}
        </div>

        {/* Live / Upcoming Google Meet Announcement Banner */}
        {activeMeetSession && (
          <div className="mb-4 sm:mb-6">
            <MeetCountdown session={activeMeetSession} variant="banner" />
          </div>
        )}

        {/* Content Area - Full-width Responsive Video Player */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden mb-4 sm:mb-6 shadow-sm">
          {lesson.type === "video" && lesson.videoUrl && (
            <div className="w-full aspect-video bg-black overflow-hidden relative shadow-inner">
              <VideoPlayer
                url={lesson.videoUrl}
                title={lesson.title}
                previewMode={false}
                className="w-full h-full rounded-none shadow-none"
              />
            </div>
          )}

          {/* Lesson Content / Notes */}
          {(lesson.content || lesson.type !== "video" || !lesson.videoUrl) && (
            <div className="p-4 sm:p-8">
              <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                {lesson.type === "quiz" ? (
                  <HiOutlineQuestionMarkCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <HiOutlineDocumentText className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
                <span className="text-xs sm:text-sm font-medium capitalize">
                  {lesson.type} Lesson
                </span>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                  {lesson.content || (lesson.type === "video" ? "Watch the video above for this lesson." : "No content available.")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Title & Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {lesson.title}
          </h1>

          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-4">
            <span className="capitalize">{lesson.type}</span>
            {lesson.duration > 0 && <span>{lesson.duration} min</span>}
          </div>

          {/* Actions: Complete Button, Meet Option, & Chat with Instructor */}
          <div className="flex flex-wrap items-center gap-3">
            {enrollment && !isCompleted && (
              <button
                onClick={completeLesson}
                className="bg-green-600 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm shadow-sm"
              >
                <HiOutlineCheckCircle className="h-5 w-5" />
                Mark as Complete
              </button>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm bg-green-50 dark:bg-green-950/80 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-900">
                <HiOutlineCheckCircle className="h-5 w-5" />
                Lesson Completed
              </div>
            )}

            <Link
              to={`/courses/${courseId}?tab=reviews`}
              className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-4 py-2 sm:py-2.5 rounded-xl font-medium transition flex items-center gap-2 text-sm"
              title="Join oral test, viva, or doubt review via Google Meet"
            >
              <SiGooglemeet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Instructor Review & Test (Google Meet)
            </Link>

            {course?.instructor && (
              <button
                onClick={() => setShowChatModal(true)}
                className="bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-zinc-700 hover:bg-indigo-100 dark:hover:bg-zinc-700 px-4 py-2 sm:py-2.5 rounded-xl font-medium transition flex items-center gap-2 text-sm"
              >
                <HiOutlineChatAlt2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Chat with Instructor
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          {prevLesson ? (
            <Link
              to={`/learn/${courseId}/lesson/${prevLesson._id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition min-w-0"
            >
              <HiOutlineArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-400">Previous</p>
                <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                  {prevLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              to={`/learn/${courseId}/lesson/${nextLesson._id}`}
              className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition min-w-0"
            >
              <div className="text-right min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-zinc-500">Next</p>
                <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                  {nextLesson.title}
                </p>
              </div>
              <HiOutlineArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            </Link>
          ) : (
            <Link
              to={`/courses/${courseId}`}
              className="bg-indigo-600 text-white px-5 sm:px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition text-sm shadow-sm"
            >
              Back to Course
            </Link>
          )}
        </div>

        {/* Lesson Sidebar */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
            Course Content
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
            {lessons.map((l, i) => (
              <Link
                key={l._id}
                to={`/learn/${courseId}/lesson/${l._id}`}
                className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition ${
                  l._id === lessonId
                    ? "bg-indigo-50 dark:bg-indigo-950/60 sm:border-l-4 sm:border-indigo-600 dark:sm:border-indigo-500"
                    : ""
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm ${
                    enrollment?.completedLessons?.includes(l._id)
                      ? "bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
                  }`}
                >
                  {enrollment?.completedLessons?.includes(l._id) ? (
                    <HiOutlineCheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm truncate ${
                    l._id === lessonId
                      ? "font-semibold text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 dark:text-zinc-300"
                  }`}
                >
                  {l.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Chat Modal */}
      {course?.instructor && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          courseId={course._id}
          courseTitle={course.title}
          otherUserId={course.instructor._id || course.instructor}
          otherUserName={course.instructor.name || "Instructor"}
          otherUserRole="instructor"
        />
      )}

      {/* AI Course Doubt Assistant */}
      <CourseAiAssistant
        courseId={courseId}
        courseTitle={course?.title}
        lessonId={lessonId}
        lessonTitle={lesson?.title}
      />
    </div>
  );
}
