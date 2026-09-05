import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineExternalLink,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineSparkles,
} from "react-icons/hi";
import { SiGooglemeet, SiGooglecalendar } from "react-icons/si";

/**
 * Format a Date object to Google Calendar TEMPLATE format (YYYYMMDDTHHmmssZ)
 */
function toGCalFormat(date) {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
}

/**
 * Generate a 1-click Google Calendar event creation URL
 */
export function getGoogleCalendarUrl(session) {
  if (!session?.scheduledAt) return "#";
  const start = new Date(session.scheduledAt);
  const duration = Number(session.duration) || 45;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const dates = `${toGCalFormat(start)}/${toGCalFormat(end)}`;
  const title = `[Learning] ${session.title || "Google Meet Session"}`;
  const details = `${session.description || "Google Meet evaluation / review session."}\n\nSession Type: ${session.type || "Review"}\nDuration: ${duration} minutes\n\nDirect Google Meet Link:\n${session.meetLink}`;
  const location = session.meetLink || "Google Meet";

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(
    location
  )}`;
}

/**
 * Get human-readable timezone string (e.g. "IST" or "America/New_York")
 */
function getLocalTimeZone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const shortTz = new Date().toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ")[2];
    return shortTz || tz || "Local Time";
  } catch {
    return "Local Time";
  }
}

/**
 * Helper to get badge style for session type
 */
export function getSessionTypeBadge(type) {
  switch (type) {
    case "test":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900";
    case "review":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    case "viva":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-900";
    case "doubt":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900";
    default:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
  }
}

/**
 * MeetCountdown Component:
 * - Live real-time countdown timer with Day/Hr/Min/Sec cards
 * - Detailed meeting time display (date, exact start time, end time, duration, timezone)
 * - State badges (Live Now, Starting Soon, Scheduled, Completed, Past Due)
 * - 1-Click "Add to Google Calendar" button
 * - 1-Click "Copy Meet Link"
 * - High-visibility Google Meet join button
 */
export default function MeetCountdown({
  session,
  isInstructor = false,
  onUpdateStatus,
  onDelete,
  variant = "card", // "card" | "compact" | "banner"
}) {
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scheduledDate = useMemo(() => new Date(session.scheduledAt), [session.scheduledAt]);
  const durationMinutes = Number(session.duration) || 45;
  const endDate = useMemo(
    () => new Date(scheduledDate.getTime() + durationMinutes * 60 * 1000),
    [scheduledDate, durationMinutes]
  );

  const startMs = scheduledDate.getTime();
  const endMs = endDate.getTime();
  const diffMs = startMs - now;
  const isCurrentlyHappening =
    session.status === "live" || (now >= startMs && now <= endMs && session.status !== "completed");
  const isPast = now > endMs && session.status !== "live";
  const isStartingSoon = diffMs > 0 && diffMs <= 15 * 60 * 1000; // within 15 mins

  // Time calculations
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Remaining time in active session
  const remainingInSessionSec = Math.max(0, Math.floor((endMs - now) / 1000));
  const liveMins = Math.floor(remainingInSessionSec / 60);
  const liveSecs = remainingInSessionSec % 60;

  const copyMeetLink = (e) => {
    e.stopPropagation();
    if (!session.meetLink) return;
    navigator.clipboard.writeText(session.meetLink);
    setCopied(true);
    toast.success("Google Meet link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedStartTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formattedEndTime = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeZone = getLocalTimeZone();

  // BANNER VARIANT (e.g. for LessonView top announcement)
  if (variant === "banner") {
    return (
      <div
        className={`p-3 sm:p-4 rounded-xl border transition-all ${
          isCurrentlyHappening
            ? "bg-emerald-600 text-white border-emerald-500 shadow-lg ring-2 ring-emerald-400/50 animate-pulse"
            : isStartingSoon
            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400 shadow-md"
            : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-gray-900 dark:text-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isCurrentlyHappening || isStartingSoon
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <SiGooglemeet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm">{session.title}</span>
                {isCurrentlyHappening ? (
                  <span className="bg-red-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full animate-bounce">
                    LIVE NOW
                  </span>
                ) : isStartingSoon ? (
                  <span className="bg-white/20 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Starting in {minutes}m {seconds}s
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold opacity-80">
                    {formattedDate} at {formattedStartTime} ({timeZone})
                  </span>
                )}
              </div>
              <p
                className={`text-xs ${
                  isCurrentlyHappening || isStartingSoon
                    ? "text-white/90"
                    : "text-gray-600 dark:text-zinc-400"
                }`}
              >
                {isCurrentlyHappening
                  ? `Live Google Meet session is active! Ends at ${formattedEndTime}.`
                  : `Scheduled for ${formattedStartTime} – ${formattedEndTime} (${durationMinutes} mins)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href={session.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                isCurrentlyHappening
                  ? "bg-white text-emerald-700 hover:bg-emerald-50"
                  : isStartingSoon
                  ? "bg-white text-orange-700 hover:bg-orange-50"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <SiGooglemeet className="h-3.5 w-3.5" />
              Join Meeting
              <HiOutlineExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // COMPACT VARIANT (e.g. for StudentDashboard grid)
  if (variant === "compact") {
    return (
      <div
        className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
          isCurrentlyHappening
            ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
            : isStartingSoon
            ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700"
            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-800"
        }`}
      >
        <div>
          {/* Header badges */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getSessionTypeBadge(
                session.type
              )}`}
            >
              {session.type}
            </span>

            {isCurrentlyHappening ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                LIVE NOW
              </span>
            ) : isStartingSoon ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full animate-pulse">
                Starts in {minutes}m {seconds}s
              </span>
            ) : isPast ? (
              <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                Completed
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Scheduled
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-1 line-clamp-1">
            {session.title}
          </h3>

          {session.course?.title && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate mb-1">
              {session.course.title}
            </p>
          )}

          {session.instructor?.name && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mb-3">
              <HiOutlineUser className="h-3 w-3" /> Instructor: {session.instructor.name}
            </p>
          )}

          {/* Time & Duration Box */}
          <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-lg p-2.5 space-y-1.5 mb-3 border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-zinc-200">
              <HiOutlineCalendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <HiOutlineClock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>
                {formattedStartTime} – {formattedEndTime} ({durationMinutes}m)
              </span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-normal">
                [{timeZone}]
              </span>
            </div>
          </div>

          {/* Countdown Block */}
          {!isPast && (
            <div className="mb-3">
              {isCurrentlyHappening ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    Session In Progress
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Ends in {liveMins}m {liveSecs}s
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-zinc-800/80 rounded-lg p-2 border border-gray-200 dark:border-zinc-700/80">
                  <div className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-center mb-1">
                    Meeting Countdown
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono">
                    <div className="bg-white dark:bg-zinc-900 rounded py-1 px-1 border border-gray-200 dark:border-zinc-800">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                        {String(days).padStart(2, "0")}
                      </span>
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400">Days</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded py-1 px-1 border border-gray-200 dark:border-zinc-800">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                        {String(hours).padStart(2, "0")}
                      </span>
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400">Hrs</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded py-1 px-1 border border-gray-200 dark:border-zinc-800">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                        {String(minutes).padStart(2, "0")}
                      </span>
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400">Min</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded py-1 px-1 border border-gray-200 dark:border-zinc-800">
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {String(seconds).padStart(2, "0")}
                      </span>
                      <span className="block text-[8px] uppercase tracking-wider text-emerald-600">Sec</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <a
              href={getGoogleCalendarUrl(session)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              title="Add to Google Calendar"
            >
              <SiGooglecalendar className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={copyMeetLink}
              className="p-2 rounded-lg text-gray-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              title="Copy Google Meet Link"
            >
              {copied ? <HiOutlineCheck className="h-4 w-4 text-emerald-600" /> : <HiOutlineClipboardCopy className="h-4 w-4" />}
            </button>
          </div>

          <a
            href={session.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition shadow-sm ${
              isCurrentlyHappening
                ? "bg-emerald-600 hover:bg-emerald-700 animate-bounce"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <SiGooglemeet className="h-3.5 w-3.5" />
            Join Google Meet
          </a>
        </div>
      </div>
    );
  }

  // FULL CARD VARIANT (for GoogleMeetSection)
  return (
    <div
      className={`relative rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all ${
        isCurrentlyHappening
          ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
          : isStartingSoon
          ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-sm"
          : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
      }`}
    >
      <div>
        {/* Top Badges & Instructor controls */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSessionTypeBadge(
                session.type
              )}`}
            >
              {session.type}
            </span>

            {isCurrentlyHappening ? (
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 rounded-full animate-pulse border border-red-200 dark:border-red-900">
                <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 animate-ping" />
                LIVE NOW
              </span>
            ) : isStartingSoon ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Starting in {minutes}m {seconds}s
              </span>
            ) : session.status === "completed" ? (
              <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                Completed
              </span>
            ) : isPast ? (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full">
                Past Due
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Scheduled
              </span>
            )}

            {session.student ? (
              <span className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <HiOutlineUser className="h-3 w-3" /> 1-on-1 Session
              </span>
            ) : (
              <span className="text-[10px] font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <HiOutlineUsers className="h-3 w-3" /> All Enrolled Students
              </span>
            )}
          </div>

          {isInstructor && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(session._id)}
              className="text-gray-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Delete Session"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Title */}
        <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1.5">
          {session.title}
        </h4>

        {session.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 line-clamp-2 mb-4">
            {session.description}
          </p>
        )}

        {/* Meeting Time Span Box */}
        <div className="bg-emerald-50/50 dark:bg-zinc-800/60 rounded-xl p-3 sm:p-3.5 mb-4 border border-emerald-100 dark:border-zinc-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              <HiOutlineCalendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700">
              {timeZone}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-100/60 dark:border-zinc-700/50">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">
              <HiOutlineClock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>
                {formattedStartTime} – {formattedEndTime}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
              {durationMinutes} mins duration
            </span>
          </div>
        </div>

        {/* Live / Upcoming Countdown Widget */}
        {!isPast && (
          <div className="mb-4">
            {isCurrentlyHappening ? (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-3.5 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Meeting In Progress
                  </span>
                </div>
                <div className="font-mono text-base sm:text-lg font-extrabold">
                  Ends in {liveMins}m {liveSecs}s
                </div>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Instructor and students are active in the room.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-zinc-800/90 rounded-xl p-3 sm:p-3.5 border border-gray-200/80 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <HiOutlineSparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Special Meeting Countdown
                  </span>
                  {isStartingSoon && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                      Get Ready to Join!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  {/* Days */}
                  <div className="bg-white dark:bg-zinc-900 rounded-lg py-2 px-1 border border-gray-200 dark:border-zinc-800 shadow-xs">
                    <div className="text-base sm:text-xl font-black text-gray-900 dark:text-white">
                      {String(days).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-zinc-400 font-semibold">
                      Days
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="bg-white dark:bg-zinc-900 rounded-lg py-2 px-1 border border-gray-200 dark:border-zinc-800 shadow-xs">
                    <div className="text-base sm:text-xl font-black text-gray-900 dark:text-white">
                      {String(hours).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-zinc-400 font-semibold">
                      Hours
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="bg-white dark:bg-zinc-900 rounded-lg py-2 px-1 border border-gray-200 dark:border-zinc-800 shadow-xs">
                    <div className="text-base sm:text-xl font-black text-gray-900 dark:text-white">
                      {String(minutes).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-zinc-400 font-semibold">
                      Mins
                    </div>
                  </div>

                  {/* Seconds */}
                  <div className="bg-white dark:bg-zinc-900 rounded-lg py-2 px-1 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 animate-pulse">
                      {String(seconds).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                      Secs
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Actions Bar */}
      <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left helpers: Calendar & Copy link */}
        <div className="flex items-center gap-2">
          <a
            href={getGoogleCalendarUrl(session)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
            title="Add event to Google Calendar with Meet link"
          >
            <SiGooglecalendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Add to Calendar
          </a>

          <button
            type="button"
            onClick={copyMeetLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
            title="Copy Google Meet Link"
          >
            {copied ? (
              <>
                <HiOutlineCheck className="h-3.5 w-3.5 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <HiOutlineClipboardCopy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Right actions: Instructor controls + Join Google Meet Button */}
        <div className="flex items-center gap-2">
          {isInstructor && onUpdateStatus && (
            <>
              {session.status !== "live" ? (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(session._id, "live")}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition"
                >
                  Go Live
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(session._id, "completed")}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 transition"
                >
                  End Session
                </button>
              )}
            </>
          )}

          <a
            href={session.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-sm ${
              isCurrentlyHappening
                ? "bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-500/30 animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <SiGooglemeet className="h-4 w-4" />
            Join Google Meet
            <HiOutlineExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
