import React from 'react';

interface GlassPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const GlassPane: React.FC<GlassPaneProps> = ({ children, className = '', interactive = false, ...props }) => {
  const baseStyles = "bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden transition-all duration-300";
  const interactiveStyles = interactive ? "hover:bg-white/70 dark:hover:bg-black/50 active:scale-[0.98] cursor-pointer" : "";

  return (
    <div className={`${baseStyles} ${interactiveStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  let variantStyles = "";
  
  switch (variant) {
    case 'primary':
      variantStyles = "bg-ios-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 border-transparent";
      break;
    case 'secondary':
      variantStyles = "bg-white/50 text-black dark:text-white dark:bg-white/10 hover:bg-white/70 border-white/20";
      break;
    case 'ghost':
      variantStyles = "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 border-transparent shadow-none";
      break;
  }

  return (
    <button 
      className={`px-4 py-2.5 rounded-xl font-medium backdrop-blur-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};