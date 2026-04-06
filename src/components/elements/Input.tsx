import { InputHTMLAttributes, forwardRef } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="label-architectural" htmlFor={props.id || props.name}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "input-field w-full placeholder:text-white/20",
            error && "border-tertiary/50 focus:border-tertiary/70 focus:ring-tertiary/20",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[10px] text-tertiary font-medium animate-in fade-in duration-300">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
