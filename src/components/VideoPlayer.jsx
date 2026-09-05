import { useState } from "react";
import { HiOutlineExternalLink, HiOutlinePlay } from "react-icons/hi";

/**
 * Extracts YouTube video ID from any format:
 * - standard watch URLs (youtube.com/watch?v=...)
 * - share URLs (youtu.be/...)
 * - embed URLs (youtube.com/embed/..., youtube-nocookie.com/embed/...)
 * - shorts URLs (youtube.com/shorts/...)
 * - live stream URLs (youtube.com/live/...)
 * - mobile URLs (m.youtube.com/watch?v=...)
 * - pasted iframe embed code (<iframe src="...">)
 * - plain 11-character video ID
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();

  // If already an 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // If pasted as an <iframe> embed tag, extract the src URL first
  const iframeSrcMatch = clean.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : clean;

  const regExp =
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:(?:watch\?[^#]*v=)|(?:embed\/)|(?:v\/)|(?:shorts\/)|(?:live\/))|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
  const match = targetUrl.match(regExp);
  return match ? match[1] : null;
}

/**
 * Extracts start time from YouTube URL (e.g. ?t=120 or ?t=2m15s) in seconds
 */
export function extractYouTubeStartTime(url) {
  if (!url || typeof url !== "string") return null;
  const tMatch = url.match(/[?&](?:t|start)=([0-9hms]+)/i);
  if (!tMatch) return null;
  const raw = tMatch[1];
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  let seconds = 0;
  const hours = raw.match(/(\d+)h/i);
  const mins = raw.match(/(\d+)m/i);
  const secs = raw.match(/(\d+)s/i);
  if (hours) seconds += parseInt(hours[1], 10) * 3600;
  if (mins) seconds += parseInt(mins[1], 10) * 60;
  if (secs) seconds += parseInt(secs[1], 10);
  return seconds > 0 ? seconds : null;
}

/**
 * Converts any YouTube URL to canonical YouTube Embed URL
 */
export function toYouTubeEmbedUrl(url, autoPlay = false) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const start = extractYouTubeStartTime(url);
  let embed = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  if (autoPlay) embed += "&autoplay=1";
  if (start) embed += `&start=${start}`;
  return embed;
}

/**
 * Extracts Vimeo video ID from URL
 */
export function extractVimeoId(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.trim().match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  return match ? match[3] : null;
}

/**
 * Returns whether a URL is a direct media file
 */
export function isDirectVideo(url) {
  if (!url || typeof url !== "string") return false;
  const u = url.toLowerCase();
  return (
    u.startsWith("/uploads") ||
    u.includes("/uploads/") ||
    u.endsWith(".mp4") ||
    u.endsWith(".webm") ||
    u.endsWith(".ogg") ||
    u.endsWith(".mov") ||
    u.endsWith(".m4v") ||
    u.startsWith("blob:") ||
    u.startsWith("data:video")
  );
}

/**
 * VideoPlayer handles:
 * - YouTube URLs (watch, shorts, youtu.be, embed, live)
 * - Vimeo URLs
 * - Direct video file uploads/URLs (.mp4, .webm, /uploads/...)
 * - Previews with responsive 16:9 full-width container
 */
export default function VideoPlayer({
  url,
  title = "Video player",
  className = "",
  controls = true,
  autoPlay = false,
  poster = "",
  previewMode = false,
}) {
  const [loadError, setLoadError] = useState(false);

  if (!url) {
    return (
      <div className={`w-full aspect-video bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 text-xs ${className}`}>
        No video URL provided
      </div>
    );
  }

  const cleanUrl = url.trim();
  const youtubeId = extractYouTubeId(cleanUrl);
  const vimeoId = extractVimeoId(cleanUrl);
  const directVideo = isDirectVideo(cleanUrl);

  // 1. YouTube Video
  if (youtubeId) {
    const embedUrl = toYouTubeEmbedUrl(cleanUrl, autoPlay);

    return (
      <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md group ${className}`}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full absolute inset-0 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onError={() => setLoadError(true)}
        />
        {previewMode && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            YouTube Embed Player
          </div>
        )}
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-black text-white text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
        >
          Watch on YouTube <HiOutlineExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  // 2. Vimeo Video
  if (vimeoId) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?dnt=1`}
          title={title}
          className="w-full h-full absolute inset-0 border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 3. Direct HTML5 Video
  if (directVideo) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md ${className}`}>
        <video
          src={cleanUrl}
          controls={controls}
          autoPlay={autoPlay}
          poster={poster || undefined}
          className="w-full h-full object-contain absolute inset-0"
          onError={() => setLoadError(true)}
        >
          Your browser does not support HTML5 video.
        </video>
        {previewMode && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-indigo-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow">
            <HiOutlinePlay className="h-3.5 w-3.5" /> Direct Video Preview
          </div>
        )}
      </div>
    );
  }

  // 4. Other URL or embed iframe fallback
  return (
    <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md ${className}`}>
      {!loadError ? (
        <iframe
          src={cleanUrl}
          title={title}
          className="w-full h-full absolute inset-0 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-400">
          <p className="text-xs mb-2">Unable to render video embed directly.</p>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 underline flex items-center gap-1"
          >
            Open external video <HiOutlineExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
