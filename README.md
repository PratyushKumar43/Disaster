# Disaster Management App - Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Project Vision
A comprehensive disaster management application for India that enables real-time coordination, resource management, and emergency response. The app will serve government agencies, NGOs, and emergency responders with tools for inventory tracking, incident management, and resource allocation.

### 1.2 Tech Stack
- **Frontend**: Next.js 14+ with App Router
- **Backend**: FastAPI (Python)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: WebSockets (FastAPI WebSockets)

### 1.3 Target Users
- Emergency Response Teams
- Government Disaster Management Agencies
- NGOs and Relief Organizations
- Local Administrative Bodies
- Volunteers and Field Workers

---

## 2. Database Schema Structure

### 2.1 Core Tables

```sql
-- Users and Authentication
users (
  id: UUID PRIMARY KEY,
  email: VARCHAR(255) UNIQUE,
  phone: VARCHAR(15),
  full_name: VARCHAR(100),
  role: ENUM('admin', 'coordinator', 'field_worker', 'volunteer'),
  organization_id: UUID,
  is_active: BOOLEAN DEFAULT true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

-- Organizations
organizations (
  id: UUID PRIMARY KEY,
  name: VARCHAR(200),
  type: ENUM('government', 'ngo', 'private', 'volunteer'),
  contact_email: VARCHAR(255),
  contact_phone: VARCHAR(15),
  address: TEXT,
  state: VARCHAR(50),
  district: VARCHAR(50),
  created_at: TIMESTAMP
)

-- Inventory Categories
inventory_categories (
  id: UUID PRIMARY KEY,
  name: VARCHAR(100),
  description: TEXT,
  icon: VARCHAR(50),
  color: VARCHAR(7),
  parent_category_id: UUID,
  is_active: BOOLEAN DEFAULT true
)

-- Inventory Items
inventory_items (
  id: UUID PRIMARY KEY,
  name: VARCHAR(200),
  description: TEXT,
  category_id: UUID,
  unit_type: ENUM('pieces', 'kg', 'liters', 'boxes', 'packets'),
  minimum_stock_level: INTEGER,
  maximum_stock_level: INTEGER,
  unit_cost: DECIMAL(10,2),
  supplier_info: JSONB,
  specifications: JSONB,
  image_url: VARCHAR(500),
  is_active: BOOLEAN DEFAULT true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

-- Warehouses/Storage Locations
warehouses (
  id: UUID PRIMARY KEY,
  name: VARCHAR(200),
  code: VARCHAR(20) UNIQUE,
  type: ENUM('central', 'regional', 'local', 'mobile'),
  address: TEXT,
  latitude: DECIMAL(10,8),
  longitude: DECIMAL(11,8),
  capacity: JSONB,
  contact_person: VARCHAR(100),
  contact_phone: VARCHAR(15),
  organization_id: UUID,
  is_active: BOOLEAN DEFAULT true,
  created_at: TIMESTAMP
)

-- Inventory Stock
inventory_stock (
  id: UUID PRIMARY KEY,
  item_id: UUID,
  warehouse_id: UUID,
  current_quantity: INTEGER,
  reserved_quantity: INTEGER DEFAULT 0,
  available_quantity: INTEGER GENERATED ALWAYS AS (current_quantity - reserved_quantity),
  batch_number: VARCHAR(50),
  expiry_date: DATE,
  last_updated: TIMESTAMP,
  updated_by: UUID
)

-- Stock Movements/Transactions
stock_movements (
  id: UUID PRIMARY KEY,
  item_id: UUID,
  warehouse_id: UUID,
  movement_type: ENUM('inbound', 'outbound', 'transfer', 'adjustment'),
  quantity: INTEGER,
  reference_type: ENUM('purchase', 'donation', 'distribution', 'transfer', 'damage', 'expiry'),
  reference_id: UUID,
  batch_number: VARCHAR(50),
  unit_cost: DECIMAL(10,2),
  total_cost: DECIMAL(12,2),
  notes: TEXT,
  created_by: UUID,
  created_at: TIMESTAMP
)

-- Disasters/Incidents
disasters (
  id: UUID PRIMARY KEY,
  name: VARCHAR(200),
  type: ENUM('earthquake', 'flood', 'cyclone', 'fire', 'drought', 'landslide', 'other'),
  severity: ENUM('low', 'medium', 'high', 'critical'),
  status: ENUM('active', 'monitoring', 'resolved', 'archived'),
  affected_areas: JSONB,
  estimated_affected_population: INTEGER,
  description: TEXT,
  latitude: DECIMAL(10,8),
  longitude: DECIMAL(11,8),
  started_at: TIMESTAMP,
  resolved_at: TIMESTAMP,
  created_by: UUID,
  created_at: TIMESTAMP
)

-- Relief Operations
relief_operations (
  id: UUID PRIMARY KEY,
  disaster_id: UUID,
  name: VARCHAR(200),
  description: TEXT,
  status: ENUM('planned', 'active', 'completed', 'cancelled'),
  priority: ENUM('low', 'medium', 'high', 'critical'),
  target_beneficiaries: INTEGER,
  actual_beneficiaries: INTEGER,
  budget_allocated: DECIMAL(12,2),
  budget_spent: DECIMAL(12,2),
  start_date: DATE,
  end_date: DATE,
  coordinator_id: UUID,
  created_at: TIMESTAMP
)

-- Resource Requests
resource_requests (
  id: UUID PRIMARY KEY,
  disaster_id: UUID,
  operation_id: UUID,
  requested_by: UUID,
  request_type: ENUM('urgent', 'regular', 'planned'),
  status: ENUM('pending', 'approved', 'partially_fulfilled', 'fulfilled', 'cancelled'),
  required_by: TIMESTAMP,
  items_requested: JSONB,
  justification: TEXT,
  approved_by: UUID,
  approved_at: TIMESTAMP,
  created_at: TIMESTAMP
)

-- Distributions
distributions (
  id: UUID PRIMARY KEY,
  operation_id: UUID,
  warehouse_id: UUID,
  distribution_point: VARCHAR(200),
  distribution_date: DATE,
  beneficiary_count: INTEGER,
  items_distributed: JSONB,
  distribution_team: JSONB,
  status: ENUM('planned', 'ongoing', 'completed'),
  notes: TEXT,
  created_by: UUID,
  created_at: TIMESTAMP
)

-- Alerts/Notifications
alerts (
  id: UUID PRIMARY KEY,
  type: ENUM('stock_low', 'stock_out', 'expiry_warning', 'disaster_alert', 'system'),
  title: VARCHAR(200),
  message: TEXT,
  severity: ENUM('info', 'warning', 'error', 'critical'),
  target_users: JSONB,
  target_roles: JSONB,
  is_read: BOOLEAN DEFAULT false,
  expires_at: TIMESTAMP,
  created_at: TIMESTAMP
)
```

