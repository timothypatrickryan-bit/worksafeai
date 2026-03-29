# Mission Control iOS - Screen Documentation

## Overview

This document describes the three main screens for Mission Control iOS app, built with React Native and featuring a glassmorphic dark theme design system.

## Design System

### Theme Files

Located in `/src/theme/`:
- **colors.ts** - Glassmorphic color palette with dark theme (navy background, frosted glass surfaces)
- **typography.ts** - Comprehensive typography system (h1-h5, body styles, labels, captions)
- **spacing.ts** - 8px-based spacing scale and border radius tokens
- **index.ts** - Theme exports

### Custom Hook

- **useTheme.ts** - Hook providing access to theme colors, typography, and spacing

## Screens

### 1. Dashboard Screen (`DashboardScreen.tsx`)

**Purpose:** Main overview of agent status, task queue, and system performance metrics.

**Location:** `src/screens/DashboardScreen.tsx`

#### Features

- **Agent Status Overview**
  - Visual display of idle, working, and completed agent counts
  - Color-coded status badges per agent state
  - 3-column grid layout

- **Quick Stats Widget**
  - Daily completion rate percentage
  - Value generated metric
  - Real-time display with pull-to-refresh

- **Live Execution Status**
  - System operational status indicator
  - Active task count
  - Queue optimization status
  - Animated pulse indicators (green for success, blue for info, orange for warning)

- **Task Queue Widget**
  - Shows next 3 tasks in queue
  - Displays completion rate for all tasks
  - Each task card includes:
    - Title and description
    - Status badge (idle/working/complete)
    - Priority badge (high/medium/low)
    - Agent assignment
    - Progress bar for working tasks
    - Tap to navigate to full task details

- **Navigation Links**
  - Quick access to "View All Tasks" and "View Briefings"

#### Navigation

- `onPress` on task card → Navigate to `TaskDetails` screen with taskId param
- Navigation links → Navigate to respective screens (Tasks, Briefings)

#### State Management

- Pulls from Zustand store: `tasks`, `setTasksLoading`
- Supports offline-first architecture via async storage

---

### 2. Task Details Screen (`TaskDetailsScreen.tsx`)

**Purpose:** Full task information with execution history, progress tracking, and action buttons.

**Location:** `src/screens/TaskDetailsScreen.tsx`

#### Features

- **Header Section**
  - Large task title with text wrapping
  - Status badge (aligned right)
  - Full task description
  - Pull-to-refresh support

- **Task Information Card**
  - Priority (with color coding)
  - Assigned agent
  - Task creation date
  - 3-column layout for optimal mobile viewing

- **Progress Indicator** (if status === "working")
  - Circular progress display
  - Percentage shown in center
  - Animated progress updates

- **Execution History Timeline**
  - Vertical timeline with status updates
  - Timestamps for each status change
  - Visual dot indicators (blue for primary status)
  - Timeline connector lines

- **Deliverables Section** (if status === "complete")
  - List of generated deliverables
  - Status indicators (ready/pending/failed)
  - Checkmark for ready, circle for pending

- **Action Buttons** (if status === "working")
  - "Approve & Complete" button (primary blue)
  - "Return to Agent" button (danger styling)
  - Tap to update task status

- **Details Section**
  - Task ID
  - Current status
  - Priority level
  - Assigned agent name

#### Navigation

- Params: `taskId` (string)
- Back navigation: Go back to Dashboard or previous screen
- Status update on approve: Marks task as complete and returns to Dashboard

#### State Management

- Pulls from Zustand store: `tasks`, `updateTask`
- Local state for refresh animation

---

### 3. Briefings Screen (`BriefingsScreen.tsx`)

**Purpose:** Overview of all briefings with status filtering and quick navigation.

**Location:** `src/screens/BriefingsScreen.tsx`

#### Features

- **Header Section**
  - Screen title "Briefings"
  - Subheading "Active briefing documents"

- **Statistics Card**
  - Total briefings count
  - Ready count (blue)
  - Executing count (orange)
  - Complete count (green)
  - 4-column layout with large numbers

- **Filter Tabs**
  - All, Draft, Ready, Executing filter buttons
  - Active tab highlighted in blue
  - Scrollable if needed
  - Updates list in real-time

- **Briefing List**
  - Each briefing displays as a `BriefingPreview` component
  - Shows:
    - Briefing title
    - Agent/owner name
    - Status badge with icon (📝 draft, ✓ ready, ⚡ executing, ✓✓ complete)
    - Content preview (2-line ellipsis)
    - Creation date
  - Tap to navigate to full briefing view
  - Empty state message if no briefings match filter

- **Create New Briefing CTA**
  - Bottom button to create new briefing
  - Primary blue styling
  - Persistent across all filter states

