import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Card Component
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("bg-onyx-800 border border-onyx-700 rounded-xl p-4 md:p-6 shadow-sm", className)} {...props}>
    {children}
  </div>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-onyx-700 text-white hover:bg-onyx-600 border border-onyx-600",
    ghost: "bg-transparent text-neutral-400 hover:text-white hover:bg-onyx-800",
    danger: "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
  };
  
  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={cn("rounded-lg font-medium transition-colors flex items-center justify-center gap-2", variants[variant], sizes[size], className)}
      {...props} 
    />
  );
};

// Checkbox
export const Checkbox: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div 
    onClick={onChange}
    className={cn(
      "w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-all",
      checked ? "bg-white border-white" : "border-neutral-600 hover:border-neutral-400"
    )}
  >
    {checked && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
  </div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "bg-onyx-700 text-neutral-300" }) => (
  <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold", color)}>
    {children}
  </span>
);

// Progress Bar
export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className }) => (
  <div className={cn("w-full h-1.5 bg-onyx-700 rounded-full overflow-hidden", className)}>
    <div 
      className="h-full bg-white transition-all duration-500 ease-out" 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

// Notification Toast
export const NotificationToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 6000); // Auto close after 6 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300 max-w-[90vw] md:max-w-md">
      <div className="bg-onyx-900/95 backdrop-blur border border-onyx-700 text-white px-4 py-4 rounded-xl shadow-2xl flex items-start gap-4 ring-1 ring-white/10">
        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <div className="flex-1">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Notification</h4>
          <span className="text-sm font-medium leading-tight block">{message}</span>
        </div>
        <button onClick={onClose} className="text-neutral-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
};