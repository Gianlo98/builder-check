"use client";

interface ScoreRingProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 120, strokeWidth = 8 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score != null ? score / 100 : 0;
  const dashOffset = circumference * (1 - progress);

  const strokeColor =
    score == null
      ? "stroke-muted"
      : score >= 75
        ? "stroke-emerald-500"
        : score >= 55
          ? "stroke-amber-500"
          : "stroke-rose-500";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={score != null ? dashOffset : circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score != null ? (
          <span className="text-3xl font-bold tabular-nums">{score}</span>
        ) : (
          <span className="text-sm text-muted-foreground">...</span>
        )}
      </div>
    </div>
  );
}
