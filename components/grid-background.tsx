import { cn } from "@/lib/utils";
import React from "react";

export function GridBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Grid Background */}
      <div
        className={cn(
          "fixed inset-0 z-0 opacity-30",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Fade out effect that increases opacity towards bottom */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent from-0% via-transparent via-40% to-white/80 to-100% dark:to-black/80"></div>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}