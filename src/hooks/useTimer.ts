/**
 * useTimer Hook
 * Custom hook for countdown and countup timers
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
  setTime: (newTime: number) => void;
}

interface UseTimerOptions {
  initialTime?: number;
  countdown?: boolean;
  onComplete?: () => void;
  onTick?: (currentTime: number) => void;
}

const useTimer = (options: UseTimerOptions = {}): UseTimerReturn => {
  const { initialTime = 0, countdown = false, onComplete, onTick } = options;

  const [time, setTimeState] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Prevent onComplete from firing more than once per countdown run
  const completedRef = useRef(false);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  // Dynamically set countdown duration
  const setTime = useCallback((newTime: number) => {
    setTimeState(newTime);
    completedRef.current = false;
  }, []);

  // Start timer
  const start = useCallback(() => {
    completedRef.current = false;
    setIsRunning(true);
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset timer to initial time
  const reset = useCallback(() => {
    setIsRunning(false);
    completedRef.current = false;
    setTimeState(initialTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialTime]);

  // Stop timer (pause and reset)
  const stop = useCallback(() => {
    setIsRunning(false);
    completedRef.current = false;
    setTimeState(initialTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialTime]);

  // Tick effect — only updates time, no side-effects inside the updater
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeState((prevTime) => {
        const newTime = countdown ? (prevTime > 0 ? prevTime - 1 : 0) : prevTime + 1;
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, countdown]);

  // onTick effect — fires after each time change while running
  useEffect(() => {
    if (isRunning && onTickRef.current) {
      onTickRef.current(time);
    }
  }, [time, isRunning]);

  // Completion effect — runs after time reaches 0 in countdown mode
  useEffect(() => {
    if (countdown && isRunning && time === 0 && !completedRef.current) {
      completedRef.current = true;
      setIsRunning(false);
      onComplete?.();
    }
  }, [time, countdown, isRunning, onComplete]);

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    stop,
    setTime,
  };
};

export default useTimer;
