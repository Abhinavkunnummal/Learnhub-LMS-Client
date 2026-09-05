import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineShare,
} from "react-icons/hi";

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, [courseId]);

  const fetchCertificate = async () => {
    try {
      const res = await api.get(`/certificates/${courseId}`);
      setCertificate(res.data.certificate);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load certificate");
    } finally {
      setLoading(false);
    }
  };

  const shareCertificate = () => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Verification link copied to clipboard! 📋");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <HiOutlineAcademicCap className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            No Certificate Found
          </h2>
          <p className="text-gray-500 text-sm">
            Complete the course to earn your certificate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-8 sm:py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Certificate Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 sm:p-8 text-center">
            <HiOutlineAcademicCap className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Certificate of Completion
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              LearnHub Learning Platform
            </p>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-8 text-center">
            <p className="text-gray-500 dark:text-zinc-400 mb-2 text-xs sm:text-sm">
              This is to certify that
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {user?.name || "Student"}
            </h2>

            <p className="text-gray-500 dark:text-zinc-400 mb-2 text-xs sm:text-sm">
              has successfully completed the course
            </p>
            <h3 className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 sm:mb-6">
              {certificate.course?.title || "Course"}
            </h3>

            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-4 sm:mb-6">
              <HiOutlineCheckCircle className="h-5 w-5" />
              <span className="font-medium text-sm">Course Completed</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-4 sm:mb-6">
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Category</p>
                <p className="font-medium text-gray-700 dark:text-zinc-200">
                  {certificate.course?.category || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Completion Date</p>
                <p className="font-medium text-gray-700 dark:text-zinc-200">
                  {new Date(certificate.completionDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-800 pt-4 sm:pt-6 mt-4 sm:mt-6">
              <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">Certificate ID</p>
              <p className="text-xs sm:text-sm font-mono font-semibold text-gray-700 dark:text-zinc-300 break-all">
                {certificate.certificateId}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-zinc-950/80 border-t border-gray-100 dark:border-zinc-800 p-4 sm:p-6 flex justify-center">
            <button
              onClick={shareCertificate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 sm:px-6 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
            >
              <HiOutlineShare className="h-5 w-5" />
              Share Certificate
            </button>
          </div>
        </div>

        {/* Verification Info */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            This certificate can be verified at:{" "}
            <span className="font-mono text-indigo-600 dark:text-indigo-400 break-all">
              /verify/{certificate.certificateId}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
