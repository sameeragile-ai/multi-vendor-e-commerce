import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: string;
  label?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label = 'Deals expire in',
}) => {
  // Default to 18 hours from now if no targetDate provided
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const target = targetDate
      ? new Date(targetDate).getTime()
      : Date.now() + 14 * 3600 * 1000 + 32 * 60 * 1000 + 45 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-stone-900 text-xs font-semibold">
      <Timer size={14} className="text-[#FF6B4A] animate-pulse" />
      <span className="text-stone-600 hidden sm:inline">{label}:</span>
      <div className="flex items-center gap-1 font-mono font-bold text-stone-900">
        <span className="px-1.5 py-0.5 bg-white rounded shadow-xs">
          {pad(timeLeft.hours)}h
        </span>
        <span>:</span>
        <span className="px-1.5 py-0.5 bg-white rounded shadow-xs">
          {pad(timeLeft.minutes)}m
        </span>
        <span>:</span>
        <span className="px-1.5 py-0.5 bg-white rounded shadow-xs text-[#FF6B4A]">
          {pad(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
};
