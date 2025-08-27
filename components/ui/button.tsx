import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from '@/lib/utils';

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button 
		ref={ref} {...props}
		className={cn(`px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 
                   hover:bg-gray-100 active:bg-gray-200 focus:outline-none 
                   focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                   transition-colors duration-150 font-medium `, className)}
	
		   {...props}
	>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;

