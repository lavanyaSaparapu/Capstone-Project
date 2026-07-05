import React, { useEffect, useState } from 'react';

interface ScoreMeterProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  size = 120,
  strokeWidth = 10
}) => {
  const [currentScore, setCurrentScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  useEffect(() => {
    // Animate count up on score change
    let start = 0;
    const end = Math.round(score);
    if (start === end) {
      setCurrentScore(end);
      return;
    }
    
    const duration = 1200; // ms
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += increment;
      setCurrentScore(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, stepTime || 10);

    return () => clearInterval(timer);
  }, [score]);

  // Color gradient helper based on match percentage
  const getColorClass = () => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-brand-500";
    if (score >= 40) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="stroke-slate-200 dark:stroke-slate-800"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`transition-all duration-300 ease-out ${getColorClass()}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Percentage Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:to-slate-300">
          {currentScore}%
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
          Match
        </span>
      </div>
    </div>
  );
};
