import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const variantMap: Record<ButtonVariant, string> = {
  default: "border border-indigo-500/50 bg-indigo-600 text-white hover:bg-indigo-500",
  outline: "border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800",
  ghost: "border border-transparent bg-transparent text-slate-200 hover:bg-slate-800/80",
  destructive: "border border-rose-500/50 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
