# DisasterIQ Design System Unification PRD

## Overview
This PRD outlines the requirements to create a cohesive, unified design system across all pages of the DisasterIQ platform, ensuring consistency between the landing page, dashboard, inventory, and all other sections.

## Current State Analysis

### ✅ Strengths
- **Consistent Dark/Light Theme**: Already implemented with context provider
- **Modern Typography**: Using Inter, Geist, and Bricolage Grotesque fonts
- **Motion/Animation Framework**: Framer Motion implemented across components
- **Component Structure**: Good separation of concerns with reusable components
- **Color Palette**: Established dark theme with accent colors

### ❌ Inconsistencies Identified
- **Layout Patterns**: Different spacing, padding, and grid systems across pages
- **Component Styling**: Inconsistent button styles, card designs, and form elements
- **Animation Patterns**: Different motion behaviors across pages
- **Navigation Consistency**: Sidebar design differs from landing page navigation
- **Content Hierarchy**: Inconsistent heading sizes and text treatments
- **Interactive Elements**: Different hover/focus states across components

## Design System Requirements

### 1. Foundation Layer

#### 1.1 Color System
```css
/* Primary Palette */
--primary-900: #0B0F12;  /* Deep dark background */
--primary-800: #1A1D21;  /* Card backgrounds */
--primary-700: #2A2D31;  /* Elevated surfaces */
--primary-600: #3A3D41;  /* Borders, dividers */
--primary-500: #4A4D51;  /* Subtle text, icons */
--primary-400: #6A6D71;  /* Secondary text */
--primary-300: #8A8D91;  /* Muted text */
--primary-200: #AAADBB;  /* Light text */
--primary-100: #CACDD1;  /* Very light text */
--primary-50: #F5F5F7;   /* White backgrounds */

/* Accent Colors */
--accent-blue: #3B82F6;    /* Primary actions */
--accent-green: #10B981;   /* Success states */
--accent-yellow: #F59E0B;  /* Warning states */
--accent-red: #EF4444;     /* Error states */
--accent-purple: #8B5CF6;  /* Special features */
--accent-cyan: #06B6D4;    /* Info states */

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

#### 1.2 Typography Scale
```css
/* Font Families */
--font-primary: 'Inter', sans-serif;      /* Body text, UI elements */
--font-heading: 'Geist', sans-serif;      /* Headings, emphasis */
--font-display: 'Bricolage Grotesque', sans-serif; /* Hero, display text */
--font-mono: 'SF Mono', 'Monaco', monospace; /* Code, data */

/* Type Scale */
--text-xs: 0.75rem;    /* 12px - Small captions */
--text-sm: 0.875rem;   /* 14px - Body small */
--text-base: 1rem;     /* 16px - Body default */
--text-lg: 1.125rem;   /* 18px - Body large */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-3xl: 1.875rem;  /* 30px - Page headings */
--text-4xl: 2.25rem;   /* 36px - Hero headings */
--text-5xl: 3rem;      /* 48px - Display headings */
--text-6xl: 4rem;      /* 64px - Hero display */
```

#### 1.3 Spacing System
```css
/* Spacing Scale (based on 4px grid) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

#### 1.4 Border Radius System
```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Cards, buttons */
--radius-lg: 0.75rem;   /* 12px - Large cards */
--radius-xl: 1rem;      /* 16px - Modals, sections */
--radius-2xl: 1.5rem;   /* 24px - Hero sections */
--radius-full: 9999px;  /* Pills, avatars */
```

### 2. Component Library Standards

#### 2.1 Button System
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg' | 'xl';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'loading';
}

/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, var(--accent-blue), #2563EB);
  color: white;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
```

#### 2.2 Card System
```tsx
interface CardProps {
  variant: 'default' | 'elevated' | 'outline' | 'glass';
  size: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

/* Card Styles */
.card-default {
  background: var(--primary-800);
  border: 1px solid var(--primary-600);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card-elevated {
  background: var(--primary-800);
  border: 1px solid var(--primary-600);
  border-radius: var(--radius-lg);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
}
```

#### 2.3 Navigation System
```tsx
interface NavigationProps {
  variant: 'sidebar' | 'topbar' | 'mobile';
  theme: 'dark' | 'light';
  collapsed?: boolean;
}

/* Navigation Styles */
.nav-sidebar {
  background: var(--primary-900);
  border-right: 1px solid var(--primary-600);
  backdrop-filter: blur(20px);
}

.nav-item {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  font-family: var(--font-primary);
  font-weight: 500;
}

.nav-item:hover {
  background: var(--primary-700);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--accent-blue), #2563EB);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
```

### 3. Layout System

#### 3.1 Grid System
```css
/* Container System */
.container-sm { max-width: 640px; }   /* Mobile landscape */
.container-md { max-width: 768px; }   /* Tablet */
.container-lg { max-width: 1024px; }  /* Desktop */
.container-xl { max-width: 1280px; }  /* Large desktop */
.container-2xl { max-width: 1536px; } /* Extra large */

/* Grid System */
.grid-auto { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.grid-responsive { 
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}
```

