import { useEffect, useState, useRef } from "react";
import { X, Plus, Minus, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  onDismiss: () => void;
}

export function RestTimer({
  initialSeconds,
  onComplete,
  onDismiss,
}: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep the ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addTime = (seconds: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + seconds));
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
