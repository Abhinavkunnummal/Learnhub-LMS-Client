import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import {
  HiOutlineSearch,
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlineFilter,
} from "react-icons/hi";

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

const levels = ["Beginner", "Intermediate", "Advanced"];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCourses();
  }, [category, level, sort, page]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (level) params.set("level", level);
      if (sort) params.set("sort", sort);
      params.set("page", page);
      params.set("limit", 12);

      const res = await api.get(`/courses?${params.toString()}`);
      setCourses(res.data.courses);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Explore Courses
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm sm:text-base">
          Discover courses to advance your career and skills
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3 mb-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 sm:px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition text-sm whitespace-nowrap shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="h-40 sm:h-48 bg-gray-200" />
              <div className="p-4 sm:p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <HiOutlineFilter className="h-12 sm:h-16 w-12 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Try adjusting your filters or search
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden hover:shadow-lg dark:hover:shadow-zinc-900/50 transition group"
              >
                <div className="h-40 sm:h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl sm:text-6xl">📚</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1">
                    <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-400 w-fit">
                      {course.category}
                    </span>
                    {course.previewVideo && (
                      <span className="bg-purple-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold w-fit shadow-sm">
                        ▶ Preview Video
                      </span>
                    )}
                  </div>
                  <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    {course.level}
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition text-sm sm:text-base">
                    {course.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <HiOutlineStar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                      <span className="font-medium">
                        {course.rating.average > 0
                          ? course.rating.average.toFixed(1)
                          : "New"}
                      </span>
                      {course.rating.count > 0 && (
                        <span>({course.rating.count})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <HiOutlineUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{course.enrolledStudents?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {course.instructor?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 truncate">
                        {course.instructor?.name || "Instructor"}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap ml-2">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8 sm:mt-10">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 sm:w-auto sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition ${
                      p === page
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
