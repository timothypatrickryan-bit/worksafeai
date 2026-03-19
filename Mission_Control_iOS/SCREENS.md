# Mission Control iOS – Screen Specifications

## Screen Index
1. Portfolio View (Active Projects)
2. Project Detail View
3. Briefing Approval Modal
4. Inbox View
5. Task Creation Sheet

---

## SCREEN 1: PORTFOLIO VIEW

### Purpose
Main dashboard showing all projects organized by status tabs. Primary entry point for the app.

### Screen Dimensions
- **Canvas:** 390 × 844 (safe areas included)
- **Content Area:** 390 × 763 (excluding top safe area 47pt, bottom tab bar 50pt)

### Layout Structure

#### Safe Area (Top)
```
Status Bar + Notch Area: 47pt
├─ Left: Time
├─ Center: —
└─ Right: Signal, WiFi, Battery
```

#### Header (56pt)
```
┌────────────────────────────────┐
│ Large Title (34pt)             │
│ "Projects"                      │
└────────────────────────────────┘
16pt left/right margin, Navy Dark (#1A1F2E) background
```

#### Tab Navigation (40pt)
```
┌────────────────────────────────┐
│ Active  │  Completed  │ Cancelled│
│ ━━━━━━━  │            │          │
└────────────────────────────────┘
Horizontal scroll if needed
Active tab: Success Green (#10B981) underline
Inactive: Text Secondary (#9CA3AF)
Padding: 12pt per tab
```

#### Content Area (Scrollable)
```
Spacing: 16pt left/right margins
Section spacing: 24pt between sections

┌─ ACTIVE PROJECTS ────────────────────────┐
│ ┌──────────────────────────────────────┐ │
│ │ Project Card                          │ │
│ │                                       │ │
│ │ [Status Badge]  [Name: "Build Dashboard"] │
│ │ Status: In Progress | 3 Tasks         │ │
│ │ Progress: ███░░░░░░ 30%               │ │
│ │                                       │ │
│ │ Queued: 2  │  In Progress: 1          │ │
│ │                                       │ │
│ │ ▼ Orchestrator Plan (Collapsed)       │ │
│ │   "Implement API, Deploy to staging"  │ │
│ └──────────────────────────────────────┘ │
│                                           │
│ ┌──────────────────────────────────────┐ │
│ │ Project Card                          │ │
│ │ [Status Badge]  [Name: "Mobile App"]  │ │
│ │ Status: In Progress | 5 Tasks         │ │
│ │ Progress: ██░░░░░░░ 20%               │ │
│ │ Queued: 3  │  In Progress: 2          │ │
│ │ ▼ Orchestrator Plan (Collapsed)       │ │
│ └──────────────────────────────────────┘ │
│                                           │
│ ... (scrollable)                          │
└─────────────────────────────────────────┘

┌──────────────────────────────────────┐
│ + Add Project Button (48pt)           │
│   (Fixed bottom, above tab bar)       │
└──────────────────────────────────────┘
```

#### Project Card Details

