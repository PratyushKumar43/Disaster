import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  animate?: boolean;
}

const buttonVariants = {
  primary: [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'text-white border-transparent',
    'hover:from-blue-600 hover:to-blue-700',
    'focus:ring-blue-500/50',
    'disabled:from-gray-500 disabled:to-gray-600',
    'shadow-lg hover:shadow-xl hover:shadow-blue-500/25'
  ],
  secondary: [
    'bg-gray-700 text-gray-100',
    'border-gray-600',
    'hover:bg-gray-600 hover:border-gray-500',
    'focus:ring-gray-500/50',
    'disabled:bg-gray-800 disabled:text-gray-500'
  ],
  ghost: [
    'bg-transparent text-gray-200',
    'border-transparent',
    'hover:bg-gray-800 hover:text-gray-50',
    'focus:ring-gray-500/50',
    'disabled:text-gray-600'
  ],
  outline: [
    'bg-transparent text-gray-200',
    'border-gray-600',
    'hover:bg-gray-800 hover:border-gray-500',
    'focus:ring-gray-500/50',
    'disabled:border-gray-700 disabled:text-gray-600'
  ],
  danger: [
    'bg-gradient-to-r from-red-500 to-red-600',
    'text-white border-transparent',
    'hover:from-red-600 hover:to-red-700',
    'focus:ring-red-500/50',
    'disabled:from-gray-500 disabled:to-gray-600',
    'shadow-lg hover:shadow-xl hover:shadow-red-500/25'
  ],
  success: [
    'bg-gradient-to-r from-green-500 to-green-600',
    'text-white border-transparent',
    'hover:from-green-600 hover:to-green-700',
    'focus:ring-green-500/50',
    'disabled:from-gray-500 disabled:to-gray-600',
    'shadow-lg hover:shadow-xl hover:shadow-green-500/25'
  ]
};

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-base h-10',
  lg: 'px-6 py-3 text-lg h-12',
  xl: 'px-8 py-4 text-xl h-14'
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
};

const motionVariants = {
  tap: { scale: 0.95 },
  hover: { 
    y: -1
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    animate = true,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = [
      // Base styles
      'inline-flex items-center justify-center gap-2',
      'font-medium font-geist',
      'rounded-lg border',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'relative overflow-hidden',
      
      // Remove default button styles
      'appearance-none select-none',
      
      // Prevent text selection
      'user-select-none'
    ];

    const variantClasses = buttonVariants[variant];
    const sizeClasses = sizeVariants[size];
    const iconSize = iconSizes[size];

    const buttonContent = (
      <>
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={cn('animate-spin', iconSize)} />
          </div>
        )}
        
        {/* Button content */}
        <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
          {leftIcon && (
            <span className={cn('shrink-0', iconSize)}>
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className={cn('shrink-0', iconSize)}>
              {rightIcon}
            </span>
          )}
        </span>
      </>
    );

    const combinedClassName = cn(
      baseClasses,
      variantClasses,
      sizeClasses,
      className
    );

    const isDisabled = disabled || isLoading;

    if (animate && !isDisabled) {
      return (
        <motion.button
          ref={ref}
          className={combinedClassName}
          disabled={isDisabled}
          whileTap={motionVariants.tap}
          whileHover={motionVariants.hover}
          transition={{ duration: 0.2 }}
          type={props.type}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          aria-label={props['aria-label']}
          id={props.id}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
