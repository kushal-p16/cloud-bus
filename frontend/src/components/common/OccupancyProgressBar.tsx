import React from 'react';

interface OccupancyProgressBarProps {
  percentage: number;
  height?: string;
  showText?: boolean;
  passengerCount?: number;
  capacity?: number;
}

export const OccupancyProgressBar: React.FC<OccupancyProgressBarProps> = ({
  percentage,
  height = 'h-2.5',
  showText = false,
  passengerCount,
  capacity,
}) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  let barColor = 'bg-emerald-500';
  if (percentage > 100) {
    barColor = 'bg-red-700 animate-pulse';
  } else if (percentage > 90) {
    barColor = 'bg-red-500';
  } else if (percentage > 70) {
    barColor = 'bg-amber-500';
  } else if (percentage > 40) {
    barColor = 'bg-sky-500';
  }

  return (
    <div className="w-full space-y-1">
      {showText && (
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>
            {passengerCount !== undefined && capacity !== undefined
              ? `${passengerCount} / ${capacity} Passengers`
              : 'Occupancy'}
          </span>
          <span className={percentage > 90 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 ${height}`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
};