---

## 3. Landing Page Design Specifications

### 3.1 Hero Section
```
Layout: Full viewport height with gradient background
Background: Linear gradient from #FFFFFF to #34E33A
Content Structure:
├── Navigation Bar (Fixed)
│   ├── Logo + App Name (Left)
│   ├── Navigation Links (Center)
│   └── Login/Register Buttons (Right)
├── Hero Content (Center)
│   ├── Main Headline (Animated typewriter effect)
│   ├── Subheadline (Fade in from bottom)
│   ├── CTA Buttons (Scale animation on hover)
│   └── Hero Illustration (Floating animation)
└── Scroll Indicator (Bouncing arrow)

Animations:
- Logo: Slide in from left (0.5s delay)
- Navigation: Fade in sequentially (0.1s stagger)
- Headline: Typewriter effect (2s duration)
- Subtext: Slide up with opacity (1s delay)
- CTA Buttons: Scale on hover, glow effect
- Background: Subtle particle animation
- Hero Image: Gentle floating (3s infinite loop)
```

### 3.2 Features Section
```
Layout: 3-column grid (responsive to 1-column on mobile)
Background: #34E33A with geometric patterns
Content Structure:
├── Section Header (Center-aligned)
├── Feature Cards (3x Grid)
│   ├── Real-time Inventory Tracking
│   ├── Disaster Response Coordination  
│   └── Resource Distribution Management
└── Interactive Demo Button

Card Design:
- Glass morphism effect
- Hover: Lift animation (translateY: -10px)
- Icon: Lottie animations
- Text: Staggered fade-in on scroll

Animations:
- Cards: Staggered slide-in from bottom
- Icons: Bounce effect on hover
- Background: Animated geometric shapes
```

