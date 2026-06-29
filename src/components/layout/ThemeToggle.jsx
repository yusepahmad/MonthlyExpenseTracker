import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300 hover:scale-110 transition-transform"
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px]" />
      ) : (
        <Moon className="w-[18px] h-[18px]" />
      )}
    </button>
  );
}
