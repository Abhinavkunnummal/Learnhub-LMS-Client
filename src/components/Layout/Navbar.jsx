import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineLogin,
} from "react-icons/hi";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "instructor") return "/instructor";
    return "/student";
  };

  return (
    <nav className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 w-full transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <HiOutlineAcademicCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">LearnHub</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/courses"
              className="text-gray-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
            >
              Browse Courses
            </Link>

            {user && (
              <Link
                to={getDashboardLink()}
                className="text-gray-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
              >
                Dashboard
              </Link>
            )}

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-gray-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium hidden sm:inline">
                    {user.name}
                  </span>
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        onClick={() => setProfileOpen(false)}
                      >
                        <HiOutlineUser className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <HiOutlineLogout className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button & Theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white p-1"
            >
              {menuOpen ? (
                <HiOutlineX className="h-6 w-6" />
              ) : (
                <HiOutlineMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/courses"
              className="block py-2 text-gray-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={() => setMenuOpen(false)}
            >
              Browse Courses
            </Link>
            {user && (
              <Link
                to={getDashboardLink()}
                className="block py-2 text-gray-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {!user ? (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-2 text-left text-red-600 dark:text-red-400 hover:text-red-700"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
