'use client';

import { useState, useEffect, useRef } from 'react';

interface WorkoutTimerProps {
  startTime: number;
  isRunning: boolean;
}

export default function WorkoutTimer({ startTime, isRunning }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      const update = () => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      };
      update();
      intervalRef.current = setInterval(update, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      <span className="font-mono text-2xl font-bold text-primary-800">
        {hours > 0 && `${formatTime(hours)}:`}
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
}
