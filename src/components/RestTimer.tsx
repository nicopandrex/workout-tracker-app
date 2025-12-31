import { useEffect, useState, useRef } from "react";
import { X, Plus, Minus, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  onDismiss: () => void;
}

const TIMER_STORAGE_KEY = "rest-timer-end-time";

// Show notification
const showNotification = () => {
  if (Notification.permission === "granted") {
    const notification = new Notification("Rest Complete! 💪", {
      body: "Time to start your next set!",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "rest-timer",
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });

    // Play a sound (optional)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGO1PXPgjMGHGm68eaPMwgUVqvl7LNZFQpFnuD0wXEdBzCM0/XShDQGHGu78uaQNAkVWLDm7bRaFgpGns/0w3IdBzCM0/XRhDQGHGu78uaQNAkVWLDm7bRaFgpGntD0w3IdBzCM0/XRhDQGHGu78uaQNAkVWLDm7bRaFgpGntD0w3IdBzCM0/XRhDQGHGu78uaQNAkVWLDm7bRaFgpGntD0w3IdBzCM0/XRhDQGHGu78uaQNAkVWLDm7bRaFgpGntD0w3IdBzCM0/XRhDQGHGu78uaQNAkVWLDm7bRaFg==');
    audio.play().catch(() => {}); // Ignore if audio fails
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

export function RestTimer({
  initialSeconds,
  onComplete,
  onDismiss,
}: RestTimerProps) {
  const endTimeRef = useRef<number>(0);
  
  const [secondsLeft, setSecondsLeft] = useState(() => {
    // On mount, check if there's a stored end time
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (stored) {
      const endTime = parseInt(stored, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      if (remaining > 0) {
        endTimeRef.current = endTime;
        return remaining;
      }
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }
    // No stored timer, create a new end time
    const newEndTime = Date.now() + initialSeconds * 1000;
    endTimeRef.current = newEndTime;
    localStorage.setItem(TIMER_STORAGE_KEY, newEndTime.toString());
    return initialSeconds;
  });
  const [isPaused, setIsPaused] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const hasNotifiedRef = useRef(false);

  // Keep the ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Save timer end time to localStorage whenever it changes
  useEffect(() => {
    if (secondsLeft > 0 && endTimeRef.current > 0) {
      localStorage.setItem(TIMER_STORAGE_KEY, endTimeRef.current.toString());
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }
  }, [secondsLeft]);

  // Main timer effect - recalculate from end time on each tick
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (endTimeRef.current > 0) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        
        if (remaining <= 0) {
          if (!hasNotifiedRef.current) {
            onCompleteRef.current?.();
            showNotification();
            hasNotifiedRef.current = true;
          }
          localStorage.removeItem(TIMER_STORAGE_KEY);
          setSecondsLeft(0);
        } else {
          setSecondsLeft(remaining);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (secondsLeft === 0) {
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    };
  }, [secondsLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addTime = (seconds: number) => {
    const newSeconds = Math.max(0, secondsLeft + seconds);
    endTimeRef.current = Date.now() + newSeconds * 1000;
    setSecondsLeft(newSeconds);
  };

  const progress = (secondsLeft / initialSeconds) * 100;
  const isAlmostDone = secondsLeft <= 10;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isAlmostDone
              ? "bg-gradient-to-r from-emerald-500 to-teal-600"
              : "bg-gradient-to-r from-blue-500 to-cyan-600"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsPaused(!isPaused)}
            className="h-7 w-7 text-slate-400 hover:text-white"
          >
            {isPaused ? (
              <Play className="w-3 h-3" />
            ) : (
              <Pause className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => addTime(-15)}
            disabled={secondsLeft <= 15}
            className="h-7 w-7 text-slate-400 hover:text-white"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => addTime(15)}
            className="h-7 w-7 text-slate-400 hover:text-white"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <div
          className={cn(
            "text-xl font-mono font-bold tabular-nums flex items-center gap-2",
            isAlmostDone ? "text-emerald-400" : "text-slate-200"
          )}
        >
          <span className="text-xs text-slate-500">REST</span>
          {formatTime(secondsLeft)}
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          className="h-7 w-7 text-slate-400 hover:text-red-400"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