### 3.3 Statistics Section
```
Layout: 4-column counter display
Background: Gradient from #34E33A to #FFFFFF
Content:
├── Disasters Managed
├── Resources Distributed
├── Lives Impacted
└── Partner Organizations

Animations:
- Numbers: CountUp animation on scroll intersection
- Icons: Pulse effect
- Background: Animated wave pattern
```

### 3.4 Technology Stack Section
```
Layout: Centered with technology logos in circular orbit
Background: #000000 with dot pattern
Content:
├── "Built with Modern Technology" header
├── Tech Stack Logos (Orbital animation)
└── Performance metrics

Animations:
- Logos: Orbital rotation (20s infinite)
- Center icon: Gentle pulse
- Metrics: Slide in from sides
```

### 3.5 CTA Section
```
Layout: Full-width banner
Background: Linear gradient #34E33A to #FFFFFF
Content:
├── "Ready to Transform Disaster Management?"
├── Email signup form
└── Get Started button

Animations:
- Background: Animated gradient shift
- Form: Focus states with glow effects
- Button: Ripple effect on click
```

---

## 4. Inventory Management Page Design

### 4.1 Page Layout Structure
```
├── Header Section (Fixed)
│   ├── Page Title & Breadcrumbs
│   ├── Search & Filters
│   └── Action Buttons (Add Item, Import, Export)
├── Dashboard Cards (Top Row)
│   ├── Total Items
│   ├── Low Stock Alerts
│   ├── Value Overview
│   └── Recent Activity
├── Main Content Area
│   ├── Sidebar (Collapsible)
│   │   ├── Category Filter Tree
│   │   ├── Warehouse Filter
│   │   ├── Status Filters
│   │   └── Advanced Filters
│   └── Content Panel
│       ├── View Toggle (Grid/List/Table)
│       ├── Sort & Pagination Controls
│       └── Items Display Area
└── Floating Action Button (Add Quick Item)
```

### 4.2 Inventory Items Display

#### 4.2.1 Card View (Default)
```
Card Design:
├── Item Image (Top) - Lazy loaded with skeleton
├── Category Badge (Top-right overlay)
├── Item Name & Description
├── Stock Information
│   ├── Current Stock (Large number)
│   ├── Available/Reserved breakdown
│   ├── Stock Status Indicator
│   └── Multiple Warehouse locations
├── Action Buttons (Bottom)
│   ├── View Details (Eye icon)
│   ├── Edit (Pencil icon)
│   ├── Quick Actions (Dots menu)
│   └── Move Stock (Arrow icon)
└── Status Indicators (Left border color)

Animations:
- Card Hover: Lift effect (translateY: -5px, shadow increase)
- Image: Zoom effect on hover
- Buttons: Scale animation on hover
- Status indicators: Pulse for critical items
- Loading: Shimmer effect for skeleton
```

#### 4.2.2 Table View
```
Columns:
├── Checkbox (Bulk selection)
├── Item Image & Name
├── Category
├── Current Stock
├── Available Stock
├── Reserved Stock
├── Stock Status
├── Last Updated
├── Warehouses
└── Actions

Features:
- Sortable columns
- Resizable columns
- Fixed header on scroll
- Row hover effects
- Bulk action toolbar
- Infinite scroll or pagination
```

### 4.3 Stock Status Indicators
```
Status Types:
├── In Stock (#34E33A) - stock > minimum
├── Low Stock (#FFFFFF) - stock <= minimum but > 0
├── Out of Stock (#000000) - stock = 0
├── Overstocked (#34E33A) - stock > maximum
└── Expiring Soon (#FFFFFF) - items expiring < 30 days

Visual Design:
- Progress bars for stock levels
- Color-coded badges
- Icon indicators
- Animated status changes
```

### 4.4 Advanced Features

