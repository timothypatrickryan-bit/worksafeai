# Mission Control: Visual Reference & Component Specifications

**Companion Document to MISSION_CONTROL_DESIGN_SYSTEM.md**  
**Created:** March 24, 2026

---

## Quick Visual Reference

### Color Palette at a Glance

```
LIGHT MODE
─────────────────────────────────────────
  WHITE (#FFFFFF)          LIGHT GRAY (#F6F8FB)    BORDER (#EAEEF2)
  ██████████               ██████████              ██████████
  
  TEXT PRIMARY (#0D1117)   TEXT SECONDARY (#57606A) TEXT TERTIARY (#8B949E)
  ██████████               ██████████              ██████████
  
  ACCENT BLUE (#0969DA)    ACCENT HOVER (#0860CA)  ACCENT ACTIVE (#033D8B)
  ██████████               ██████████              ██████████
  
  SUCCESS (#1A7F64)        WARNING (#9E6A03)       CRITICAL (#DA3633)
  ██████████               ██████████              ██████████

DARK MODE
─────────────────────────────────────────
  BG PRIMARY (#0D1117)     BG SECONDARY (#161B22)  BORDER (#30363D)
  ██████████               ██████████              ██████████
  
  TEXT PRIMARY (#F0F6FC)   TEXT SECONDARY (#C9D1D9) TEXT TERTIARY (#8B949E)
  ██████████               ██████████              ██████████
  
  ACCENT LIGHT (#79C0FF)   ACCENT MED (#58A6FF)    ACCENT DEEP (#3B82F6)
  ██████████               ██████████              ██████████
  
  SUCCESS (#3FB950)        WARNING (#D29922)       CRITICAL (#F85149)
  ██████████               ██████████              ██████████
```

---

## Component Size Specifications

### Buttons - Dimensional Reference

```
SMALL BUTTON (32px height)
┌──────────────────┐
│  Small Label     │  Font: 12px
│ P: 8px V, 12px H │
└──────────────────┘

MEDIUM BUTTON (36px height)
┌──────────────────────┐
│  Medium Label        │  Font: 13px (default)
│ P: 8px V, 16px H    │
└──────────────────────┘

LARGE BUTTON (44px height)
┌────────────────────────┐
│    Large Label         │  Font: 14px
│ P: 12px V, 20px H     │
└────────────────────────┘

All buttons:
- Border radius: 6px
- Font weight: 500 (medium)
- Transition: 100ms ease-out
- Focus: 2px outline, 2px offset
```

### Typography Scale Grid

```
Display Headlines:
┌────────────────────────────────────┐
│ Page Title (32px / 600 weight)     │  LINE HEIGHT: 40px
│ Used for main page headers         │  LEADING: 1.25
└────────────────────────────────────┘

Section Headers:
┌────────────────────────────────────┐
│ Section Title (24px / 600 weight)  │  LINE HEIGHT: 32px
│ For major content divisions        │  LEADING: 1.33
└────────────────────────────────────┘

Subsection:
┌────────────────────────────────────┐
│ Subsection (18px / 600 weight)     │  LINE HEIGHT: 24px
└────────────────────────────────────┘

Body Text (13px / 400 weight, primary color):
The main content area uses Body Regular for all body copy. This maintains
excellent readability while keeping the design lightweight and approachable.

Secondary Text (13px / 400 weight, secondary color):
Supporting information, descriptions, and contextual details use secondary
text color for visual hierarchy.

Small Label (11px / 500 weight):
Used for badges, tags, form labels, and other compact text elements.
```

### Spacing Grid Visualization

```
Measurements (8pt base unit):

4px  ├─ Half-step tight spacing
     │  └─ Icon-to-text gap, form field padding

8px  ├─ Default spacing
     │  └─ Button padding, card internal gaps, list items

12px ├─ Comfortable spacing
     │  └─ Card gutters, form label to field

16px ├─ Section spacing
     │  └─ Card padding, between content blocks

24px ├─ Major breaks
     │  └─ Between page sections, container margins

32px ├─ Large spacing
     │  └─ Page top/bottom padding, section separators

40px ├─ Extra large
     │  └─ Major page divisions

48px └─ Maximum breathing room
       └─ Landing hero sections, full-page breaks
```

