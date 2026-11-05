import React from 'react';
import { useTheme } from '../context/ThemeContext.tsx';
import { Sun, Moon } from 'lucide-react';

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm cursor-pointer select-none ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle visual theme"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-[var(--accent)] shrink-0" />
          {!compact && (
            <span className="text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] hidden sm:inline">
              Light
            </span>
          )}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-[var(--accent)] shrink-0" />
          {!compact && (
            <span className="text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] hidden sm:inline">
              Dark
            </span>
          )}
        </>
      )}
    </button>
  );
};