#### 4.4.1 Search & Filter Panel
```
Search Bar:
├── Global search with autocomplete
├── Filter by multiple criteria
├── Saved search functionality
└── Recent searches dropdown

Filters:
├── Category (Tree structure with checkboxes)
├── Warehouse (Multi-select dropdown)
├── Stock Status (Checkbox group)
├── Date Range (Last updated, expiry)
├── Value Range (Min/Max sliders)
└── Custom Fields (Dynamic based on item type)

Animations:
- Filter panel: Slide in/out from left
- Checkboxes: Custom animations
- Sliders: Smooth value transitions
- Results: Fade transition during filtering
```

#### 4.4.2 Bulk Operations
```
Selection Features:
├── Select All/None toggles
├── Select by filter criteria
├── Selection counter
└── Clear selection

Bulk Actions:
├── Move to Warehouse
├── Update Stock Levels
├── Change Category
├── Export Selected
├── Delete Selected
└── Generate Reports

UI Elements:
- Floating action bar (appears on selection)
- Progress indicators for bulk operations
- Confirmation modals with item previews
- Undo functionality for reversible actions
```

### 4.5 Interactive Elements

#### 4.5.1 Quick Actions Menu
```
Menu Items:
├── View Item Details
├── Edit Basic Info
├── Adjust Stock
├── Move Stock
├── View Stock History
├── Generate Barcode/QR
├── Mark as Damaged
└── Archive Item

Animation:
- Menu: Radial expansion from trigger button
- Items: Staggered slide-in animation
- Hover: Scale and glow effects
- Close: Reverse animation with fade
```

#### 4.5.2 Stock Adjustment Modal
```
Modal Sections:
├── Current Stock Display
├── Adjustment Type (Add/Remove/Set)
├── Quantity Input (Number with +/- buttons)
├── Reason Selection (Dropdown)
├── Batch/Serial Number Input
├── Notes (Textarea)
├── Warehouse Selection (If multiple)
└── Action Buttons (Cancel/Confirm)

Validation:
- Real-time input validation
- Visual feedback for errors
- Confirmation for large adjustments
- History preview
```

### 4.6 Dashboard Cards Specifications

#### 4.6.1 Total Items Card
```
Layout:
├── Large Number (Animated counter)
├── Trend Indicator (↑/↓ with percentage)
├── Mini Chart (Sparkline)
└── "View All" link

Animation:
- Number: CountUp animation on load
- Chart: Draw animation (1s duration)
- Hover: Subtle glow effect
```

#### 4.6.2 Low Stock Alerts Card
```
Layout:
├── Alert Count (Red badge with pulse)
├── Critical Items List (Scrollable)
├── "View All Alerts" button
└── Quick Action: "Reorder Items"

Critical Items Display:
- Item name with stock level
- Mini progress bar
- Quick action icons
- Auto-refresh every 30s
```

#### 4.6.3 Value Overview Card
```
Layout:
├── Total Inventory Value
├── Value by Category (Donut chart)
├── Trend Over Time (Line chart)
└── Currency format with locale

Charts:
- Interactive hover tooltips
- Animated data transitions
- Responsive design
- Color-coded categories
```

#### 4.6.4 Recent Activity Card
```
Layout:
├── Activity Timeline (Vertical)
├── Activity Types (Icons + descriptions)
├── Time Stamps (Relative time)
└── "View Full History" link

Activity Types:
- Stock additions (#34E33A)
- Stock removals (#FFFFFF)
- Transfers (#34E33A)
- Adjustments (#000000)
- New items (#34E33A)

Animation:
- Timeline: Slide-in from top
- Icons: Bounce effect on new activity
- Auto-scroll for new items
```

---

## 5. Animation Specifications

### 5.1 Page Transitions
```javascript
// Page enter/exit animations
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
}
```

### 5.2 Component Animations

#### 5.2.1 Card Animations
```javascript
// Inventory card hover effects
const cardVariants = {
  rest: { 
    scale: 1, 
    y: 0, 
    boxShadow: "0 4px 6px rgba(52, 227, 58, 0.1)" 
  },
  hover: { 
    scale: 1.02, 
    y: -5, 
    boxShadow: "0 20px 25px rgba(52, 227, 58, 0.2)",
    transition: { duration: 0.2 }
  }
}

// Staggered children animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}
```

#### 5.2.2 Modal Animations
```javascript
const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: -50 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -50,
    transition: { duration: 0.2 }
  }
}
```

#### 5.2.3 Loading Animations
```javascript
// Skeleton loading animation
const skeletonVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Spinner animation
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}
```