**Dimensions:** Full width minus 32pt margins = 358pt wide
**Height:** 140pt (expandable when orchestrator plan revealed)
**Background:** Navy Dark (#1A1F2E)
**Border:** 1pt Divider (#374151)
**Border Radius:** 12pt
**Padding:** 12pt
**Shadow:** Elevation 1

**Card Content Layout:**
```
┌─ Top Row (32pt) ──────────────────────┐
│ [Status Badge]      [Project Name]    │
│ 11pt/600  14pt      22pt/700 title 3  │
└───────────────────────────────────────┘

┌─ Status Line (20pt) ───────────────────┐
│ "Status: In Progress"  |  "3 Tasks"   │
│ 15pt/400 subheading                   │
└───────────────────────────────────────┘

┌─ Progress Bar (8pt + 4pt spacing) ────┐
│ ████░░░░░░░░ 30%                      │
│ 4pt height, 8pt radius, 12pt label    │
└───────────────────────────────────────┘

┌─ Task Counts (24pt) ──────────────────┐
│ Queued: 2  │  In Progress: 1          │
│ 13pt/500 callout, centered distribution│
└───────────────────────────────────────┘

┌─ Orchestrator Section (Expandable) ───┐
│ ▼ Orchestrator Plan                   │
│ "Implement API, deploy to staging..."  │
│ 15pt/400, Text Secondary, 1 line max  │
│ Tap to expand (shows full plan)        │
└───────────────────────────────────────┘
```

**Status Badge Options:**
```
Active    → ● Success Green (#10B981), 11pt "Active"
In-Prog   → ● Warning Orange (#F59E0B), 11pt "In Progress"
Completed → ✓ Navy Light (#2A3142), 11pt "Completed"
Cancelled → ✗ Error Red (#EF4444), 11pt "Cancelled"
```

**Card Interaction:**
- Tap anywhere → Navigate to Project Detail View
- Tap on Orchestrator Plan section → Expand full plan inline
- Swipe left (future) → Quick actions (edit, delete)

#### Add Project Button (Fixed Bottom)
```
Position: 20pt above tab bar (bottom: 70pt from screen bottom)
Width: Full width minus 32pt margins (358pt)
Height: 48pt
Background: Success Green (#10B981)
Text: "Add Project" | 17pt/600 Text Primary
Icon: plus.circle.fill (20pt) left of text
Border Radius: 8pt
Shadow: Elevation 1
Pressed: Success Green Light (#34D399)
```

#### Bottom Tab Bar (50pt + 34pt safe area)
```
┌─────────────────────────────────────┐
│ Projects │ Inbox │ Settings (hidden │
│    ✓     │  📬   │  for v1)        │
│ Success  │ Gray  │                  │
│ Green    │       │                  │
└─────────────────────────────────────┘
Indicator: Success Green underline under active tab
```

### Navigation Flow
- **Tab: Completed** → Shows projects with Completed status, same card layout
- **Tab: Cancelled** → Shows projects with Cancelled status, muted styling
- **Tap Project Card** → Navigate to Project Detail View (push animation)
- **Tap Add Project Button** → [Future] Navigation to project creation flow
- **Tap Inbox Tab** → Navigate to Inbox View
- **Swipe Left on Card** → [Future] Reveal quick actions (Edit, Delete)

### Empty State (if no projects in tab)
```
┌─────────────────────────────────────┐
│          (Centered, empty state)    │
│                                     │
│              📋                     │
│         No Projects Yet             │
│                                     │
│    Create your first project to    │
│    start collaborating             │
│                                     │
│        [+ Add Project] Button       │
└─────────────────────────────────────┘
```

---

## SCREEN 2: PROJECT DETAIL VIEW

### Purpose
Deep dive into a single project. Shows tasks organized by status, orchestrator briefing, and add task action.

### Screen Dimensions
- **Canvas:** 390 × 844
- **Content Area:** 390 × 763 (safe areas)

### Layout Structure

#### Header (56pt)
```
┌────────────────────────────────────┐
│ < Projects        Project Name     │
│   [Back Button]   [Title 1: 28pt]  │
└────────────────────────────────────┘
Back button: Chevron left, 44pt touch target
Title: Center-aligned, Text Primary
Background: Navy Dark (#1A1F2E)
Border Bottom: 1pt Divider (#374151)
```

#### Tab Navigation (40pt – Horizontal Scroll)
```
┌────────────────────────────────────┐
│ Queued │ In-Progress │ What's Next │
│ ━━━━━━  │      │         │ Completed │
└────────────────────────────────────┘
Active: Success Green (#10B981) underline + Text Primary
Inactive: Text Secondary (#9CA3AF)
Scroll: Bouncy horizontal
Snap: To tab edges
```

#### Briefing Section (Collapse/Expand)
```
Height: 44pt (collapsed) | Expandable to ~120pt

┌─ BRIEFING BAR (Collapsed) ────────────┐
│ 📋 Briefing Pending Approval          │
│ [Tap to expand or pull down]          │
│ Status Badge: "Pending" (Orange)      │
│                                       │
│ Pull indicator: chevron.down (rotate) │
└───────────────────────────────────────┘

Pull-down interaction:
- User pulls down on briefing section
- Reveals full briefing content below header
- Collapse via swipe up or tap outside

Expanded:
┌─────────────────────────────────────┐
│ 📋 Briefing                         │
│                                     │
│ Execution Plan:                     │
│ "Implement user authentication,    │
│  Set up database schema, Deploy    │
│  to staging environment"           │
│                                     │
│ Status: Pending Approval           │
│ Created: Mar 18, 2:30 PM          │
│                                     │
│ [Request Changes] [Approve & Exec] │
│ Secondary         Primary (Green)  │
└─────────────────────────────────────┘
```

#### Task Cards (Scrollable Content)
```
Spacing: 16pt left/right, 12pt between cards

┌──────────────────────────────────────┐
│ QUEUED (2 tasks)                     │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [Queued Badge] Setup Database  │  │
│ │                                │  │
│ │ Priority: High | Due: Tomorrow │  │
│ │ [Details preview, 1 line]      │  │
│ │                                │  │
│ │ ← Swipe: Edit  |  Delete →     │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [Queued Badge] Configure Auth  │  │
│ │                                │  │
│ │ Priority: Medium | No due date │  │
│ │ [Details preview, 1 line]      │  │
│ │                                │  │
│ │ ← Swipe: Edit  |  Delete →     │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ IN-PROGRESS (1 task)                 │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [In-Prog Badge] API Integration│  │
│ │                                │  │
│ │ Priority: High | Due: Today    │  │
│ │ [Details preview, 1 line]      │  │
│ │ Progress: ██░░░░░ 20%          │  │
│ │                                │  │
│ │ ← Swipe: Edit  |  Delete →     │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ WHAT'S NEXT (0 tasks)                │
│ (Empty state)                        │
│ "No upcoming tasks – all caught up!" │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ COMPLETED (3 tasks)                  │
│ ┌────────────────────────────────┐  │
│ │ ✓ Environment Setup            │  │
│ │ Status: Completed              │  │
│ │ Completed: Mar 17, 5:00 PM     │  │
│ └────────────────────────────────┘  │
│ (Muted styling, Navy Light bg)      │
│ ... (scrollable)                     │
└──────────────────────────────────────┘
```

**Task Card (Detailed):**
```
Width: Full minus 32pt = 358pt
Height: 100pt (expandable on interaction)
Background: Navy Dark (#1A1F2E)
Border: 1pt Divider (#374151)
Border Radius: 8pt
Padding: 12pt
Shadow: Elevation 1

┌─ Top Row (24pt) ──────────────────┐
│ [Status Badge]  [Task Title]      │
│ 11pt/600        20pt/600 title 3  │
└───────────────────────────────────┘

┌─ Metadata (16pt) ─────────────────┐
│ Priority: High  │  Due: Tomorrow  │
│ 13pt/500 callout                  │
└───────────────────────────────────┘

┌─ Description (20pt) ──────────────┐
│ "Implement OAuth 2.0 flow with..."│
│ 15pt/400 body, 1 line max         │
└───────────────────────────────────┘

┌─ Progress (8pt + spacing) ────────┐
│ ██░░░░░ 20% (only for in-progress)│
└───────────────────────────────────┘

Swipe Actions (Reveal on left/right):
Left Swipe:  [Edit] (blue background)
Right Swipe: [Delete] (red background)
```

#### Add Task Button (Fixed Bottom)
```
Position: 20pt above tab bar (bottom: 70pt from screen bottom)
Width: Full width minus 32pt (358pt)
Height: 48pt
Background: Success Green (#10B981)
Text: "+ Add Task" | 17pt/600 Text Primary
Icon: plus.circle.fill (20pt) left of text
Border Radius: 8pt
Shadow: Elevation 1
Tap → Opens Task Creation Sheet (animated from bottom)
```

#### Bottom Tab Bar
```
Same as Screen 1:
Projects | Inbox | Settings (hidden)
```

### Navigation Flow
- **Back Button** → Return to Portfolio View (pop animation)
- **Tab Change** → Scroll to that section (smooth scroll within page)
- **Tap Task Card** → [Future] Open task detail, edit flow
- **Swipe Task Left** → Edit action
- **Swipe Task Right** → Delete action (confirm dialog)
- **Tap Briefing Section** → Expand full briefing content
- **Tap Approve & Execute Button** → Navigate to Briefing Approval Modal
- **Tap Add Task Button** → Open Task Creation Sheet (bottom sheet)
- **Tap Inbox Tab** → Navigate to Inbox View

### Project Detail Empty State (No Tasks)
```
┌─────────────────────────────────────┐
│          (Centered)                 │
│                                     │
│              ✨                     │
│         All Tasks Caught Up         │
│                                     │
│    Create a new task to keep        │
│    moving forward                   │
│                                     │
│         [+ Add Task] Button         │
└─────────────────────────────────────┘
```

---

## SCREEN 3: BRIEFING APPROVAL MODAL

### Purpose
Review and approve (or request changes on) orchestrator briefing before execution. Critical decision point.

### Presentation Style
Full-screen modal (not bottom sheet) for prominence and decision-making

### Layout

#### Safe Area & Overlay
- Background: Black, 40% opacity
- Blur: 20pt backdrop blur (vibrancy effect)

#### Modal Frame
```
Width: Full (390pt)
Height: Full (844pt) minus safe areas (47pt top, 34pt bottom) = 763pt
Background: Navy Base (#0F1419)
Border Radius: 20pt top (if bottom-sheet variant), 0pt if full-screen
Position: Full screen from top

┌─ HEADER (56pt) ─────────────────────┐
│ ✕ Close                             │
│ [Dismiss Button, top-left]          │
│ Title: "Review Briefing" (28pt)     │
└─────────────────────────────────────┘
Divider: 1pt Divider (#374151) below header
```

#### Content Area (Scrollable)
```
Padding: 16pt left/right, 20pt top/bottom
Max Width: 358pt (content width)

┌─ Section: Execution Plan ─────────────┐
│ Title: "Execution Plan"               │
│ 17pt/600 Headline, Navy Dark bg       │
│ Padding: 12pt inside section          │
│                                       │
│ Content (Body text):                  │
│ "1. Implement OAuth 2.0 authentication│
│  2. Set up PostgreSQL database schema │
│  3. Create RESTful API endpoints      │
│  4. Deploy to staging environment    │
│  5. Run integration tests            │
│  6. Get final approval               │
│                                       │
│  Estimated Duration: 4-6 hours       │
│  Confidence Level: High (95%)        │
│                                       │
│  Risks:                               │
│  - Database migration may cause      │
│    downtime if not done in off-hours │
│  - Need staging environment ready    │
│"                                      │
│                                       │
│ 17pt/400 Body text, Navy Light bg    │
│ Border Radius: 8pt                   │
│ Padding: 12pt                        │
└───────────────────────────────────────┘

┌─ Section: Metadata ───────────────────┐
│ Status: Pending Approval              │
│ [Status Badge: Orange]                │
│                                       │
│ Created: March 18, 2:30 PM           │
│ Created By: Orchestrator AI          │
│                                       │
│ Expires: March 20, 2:30 PM           │
│ [24 hour approval window]             │
│                                       │
│ 13pt/500 Callout text, Navy Light    │
└───────────────────────────────────────┘

┌─ Section: Impact Summary ─────────────┐
│ Affected Systems:                     │
│ • Authentication Layer                │
│ • Database (PostgreSQL)               │
│ • API Server                          │
│ • Staging Environment                 │
│                                       │
│ Changes:                              │
│ • 12 database migrations              │
│ • 8 new API endpoints                │
│ • 3 configuration updates             │
│                                       │
│ Rollback Plan: Available              │
│ (Backup created before execution)     │
│                                       │
│ 13pt/500 Callout text                 │
└───────────────────────────────────────┘
```

#### Action Buttons (Sticky Bottom)
```
Position: Bottom of modal, above safe area
Background: Navy Dark (#1A1F2E) with top border 1pt Divider
Padding: 16pt left/right, 12pt top/bottom

┌────────────────────────────────────┐
│ [Request Changes] [Approve & Exec] │
│ Secondary Button     Primary Button │
│ 358pt available     Width split     │
│ (175pt each + 8pt spacing)          │
└────────────────────────────────────┘

Primary Button (Approve & Execute):
- Width: 175pt
- Height: 48pt
- Background: Success Green (#10B981)
- Text: "Approve & Execute" | 17pt/600 Text Primary
- Icon: checkmark.circle.fill (20pt) left of text
- Border Radius: 8pt
- Shadow: Elevation 1
- Pressed: Success Green Light (#34D399)

Secondary Button (Request Changes):
- Width: 175pt
- Height: 48pt
- Background: Navy Light (#2A3142)
- Text: "Request Changes" | 17pt/600 Text Primary
- Border: 1pt Divider (#374151)
- Border Radius: 8pt
- Pressed: Navy Lighter (#3A4557)
```

### Interaction
- **Tap Approve & Execute** → Execute plan, show success state, close modal, return to Project Detail View
- **Tap Request Changes** → Navigate to request changes flow [Future]
- **Swipe Down** → Dismiss modal (springy, with parallax)
- **Tap Outside Modal** → Dismiss (if bottom sheet variant)
- **Tap Close Button (X)** → Close modal

### Success State (After Approval)
```
┌─────────────────────────────────────┐
│          (Centered)                 │
│                                     │
│              ✓                      │
│         Briefing Approved!          │
│                                     │
│    Execution plan is now running   │
│    You'll receive updates as it     │
│    progresses.                      │
│                                     │
│                  [Close]            │
│                  (Auto-dismiss)     │
└─────────────────────────────────────┘
```

---

## SCREEN 4: INBOX VIEW

### Purpose
Centralized message list. Quick review of all incoming communications, with send action to mark complete.

### Screen Dimensions
- **Canvas:** 390 × 844
- **Content Area:** 390 × 763 (safe areas)

### Layout Structure

#### Header (56pt)
```
┌────────────────────────────────────┐
│ Large Title (34pt)                 │
│ "Inbox"                             │
│ Subtitle: "3 new messages"         │
│ (13pt/400 text secondary)          │
└────────────────────────────────────┘
Background: Navy Dark (#1A1F2E)
Border Bottom: 1pt Divider (#374151)
```

#### Message List (Scrollable)
```
Padding: 16pt left/right
Spacing: 12pt between messages

┌─ MESSAGE CARD (52pt) ─────────────────┐
│ [Avatar] From: Tim Ryan              │
│          "Here's the deployment plan" │
│                                      │
│ [Message Preview, 1 line max]        │
│ "I've outlined the steps for rolling │
│  out..."                             │
│                                      │
│ Time: "2:30 PM" | [Send Button]     │
│       13pt/400        Embedded       │
│                                      │
│ ← Swipe: Delete                      │
└──────────────────────────────────────┘

Background: Navy Dark (#1A1F2E)
Border: 1pt Divider (#374151)
Border Radius: 8pt
Padding: 12pt
Shadow: Elevation 1

Message States:
┌─ Unsent (Default) ───────────────────┐
│ [Avatar] From: ...                  │
│ Message content...                  │
│ [Send] Button (Success Green)       │
│ Time: Timestamp                     │
└──────────────────────────────────────┘

┌─ Sent (After Send) ──────────────────┐
│ [Avatar] From: ...                  │
│ Message content...                  │
│ ✓ Sent at 2:30 PM                   │
│ (Checkmark icon, Text Secondary)    │
│ (Send button removed)               │
└──────────────────────────────────────┘

Swipe Action (Left):
- Reveal: [Delete] button (Error Red bg)
- Tap Delete → Confirm dialog → Remove message
```

#### Send Button (Within Message Card)
```
Position: Right side of message card (inline)
Height: 32pt
Width: 80pt
Text: "Send" | 14pt/600 Callout
Icon: paper.plane.fill (14pt) left of text
Background: Success Green (#10B981)
Border Radius: 6pt
Tap → Mark message as sent, update UI, show checkmark

Pressed state:
- Background: Success Green Light (#34D399)
- Haptic: Medium feedback
```

#### Empty State (No Messages)
```
┌─────────────────────────────────────┐
│          (Centered)                 │
│                                     │
│              📬                     │
│         Inbox Zero!                 │
│                                     │
│    You're all caught up. New       │
│    messages will appear here.      │
│                                     │
└─────────────────────────────────────┘
```

### Navigation Flow
- **Tap Send Button** → Mark message as sent, show checkmark, disable button
- **Swipe Message Left** → Reveal Delete action
- **Tap Delete Action** → Confirm dialog → Remove message from inbox
- **Pull Down** → Refresh messages (optional, future)
- **Bottom Tab Bar** → Switch to Projects or Settings (hidden)

### Message Types (Variations)
```
1. Text Message (shown above)
2. System Message (e.g., "Briefing approved by Tim")
   - Different styling: Muted background
   - No Send button
   - Timestamp only

3. Error Message (e.g., "Deployment failed")
   - Red status indicator
   - Alert icon
   - Action button (View Details, Retry)
```

---

## SCREEN 5: TASK CREATION SHEET

### Purpose
Bottom sheet for creating a new task. Accessible from Project Detail View or via "Add Task" button.

### Presentation Style
Bottom sheet with drag handle, springy animation from bottom

### Layout

#### Handle Bar (16pt)
```
Position: Top of sheet
Height: 4pt
Width: 40pt
Background: Navy Light (#2A3142)
Border Radius: 2pt
Centered horizontally
Tap or drag to dismiss
```

#### Header (44pt)
```
┌────────────────────────────────────┐
│ Title: "New Task"                  │
│ (20pt/600 Title 3)                 │
│                                     │
│ (Subtitle optional: Project name)  │
│ 13pt/400 Caption, Text Secondary   │
└────────────────────────────────────┘
Padding: 12pt left/right, 8pt top
Border Bottom: 1pt Divider (#374151)
```

#### Form Content (Scrollable within sheet)
```
Padding: 16pt left/right
Spacing: 20pt between fields

┌─ FIELD: Title ────────────────────┐
│ Label: "Task Title" (13pt/600)     │
│ Required: * (red)                  │
│                                   │
│ ┌─ Text Input ──────────────────┐ │
│ │ Placeholder: "e.g., Setup DB" │ │
│ │ Height: 44pt                  │ │
│ │ Navy Light bg, 1pt border     │ │
│ └───────────────────────────────┘ │
│ Input: 17pt/400 Body              │
└───────────────────────────────────┘

┌─ FIELD: Description ──────────────┐
│ Label: "Description" (13pt/600)   │
│ Optional (13pt/400, Text Secondary)│
│                                   │
│ ┌─ Text Area ───────────────────┐ │
│ │ Placeholder: "Add details..."  │ │
│ │ Height: 100pt (expandable)     │ │
│ │ Navy Light bg, 1pt border     │ │
│ │ Multi-line, word wrap         │ │
│ └───────────────────────────────┘ │
│ Input: 17pt/400 Body              │
└───────────────────────────────────┘

┌─ FIELD: Project ──────────────────┐
│ Label: "Project" (13pt/600)       │
│ Pre-filled from context (optional) │
│                                   │
│ ┌─ Picker / Dropdown ──────────┐ │
│ │ "Build Dashboard" (selected)  │ │
│ │ Navy Light bg, 1pt border     │ │
│ │ Icon: chevron.down (right)    │ │
│ │ 44pt height                   │ │
│ │ Tap → Show picker modal       │ │
│ └───────────────────────────────┘ │
│ Input: 17pt/400 Body              │
└───────────────────────────────────┘

┌─ FIELD: Status ───────────────────┐
│ Label: "Status" (13pt/600)        │
│                                   │
│ ┌─ Segmented Control ──────────┐ │
│ │ [Queued] [In-Progress]       │ │
│ │ Default: Queued selected     │ │
│ │ 6pt spacing, equal widths    │ │
│ │ Active: Success Green bg     │ │
│ │ Inactive: Navy Light bg      │ │
│ └───────────────────────────────┘ │
│ Input: 13pt/500 Callout           │
└───────────────────────────────────┘

┌─ FIELD: Priority ─────────────────┐
│ Label: "Priority" (13pt/600)      │
│                                   │
│ ┌─ Segmented Control ──────────┐ │
│ │ [Low] [Medium] [High]        │ │
│ │ Default: Medium selected     │ │
│ │ 6pt spacing, equal widths    │ │
│ │ Active: Success Green bg     │ │
│ │ Inactive: Navy Light bg      │ │
│ └───────────────────────────────┘ │
│ Input: 13pt/500 Callout           │
└───────────────────────────────────┘

┌─ FIELD: Due Date (Optional) ──────┐
│ Label: "Due Date" (13pt/600)      │
│ Hint: "Set a deadline" (13pt/400) │
│                                   │
│ ┌─ Date Picker ─────────────────┐ │
│ │ "Tomorrow" (selected)         │ │
│ │ Tap → Show calendar picker    │ │
│ │ 44pt height                   │ │
│ └───────────────────────────────┘ │
│ Input: 17pt/400 Body              │
└───────────────────────────────────┘

┌─ FIELD: Assignee (Optional) ──────┐
│ Label: "Assign to" (13pt/600)     │
│ Hint: "Optional" (13pt/400)       │
│                                   │
│ ┌─ Avatar Picker ───────────────┐ │
│ │ [👤 Tim Ryan] [+]             │ │
│ │ Tap → Show contact picker     │ │
│ │ 44pt height                   │ │
│ └───────────────────────────────┘ │
│ Input: 17pt/400 Body              │
└───────────────────────────────────┘
```

#### Action Buttons (Sticky Bottom)
```
Position: Bottom of sheet, above safe area
Background: Navy Dark (#1A1F2E) with top border 1pt Divider
Padding: 16pt left/right, 12pt top/bottom

┌────────────────────────────────────┐
│ [Cancel]         [Create Task]     │
│ Secondary        Primary (Green)   │
│ 175pt width each (358pt total)     │
└────────────────────────────────────┘

Primary Button (Create Task):
- Width: 175pt
- Height: 48pt
- Background: Success Green (#10B981)
- Text: "Create Task" | 17pt/600 Text Primary
- Icon: plus.circle.fill (20pt) left of text
- Border Radius: 8pt
- Shadow: Elevation 1
- Disabled if Title is empty
- Pressed: Success Green Light (#34D399)

Secondary Button (Cancel):
- Width: 175pt
- Height: 48pt
- Background: Navy Light (#2A3142)
- Text: "Cancel" | 17pt/600 Text Primary
- Border: 1pt Divider (#374151)
- Border Radius: 8pt
- Pressed: Navy Lighter (#3A4557)
```

### Interaction
- **Drag Handle** → Dismiss sheet (spring animation downward)
- **Swipe Down** → Dismiss sheet
- **Tap Outside (if visible)** → Dismiss sheet
- **Tap Cancel Button** → Close sheet without creating
- **Fill Title + Tap Create Task** → Create task, close sheet, return to Project Detail View
- **Project Pre-fill** → If opened from project context, auto-select that project
- **Focus Input** → Keyboard slides up, sheet remains visible (scroll within sheet)
- **Validate on Submit** → Title required; if empty, show error state on field

### Form Validation
```
Title Field:
- Empty: Show red border + error message "Task title is required"
- Max 100 characters
- On focus: Border Success Green

Description Field:
- Max 500 characters
- Optional
- Character counter (future)

Date Field:
- Can't select past dates
- Calendar picker shows 30-day range
```

### Success State (After Creation)
```
Brief haptic feedback (medium)
Toast message: "Task created!" (bottom, above tab bar)
Auto-dismiss sheet
Return to Project Detail View
Scroll to newly created task in appropriate section
```

---

## SCREEN SUMMARY TABLE

| Screen | Type | Primary Action | Secondary Actions |
|--------|------|-----------------|-------------------|
| Portfolio View | List/Tabs | Tap Project Card | Add Project, Switch Tab, Inbox |
| Project Detail | List/Tabs | Tap Task Card | Add Task, Approve Briefing, Inbox |
| Briefing Modal | Modal | Approve & Execute | Request Changes, Close |
| Inbox View | List | Send Message | Delete Message, Switch Tab |
| Task Creation | Sheet | Create Task | Cancel, Select Project/Status |

---

**Last Updated:** 2026-03-18  
**Design Version:** 1.0  
**Platform:** iOS 16+ (iPhone 14+)