---

## Component States Matrix

### Button States (All Variants)

```
PRIMARY BUTTON STATE MATRIX
┌─────────────────────────────────────────────────────────┐
│ Default         │ Hover           │ Pressed            │
│ bg: #0969DA     │ bg: #0860CA     │ bg: #033D8B        │
│ text: white     │ shadow: +2px    │ shadow: inset      │
│ shadow: 0 1px 3 │ scale: 1.0      │ scale: 0.98        │
│                 │                 │                    │
├─────────────────┼─────────────────┼────────────────────┤
│ Focus           │ Disabled        │ Loading            │
│ outline: 2px    │ bg: #EAEEF2     │ bg: #0969DA        │
│ outline-color   │ text: #8B949E   │ spinner: spinning  │
│ offset: 2px     │ opacity: 0.5    │ opacity: 0.8       │
│                 │ cursor: n/a     │ cursor: wait       │
└─────────────────┴─────────────────┴────────────────────┘

All state transitions: 100ms ease-out (except loading spinner 800ms linear)
```

### Form Input States

```
INPUT FIELD STATE PROGRESSION

Default (Empty):
┌─────────────────────────────────┐
│ Placeholder text...             │  Border: #EAEEF2
└─────────────────────────────────┘

Hover:
┌─────────────────────────────────┐
│ Placeholder text...             │  Border: #CED4DA
└─────────────────────────────────┘  Shadow: subtle lift

Focus (Active):
┌─────────────────────────────────┐
│ │ Cursor blinking              │  Border: #0969DA
└─────────────────────────────────┘  Outline: 2px #0969DA

Filled (With Value):
┌─────────────────────────────────┐
│ User-entered text ✓             │  Border: #EAEEF2
└─────────────────────────────────┘  Icon: checkmark

Error State:
┌─────────────────────────────────┐
│ ✗ Invalid input text            │  Border: #DA3633 (red)
├─────────────────────────────────┤
│ Error message in red text       │  Font: 11px, red
└─────────────────────────────────┘

Disabled:
┌─────────────────────────────────┐
│ Placeholder text (grayed)       │  bg: #F0F2F5
└─────────────────────────────────┘  opacity: 0.5, cursor: n/a
```

---

## Layout Grid Templates

### 12-Column Grid System (Desktop)

```
┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│  │  │  │  │  │  │  │  │  │  │  │  │  12 columns, each 1/12 width
└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘

Gutter: 16px between columns
Max content width: 1440px

COMMON LAYOUTS:
Half-width:     │      6 cols       │      6 cols       │
Third-width:    │   4 cols   │   4 cols   │   4 cols   │
Quarter-width:  │ 3  │ 3  │ 3  │ 3  │
Full-width:     │           12 cols            │

Sidebar + Main: │ 3 cols │      9 cols      │ (sidebar + content)
```

### Card Layout Proportions

```
COMPACT CARD (ideal for lists)
┌────────────────────────┐
│ [Icon] Title  [Action] │ ← 40px height
└────────────────────────┘
Padding: 8px

REGULAR CARD (default)
┌──────────────────────────────┐
│ [Icon] Title    [Actions]     │ ← 44px header
├──────────────────────────────┤
│ Content area                 │ ← 16px padding
│                              │
└──────────────────────────────┘

EXPANDED CARD (focus/detail)
┌──────────────────────────────┐
│ ◀ Back   Title    [Close]     │ ← 48px header
├──────────────────────────────┤
│ Expanded content area        │ ← 20px padding
│ Multiple sections            │
│ Rich interactions            │
│                              │
└──────────────────────────────┘

METRIC CARD (KPI display)
┌──────────────────────────┐
│ Metric Name              │ ← 12px label
│ 1,234                    │ ← 28px large number
│ ↑ 12% from last period   │ ← 11px secondary text
└──────────────────────────┘
```

---

## Interaction Animation Timings

### Standard Animation Curves

