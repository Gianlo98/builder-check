"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { RotateCcw } from "lucide-react";

interface DashboardHeaderProps {
  query: string;
}

export function DashboardHeader({ query }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-4 pb-2">
      <div className="flex items-center gap-4 min-w-0">
        <Logo size="sm" showText={false} className="flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Validation Report</p>
          <p className="text-sm font-medium truncate">
            &ldquo;{query}&rdquo;
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/")}
        className="flex-shrink-0"
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
        New idea
      </Button>
    </div>
  );
}
