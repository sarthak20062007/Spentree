import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      className="group relative flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 w-16 h-8 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      {/* Sliding Pill */}
      <div 
        className={`absolute top-1 bottom-1 w-6 bg-white dark:bg-blue-600 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isLight ? 'left-1' : 'left-[calc(100%-28px)]'
        }`}
      />
      
      {/* Icons Container */}
      <div className="flex justify-between w-full px-1.5 relative z-10 pointer-events-none">
        <span className={`text-[12px] transition-all duration-300 ${isLight ? 'opacity-100 scale-100' : 'opacity-40 scale-75'}`}>
          ☀️
        </span>
        <span className={`text-[12px] transition-all duration-300 ${!isLight ? 'opacity-100 scale-100' : 'opacity-40 scale-75'}`}>
          🌙
        </span>
      </div>
    </button>
  );
}
