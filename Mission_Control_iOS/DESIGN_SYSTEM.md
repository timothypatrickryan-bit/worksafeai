# Mission Control iOS – Design System

## Overview
Complete design system for Mission Control iPhone app (iOS 16+). This system ensures consistency, scalability, and native iOS feel across all screens.

---

## 1. SCREEN DIMENSIONS & SAFE AREAS

### iPhone 14+ (Base Design Target)
- **Screen Size:** 390 × 844 (logical points)
- **Physical Resolution:** 1170 × 2532 (3x scale)
- **Safe Areas:**
  - Top: 47pt (notch + status bar)
  - Bottom: 34pt (home indicator)
  - Left/Right: 0pt (full width)

### Usable Canvas
- **Width:** 390pt full-width
- **Content Width:** 350pt (20pt margins left/right)
- **Height (excluding safe areas):** 763pt

---

## 2. COLOR PALETTE

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Navy Base** | `#0F1419` | 15, 20, 25 | Background, deep elements |
| **Navy Dark** | `#1A1F2E` | 26, 31, 46 | Elevated surfaces, cards |
| **Navy Light** | `#2A3142` | 42, 49, 66 | Secondary backgrounds |
| **Navy Lighter** | `#3A4557` | 58, 69, 87 | Borders, subtle dividers |

### Accent Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Success Green** | `#10B981` | 16, 185, 129 | Approve, complete, active |
| **Green Light** | `#34D399` | 52, 211, 153 | Hover states, highlights |
| **Warning Orange** | `#F59E0B` | 245, 158, 11 | In-progress, pending |
| **Error Red** | `#EF4444` | 239, 68, 68 | Error, cancel, delete |
| **Info Blue** | `#3B82F6` | 59, 130, 246 | Information, queued |

### Neutral Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Text Primary** | `#F3F4F6` | 243, 244, 246 | Main text, labels |
| **Text Secondary** | `#9CA3AF` | 156, 163, 175 | Secondary text, hints |
| **Text Tertiary** | `#6B7280` | 107, 114, 128 | Disabled, muted text |
| **Divider** | `#374151` | 55, 65, 81 | Borders, separators |

### Semantic Colors
- **Active Task:** Success Green (`#10B981`)
- **In-Progress Task:** Warning Orange (`#F59E0B`)
- **Queued Task:** Info Blue (`#3B82F6`)
- **Completed Task:** Navy Light (`#2A3142`)
- **Cancelled Project:** Error Red (`#EF4444`)

---

## 3. TYPOGRAPHY

### Font Family
- **Primary:** SF Pro Display (headings, UI)
- **Secondary:** SF Pro Text (body, labels)
- **Monospace:** SF Mono (code, IDs)

### Type Scale

| Usage | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| **Large Title** | SF Pro Display | 34pt | 700 (Bold) | 41pt | -0.5pt |
| **Title 1** | SF Pro Display | 28pt | 700 (Bold) | 34pt | -0.5pt |
| **Title 2** | SF Pro Display | 22pt | 700 (Bold) | 28pt | -0.25pt |
| **Title 3** | SF Pro Display | 20pt | 600 (Semibold) | 25pt | 0pt |
| **Headline** | SF Pro Text | 17pt | 600 (Semibold) | 22pt | -0.41pt |
| **Body** | SF Pro Text | 17pt | 400 (Regular) | 22pt | -0.41pt |
| **Callout** | SF Pro Text | 16pt | 500 (Medium) | 21pt | -0.32pt |
| **Subheadline** | SF Pro Text | 15pt | 400 (Regular) | 20pt | -0.24pt |
| **Caption 1** | SF Pro Text | 13pt | 500 (Medium) | 18pt | -0.08pt |
| **Caption 2** | SF Pro Text | 12pt | 400 (Regular) | 16pt | 0pt |

---

## 4. SPACING & LAYOUT

### Spacing Scale (8pt Base)
```
2pt  = 0.25x
4pt  = 0.5x
8pt  = 1x (base)
12pt = 1.5x
16pt = 2x
20pt = 2.5x
24pt = 3x
32pt = 4x
40pt = 5x
48pt = 6x
```

### Common Spacing Values
- **Screen Margins:** 16pt left/right
- **Card Padding:** 12pt
- **Section Spacing:** 24pt
- **Element Spacing:** 8pt-12pt
- **Tab Bar Height:** 50pt
- **Header Height:** 56pt

---

## 5. COMPONENT FOUNDATION

### Border Radius
| Size | Usage |
|------|-------|
| **4pt** | Subtle, buttons, small elements |
| **8pt** | Standard, cards, inputs |
| **12pt** | Large, full-width sheets |
| **20pt** | Extra large, hero elements |

### Shadows & Elevation

**Surface Elevation (z-axis):**
```
Elevation 1: 0pt 1pt 3pt rgba(0,0,0,0.12)
Elevation 2: 0pt 4pt 6pt rgba(0,0,0,0.15)
Elevation 3: 0pt 8pt 12pt rgba(0,0,0,0.18)
Elevation 4: 0pt 12pt 24pt rgba(0,0,0,0.20)
```

