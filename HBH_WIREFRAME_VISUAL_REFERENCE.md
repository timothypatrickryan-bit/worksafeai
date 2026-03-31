# Home Builder Helper — Detailed Wireframe Visual Reference

**Document:** Wireframe Sketches & Layout Details  
**Created:** March 30, 2026  
**For:** High-Fidelity Design Phase

---

## Visual Hierarchy Reference

### Primary Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
│  [Logo] Home Builder Helper  [Search] [Notifications] [Menu] │
├──────────────────────────────────────────────────────────────┤
│  Left Sidebar (Sticky)      │  Main Content Area             │
│  ─────────────────────────  │  ──────────────────────────    │
│                             │                                │
│  [Dashboard]               │  PROJECT DASHBOARD             │
│  [Rooms]                   │  ┌────────────────────────────┐│
│  [Decisions]               │  │ 🏠 My Dream House          ││
│  [Timeline]                │  │ Austin, TX • In Progress   ││
│  [Team]                    │  │ Started: Mar 15, 2026      ││
│  [Budget]                  │  │                            ││
│  [Documents]               │  │ STATUS CARDS               ││
│  [Settings]                │  │ ┌──────────┬──────────────┐││
│  [Help/FAQs]               │  │ │ Decisions│  Budget Used ││
│                             │  │ │ 38/120   │  $45K/$250K  ││
│  ─────────────────────────  │  │ └──────────┴──────────────┘││
│  📌 QUICK ACCESS           │  │                            ││
│  · Kitchen Decisions (5)   │  │ TIMELINE VIEW              ││
│  · Pending Approval (3)    │  │ [Design Phase in Progress] ││
│  · Overdue Items (0)       │  │ [Construction Starts Apr16]││
│  · New Feedback (2)        │  │                            ││
│                             │  │ RECENT ACTIVITY            ││
│                             │  │ · Sarah: Approved kitchen  ││
│                             │  │ · James: Commented on bath││
│                             │  └────────────────────────────┘│
│                             │                                │
│                             │  [View Full Timeline]          │
│                             │  [View All Activities]         │
│                             │                                │
├────────────────────────────┴────────────────────────────────┤
│  FOOTER: © 2026 Home Builder Helper | Terms | Privacy        │
└──────────────────────────────────────────────────────────────┘
```

---

## Screen Layouts (Detailed Grid)

### Layout 1: Room-Based Grid View

```
┌────────────────────────────────────────────────────────────┐
│ MY HOUSE LAYOUT                                            │
│ [Edit] [View Photos] [Share] [Timeline View]              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────┬────────────────┐                      │
│  │  MASTER        │  MASTER        │                      │
│  │  BEDROOM       │  BATHROOM      │                      │
│  │                │                │                      │
│  │  8/12 Done     │  4/6 Done      │                      │
│  │  [67%]███░     │  [67%]███░     │                      │
│  │                │                │                      │
│  │  Progress      │  Progress      │                      │
│  │  Next: Flooring│ Next: Fixtures│                      │
│  │                │                │                      │
│  │ [View Details] │ [View Details] │                      │
│  └───────┬────────┴────────┬───────┘                      │
│          │                 │                              │
│  ┌───────┴─────────────────┴───────┐                      │
│  │      CLOSET                     │                      │
│  │      2/3 Done (67%)  [View]     │                      │
│  └───────┬─────────────────────────┘                      │
│          │                                                │
│  ┌───────┴─────────────────────────────────────────┐     │
│  │  KITCHEN / DINING                              │     │
│  │                                                 │     │
│  │  11/18 Done [61%]████████░░░░░░░░░░░░       │     │
│  │  [View Details] [Add Decisions]              │     │
│  └─────────────────────────────────────────────────┘     │
│                                                            │
│  ┌───────────────────────────────────────────────────┐   │
│  │  LIVING ROOM / ENTRY                             │   │
│  │  7/9 Done [78%]██████████░                       │   │
│  │  [View Details] [Add Decisions]                  │   │
│  └───────────────────────────────────────────────────┘   │
│                                                            │
│  ┌───────────────────────────────────────────────────┐   │
│  │  BEDROOM 2                                        │   │
│  │  3/8 Done [38%]███░░░░░░                         │   │
│  │  [View Details] [Add Decisions]                  │   │
│  └───────────────────────────────────────────────────┘   │
│                                                            │
│  [+ Add Room] [Reorganize Layout] [Print Layout]         │
└────────────────────────────────────────────────────────────┘
```

---

### Layout 2: Decision Detail Page (Full Width)

```
┌──────────────────────────────────────────────────────────────┐
│ KITCHEN & DINING                                             │
│ [← Back] [Room Photos] [Share] [Print] [Export]             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ OVERALL PROGRESS: 11/18 Decisions                        ││
│ │ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 61%││
│ │                                                          ││
│ │ PHASE DEPENDENCY: Design Phase → Construction Phase    ││
│ │ Status: Decisions Due Apr 15 (12 days remaining)        ││
│ │ Impact: 6 decisions unfinalized, may delay construction ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ COMPLETED DECISIONS (6)                                      │
│ ────────────────────────────────────────────────────────    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 1. LAYOUT: Galley with Island                        │  │
│ │    ✓ Status: Final                                  │  │
│ │                                                      │  │
│ │    Sketch/Plan: [📸 View] [📋 Details] [📝 Notes]  │  │
│ │                                                      │  │
│ │    Confirmed by: Architect James (Mar 18)           │  │
│ │    Impact: Opens up dining area, improves flow      │  │
│ │                                                      │  │
│ │    [Edit Decision] [Remove] [Share for Review]      │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 2. COUNTERTOPS: Quartz (White Storm)                │  │
│ │    ✓ Status: Final                                  │  │
│ │                                                      │  │
│ │    Selected Option: White Storm Quartz (engineered) │  │
│ │    Dimensions: 42 linear feet                       │  │
│ │                                                      │  │
│ │    💰 VENDOR QUOTES:                                │  │
│ │    • ABC Surfaces: $4,200 (14-day lead) ✓ Selected │  │
│ │    • XYZ Stone: $4,500 (10-day lead)               │  │
│ │    • Granite Masters: $6,200 (21-day lead)         │  │
│ │                                                      │  │
│ │    Decision made: Mar 25 by Sarah                   │  │
│ │    Budget impact: +$4,200 (within budget)          │  │
│ │    Timeline impact: Adds 14 days after finalize    │  │
│ │                                                      │  │
│ │    [📸 Photos] [💬 Comments] [Edit] [Remove]       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ [Show 4 more completed decisions...]                        │
│                                                              │
│ PENDING DECISIONS (5) — ATTENTION NEEDED                    │
│ ────────────────────────────────────────────────────────    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ → FLOORING: Wood or Tile?                           │  │
│ │    ⚠ Due: April 10 (9 days remaining)              │  │
│ │    Priority: HIGH (impacts timeline)                │  │
│ │                                                      │  │
│ │    OPTION A: Oak Hardwood                           │  │
│ │    ├ Cost: $6,000 | Install: 5 days               │  │
│ │    ├ Warmth: ★★★★★ | Durability: ★★★★☆           │  │
│ │    └ Quote from ABC Floors (5-day lead)            │  │
│ │                                                      │  │
│ │    OPTION B: Porcelain Tile (RECOMMENDED)          │  │
│ │    ├ Cost: $3,500 | Install: 7 days               │  │
│ │    ├ Warmth: ★☆☆☆☆ | Durability: ★★★★★           │  │
│ │    ├ Quote from ABC Tile ($3,200 alt quote)       │  │
│ │    └ Matches modern style direction                │  │
│ │                                                      │  │
│ │    FAMILY INPUT:                                    │  │
│ │    Sarah: "Love warmth of oak" ♥                   │  │
│ │    James: "Tile easier to clean" ♥                 │  │
│ │    Mark (Mom): "Go with durability"                │  │
│ │                                                      │  │
│ │    [View Full Comparison] [View Inspiration Board]  │  │
│ │    [Start Discussion] [Request Votes]               │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ → CABINET HARDWARE: (Due: April 15)                │  │
│ │    Not started • Medium Priority                    │  │
│ │    [View Options] [Get Quotes] [Add Inspiration]    │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ○ BACKSPLASH: Optional Feature                      │  │
│ │    Not started • Low Priority                       │  │
│ │    Recommended timing: After counters finalized     │  │
│ │    [View Options] [Skip for Now]                    │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ [Show 2 more pending decisions...]                         │
│                                                              │
│ ────────────────────────────────────────────────────────    │
│ [+ Add New Decision] [Download Summary] [Export to PDF]    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Layout 3: Timeline/Gantt View

