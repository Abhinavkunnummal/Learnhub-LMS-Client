import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineAcademicCap,
  HiOutlinePlay,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineLightBulb,
} from "react-icons/hi";

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: HiOutlinePlay,
      title: "Video Lessons",
      description:
        "High-quality video content with downloadable resources and transcripts.",
    },
    {
      icon: HiOutlineCheckCircle,
      title: "Interactive Quizzes",
      description:
        "Test your knowledge with quizzes and track your progress in real-time.",
    },
    {
      icon: HiOutlineUserGroup,
      title: "Community",
      description:
        "Join discussions with fellow learners and instructors.",
    },
    {
      icon: HiOutlineStar,
      title: "Certifications",
      description:
        "Earn verified certificates upon course completion.",
    },
    {
      icon: HiOutlineChartBar,
      title: "Progress Tracking",
      description:
        "Detailed analytics and progress dashboards for every learner.",
    },
    {
      icon: HiOutlineShieldCheck,
      title: "Expert Instructors",
      description:
        "Learn from industry professionals with real-world experience.",
    },
  ];

  const stats = [
    { label: "Active Students", value: "10,000+" },
    { label: "Courses", value: "500+" },
    { label: "Instructors", value: "200+" },
    { label: "Certificates Issued", value: "25,000+" },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 sm:mb-8">
              <HiOutlineAcademicCap className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">
                The Future of Online Learning
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              Learn Without
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Limits
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 sm:mb-10 max-w-2xl mx-auto">
              Access world-class courses, track your progress, earn
              certifications, and join a global community of learners.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/courses"
                className="bg-white text-indigo-700 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition shadow-lg text-center"
              >
                Explore Courses
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="border-2 border-white/30 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-white/10 transition text-center"
                >
                  Start Learning Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-300 max-w-2xl mx-auto">
              Our platform provides all the tools and features you need for an
              effective learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:shadow-lg dark:hover:shadow-zinc-900/50 transition group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-indigo-600 transition">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-zinc-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <HiOutlineLightBulb className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 sm:mb-6 text-yellow-300" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-indigo-100 text-sm sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
                Join thousands of learners who are already building new skills
                and advancing their careers.
              </p>
              <Link
                to={user ? "/courses" : "/register"}
                className="inline-block bg-white text-indigo-700 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition shadow-lg"
              >
                {user ? "Browse Courses" : "Get Started Free"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