#### Status Colors

- **Draft:** Gray (999999)
- **Ready:** Blue (0066FF) - primary
- **Executing:** Orange (FF9500) - warning
- **Complete:** Green (34C759) - success

#### Navigation

- `onPress` on briefing → Navigate to `BriefingDetail` screen with briefingId param
- Filter tabs → Update local state and re-filter briefing list

#### State Management

- Pulls from Zustand store: `briefings`, `setBriefingsLoading`
- Local state: `refreshing`, `activeFilter`
- Mock data provided for demo (can be replaced with API calls)

---

## Supporting Components

Located in `/src/components/`:

### GlassCard (`GlassCard.tsx`)

Reusable glassmorphic card component with frosted glass effect.

**Props:**
- `children: React.ReactNode` - Card content
- `style?: ViewStyle` - Custom styles
- `scrollable?: boolean` - Enable scroll within card
- `scrollViewProps?: ScrollViewProps` - Props for internal ScrollView
- `onPress?: () => void` - Tap handler

**Features:**
- Glassmorphic styling with semi-transparent background
- Subtle border matching design system
- Responsive padding
- Can contain scrollable content

---

### AgentStatusBadge (`AgentStatusBadge.tsx`)

Status indicator badge for agents.

**Props:**
- `status: 'idle' | 'working' | 'complete' | 'error'` - Status type
- `label?: string` - Custom label (defaults to status name)
- `size?: 'small' | 'medium' | 'large'` - Badge size

**Features:**
- Color-coded backgrounds and text
- Animated dot indicator
- Touch-friendly sizing (min 44px)
- Used across all screens

---

### ProgressIndicator (`ProgressIndicator.tsx`)

Animated progress display in circular or linear format.

**Props:**
- `progress: number` - Percentage (0-100)
- `type?: 'circular' | 'linear'` - Display type
- `size?: 'small' | 'medium' | 'large'` - Visual size
- `showLabel?: boolean` - Show label text
- `color?: string` - Progress color (default: primary blue)
- `showPercentage?: boolean` - Show percentage text

**Features:**
- Smooth easing animations
- Circular progress with center percentage
- Linear progress bar with optional label
- Customizable colors and sizes
- Used in Dashboard (stats) and Task Details (progress)

---

### TaskCard (`TaskCard.tsx`)

Card component displaying task summary.

**Props:**
- `id: string` - Task ID
- `title: string` - Task title
- `description?: string` - Task description
- `status: 'idle' | 'working' | 'complete' | 'scheduled'` - Task status
- `progress?: number` - Progress percentage (0-100)
- `priority: 'high' | 'medium' | 'low'` - Priority level
- `agentName?: string` - Assigned agent name
- `onPress?: () => void` - Tap handler
- `onApprove?: () => void` - Approve button handler
- `showActions?: boolean` - Show approve/reject buttons

**Features:**
- Status badge (colored)
- Priority badge with colored dot
- Agent assignment display
- Conditional progress indicator for working tasks
- Optional action buttons
- Tap to navigate to details

---

### BriefingPreview (`BriefingPreview.tsx`)

Preview card for briefing documents.

**Props:**
- `id: string` - Briefing ID
- `title: string` - Briefing title
- `status: 'draft' | 'ready' | 'executing' | 'complete'` - Briefing status
- `agent: string` - Agent/owner name
- `taskId?: string` - Associated task ID
- `content?: string` - Content preview text
- `createdAt?: string` - Creation date ISO string
- `onPress?: () => void` - Tap handler

**Features:**
- Status badge with emoji icon
- Agent name display
- Content preview (2-line ellipsis)
- Creation date formatting
- Color-coded status indicators
- Tap to view full briefing

---

## Navigation Structure

```
RootNavigator
├── AuthStack
│   └── LoginScreen
│
└── MainTabs
    ├── Dashboard Stack
    │   ├── DashboardScreen
    │   └── TaskDetailsScreen
    ├── Briefings Stack
    │   ├── BriefingsScreen
    │   └── BriefingDetail (placeholder)
    ├── Portfolio Stack
    │   └── PortfolioScreen
    ├── Inbox Stack
    │   └── InboxScreen
    └── Profile
        └── ProfileScreen
```

## Data Model

### Task Object

```typescript
{
  id: string
  title: string
  description: string
  status: 'idle' | 'working' | 'complete' | 'scheduled'
  priority: 'high' | 'medium' | 'low'
  agentName?: string
  progress?: number (0-100)
  createdAt: string (ISO date)
}
```

### Briefing Object

```typescript
{
  id: string
  title: string
  status: 'draft' | 'ready' | 'executing' | 'complete'
  agent: string
  taskId?: string
  content?: string
  createdAt?: string (ISO date)
}
```

