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
}

interface UseTimerOptions {
  initialTime?: number;
  countdown?: boolean;
  onComplete?: () => void;
}

const useTimer = (options: UseTimerOptions = {}): UseTimerReturn => {
  const { initialTime = 0, countdown = false, onComplete } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Prevent onComplete from firing more than once per countdown run
  const completedRef = useRef(false);

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
    setTime(initialTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialTime]);

  // Stop timer (pause and reset)
  const stop = useCallback(() => {
    setIsRunning(false);
    completedRef.current = false;
    setTime(initialTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialTime]);

  // Tick effect — only updates time, no side-effects inside the updater
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (countdown) {
          return prevTime > 0 ? prevTime - 1 : 0;
        }
        return prevTime + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, countdown]);

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
  };
};

export default useTimer;
