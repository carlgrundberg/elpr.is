import { useEffect, useState } from "react";

const getTime = () => {
  return new Date().getTime();
};

export const getQuarterHourTime = (date = new Date()) => {
  // Truncate time to nearest quarter hour (00:00, 00:15, 00:30, 00:45)
  const quarterDate = new Date(date);
  const minutes = quarterDate.getMinutes();
  const quarter = Math.floor(minutes / 15) * 15;

  quarterDate.setMinutes(quarter);
  quarterDate.setSeconds(0);
  quarterDate.setMilliseconds(0);

  return quarterDate;
};

export const useTime = (refreshCycle = 100) => {
  // Returns the current time
  // and queues re-renders every `refreshCycle` milliseconds (default: 100ms)

  const [now, setNow] = useState(getTime());

  useEffect(() => {
    // Regularly set time in state
    // (this will cause your component to re-render frequently)
    const intervalId = setInterval(() => setNow(getTime()), refreshCycle);

    // Cleanup interval
    return () => clearInterval(intervalId);

    // Specify dependencies for useEffect
  }, [refreshCycle, setNow]);

  return now;
};
