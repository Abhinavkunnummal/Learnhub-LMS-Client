import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineExternalLink,
} from "react-icons/hi";
import { SiGooglemeet } from "react-icons/si";
import MeetCountdown from "./MeetCountdown";

export default function GoogleMeetSection({
  courseId,
  courseTitle,
  isInstructor = false,
  availableCourses = [],
  enrolledStudents = [],
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    type: "review",
    description: "",
    meetLink: "",
    scheduledAt: "",
    duration: 45,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  useEffect(() => {
    setSelectedCourseId(courseId || "");
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const endpoint = courseId
        ? `/meet-sessions/course/${courseId}`
        : "/meet-sessions/my-sessions";
      const res = await api.get(endpoint);
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to load meet sessions", err);
    } finally {
      setLoading(false);
    }
  };

  const openInstantGoogleMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
    toast.success("Google Meet opened in a new tab! Copy the link and paste it below.", {
      icon: "📹",
      duration: 4500,
    });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const sessionCourseId = courseId || selectedCourseId;
    if (!sessionCourseId || !formData.title.trim() || !formData.meetLink.trim() || !formData.scheduledAt) {
      toast.error("Please select a course and fill in the session title, Google Meet link, and date/time");
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/meet-sessions", {
        courseId: sessionCourseId,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        meetLink: formData.meetLink,
        scheduledAt: formData.scheduledAt,
        duration: Number(formData.duration) || 45,
        studentId: selectedStudent || null,
      });

      toast.success("Google Meet review session scheduled! 🎯");
      setSessions((prev) => [...prev, res.data.session]);
      setShowModal(false);
      setFormData({
        title: "",
        type: "review",
        description: "",
        meetLink: "",
        scheduledAt: "",
        duration: 45,
      });
      setSelectedStudent("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule Google Meet session");
    } finally {
      setCreating(false);
    }
  };

  const selectedCourse = availableCourses.find(
    (course) => course._id === selectedCourseId
  );
  const displayedCourseTitle = courseTitle || selectedCourse?.title || "Select a course";

  const handleUpdateStatus = async (sessionId, newStatus) => {
    try {
      await api.put(`/meet-sessions/${sessionId}`, { status: newStatus });
      toast.success(`Session marked as ${newStatus}`);
      fetchSessions();
    } catch (err) {
      toast.error("Failed to update session status");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/meet-sessions/${sessionId}`);
      toast.success("Session cancelled and removed");
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <SiGooglemeet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Google Meet Reviews & Tests
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                Live Video
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
              {isInstructor
                ? "Schedule 1-on-1 code reviews, viva exams, and live student evaluations"
                : "Join live Google Meet review and test sessions scheduled by your instructor"}
            </p>
          </div>
        </div>

        {isInstructor && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Schedule Meet Session
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-gray-400 dark:text-zinc-500 text-sm animate-pulse">
          Loading Google Meet sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-dashed border-gray-200 dark:border-zinc-800">
          <SiGooglemeet className="h-10 w-10 text-gray-400 dark:text-zinc-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-800 dark:text-zinc-200 text-sm mb-1">
            No Review or Test Sessions Scheduled
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
            {isInstructor
              ? "Click 'Schedule Meet Session' to set up a code review, viva, or oral test with your students."
              : "Your instructor hasn't scheduled any Google Meet sessions for this course yet. Check back soon!"}
          </p>
          {isInstructor && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              + Create First Session
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <MeetCountdown
              key={session._id}
              session={session}
              isInstructor={isInstructor}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteSession}
              variant="card"
            />
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <SiGooglemeet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Schedule Google Meet Review / Test
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {displayedCourseTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 p-1"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-4">
              {!courseId && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                    Course *
                  </label>
                  <select
                    required
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Select a course</option>
                    {availableCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 3 Code Review & Viva Test"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="review">Code / Project Review</option>
                    <option value="test">Oral Exam / Test</option>
                    <option value="viva">Viva / Final Evaluation</option>
                    <option value="doubt">Doubt Clearing Session</option>
                    <option value="live_class">Live Interactive Class</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Google Meet Link with 1-click helper */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Google Meet Link *
                  </label>
                  <button
                    type="button"
                    onClick={openInstantGoogleMeet}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Open Google Meet to Create Link <HiOutlineExternalLink className="h-3 w-3" />
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  value={formData.meetLink}
                  onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Tip: You can use any existing Google Meet room or click the button above to generate a new meeting code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  Agenda / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please be ready with your git repository and working environment."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {creating ? "Scheduling..." : "Confirm & Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
