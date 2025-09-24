"use client";

import React from "react";
import { GlowingEffect } from "./glowing-effect";
import { cn } from "@/lib/utils";

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowingEffectProps?: {
    blur?: number;
    borderWidth?: number;
    spread?: number;
    glow?: boolean;
    disabled?: boolean;
    proximity?: number;
    inactiveZone?: number;
    variant?: "default" | "white";
    movementDuration?: number;
  };
}

export function GlowingCard({ 
  children, 
  className,
  glowingEffectProps = {},
  ...props 
}: GlowingCardProps) {
  return (
    <div className={cn("relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3", className)} {...props}>
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        {...glowingEffectProps}
      />
      <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-background/95 backdrop-blur-sm dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
        {children}
      </div>
    </div>
  );
}