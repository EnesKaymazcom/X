"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName?: string;
  onClick?: () => void | Promise<void>;
  variant?: string;
}

export const Button = ({ children, className, appName, onClick, variant }: ButtonProps) => {
  const handleClick = onClick || (() => alert(`Hello from your ${appName} app!`));
  
  return (
    <button
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