---

## Responsive Design

### Breakpoints

- **iPhone 12/14/Pro:** 390-430px width (primary target)
- **iPhone 15 Pro Max:** 430-460px width
- **iPad:** Supported via stack stretching

### Touch Targets

- Minimum 44px (iOS HG standard)
- Button padding: 16px vertical, 20px horizontal
- Tab icons: 20-24px

### Layout Strategies

- Flexbox for responsive layouts
- Percentage widths for card grids
- ScrollView for overflow content
- FlatList for large lists (future optimization)

---

## Offline Support

All screens support offline-first architecture:

1. **Local State:** Zustand store persists to AsyncStorage
2. **Pending Actions:** Queue stored locally, synced when online
3. **Pull-to-Refresh:** Triggers sync when user pulls down
4. **Graceful Degradation:** Shows cached data if network unavailable

---

## Performance Optimizations

1. **Shimmer Placeholders:** Loading states use placeholder cards
2. **Reanimated Animations:** Smooth 60 FPS animations
3. **Memoization:** Components memoized to prevent unnecessary re-renders
4. **Scroll Performance:** FlatList for large task/briefing lists (future)
5. **Image Caching:** Expo Image handles smart caching

---

## Testing Checklist

- [x] All 3 screens render without errors
- [x] Navigation between screens works smoothly
- [x] Glassmorphic design consistent across screens
- [x] Status badges color-coded correctly
- [x] Pull-to-refresh functional
- [x] Task details screen shows correct task info
- [x] Briefing filtering works
- [x] Touch targets >= 44px
- [x] TypeScript types throughout
- [x] No console warnings/errors

---

## Future Enhancements

1. **Animations:** Add Reanimated screen transitions
2. **Briefing Detail:** Full briefing view with approve/reject
3. **Search:** Search tasks/briefings
4. **Sort:** Sort by date, priority, status
5. **Real-time Sync:** WebSocket connection to backend
6. **Notifications:** Push notifications for task updates
7. **Dark Mode Toggle:** System preference support
8. **Voice Commands:** Siri shortcuts integration

---

## File Structure

```
src/
├── screens/
│   ├── DashboardScreen.tsx ✓
│   ├── TaskDetailsScreen.tsx ✓
│   ├── BriefingsScreen.tsx ✓
│   ├── LoginScreen.js (existing)
│   ├── PortfolioScreen.js (existing)
│   ├── InboxScreen.js (existing)
│   └── ProfileScreen.js (existing)
│
├── components/
│   ├── GlassCard.tsx ✓
│   ├── AgentStatusBadge.tsx ✓
│   ├── ProgressIndicator.tsx ✓
│   ├── TaskCard.tsx ✓
│   ├── BriefingPreview.tsx ✓
│   └── (existing components)
│
├── theme/
│   ├── colors.ts ✓
│   ├── typography.ts ✓
│   ├── spacing.ts ✓
│   └── index.ts ✓
│
├── hooks/
│   ├── useTheme.ts ✓
│   └── (existing hooks)
│
└── navigation/
    └── RootNavigator.tsx ✓
```

---

## Component API Reference

### DashboardScreen

```typescript
type DashboardScreenProps = NativeStackScreenProps<any, 'Dashboard'>;

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  // State: [refreshing, setRefreshing]
  // Store: tasks, setTasksLoading
  // Actions: onRefresh() → triggers mock sync
}
```

### TaskDetailsScreen

```typescript
type TaskDetailsScreenProps = NativeStackScreenProps<any, 'TaskDetails'>;

const TaskDetailsScreen: React.FC<TaskDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  // Params: route.params.taskId
  // State: [refreshing, setRefreshing]
  // Store: tasks, updateTask
  // Actions: handleApprove() → updates task to complete
}
```

### BriefingsScreen

```typescript
type BriefingsScreenProps = NativeStackScreenProps<any, 'Briefings'>;

const BriefingsScreen: React.FC<BriefingsScreenProps> = ({ navigation }) => {
  // State: [refreshing, setRefreshing], [activeFilter, setActiveFilter]
  // Store: briefings, setBriefingsLoading
  // Filter: all | draft | ready | executing | complete
}
```

---

## Styling Notes

- All components use glassmorphic design
- Dark navy background (#0a0e27) for accessibility and contrast
- Semi-transparent surfaces with subtle borders
- Primary blue (#0066ff) for interactive elements
- Green (#34c759) for success states
- Orange (#ff9500) for warning states
- Red (#ff3b30) for error states
- Text hierarchy: h1 (32px) down to caption (12px)
- Spacing: 8px base unit for consistency

---

**Version:** 1.0.0  
**Last Updated:** March 29, 2026  
**Framework:** React Native 0.81.5 + Expo 54