```
┌─────────────────────────────────────────────────────────────┐
│ PROJECT TIMELINE                                            │
│ [Linear View] [Gantt View] [Milestones] [Export Schedule] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ FILTER BY: [All Phases] [Design] [Construction] [Finishing]│
│ SHOW:      [Milestones] [Critical Path] [Dependencies]    │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│ MARCH         APRIL                  MAY           JUNE   │
│ 28 29 30 31 | 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 | ...  │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ DESIGN PHASE ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│ ▓ Work       ░ Remaining                      55% Complete│
│ Start: Mar 15     Target: Apr 15                          │
│ ├─ [✓] Floor Plans Finalized (Mar 18)                   │
│ ├─ [✓] Style Direction (Mar 22)                         │
│ ├─ [→] Kitchen Decisions (Due Apr 10)                   │
│ ├─ [→] Bathroom Selections (Due Apr 12)                 │
│ ├─ [→] Color Palette (Due Apr 14)                       │
│ └─ [→] Electrical/MEP Rough-in Review (Due Apr 15)     │
│                                                             │
│ CONSTRUCTION PHASE ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ ░ Not Yet Started                           0% Complete   │
│ Planned Start: Apr 16     Target: Jul 15                  │
│                                                             │
│ ├─ Foundation & Site Work (Apr 16 - May 3)               │
│ │  └─ Estimate: 10 calendar days, 40 work hours         │
│ │     [Dependencies: None - can start immediately]       │
│ │                                                          │
│ ├─ Framing & Rough-in (May 4 - Jun 2)                   │
│ │  └─ Estimate: 20 calendar days, 80 work hours         │
│ │     [Depends on: Foundation complete]                  │
│ │                                                          │
│ ├─ MEP Installation (May 4 - Jun 9)                      │
│ │  └─ Estimate: 25 calendar days (runs parallel)         │
│ │     [Depends on: Electrical/MEP decisions finalized]   │
│ │                                                          │
│ ├─ Drywall & Interior (Jun 10 - Jun 28)                 │
│ │  └─ Estimate: 15 calendar days                        │
│ │     [Depends on: MEP rough-in complete]                │
│ │                                                          │
│ └─ Finishes (Jun 29 - Jul 15)                            │
│    └─ Estimate: 12 calendar days                        │
│       [Depends on: All selections finalized]             │
│                                                             │
│ FINISHING PHASE ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░ Not Yet Started                           0% Complete   │
│ Planned Start: Jul 16     Target: Aug 30                  │
│                                                             │
│ ├─ Paint & Wall Finishes (Jul 16 - Jul 25)              │
│ ├─ Cabinet Installation (Jul 26 - Aug 5)                │
│ ├─ Flooring Installation (Aug 6 - Aug 15)               │
│ ├─ Appliance Installation (Aug 16 - Aug 20)             │
│ ├─ Final Fixtures & Hardware (Aug 21 - Aug 25)          │
│ └─ Inspection & Punch List (Aug 26 - Aug 30)            │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│ KEY DATES:                                                  │
│ ✓ Today: Mar 30, 2026                                     │
│ → Design Due: Apr 15 (15 days out)                        │
│ → Construction Starts: Apr 16 (16 days out)              │
│ ⚠ Critical Path: Flooring decision (affects MEP timing)  │
│                                                             │
│ [View Slack] [Print Schedule] [Export to Calendar]         │
│ [Adjust Timeline] [Add Milestone] [Set Alerts]            │
└─────────────────────────────────────────────────────────────┘
```

