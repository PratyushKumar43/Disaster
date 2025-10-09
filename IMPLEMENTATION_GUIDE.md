## Implementation Guide: Applying Unified Design System

### Phase 1: Update Dashboard Components

Here are the key changes needed to align your dashboard with the unified design system:

#### 1. Update DashboardOverview Component

**Before:**
```tsx
<div className={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm h-fit`}>
```

**After:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid, Stack } from '@/components/layout/Layout';

// Replace card divs with unified Card components
<Card variant="elevated" size="md" interactive>
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <Stack spacing="sm">
      <Button 
        variant="primary" 
        size="md" 
        leftIcon={<Plus className="w-4 h-4" />}
        className="w-full"
      >
        Add Inventory Item
      </Button>
      <Button 
        variant="success" 
        size="md" 
        leftIcon={<AlertTriangle className="w-4 h-4" />}
        className="w-full"
      >
        Create Alert
      </Button>
    </Stack>
  </CardContent>
</Card>
```

#### 2. Update StatsCard Component

**Current StatsCard Update:**
```tsx
// In StatsCard.tsx
import { Card, CardContent } from '@/components/ui/card';

export function StatsCard({ title, value, trend, icon, color, isDark }: StatsCardProps) {
  return (
    <Card variant="elevated" size="md" interactive glow glowColor="blue">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 font-medium font-geist">{title}</p>
            <p className="text-2xl font-bold font-geist text-white mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-green-400 mt-1">{trend}</p>
            )}
          </div>
          {icon && (
            <div className={cn("text-2xl", color)}>
              <icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3. Update Layout Grid System

**Replace grid containers:**
```tsx
// Before
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

// After  
<Grid cols="auto" gap="md" responsive>
  {/* Stats cards */}
</Grid>
```

#### 4. Update InventoryView Component

**Major Updates Needed:**

```tsx
// Replace current card styling
// Before:
<div className="bg-white dark:bg-gray-800 rounded-lg p-6">

// After:
<Card variant="elevated" size="lg">
  <CardHeader>
    <CardTitle>Inventory Management</CardTitle>
    <CardDescription>Manage your disaster response inventory</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Update Button Usage:**
```tsx
// Before:
<button className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">

// After:
<Button variant="primary" size="md" leftIcon={<Plus />}>
  Add Item
</Button>
```

### Phase 2: Create Unified Navigation

#### Update Sidebar Component

```tsx
// In dashboard/layout.tsx
import { PageLayout } from '@/components/layout/Layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout
      sidebar={<DashboardSidebar />}
      maxWidth="xl"
    >
      {children}
    </PageLayout>
  );
}
```

### Phase 3: Update Theme System

#### Enhanced useTheme Hook

```tsx
// In hooks/useTheme.ts
import { createContext, useContext } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Phase 4: Animation Consistency

#### Standard Animation Props

```tsx
// Standard motion variants to use across components
export const standardAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  hover: {
    whileHover: { y: -2, scale: 1.02 },
    transition: { duration: 0.2 }
  }
};
```

### Phase 5: Color System Implementation

#### CSS Custom Properties Usage

```css
/* Apply in components */
.stats-card {
  background: var(--primary-800);
  border: 1px solid var(--primary-600);
  color: var(--primary-50);
}

.stats-card:hover {
  background: var(--primary-700);
  box-shadow: var(--glow-blue);
}
```

### Implementation Checklist

#### Week 1-2: Foundation
- [ ] Import design tokens CSS
- [ ] Update Button component
- [ ] Update Card component  
- [ ] Create Layout components
- [ ] Test basic components

#### Week 3-4: Dashboard Update
- [ ] Update DashboardOverview.tsx
- [ ] Update StatsCard.tsx
- [ ] Replace grid systems
- [ ] Update sidebar styling
- [ ] Test dashboard consistency

#### Week 5: Inventory Page
- [ ] Update InventoryView.tsx
- [ ] Replace all card instances
- [ ] Update form components
- [ ] Update modal styling
- [ ] Test inventory functionality

#### Week 6: AI Analysis & Weather
- [ ] Update AI Analysis page
- [ ] Update Weather components
- [ ] Ensure map component styling
- [ ] Test cross-page navigation

### Usage Examples

#### Quick Component Replacement Guide

```tsx
// Old pattern
<div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
  <h3 className="text-lg font-semibold text-white mb-4">Title</h3>
  <div className="text-gray-300">Content</div>
</div>

// New pattern  
<Card variant="elevated" size="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// Old button
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click me
</button>

// New button
<Button variant="primary" size="md">
  Click me
</Button>

// Old grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {items}
</div>

// New grid
<Grid cols={3} gap="md" responsive>
  {items}
</Grid>
```

This implementation guide provides a systematic approach to upgrading your entire application to use the unified design system while maintaining functionality.