```
EASING FUNCTIONS & USE CASES

Ease-Out (most common)     Ease-In-Out (transitions between states)
  ╲                          ╱╲
   ╲                        ╱  ╲
    ╲___                  __╱    ╲___
Duration: 100-150ms      Duration: 150-250ms
Use: Entrance, buttons   Use: Modals, panels, state changes

Linear (continuous motion) Ease-In (exits)
  │╱                        │  ╱
  │ ╱                       │ ╱
  │╱                        │╱
Duration: 800-1000ms      Duration: 80-100ms
Use: Loaders, spinners    Use: Dismissals, closures
```

### Micro-Animation Playbook

```
ACTION                    TIMING         EASING        EFFECT
──────────────────────────────────────────────────────────────────
Button Click              100ms          ease-out      Scale 1.0 → 0.98
Button Hover              100ms          ease-out      Shadow increase
Card Hover                150ms          ease-out      Scale 1.0 → 1.02 + shadow
Form Error Shake          150ms          ease-out      ±10px horizontal × 2
Tab Switch Slide          150ms          ease-out      Underline moves
Modal Entrance            150ms          ease-out      Scale 0.95 → 1.0 + fade
Tooltip Appear            100ms          ease-out      Fade 0 → 1.0
Skeleton Shimmer          1500ms         linear        Gradient sweep
Data Update Highlight     300ms          ease-out      BG opacity decay
Loading Spinner           800ms          linear        Continuous rotation
Drag & Drop Snap          200ms          ease-out      Final position animate
```

---

## Dark Mode Color Mapping

### Automatic Dark Mode Switch

```
COMPONENT BEHAVIOR ON DARK MODE TOGGLE

Light Mode → Dark Mode Transformation:

Element Type          Light Mode         →    Dark Mode
────────────────────────────────────────────────────────────
Page Background       #FFFFFF            →    #0D1117
Card Surface          #F6F8FB            →    #161B22
Dividers/Borders      #EAEEF2            →    #30363D
Primary Text          #0D1117            →    #F0F6FC
Secondary Text        #57606A            →    #C9D1D9
Tertiary Text         #8B949E            →    #8B949E (same)
Accent Primary        #0969DA            →    #79C0FF
Accent Hover          #0860CA            →    #58A6FF
Accent Active         #033D8B            →    #3B82F6
Success               #1A7F64            →    #3FB950
Warning               #9E6A03            →    #D29922
Critical              #DA3633            →    #F85149

Shadow (Light):       0 1px 3px rgba(0,0,0,0.08)
Shadow (Dark):        0 1px 3px rgba(0,0,0,0.3)

CSS Implementation:
@media (prefers-color-scheme: dark) {
  :root { /* override light mode values */ }
}

User Toggle:
- Preference stored in localStorage
- Applied via class="dark-mode" on <html>
- System preference respected on first visit
- User can override in settings
```

---

## Accessibility Specifications

### Touch Target Sizing

```
MINIMUM TOUCH TARGET SIZES (iOS/Android HIG)

Large Touch Target (Primary CTAs):
┌────────────┐
│  Action    │  44px × 44px minimum
│   Button   │  Generous spacing (16px minimum between targets)
└────────────┘

Standard Touch Target (Secondary):
┌──────────┐
│ Secondary │  36px × 36px minimum
│  Button   │
└──────────┘

Compact Touch Target (Tertiary/Icons):
┌────────┐
│ Icon   │  32px × 32px minimum
│        │
└────────┘

SPACING BETWEEN TARGETS:
Minimum 8px gap between adjacent touch targets
Preferably 16px for mobile user comfort
```

### Keyboard Navigation

```
TAB ORDER FLOW

Dashboard Example:
1. Skip to main content link
2. Search input (top bar)
3. Sidebar menu items (left to right, top to bottom)
4. Main content cards (logical reading order)
5. Card action buttons
6. Pagination controls
7. Settings button (top right)

KEYBOARD SHORTCUTS

Ctrl/Cmd + K         Open search/command palette
Tab / Shift+Tab      Navigate between elements
Enter               Activate selected button/link
Space               Toggle switch/checkbox
Escape              Close modals/dropdowns
Arrow Keys          Navigate within lists/dropdowns
```

### Color Contrast Reference