---

### Layout 4: Comparison Matrix

```
┌─────────────────────────────────────────────────────────────┐
│ COMPARE OPTIONS: KITCHEN FLOORING                           │
│ [Add Option] [Add Custom Criteria] [Export Comparison PDF] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    OAK      │    TILE   │    VINYL          │
│                   HARDWOOD  │ PORCELAIN │   LUXURY          │
│ ─────────────────────────────────────────────────────────  │
│ IMAGE/SAMPLE     [Oak Photo]│ [Tile Ph] │ [Vinyl Photo]    │
│                                                             │
│ COST              $6,000     │  $3,500   │  $2,200          │
│ sq/ft installed   $42        │  $25      │  $15             │
│                                                             │
│ INSTALL TIME      5 days     │  7 days   │  3 days          │
│ LEAD TIME         5 days     │  14 days  │  7 days          │
│ TOTAL TIMELINE    10 days    │  21 days  │  10 days         │
│                                                             │
│ DURABILITY        ★★★★☆    │ ★★★★★   │ ★★★☆☆           │
│ WATER RESISTANT   Low        │  Excellent│  Excellent       │
│ SCRATCH PRONE     High       │  Low      │  Medium          │
│ MAINTENANCE       High       │  Low      │  Low             │
│                                                             │
│ AESTHETIC         Warm,      │  Modern,  │  Modern,         │
│                   Traditional│  Cool     │  Plastic feel    │
│ STYLE MATCH       ★★☆☆☆    │ ★★★★★   │ ★★★☆☆           │
│                                                             │
│ RESALE VALUE      High       │  High     │  Medium          │
│ LONGEVITY         15-25 yrs  │  25+ yrs  │  10-15 yrs       │
│                                                             │
│ ECO-FRIENDLY      ◑ (Natural)│ ◑ (Mixed) │ ◑ (Plastic)      │
│                                                             │
│ VENDOR QUOTES:                                              │
│ Option 1:         ABC Floors │ ABC Tile  │ XYZ Vinyl        │
│ Price:            $6,000     │  $3,200   │  $2,000          │
│ Lead Time:        5 days     │  14 days  │  3 days          │
│ Status:           Available  │ Available │  Available       │
│ Contact:          [View]     │  [View]   │  [View]          │
│                                                             │
│ Option 2:         XYZ Wood   │ Tile Mas. │  (No other)      │
│ Price:            $5,800     │  $3,500   │                  │
│ Lead Time:        2 weeks    │  21 days  │                  │
│ Status:           Backorder  │ Available │                  │
│ Contact:          [View]     │  [View]   │                  │
│                                                             │
│ FAMILY VOTING:                                              │
│ Sarah (Wife):     ♥♥♥ (3/5)  │ ♥♥ (2/5)  │ ♥ (1/5)         │
│ James (Husband):  ♥ (1/5)    │ ♥♥♥♥ (4/5)│ ♥♥ (2/5)        │
│ Mark (Advisor):   ♥♥ (2/5)   │ ♥♥♥ (3/5) │ ♥♥ (2/5)        │
│                                                             │
│ COMMENTS:                                                   │
│ Sarah: "Love the warmth, but worried about maintenance"    │
│ James: "Tile is perfect for a modern kitchen"              │
│ Mark: "Vinyl won't last 25 years, avoid"                   │
│                                                             │
│ SCORING (Weighted by Importance):                           │
│ Durability (30%):    Oak: 2.7 | Tile: 3.0 | Vinyl: 1.5    │
│ Cost (20%):          Oak: 1.0 | Tile: 2.0 | Vinyl: 3.0    │
│ Timeline (15%):      Oak: 2.7 | Tile: 1.5 | Vinyl: 3.0    │
│ Aesthetics (20%):    Oak: 3.0 | Tile: 3.0 | Vinyl: 2.0    │
│ Maintenance (15%):   Oak: 1.5 | Tile: 3.0 | Vinyl: 2.5    │
│                                                             │
│ TOTAL SCORE:         Oak: 2.3 | Tile: 2.6 | Vinyl: 2.2    │
│ RECOMMENDATION:      🏆 Porcelain Tile (Best value)       │
│                                                             │
│ [Finalize Selection] [Request More Quotes] [Export PDF]    │
│ [Continue Comparing] [Add New Option]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Layout 5: Mobile View (iPhone 12)

```
┌────────────────────────────────────┐
│ 📍 Home Builder Helper             │
│ ─────────────────────────────────  │
│                                    │
│ 🏠 MY DREAM HOUSE                  │
│ Austin, TX • In Progress           │
│                                    │
│ STATUS                             │
│ 38/120 Decisions (32%)             │
│ ████████░░░░░░░░░░░░░░░░░░       │
│                                    │
│ PHASE PROGRESS                     │
│ ▓▓ DESIGN (In Progress)            │
│   ████████░░░░░░░░░░░░░░░░░░     │
│   Due: Apr 15 (12 days left)       │
│                                    │
│ ░░░ CONSTRUCTION (Apr 16)          │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                    │
│ ─────────────────────────────────  │
│                                    │
│ 🎯 NEXT STEPS                      │
│ [→] Kitchen Flooring (Due Apr 10)  │
│ [→] Cabinet Hardware (Due Apr 15)  │
│ [→] Bathroom Fixtures (Due Apr 12) │
│                                    │
│ ─────────────────────────────────  │
│                                    │
│ 💬 RECENT ACTIVITY                 │
│ Sarah: Approved cabinet style      │
│ 3h ago                             │
│                                    │
│ James: Commented on bathroom       │
│ 1d ago                             │
│                                    │
│ ─────────────────────────────────  │
│ [≡ Menu] [Dashboard] [Rooms]       │
│         [Decisions] [Timeline]     │
│         [Team] [Budget]            │
└────────────────────────────────────┘
```

---

## Component States

### Decision Card States

**Completed State:**
```
┌─────────────────────────────────┐
│ ✓ COUNTERTOPS                   │
│ ✓ Quartz (White Storm)          │
│                                 │
│ Vendor: ABC Surfaces            │
│ Price: $4,200                   │
│ Timeline: 14 days lead          │
│                                 │
│ Status: FINAL                   │
│ Decision by: Sarah (Mar 25)      │
│                                 │
│ [View] [Edit] [Share]           │
└─────────────────────────────────┘
```

**Pending State:**
```
┌─────────────────────────────────┐
│ → FLOORING                      │
│ ⚠ Due: April 10 (9 days)       │
│                                 │
│ Status: DECIDING                │
│ Priority: HIGH                  │
│                                 │
│ Comparing: Oak vs Tile          │
│ Votes: Sarah (Oak), James (Tile)│
│ Need: Final decision            │
│                                 │
│ [View Options] [Start Vote]     │
└─────────────────────────────────┘
```

**Blocked State:**
```
┌─────────────────────────────────┐
│ 🔒 APPLIANCES                   │
│ ⏳ Waiting on Cabinet Design    │
│                                 │
│ Status: BLOCKED                 │
│ Blocked by: Cabinet Hardware    │
│ (Due: April 15)                 │
│                                 │
│ Once cabinets finalized,        │
│ can proceed with appliances     │
│                                 │
│ [View Blocker] [Notify]         │
└─────────────────────────────────┘
```

---

## Color Application Examples

### Status Indicator Bar

```
Design Phase: #2D7A3F (Brand Green) — Active/In Progress
Construction: #9CA3AF (Gray) — Not Started
Finishing: #9CA3AF (Gray) — Pending

