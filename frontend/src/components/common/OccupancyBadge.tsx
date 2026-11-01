import React from 'react';

interface OccupancyBadgeProps {
  percentage: number;
  category?: 'LOW' | 'MODERATE' | 'HIGH' | 'NEAR_FULL' | 'OVERCROWDED' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const OccupancyBadge: React.FC<OccupancyBadgeProps> = ({
  percentage,
  category,
  size = 'md',
  showLabel = true,
}) => {
  // Determine color and status
  let bg = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';
  let label = 'Low Crowding';

  if (percentage > 100 || category === 'OVERCROWDED') {
    bg = 'bg-rose-950/90 text-rose-300 border-rose-700/50';
    dotColor = 'bg-rose-500 animate-ping';
    label = 'Overcrowded';
  } else if (percentage > 90 || category === 'NEAR_FULL') {
    bg = 'bg-red-950/80 text-red-400 border-red-500/40';
    dotColor = 'bg-red-400 animate-pulse';
    label = 'Near Full';
  } else if (percentage > 70 || category === 'HIGH') {
    bg = 'bg-amber-950/80 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
    label = 'High Crowding';
  } else if (percentage > 40 || category === 'MODERATE') {
    bg = 'bg-sky-950/80 text-sky-400 border-sky-500/30';
    dotColor = 'bg-sky-400';
    label = 'Moderate';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${bg} ${sizeClasses[size]}`}
    >
      <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
      <span>{percentage}%</span>
      {showLabel && <span className="opacity-80 text-[11px]">({label})</span>}
    </span>
  );
};