```
WCAG 2.1 AA COMPLIANCE MATRIX

Text Type              Minimum Contrast    Our Standard
─────────────────────────────────────────────────────────
Normal Text (<18pt)    4.5:1              5.0:1 (exceeds)
Large Text (18pt+)     3:1                4.0:1 (exceeds)
UI Components          3:1                4.0:1 (exceeds)
Focus Indicators       3:1                4.0:1 (exceeds)

VERIFICATION:
Use WebAIM Contrast Checker or similar tool for all color combinations
Test both light and dark mode variants
Include test for color-blind vision (Deuteranopia simulator)
```

---

## Responsive Design Breakpoints

### Breakpoint Strategy

```
MOBILE FIRST APPROACH

Mobile (< 640px)
  └─ Single column layout
     Sidebar collapses to icon-only
     Full-screen modals
     Stacked cards vertically
     Touch-optimized (44px targets)

Tablet (640px - 1024px)
  └─ Two column grid
     Sidebar visible but compact
     Modal centered, 90% viewport width
     Cards in 2-column grid
     Hybrid keyboard + touch support

Desktop (1024px - 1440px)
  └─ Three+ column grid
     Full-width sidebar (240px)
     Modal centered, fixed width (600px max)
     Cards in adaptive grid (3-4 columns)
     Mouse + keyboard primary

Large Desktop (> 1440px)
  └─ Four+ column grid
     Wider sidebar content (360px)
     Modal larger (max-width: 800px)
     Info panels visible by default
     Wide data tables with horizontal scroll
```

### Responsive Components

```
SIDEBAR BEHAVIOR
< 640px:  Hidden (hamburger menu)
640-1024: Icon-only (hover reveals label)
1024px+:  Full width (240px)

GRID LAYOUT
< 640px:  1 column (stack all)
640-1024: 2 columns
1024px+:  3+ columns (flexible)

TABLES/DATA
< 640px:  Horizontal scroll or card view
640px+:   Normal table layout with wrapping

MODALS
< 640px:  Full screen with padding
640px+:   Centered dialog (90vw max)
1024px+:  Centered dialog (600px fixed)

NAVIGATION
< 640px:  Bottom sheet / hamburger menu
1024px+:  Left sidebar + top bar
```

---

## Component Library Checklist

### Core Components (Priority Order)

```
PHASE 1: Foundation (Week 1)
☐ Button (primary, secondary, tertiary, danger variants + all states)
☐ Input Field (text, email, password, with validation states)
☐ Checkbox
☐ Radio Button
☐ Toggle Switch
☐ Link / Text Link

PHASE 2: Containers (Week 2)
☐ Card (basic + elevated + interactive)
☐ Modal / Dialog
☐ Toast / Alert notification
☐ Tooltip
☐ Dropdown / Select

PHASE 3: Navigation (Week 2-3)
☐ Sidebar Navigation
☐ Top Navigation Bar
☐ Tabs
☐ Breadcrumbs
☐ Pagination

PHASE 4: Data Display (Week 3-4)
☐ Table (with sorting, pagination)
☐ List Item
☐ Badge / Tag
☐ Progress Bar
☐ Status Indicator

PHASE 5: Forms & Feedback (Week 4)
☐ Form Group (label + input + helper)
☐ Date Picker
☐ Multi-select
☐ Search Input
☐ Loading Skeleton
☐ Empty State
☐ Error State

PHASE 6: Advanced (Week 5+)
☐ Drag & Drop Container
☐ Collapsible Section / Accordion
☐ Stepper / Progress Steps
☐ Command Palette
☐ Chart Container (wrapper, not the charts themselves)
```

---

## Design Handoff Package

### Deliverables Checklist