### 5.3 Micro-interactions

#### 5.3.1 Button Interactions
```javascript
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  disabled: { scale: 1, opacity: 0.6 }
}

// Ripple effect for material buttons
const rippleVariants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 2, 
    opacity: 0,
    transition: { duration: 0.6 }
  }
}
```

#### 5.3.2 Form Interactions
```javascript
const inputVariants = {
  focus: {
    borderColor: "#34E33A",
    boxShadow: "0 0 0 3px rgba(52, 227, 58, 0.1)",
    transition: { duration: 0.2 }
  },
  error: {
    borderColor: "#000000",
    boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.1)",
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.4 }
  }
}
```

---

## 6. Responsive Design Specifications

### 6.1 Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 6.2 Layout Adaptations

#### 6.2.1 Landing Page
```
Desktop (xl+):
- Hero: Full viewport with side-by-side content
- Features: 3-column grid
- Statistics: 4-column grid
- Navigation: Horizontal menu

Tablet (md-lg):
- Hero: Stacked content, reduced spacing
- Features: 2-column grid
- Statistics: 2x2 grid
- Navigation: Horizontal with collapsible menu

Mobile (sm-):
- Hero: Single column, larger text
- Features: Single column cards
- Statistics: 2x2 or single column
- Navigation: Hamburger menu with slide-out
```

#### 6.2.2 Inventory Management
```
Desktop:
- Sidebar: Always visible (280px width)
- Main content: Table/grid view
- Dashboard: 4-card row
- Filters: Expanded panel

Tablet:
- Sidebar: Collapsible overlay
- Main content: Responsive grid (2-3 columns)
- Dashboard: 2x2 grid
- Filters: Collapsible sections

Mobile:
- Sidebar: Bottom sheet or full-screen modal
- Main content: Single column list
- Dashboard: Vertical stack
- Filters: Accordion interface
- Floating action button for quick actions
```

---

## 7. Performance Requirements

### 7.1 Loading Performance
- Initial page load: < 3 seconds
- Subsequent navigation: < 1 second
- Image loading: Lazy loading with progressive enhancement
- API responses: < 500ms for standard requests
- Large dataset handling: Virtual scrolling for >100 items

### 7.2 Animation Performance
- Maintain 60fps during animations
- Use GPU-accelerated properties (transform, opacity)
- Reduce animations on low-performance devices
- Implement prefers-reduced-motion support

### 7.3 Offline Capabilities
- Service worker for offline functionality
- Cache critical resources
- Offline inventory browsing
- Sync data when connection restored
- Progressive Web App (PWA) features

---

## 8. Accessibility Requirements

### 8.1 WCAG 2.1 Compliance
- Level AA compliance minimum
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### 8.2 Accessibility Features
```
- Alt text for all images
- ARIA labels for interactive elements
- Semantic HTML structure
- Skip navigation links
- High contrast mode support
- Text scaling support (up to 200%)
- Reduced motion preferences
- Screen reader announcements for dynamic content
```

---

## 9. Integration Requirements

### 9.1 API Specifications
```
Authentication:
- JWT-based authentication
- Role-based access control (RBAC)
- Session management
- Password policies

Data APIs:
- RESTful API design
- GraphQL for complex queries
- Real-time updates via WebSockets
- Bulk operations support
- Export functionality (CSV, PDF, Excel)

External Integrations:
- Government disaster management systems
- SMS/Email notification services
- Mapping services (Google Maps/OpenStreetMap)
- Barcode/QR code generation
- Cloud storage for file uploads
```

### 9.2 Real-time Features
```
WebSocket Events:
- Stock level changes
- New disaster alerts
- User activity updates
- System notifications
- Chat/messaging for coordination

Push Notifications:
- Browser push notifications
- Mobile app notifications
- Email notifications
- SMS alerts for critical events
```

---

## 10. Security Specifications

### 10.1 Data Protection
- Encryption at rest and in transit
- Personal data anonymization
- GDPR compliance considerations
- Regular security audits
- Secure file upload handling

### 10.2 Access Control
- Multi-factor authentication (MFA)
- Role-based permissions
- API rate limiting
- SQL injection prevention
- XSS protection
- CSRF protection