**Blur & Vibrancy:**
- Modal overlays: 20pt blur, 40% opacity black
- Glassmorphism (optional for future): 10pt blur, 20% opacity white

---

## 6. ICON SYSTEM

### Icon Library
- **Source:** SF Symbols 5 (native iOS icons)
- **Sizes:** 16pt, 20pt, 24pt, 32pt (Figma) or nominal sizes in code
- **Weight:** Regular (most), Medium (emphasized)
- **Color:** Text Primary or Accent colors

### Common Icons
| Icon | Usage |
|------|-------|
| `checkmark.circle.fill` | Approved, completed |
| `clock.fill` | In-progress, pending |
| `xmark.circle.fill` | Cancelled, error |
| `plus.circle.fill` | Add actions |
| `chevron.right` | Navigation, disclosure |
| `chevron.down` | Expand, collapse |
| `line.3.horizontal` | Menu |
| `bell.fill` | Notifications, inbox |
| `trash.fill` | Delete actions |
| `square.and.pencil` | Edit actions |

---

## 7. BUTTON STYLES

### Primary Button
```
Background: Success Green (#10B981)
Text: Text Primary (#F3F4F6), 17pt Semibold
Height: 48pt minimum
Padding: 12pt vertical, 16pt horizontal
Border Radius: 8pt
Shadow: Elevation 1
States:
  - Default: Full color
  - Pressed: Green Light (#34D399)
  - Disabled: Gray (#6B7280), 50% opacity
```

### Secondary Button
```
Background: Navy Light (#2A3142)
Text: Text Primary (#F3F4F6), 17pt Semibold
Border: 1pt Divider (#374151)
Height: 44pt minimum
Padding: 10pt vertical, 14pt horizontal
Border Radius: 8pt
States:
  - Default: Full color
  - Pressed: Navy Lighter (#3A4557)
  - Disabled: Gray (#6B7280), 50% opacity
```

### Tertiary / Ghost Button
```
Background: Transparent
Text: Text Primary (#F3F4F6), 17pt Semibold
Height: 44pt
Padding: 10pt vertical, 14pt horizontal
States:
  - Default: Transparent
  - Pressed: Navy Light (#2A3142), 30% opacity
  - Disabled: Text Tertiary (#6B7280), 50% opacity
```

### Destructive Button
```
Background: Error Red (#EF4444)
Text: Text Primary (#F3F4F6), 17pt Semibold
Height: 48pt
Padding: 12pt vertical, 16pt horizontal
Border Radius: 8pt
States:
  - Default: Full red
  - Pressed: Darker red
```

---

## 8. CARD STYLES

### Project Card
```
Background: Navy Dark (#1A1F2E)
Border: 1pt Divider (#374151)
Border Radius: 12pt
Padding: 12pt
Margin Bottom: 12pt
States:
  - Default: Subtle shadow (Elevation 1)
  - Pressed: Navy Lighter (#3A4557), 10% opacity increase
```

### Task Card
```
Background: Navy Dark (#1A1F2E)
Border: 1pt Divider (#374151)
Border Radius: 8pt
Padding: 12pt
Height: 60pt minimum
Swipe Actions: Edit (Blue), Delete (Red)
```

### Message Card
```
Background: Navy Dark (#1A1F2E)
Border: None
Border Radius: 8pt
Padding: 12pt
Height: 56pt minimum
Swipe Action: Delete (Red)
```

---

## 9. MODAL & SHEET STYLES

### Bottom Sheet
```
Background: Navy Dark (#1A1F2E)
Top Corner Radius: 20pt
Padding: 16pt
Handle Bar: 4pt × 40pt, Navy Light (#2A3142), top 8pt
Safe Area Bottom: 34pt padding
Drag Dismiss: Yes
Swipe Distance: 30% of height
```

### Full-Screen Modal
```
Background: Navy Base (#0F1419)
Header: Navy Dark (#1A1F2E), 56pt height
Safe Areas: Full compliance
Close Button: Top-left or dismiss swipe
```

### Overlay
```
Background: Black, 40% opacity
Blur: 20pt backdrop blur
Tappable to dismiss: Yes (for modals)
```

---

## 10. TAB BAR & NAVIGATION

### Bottom Tab Bar
```
Background: Navy Dark (#1A1F2E)
Height: 50pt + 34pt safe area
Border Top: 1pt Divider (#374151)
Tab Height: 50pt
Tab Items: 3-5 items (6pt spacing between)
Icon Size: 24pt
Label Size: 12pt, 500 Weight
Label Color: Text Secondary (#9CA3AF)
Active Tab: Icon + Label in Success Green (#10B981)
Inactive Tab: Text Secondary (#9CA3AF)
```

### Horizontal Scroll Tabs (In-View)
```
Height: 40pt
Font: Callout (16pt, 500 weight)
Padding: 12pt horizontal per tab
Underline: 3pt Success Green, full width of active tab
Scroll: Horizontally bouncy, snaps to tabs
Active: Text Primary (#F3F4F6)
Inactive: Text Secondary (#9CA3AF)
```

