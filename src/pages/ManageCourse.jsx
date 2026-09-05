import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlinePhotograph,
  HiOutlineFilm,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
} from "react-icons/hi";
import { SiGooglemeet } from "react-icons/si";
import VideoPlayer, { extractYouTubeId } from "../components/VideoPlayer";
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

export default function ManageCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("media"); // "media", "curriculum"

  // Edit course form state
  const [formData, setFormData] = useState({
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

  // Upload states
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingPreviewVideo, setUploadingPreviewVideo] = useState(false);

  // Lesson modal state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    type: "video",
    videoUrl: "",
    content: "",
    duration: 10,
    isFree: false,
  });
  const [uploadingLessonVideo, setUploadingLessonVideo] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/lessons/course/${id}`),
      ]);

      const c = courseRes.data.course;
      setCourse(c);
      setFormData({
        title: c.title || "",
        description: c.description || "",
        category: c.category || "Programming",
        level: c.level || "Beginner",
        price: c.price || 0,
        tags: Array.isArray(c.tags) ? c.tags.join(", ") : "",
        thumbnail: c.thumbnail || "",
        previewVideo: c.previewVideo || "",
        isPublished: c.isPublished !== undefined ? c.isPublished : true,
      });

      setLessons(lessonsRes.data.lessons || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load course");
      navigate("/instructor");
    } finally {
      setLoading(false);
    }
  };

  // Upload handler helper
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append("file", file);

    try {
      if (type === "thumbnail") setUploadingThumbnail(true);
      if (type === "previewVideo") setUploadingPreviewVideo(true);
      if (type === "lessonVideo") setUploadingLessonVideo(true);

      const res = await api.post("/upload", uploadForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = res.data.file.url;
      toast.success("File uploaded successfully!");

      if (type === "thumbnail") {
        setFormData((prev) => ({ ...prev, thumbnail: fileUrl }));
      } else if (type === "previewVideo") {
        setFormData((prev) => ({ ...prev, previewVideo: fileUrl }));
      } else if (type === "lessonVideo") {
        setLessonFormData((prev) => ({ ...prev, videoUrl: fileUrl }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "File upload failed");
    } finally {
      if (type === "thumbnail") setUploadingThumbnail(false);
      if (type === "previewVideo") setUploadingPreviewVideo(false);
      if (type === "lessonVideo") setUploadingLessonVideo(false);
    }
  };

  const handleSaveCourse = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await api.put(`/courses/${id}`, payload);
      setCourse(res.data.course);
      toast.success("Course details saved!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    try {
      const newStatus = !formData.isPublished;
      await api.put(`/courses/${id}`, { isPublished: newStatus });
      setFormData((prev) => ({ ...prev, isPublished: newStatus }));
      setCourse((prev) => ({ ...prev, isPublished: newStatus }));
      toast.success(newStatus ? "Course published!" : "Course unpublished!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Lesson handlers
  const openAddLessonModal = () => {
    setEditingLesson(null);
    setLessonFormData({
      title: "",
      type: "video",
      videoUrl: "",
      content: "",
      duration: 10,
      isFree: false,
    });
    setShowLessonModal(true);
  };

  const openEditLessonModal = (lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title || "",
      type: lesson.type || "video",
      videoUrl: lesson.videoUrl || "",
      content: lesson.content || "",
      duration: lesson.duration || 0,
      isFree: lesson.isFree || false,
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      if (editingLesson) {
        // Update lesson
        await api.put(`/lessons/${editingLesson._id}`, lessonFormData);
        toast.success("Lesson updated!");
      } else {
        // Create lesson
        await api.post("/lessons", {
          ...lessonFormData,
          course: id,
        });
        toast.success("Lesson added!");
      }
      setShowLessonModal(false);
      // Refresh lessons
      const lessonsRes = await api.get(`/lessons/course/${id}`);
      setLessons(lessonsRes.data.lessons || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save lesson");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      toast.success("Lesson deleted");
      setLessons(lessons.filter((l) => l._id !== lessonId));
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            to="/instructor"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium mb-2"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Back to Instructor Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {course?.title || "Manage Course"}
            </h1>
            {formData.isPublished ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
                <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                Published (Visible to students)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-300 px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                <HiOutlineXCircle className="h-3.5 w-3.5" />
                Draft (Not visible to students)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
          >
            <HiOutlineEye className="h-4 w-4" />
            Preview Course
          </Link>
          <button
            onClick={togglePublish}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              formData.isPublished
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {formData.isPublished ? "Unpublish Course" : "Publish to Students"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("media")}
          className={`pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
            activeTab === "media"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <HiOutlinePhotograph className="h-5 w-5" />
          Course Details & Media
        </button>
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
            activeTab === "curriculum"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <HiOutlineFilm className="h-5 w-5" />
          Lessons & Video Content ({lessons.length})
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
      </div>

      {/* TAB 1: Course Details, Thumbnail & Short Video */}
      {activeTab === "media" && (
        <form onSubmit={handleSaveCourse} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: General Info */}
            <div className="lg:col-span-2 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-3">
                General Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Course Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
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
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="react, web development, javascript"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-zinc-700 focus:ring-indigo-500"
                />
                <label
                  htmlFor="isPublishedCheck"
                  className="text-sm text-gray-700 dark:text-zinc-300 font-medium"
                >
                  Publish course (make available to students on courses page)
                </label>
              </div>
            </div>

            {/* Right: Media (Thumbnail & Short Video Preview) */}
            <div className="space-y-6">
              {/* Thumbnail Card */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <HiOutlinePhotograph className="h-5 w-5 text-indigo-600" />
                    Course Thumbnail
                  </h2>
                </div>

                {formData.thumbnail ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
                    <img
                      src={formData.thumbnail}
                      alt="Course Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, thumbnail: "" })
                      }
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow"
                      title="Remove Thumbnail"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 text-center">
                    <HiOutlinePhotograph className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 mb-2">
                      Upload an image file (PNG, JPG, WebP)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Upload from Device
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e.target.files?.[0], "thumbnail")
                    }
                    disabled={uploadingThumbnail}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {uploadingThumbnail && (
                    <p className="text-xs text-indigo-600 mt-1 animate-pulse">
                      Uploading thumbnail...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Or Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Short Preview Video Card */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HiOutlineFilm className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Short Preview / Promo Video
                  </h2>
                </div>

                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Upload a short teaser or intro video for students to watch
                  before enrolling.
                </p>

                {formData.previewVideo ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black shadow-md">
                    <VideoPlayer url={formData.previewVideo} previewMode={true} />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, previewVideo: "" })
                      }
                      className="absolute top-2 right-2 z-20 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow"
                      title="Remove Video"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gray-50 dark:bg-zinc-800/60 border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center p-4 text-center">
                    <HiOutlineFilm className="h-10 w-10 text-gray-400 dark:text-zinc-500 mb-2" />
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Upload an MP4 or paste a YouTube video URL
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Upload Video File
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleFileUpload(e.target.files?.[0], "previewVideo")
                    }
                    disabled={uploadingPreviewVideo}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                  {uploadingPreviewVideo && (
                    <p className="text-xs text-purple-600 mt-1 animate-pulse">
                      Uploading video... please wait
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Or Video URL (YouTube, Vimeo, or Direct Video)
                  </label>
                  <input
                    type="text"
                    value={formData.previewVideo}
                    onChange={(e) => {
                      const val = e.target.value;
                      const iframeMatch = val.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                      setFormData({
                        ...formData,
                        previewVideo: iframeMatch ? iframeMatch[1] : val,
                      });
                    }}
                    placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {extractYouTubeId(formData.previewVideo) && (
                    <div className="flex items-center justify-between mt-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        YouTube detected (ID: {extractYouTubeId(formData.previewVideo)})
                      </span>
                      {!formData.previewVideo.includes("/embed/") && (
                        <button
                          type="button"
                          onClick={() => {
                            const embed = `https://www.youtube.com/embed/${extractYouTubeId(formData.previewVideo)}`;
                            setFormData({ ...formData, previewVideo: embed });
                            toast.success("Converted to YouTube embed URL!");
                          }}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Convert to Embed Link
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save All Changes"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Curriculum & Lessons */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Course Lessons & Video Content
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Add video lessons, text materials, and preview lessons for your
                students.
              </p>
            </div>
            <button
              onClick={openAddLessonModal}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
            >
              <HiOutlinePlus className="h-5 w-5" />
              Add New Lesson
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 border border-gray-100 dark:border-zinc-800 text-center">
              <HiOutlineFilm className="h-16 w-16 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No lessons created yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                Start uploading video or text lessons to complete your course
                curriculum.
              </p>
              <button
                onClick={openAddLessonModal}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Add Your First Lesson
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson._id}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-indigo-100 dark:border-indigo-900">
                      {idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                          {lesson.title}
                        </h4>
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                          {lesson.type}
                        </span>
                        {lesson.isFree && (
                          <span className="text-[10px] sm:text-xs font-semibold bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-900">
                            Free Preview
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-400 mt-1">
                        {lesson.duration > 0 && (
                          <span>{lesson.duration} mins</span>
                        )}
                        {lesson.videoUrl && (
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                            <HiOutlineFilm className="h-3.5 w-3.5" /> Video
                            Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => openEditLessonModal(lesson)}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 rounded-lg transition"
                      title="Edit Lesson"
                    >
                      <HiOutlinePencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg transition"
                      title="Delete Lesson"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Google Meet Reviews & Tests */}
      {activeTab === "meet" && (
        <GoogleMeetSection
          courseId={id}
          courseTitle={course?.title}
          isInstructor={true}
          enrolledStudents={course?.enrolledStudents || []}
        />
      )}

      {/* Lesson Add/Edit Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingLesson ? "Edit Lesson" : "Add New Lesson"}
              </h3>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
              >
                <HiOutlineXCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lessonFormData.title}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="e.g. Introduction to React Components"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Lesson Type
                  </label>
                  <select
                    value={lessonFormData.type}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text / Notes</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Estimated Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={lessonFormData.duration}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    min={0}
                  />
                </div>
              </div>

              {/* Video Specific inputs */}
              {lessonFormData.type === "video" && (
                <div className="bg-indigo-50/50 dark:bg-zinc-800/60 p-4 rounded-xl border border-indigo-100 dark:border-zinc-700 space-y-3">
                  <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                    Lesson Video
                  </label>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-zinc-400 mb-1">
                      Upload Video from Device
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        handleFileUpload(e.target.files?.[0], "lessonVideo")
                      }
                      disabled={uploadingLessonVideo}
                      className="block w-full text-xs text-gray-500 dark:text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200 cursor-pointer"
                    />
                    {uploadingLessonVideo && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 animate-pulse">
                        Uploading video to storage...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-zinc-400 mb-1">
                      Or Video URL (YouTube, Vimeo, or Direct Video URL)
                    </label>
                    <input
                      type="text"
                      value={lessonFormData.videoUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        const iframeMatch = val.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                        setLessonFormData({
                          ...lessonFormData,
                          videoUrl: iframeMatch ? iframeMatch[1] : val,
                        });
                      }}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    />
                    {extractYouTubeId(lessonFormData.videoUrl) && (
                      <div className="flex items-center justify-between mt-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          YouTube video ready (ID: {extractYouTubeId(lessonFormData.videoUrl)})
                        </span>
                        {!lessonFormData.videoUrl.includes("/embed/") && (
                          <button
                            type="button"
                            onClick={() => {
                              const embed = `https://www.youtube.com/embed/${extractYouTubeId(lessonFormData.videoUrl)}`;
                              setLessonFormData({ ...lessonFormData, videoUrl: embed });
                              toast.success("Converted to YouTube embed URL!");
                            }}
                            className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition cursor-pointer"
                          >
                            Convert to Embed Link
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {lessonFormData.videoUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden shadow-md">
                      <VideoPlayer url={lessonFormData.videoUrl} previewMode={true} className="w-full h-full" />
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Text / Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Lesson Notes & Content (Markdown / Text)
                </label>
                <textarea
                  value={lessonFormData.content}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      content: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Enter lesson explanation, study notes, or reference materials..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                />
              </div>

              {/* Free preview toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFreeCheck"
                  checked={lessonFormData.isFree}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      isFree: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-zinc-700 focus:ring-indigo-500"
                />
                <label
                  htmlFor="isFreeCheck"
                  className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300"
                >
                  Allow Free Preview (students can view without enrolling)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="flex-1 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson || uploadingLessonVideo}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-sm shadow-sm"
                >
                  {savingLesson ? "Saving..." : "Save Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
