'use client';

import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

export const useCountdown = (targetDate: Date | null) => {
  const [timeRemaining, setTimeRemaining] = useState(targetDate ? differenceInSeconds(targetDate, new Date()) : 0);

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const remaining = differenceInSeconds(targetDate, new Date());
      setTimeRemaining(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isDue = timeRemaining <= 0;
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  return { hours, minutes, seconds, isDue };
};