When Complete: ✓ #10B981 (Success Green)
When Overdue: ⚠ #F97316 (Warning Orange)
When Blocked: 🔒 #EF4444 (Error Red)
```

### Text Hierarchy Example

```
┌─────────────────────────────────────────────┐
│ KITCHEN & DINING                      32pt  │ H1
├─────────────────────────────────────────────┤
│                                             │
│ Progress: 11/18 Decisions              24pt │ H2
│ ████████████░░░░░░░░░░░░░░░░░░░░░    14pt │ Body
│                                             │
│ COMPLETED DECISIONS (6)                18pt │ H3
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  14pt │
│                                             │
│ ✓ Countertops: Quartz (White Storm)  16pt │ Body Large
│   Vendor: ABC Surfaces • $4,200        14pt │ Body
│   Timeline: 14 days lead               12pt │ Small
│   Finalized: March 25 by Sarah         12pt │ Small
│                                             │
└─────────────────────────────────────────────┘
```

---

## Interactive States

### Button States

```
PRIMARY ACTION BUTTON (Save, Confirm)
─────────────────────────────────────

[Default]
┌─────────────────────────┐
│ SAVE DECISION           │
│ Background: #0066CC     │
│ Text: White             │
└─────────────────────────┘

[Hover]
┌─────────────────────────┐
│ SAVE DECISION           │
│ Background: #0052A3     │ (Darker)
│ Text: White             │
│ Shadow: Elevated        │
└─────────────────────────┘

