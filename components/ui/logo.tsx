import { cn } from "@/lib/utils";

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Short arm (behind, darker green) */}
      <path
        d="M10 30L20 42"
        stroke="#2A9464"
        strokeWidth="13"
        strokeLinecap="round"
      />
      {/* Long arm (in front, lighter green) */}
      <path
        d="M20 42L42 8"
        stroke="#3CB878"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
  size = "default",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const iconSize = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  const textSize = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon className={iconSize} />
      {showText && (
        <span className={cn("font-bold tracking-tight", textSize)}>
          <span className="text-foreground">Builder</span>
          <span className="text-primary">Check</span>
        </span>
      )}
    </div>
  );
}
