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
    xl: 'w-13 h-13',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const pulseIconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
    xl: 'w-6.5 h-6.5',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Ultra-Premium Glowing Royal Gradient Emblem */}
      <div className="relative">
        {/* Ambient backlight glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 blur-md opacity-60 animate-pulse" />

        <div
          className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_4px_18px_rgba(79,70,229,0.4)] flex items-center justify-center shrink-0`}
        >
          <div className="w-full h-full rounded-[10px] bg-[#0c1022] flex items-center justify-center">
            <Activity className={`${pulseIconSizes[size]} text-indigo-400 stroke-[2.5]`} />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-none font-bold tracking-tight">
          <span className={`text-white tracking-[-0.03em] ${textSizes[size]}`}>
            EXAM
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-400">
              -PULSE
            </span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300/70 mt-0.5">
            Technical Assessment Platform
          </span>
        )}
      </div>
    </div>
  );
};
