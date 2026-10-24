import React from 'react';
import { Activity } from 'lucide-react';

interface OrbitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const OrbitLogo: React.FC<OrbitLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const pulseIconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Exam-Pulse glowing dynamic emblem */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        {/* Outer pulse glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 blur-[6px] opacity-75 animate-pulse" />

        {/* Outer gradient border */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-indigo-600 to-purple-700 p-[2px] shadow-lg shadow-indigo-500/25">
          <div className="w-full h-full rounded-full bg-[#0a0f1d] flex items-center justify-center overflow-hidden relative">
            <Activity className={`${pulseIconSizes[size]} text-cyan-400 animate-pulse`} />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-white ${textSizes[size]}`}>
            Exam<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">-Pulse</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium tracking-wide text-cyan-400/80 mt-0.5">
            Online Examination Portal
          </span>
        )}
      </div>
    </div>
  );
};
