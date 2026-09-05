import { useTheme } from "../context/ThemeContext";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";

export default function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} theme`}
      className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
        isDark
          ? "bg-zinc-800 text-amber-300 hover:bg-zinc-700 border border-zinc-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
      } ${className}`}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark / Black & White Theme"}
    >
      {isDark ? (
        <HiOutlineSun className="h-5 w-5 animate-in spin-in-90 duration-200" />
      ) : (
        <HiOutlineMoon className="h-5 w-5 animate-in spin-in-90 duration-200" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