[Active/Pressed]
┌─────────────────────────┐
│ SAVE DECISION           │
│ Background: #003D7A     │ (Even darker)
│ Text: White             │
└─────────────────────────┘

[Disabled]
┌─────────────────────────┐
│ SAVE DECISION           │
│ Background: #D1D5DB     │ (Grayed)
│ Text: #9CA3AF           │ (Grayed)
│ Cursor: not-allowed     │
└─────────────────────────┘

[Loading]
┌─────────────────────────┐
│ ⟳ SAVING...             │
│ Background: #0066CC     │
│ Text: White (spinner)   │
└─────────────────────────┘
```

### Card Hover States

```
[Default]
┌──────────────────────────┐
│ Kitchen & Dining         │
│ 11/18 decisions          │
│ [67%]████████░░░░░░     │
└──────────────────────────┘

[Hover]
┌──────────────────────────┐
│ Kitchen & Dining         │
│ 11/18 decisions          │
│ [67%]████████░░░░░░     │
│                          │
│ Shadow: Elevated         │
│ Transform: Scale 1.02    │
│ Cursor: Pointer          │
└──────────────────────────┘
(Slight lift, increased shadow)
```

---

## Data Visualization Examples

### Progress Ring (Circular Progress)

```
        Design Phase
       ┌──────────────┐
      ╱   55% Done    ╲
    ╱                    ╲
   │      ▓▓▓▓▓▓▓       │
   │     ▓▓▓▓▓▓▓▓▓     │
   │    ▓▓▓▓▓▓░░░░░    │
   │   ▓▓▓▓▓░░░░░░░░   │
   │   ▓▓▓▓░░░░░░░░░   │
   │    ▓▓▓░░░░░░░░░    │
   │     ▓▓░░░░░░░░     │
   │      ░░░░░░░░░      │
    ╲                    ╱
      ╲  Due: Apr 15   ╱
       └──────────────┘