---

## 11. FORM INPUTS

### Text Input
```
Background: Navy Light (#2A3142)
Border: 1pt Divider (#374151)
Border Radius: 8pt
Padding: 12pt
Font: Body (17pt)
Text Color: Text Primary (#F3F4F6)
Placeholder: Text Tertiary (#6B7280), 50% opacity
Height: 44pt minimum
States:
  - Default: Navy Light
  - Focused: Navy Lighter, border Success Green
  - Filled: Navy Light, Text Primary
  - Disabled: Navy Light, 50% opacity
```

### Picker / Dropdown
```
Background: Navy Light (#2A3142)
Border: 1pt Divider (#374151)
Border Radius: 8pt
Padding: 12pt
Height: 44pt
Icon: chevron.down, Text Secondary
Selection: Inline picker or modal list
```

### Toggle / Switch
```
Size: 51pt × 31pt (standard iOS)
On Color: Success Green (#10B981)
Off Color: Navy Light (#2A3142)
Thumb: Text Primary (#F3F4F6)
```

---

## 12. PROGRESS INDICATORS

### Progress Bar
```
Background: Navy Light (#2A3142)
Fill: Success Green (#10B981)
Height: 4pt
Border Radius: 2pt
Width: Full width of parent container
```

### Circular Progress
```
Background: Navy Light (#2A3142), 30% opacity
Fill: Success Green (#10B981)
Size: 24pt-40pt (varies by context)
Border Width: 2pt-3pt
```

### Status Badge
```
Background: Semantic color (green, orange, blue, red)
Text: Text Primary (#F3F4F6), 11pt, 600 weight
Padding: 4pt horizontal, 2pt vertical
Border Radius: 4pt
```

---

## 13. ANIMATION & TRANSITIONS

### Standard Timings
```
Quick: 150ms (button press, toggle)
Normal: 300ms (sheet open, view transition)
Slow: 450ms (hero animations, complex layouts)
```

### Easing Curves
```
Standard: ease-in-out (cubic-bezier(0.4, 0, 0.2, 1))
Entrance: ease-out (cubic-bezier(0, 0, 0.2, 1))
Exit: ease-in (cubic-bezier(0.4, 0, 1, 1))
```

### Common Interactions
- **Tap Feedback:** Scale 0.98 + haptic light
- **Swipe Dismiss:** Velocity-based, parallax reveal
- **Pull-to-Expand:** Smooth ease-out
- **Tab Change:** Crossfade + underline animation
- **Bottom Sheet:** Spring animation from bottom

---

## 14. ACCESSIBILITY

### Touch Targets
- **Minimum:** 44pt × 44pt
- **Preferred:** 48pt × 48pt
- **Spacing:** 8pt minimum between targets

### Contrast Ratios
- Text Primary on Navy Base: 11.5:1 (WCAG AAA)
- Text Secondary on Navy Base: 4.8:1 (WCAG AA)
- Text Tertiary on Navy Base: 3.2:1 (WCAG A, avoid critical info)

### VoiceOver Support
- All interactive elements: Labeled
- Custom actions: Defined (swipe, delete, etc.)
- Semantic markup: Correct heading levels, lists
- Focus order: Logical, top-to-bottom, left-to-right

### Haptics
- Light: Button press, simple feedback
- Medium: Confirmation, significant action
- Heavy: Error, deletion, critical action
- Selection: Subtle, detail changes

---

## 15. RESPONSIVE VARIANTS

### iPad (Future)
- Landscape layout: 2-column grid for projects
- Sidebar navigation: Optional
- Larger touch targets: 48pt minimum
- Typography: Same scale (native auto-scaling)

### Safe Area Adaptations
- Notch/Dynamic Island: 47pt top safe area
- Home Indicator: 34pt bottom safe area
- Used in all screens: Consistent insets

---

## Dark Mode Only

This design system assumes **Dark Mode only** (iOS 13+). Light mode is not supported in v1.

---

## File Structure (Figma)

```
Mission Control iOS
├── 🎨 Design System
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Shadows
├── 🧩 Components
│   ├── Buttons (Primary, Secondary, Tertiary, Destructive)
│   ├── Cards (Project, Task, Message)
│   ├── Modals (Bottom Sheet, Full-Screen, Overlay)
│   ├── Tabs (Bottom Bar, Horizontal Scroll)
│   ├── Inputs (Text, Picker, Toggle)
│   ├── Progress (Bar, Circular, Badge)
│   └── Icons
├── 📱 Screens
│   ├── 1. Portfolio View
│   ├── 2. Project Detail View
│   ├── 3. Briefing Approval Modal
│   ├── 4. Inbox View
│   └── 5. Task Creation Sheet
└── 📊 Before/After
    └── Web vs. Mobile Comparison
```

---

**Last Updated:** 2026-03-18  
**Design Version:** 1.0  
**Platform:** iOS 16+ (iPhone 14+)
