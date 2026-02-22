import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      suppressHydrationWarning
      className={cn(
        "h-9 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500/60",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
