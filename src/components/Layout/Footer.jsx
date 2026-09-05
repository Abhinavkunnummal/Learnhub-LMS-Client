import { Link } from "react-router-dom";
import { HiOutlineAcademicCap } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-zinc-950 border-t border-zinc-800 text-zinc-300 w-full transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineAcademicCap className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold text-white">LearnHub</span>
            </div>
            <p className="text-sm text-gray-400">
              Empowering learners worldwide with quality education and hands-on
              courses.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <div className="space-y-2">
              <Link to="/courses" className="block text-sm hover:text-white transition">
                Browse Courses
              </Link>
              <Link to="/register" className="block text-sm hover:text-white transition">
                Become an Instructor
              </Link>
              <Link to="/courses" className="block text-sm hover:text-white transition">
                Pricing
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm hover:text-white transition">
                About Us
              </a>
              <a href="#" className="block text-sm hover:text-white transition">
                Careers
              </a>
              <a href="#" className="block text-sm hover:text-white transition">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm hover:text-white transition">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm hover:text-white transition">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
