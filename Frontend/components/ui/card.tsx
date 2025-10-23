import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  animate?: boolean;
  glow?: boolean;
  glowColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const cardVariants = {
  default: [
    'bg-gray-800/90 dark:bg-gray-800/90',
    'border-gray-700 dark:border-gray-700',
    'backdrop-blur-sm',
    'text-white'
  ],
  elevated: [
    'bg-gray-800/95 dark:bg-gray-800/95',
    'border-gray-700 dark:border-gray-700',
    'backdrop-blur-md',
    'shadow-lg shadow-black/20',
    'text-white'
  ],
  outline: [
    'bg-transparent',
    'border-gray-600 dark:border-gray-600',
    'backdrop-blur-sm',
    'text-white'
  ],
  glass: [
    'bg-white/5 dark:bg-white/5',
    'border-white/10 dark:border-white/10',
    'backdrop-blur-xl',
    'shadow-lg shadow-black/10',
    'text-white'
  ],
  gradient: [
    'bg-gradient-to-br from-gray-800/90 via-gray-800/70 to-gray-900/90',
    'border-gray-700/50 dark:border-gray-700/50',
    'backdrop-blur-md',
    'text-white'
  ]
};

const sizeVariants = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-xl',
  xl: 'p-8 rounded-2xl'
};

const glowVariants = {
  blue: 'shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]',
  green: 'shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
  yellow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]',
  red: 'shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]',
  purple: 'shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]'
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    size = 'md',
    interactive = false,
    animate = true,
    glow = false,
    glowColor = 'blue',
    className,
    children,
    ...props
  }, ref) => {
    const baseClasses = [
      'border',
      'transition-all duration-300 ease-out',
      'relative overflow-hidden'
    ];

    const variantClasses = cardVariants[variant];
    const sizeClasses = sizeVariants[size];
    const glowClasses = glow ? glowVariants[glowColor] : '';
    const interactiveClasses = interactive ? [
      'cursor-pointer',
      'hover:border-gray-600 dark:hover:border-gray-600',
      glow ? '' : 'hover:shadow-lg hover:shadow-black/25'
    ] : [];

    const combinedClassName = cn(
      baseClasses,
      variantClasses,
      sizeClasses,
      glowClasses,
      interactiveClasses,
      className
    );

    // Extract motion-conflicting props
    const { 
      onAnimationStart,
      onAnimationEnd,
      onDrag,
      onDragStart, 
      onDragEnd,
      onDragEnter,
      onDragExit,
      onDragLeave,
      onDragOver,
      onDrop,
      ...restProps 
    } = props;

    if (animate && interactive) {
      return (
        <motion.div
          ref={ref}
          className={combinedClassName}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={restProps.onClick}
          onMouseEnter={restProps.onMouseEnter}
          onMouseLeave={restProps.onMouseLeave}
          onFocus={restProps.onFocus}
          onBlur={restProps.onBlur}
          id={restProps.id}
          role={restProps.role}
          aria-label={restProps['aria-label']}
          aria-labelledby={restProps['aria-labelledby']}
          aria-describedby={restProps['aria-describedby']}
          tabIndex={restProps.tabIndex}
          style={restProps.style}
          data-testid={restProps['data-testid']}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold font-geist leading-none tracking-tight text-white", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-gray-200", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between pt-4 mt-4 border-t border-gray-700/50", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
