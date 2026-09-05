import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import api from "./utils/api";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import ManageCourse from "./pages/ManageCourse";
import AdminDashboard from "./pages/AdminDashboard";
import LessonView from "./pages/LessonView";
import Certificate from "./pages/Certificate";

import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";

// Certificate verification page
function VerifyCertificate() {
  const { certId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/certificates/verify/${certId}`);
        setResult(res.data.certificate);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [certId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Verifying...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 transition-colors">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <HiOutlineXCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Certificate Not Found
            </h2>
            <p className="text-gray-500 dark:text-zinc-400">
              This certificate ID is invalid or does not exist.
            </p>
          </>
        ) : (
          <>
            <HiOutlineCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Certificate Verified ✓
            </h2>
            <div className="mt-4 space-y-2 text-sm text-left">
              <p>
                <span className="text-gray-500 dark:text-zinc-400">Student:</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{result.student}</span>
              </p>
              <p>
                <span className="text-gray-500 dark:text-zinc-400">Course:</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{result.course}</span>
              </p>
              <p>
                <span className="text-gray-500 dark:text-zinc-400">Category:</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{result.category}</span>
              </p>
              <p>
                <span className="text-gray-500 dark:text-zinc-400">Issued:</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(result.issuedAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              className: "!bg-zinc-900 !text-white !border !border-zinc-800 dark:!bg-zinc-100 dark:!text-zinc-900 dark:!border-zinc-200 shadow-xl",
              style: {
                borderRadius: "14px",
                padding: "14px 18px",
                fontSize: "14px",
                fontWeight: 500,
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        <Routes>
          {/* Auth pages - standalone, no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* All other pages - with Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="verify/:certId" element={<VerifyCertificate />} />

            {/* Student Routes */}
            <Route
              path="student"
              element={
                <ProtectedRoute roles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="learn/:courseId/lesson/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonView />
                </ProtectedRoute>
              }
            />
            <Route
              path="certificate/:courseId"
              element={
                <ProtectedRoute>
                  <Certificate />
                </ProtectedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="instructor"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="instructor/courses/:id/manage"
              element={
                <ProtectedRoute roles={["instructor", "admin"]}>
                  <ManageCourse />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}
