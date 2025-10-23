import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centerContent?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  centerContent = false,
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',     // 640px
    md: 'max-w-3xl',     // 768px  
    lg: 'max-w-5xl',     // 1024px
    xl: 'max-w-6xl',     // 1280px
    '2xl': 'max-w-7xl',  // 1536px
    full: 'max-w-full'
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        centerContent && 'flex flex-col items-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  maxWidth = 'xl',
  className
}) => {
  return (
    <div className={cn('min-h-screen bg-gray-900 text-white', className)}>
      {header && (
        <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
          {header}
        </header>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-gray-800">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 min-w-0">
          <Container size={maxWidth} className="py-8">
            {children}
          </Container>
        </main>
      </div>
      
      {footer && (
        <footer className="border-t border-gray-800 bg-gray-900">
          {footer}
        </footer>
      )}
    </div>
  );
};

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  cols = 'auto',
  gap = 'md',
  responsive = true,
  className,
  children,
  ...props
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
    auto: responsive 
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  className,
  children,
  ...props
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  
  const spacingClasses = {
    sm: direction === 'row' ? 'gap-2' : 'space-y-2',
    md: direction === 'row' ? 'gap-4' : 'space-y-4',
    lg: direction === 'row' ? 'gap-6' : 'space-y-6',
    xl: direction === 'row' ? 'gap-8' : 'space-y-8'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center', 
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <div
      className={cn(
        'flex',
        directionClass,
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};