Green ring = completed
Gray ring = remaining
```

### Timeline Mini Map

```
MAR            APR            MAY            JUN
│              │              │              │
├──────────────┤              │              │
│ DESIGN       │              │              │
│ ▓▓▓▓▓▓░░░░  │              │              │
│              ├──────────────────────────────┤
│              │ CONSTRUCTION                 │
│              │ ░░░░░░░░░░░░░░░░░░░░░░░░    │
│              │                              │
│              ├──────────────────────┤       │
│              │ FINISHING             │     │
│              │ ░░░░░░░░░░░░░░░░░░░  │     │
│              │                       ├─────┤

Colored blocks show phase overlap and dependencies
```

---

## Annotation Guide (For Developer Handoff)

### Example: Kitchen Decision Card

```
┌────────────────────────────────────────┐
│ ✓ COUNTERTOPS              ←─┐         │
│ ✓ Quartz (White Storm)       │ H3: 18px
│                              │ Semi-bold
│ Vendor: ABC Surfaces         │
│ Price: $4,200                ├─ Body: 14px
│ Timeline: 14 days            │ Regular text
│                              │
│ Status: FINAL                │
│ Decision by: Sarah (Mar 25)  ├─ Small: 12px
│                              │ Secondary text
│ [View] [Edit] [Share]        ├─ Action buttons
└────────────────────────────────────────┘

Spec Details:
- Card padding: 16px (md)
- Border radius: 8px
- Background: #FFFFFF
- Border: 1px #E5E7EB
- Shadow: subtle (0 1px 3px rgba(0,0,0,0.12))
- Hover state: elevated shadow + 1px border highlight

Interactive elements:
- [View]: Link color #0066CC
- [Edit]: Action button, secondary style
- [Share]: Action button, secondary style
- Status badge: Green background (#10B981), white text
```

---

## Responsive Considerations

### Breakpoints Applied

```
MOBILE (320px - 640px)
├─ Single column layout
├─ Full-width cards
├─ Sticky header with menu icon
├─ Bottom navigation bar
└─ Large touch targets (44px minimum)

TABLET (641px - 1024px)
├─ Two-column layout where applicable
├─ Sidebar collapses to icons
├─ Wider cards for content
└─ Hybrid touch + keyboard navigation

DESKTOP (1025px+)
├─ Three-column layout (sidebar + main + context)
├─ Expanded sidebar with labels
├─ Desktop keyboard shortcuts
└─ Pointer-based interactions
```

### Mobile Navigation Pattern

```
DESKTOP (Sidebar):        MOBILE (Bottom Nav):
┌─────────┐               ┌──────────────────┐
│ ≡       │               │      Content     │
│ ─ Dashboard             │                  │
│ ─ Rooms                 ├──────────────────┤
│ ─ Decisions             │ [◀] [◉] [◀] [☰]  │
│ ─ Timeline              │ Home Menu Search │
│ ─ Team                  │ (4 icons)        │
│ ─ Budget                └──────────────────┘
│ ─ Documents             
└─────────┘               Hamburger menu for secondary
                          navigation (Settings, Help, etc)
```

---

## End of Wireframe Reference

**Next Steps:**
1. Transfer these wireframes into Figma
2. Create component variants for all states
3. Design responsive layouts for all breakpoints
4. Create interactive prototype for key user flows
5. Prepare for developer handoff specifications

**Reference:**
- See `HOME_BUILDER_HELPER_DESIGN_CONCEPTS.md` for full design specifications
- Use this document for layout details and spacing reference
- Component specs locked at Figma component level

---

**Document Version:** 1.0  
**Created:** March 30, 2026  
**Designer:** Lucy