#### 3.2 Page Layout Structure
```tsx
/* Standard Page Layout */
interface PageLayoutProps {
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const PageLayout = ({ children, sidebar, header, maxWidth = 'xl' }) => (
  <div className="min-h-screen bg-primary-900">
    {header && <Header />}
    <div className="flex">
      {sidebar && <Sidebar />}
      <main className={`flex-1 container-${maxWidth} mx-auto px-6 py-8`}>
        {children}
      </main>
    </div>
  </div>
);
```

### 4. Animation & Interaction Standards

#### 4.1 Motion Patterns
```tsx
/* Standard Animations */
const animations = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  
  // Card hover
  cardHover: {
    whileHover: { 
      scale: 1.02, 
      y: -4,
      transition: { duration: 0.2 }
    }
  },
  
  // Button interactions
  buttonTap: {
    whileTap: { scale: 0.95 },
    whileHover: { y: -1 }
  },
  
  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }
};
```

#### 4.2 Loading States
```tsx
/* Loading Patterns */
const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="w-6 h-6 border-2 border-primary-300 border-t-accent-blue rounded-full"
  />
);

const LoadingSkeleton = () => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className="bg-primary-700 rounded-md"
  />
);
```

### 5. Implementation Plan

#### Phase 1: Foundation (Week 1-2)
- [ ] Set up design tokens as CSS custom properties
- [ ] Create unified theme provider
- [ ] Implement typography system
- [ ] Create spacing utilities

#### Phase 2: Core Components (Week 3-4)
- [ ] Standardize Button component
- [ ] Unify Card components
- [ ] Create consistent Form elements
- [ ] Implement Navigation components

#### Phase 3: Layout System (Week 5)
- [ ] Create standard page layouts
- [ ] Implement responsive grid system
- [ ] Unify sidebar across all pages
- [ ] Create consistent headers/footers

#### Phase 4: Page Unification (Week 6-7)
- [ ] Apply design system to Dashboard
- [ ] Unify Inventory page design
- [ ] Update AI Analysis page
- [ ] Harmonize Weather section

#### Phase 5: Polish & Optimization (Week 8)
- [ ] Implement consistent animations
- [ ] Add loading states
- [ ] Performance optimization
- [ ] Cross-browser testing

### 6. Component Migration Strategy

#### 6.1 Dashboard Page Updates
```tsx
// Before (Current)
<div className="p-4 md:p-6 rounded-xl bg-gray-800 shadow-sm">

// After (Unified)
<Card variant="default" size="lg" className="stats-card">
```

#### 6.2 Inventory Page Updates
```tsx
// Before (Current)
<div className="bg-white dark:bg-gray-800 rounded-lg p-6">

// After (Unified)
<Card variant="elevated" size="md" className="inventory-card">
```

#### 6.3 Navigation Updates
```tsx
// Before (Current)
<div className="px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10">

// After (Unified)
<NavItem variant="sidebar" active={isActive} href="/dashboard">
```

### 7. Quality Assurance

#### 7.1 Visual Consistency Checklist
- [ ] All pages use the same color palette
- [ ] Typography hierarchy is consistent
- [ ] Spacing follows the same system
- [ ] Animations have consistent timing
- [ ] Interactive states are uniform

#### 7.2 Responsive Design Standards
- [ ] Mobile-first approach
- [ ] Consistent breakpoints
- [ ] Touch-friendly interactions
- [ ] Accessible navigation

#### 7.3 Performance Standards
- [ ] Animation performance (60fps)
- [ ] Component bundle size
- [ ] Loading state implementations
- [ ] Image optimization

### 8. Documentation Requirements

#### 8.1 Component Documentation
- Component props and usage examples
- Design tokens reference
- Animation guidelines
- Accessibility standards

#### 8.2 Design Guidelines
- Color usage principles
- Typography guidelines
- Spacing recommendations
- Motion design principles

### 9. Success Metrics

#### 9.1 Technical Metrics
- Consistent component reuse across pages
- Reduced CSS bundle size
- Improved animation performance
- Better mobile experience scores

#### 9.2 User Experience Metrics
- Navigation consistency rating
- Visual harmony assessment
- User task completion rates
- Accessibility compliance score

### 10. Implementation Files Structure

```
/components
  /ui
    - Button.tsx
    - Card.tsx
    - Input.tsx
    - Navigation.tsx
  /layout
    - PageLayout.tsx
    - Container.tsx
    - Grid.tsx
  /shared
    - LoadingStates.tsx
    - EmptyStates.tsx
    - ErrorStates.tsx

/styles
  - tokens.css (design tokens)
  - components.css (component styles)
  - utilities.css (utility classes)
  - animations.css (motion patterns)

/hooks
  - useTheme.ts
  - useAnimation.ts
  - useBreakpoint.ts
```

This PRD provides a comprehensive roadmap to unify your DisasterIQ design system, ensuring consistency, scalability, and an improved user experience across all pages.