```
FOR DEVELOPERS:
☐ Figma component library with all variants
☐ CSS/Tailwind token file
☐ Icon set (SVG format, optimized)
☐ Typography scale (font files or CDN links)
☐ Color palette with contrast verification
☐ Spacing scale documentation
☐ Animation timing functions
☐ Responsive breakpoint values
☐ Dark mode theme variables
☐ Accessibility guidelines checklist

DOCUMENTATION:
☐ Component usage guide (do's/don'ts for each)
☐ Layout pattern examples
☐ State diagrams for complex interactions
☐ Mobile/tablet/desktop screenshots
☐ Animation specifications (duration, easing, distance)
☐ Keyboard navigation diagram
☐ Color blind simulation images
☐ WCAG compliance verification report

TESTING:
☐ Accessibility audit (axe, WAVE, etc.)
☐ Responsive design testing (BrowserStack, etc.)
☐ Color contrast verification (WebAIM)
☐ Performance budget (< 3MB assets per page)
☐ Cross-browser testing (Chrome, Firefox, Safari, Edge)
```

---

## Quick Reference for Designers

### When in Doubt, Default To:

```
SIZE:     Use the standard button height (36px for medium)
SPACING:  Use multiples of 8px (never odd numbers)
COLOR:    Use primary accent sparingly; favor grayscale hierarchy
SHADOW:   Use 0 1px 3px for cards, 0 4px 12px for elevation
WEIGHT:   Use 400 (regular) for body, 600 (semibold) for headers
ALIGN:    Left-align body text, center-align modals/cards
RADIUS:   Use 6px for inputs/buttons, 8px for cards
MARGIN:   Use 16px between sections, 24px for major breaks
OPACITY:  Use full opacity; fade only for disabled/inactive states
```

### Designing for the Gap Analysis Swimlanes

```
6-SWIMLANE COLOR SPECIFICATION (FIXED & REUSABLE)

Position 1: Blue (#0969DA)        → Strategy / Planning
Position 2: Teal (#1A7F64)        → People / Culture
Position 3: Amber (#9E6A03)       → Operations
Position 4: Red (#DA3633)         → Technology
Position 5: Purple (#6F42C1)      → Innovation
Position 6: Cyan (#088395)        → Metrics / KPIs

SWIMLANE CARD DESIGN:
┌─────────────────────────┐
│ 🎨 [Color] Swimlane 1   │ ← Header 40px, dark color background
├─────────────────────────┤
│ NOT STARTED            │
│ ┌─────────────────────┐│
│ │ Item 1              ││ ← Cards 32px each
│ │ [Avatar] [Priority] ││
│ └─────────────────────┘│
│ ┌─────────────────────┐│
│ │ Item 2              ││
│ └─────────────────────┘│
├─────────────────────────┤
│ IN PROGRESS            │
│ ┌─────────────────────┐│
│ │ Item 3 (50%)       ││ ← Progress bar
│ └─────────────────────┘│
├─────────────────────────┤
│ COMPLETE               │
│ ✓ Item 4               │ ← Checkmark, strikethrough
│ ✓ Item 5               │
└─────────────────────────┘

Spacing: 8px between items within section, 12px between section headers
Drag-and-drop enabled for reordering both within and across swimlanes
Color persists even when swimlane item is moved
```

---

## Color Blind Safe Palette

### Testing Across Color Vision Deficiencies

```
VERIFY THESE COMBINATIONS WITH COLOR BLINDNESS SIMULATOR:

Deuteranopia (Red-Green, ~1% male population):
  ✓ Blue & Yellow combinations safe
  ✓ Avoid: Red + Green, Red + Brown
  🔄 Recommendation: Add icons/patterns to distinguish colors

Protanopia (Red-Green variant):
  ✓ Blue & Yellow safe
  ✓ Avoid: Red + Black together
  
Tritanopia (Blue-Yellow, rare):
  ✓ Red & Cyan safe
  ✓ Avoid: Blue + Yellow
  
MISSION CONTROL SAFE COMBINATIONS:
- Accent Blue (#0969DA) + Gray: ✓ Safe across all types
- Success Green (#1A7F64) + add ✓ icon: ✓ Safe with icon support
- Warning Amber (#9E6A03) + add ⚠️ icon: ✓ Safe with icon support
- Error Red (#DA3633) + add ✗ icon: ✓ Safe with icon support

BEST PRACTICE:
Never rely on color alone. Always pair with:
- Icons (checkmark, warning, etc.)
- Text labels
- Patterns (stripes, hatching)
- Position/hierarchy cues
```

---

This visual reference guide complements the main design system document with quick lookups, dimensional specifications, and visual grids for rapid design implementation.
