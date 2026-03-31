# Home Builder Helper — Design Concepts & Wireframes

**Project:** Home Builder Helper  
**Created:** March 30, 2026  
**Designer:** Lucy  
**Status:** Concept Phase Complete  
**Timeline:** Due April 6, 2026

---

## 📋 Table of Contents

1. [Product Overview](#product-overview)
2. [Design Principles](#design-principles)
3. [User Research Summary](#user-research-summary)
4. [Information Architecture](#information-architecture)
5. [Design Concepts](#design-concepts)
6. [Wireframes](#wireframes)
7. [Component Library](#component-library)
8. [User Flows](#user-flows)
9. [Design Specifications](#design-specifications)
10. [Next Steps](#next-steps)

---

## Product Overview

**What is Home Builder Helper?**

A web application designed to help homeowners navigate the complexity of building a new house. The product simplifies the overwhelming number of decisions involved in construction by organizing information, tracking progress, and keeping projects on schedule.

### Core Problem

Building a new house involves:
- **100+ major decisions** (materials, colors, layouts, finishes, appliances)
- **Multiple phases** (planning, design, physical construction, finishes)
- **Multiple stakeholders** (owners, architects, contractors, inspectors)
- **Complex timelines** (months-long projects with interdependencies)
- **Paper-based workflows** (plans, spreadsheets, emails, texts)

**Result:** Homeowners feel overwhelmed, lose track of decisions, miss deadlines, and experience high stress.

### Solution

A centralized hub that:
1. **Captures the scope** — Upload plans or complete intake form
2. **Organizes decisions** — By phase, room, category, vendor
3. **Tracks progress** — Visual timeline, checklists, milestones
4. **Facilitates collaboration** — Share with architects, contractors, family
5. **Provides clarity** — One source of truth for all decisions

---

## Design Principles

### 1. **Reduce Cognitive Load**
   - Default to intelligent organization (not blank slate)
   - Show next steps, not all options
   - Progressively disclose complexity

### 2. **Build Confidence**
   - Celebrate progress (completed decisions, milestones)
   - Validate decisions (show status, dependencies)
   - Reduce decision paralysis (good defaults, recommendations)

### 3. **Save Time**
   - Smart forms (conditional fields based on home type/size)
   - Templates (pre-filled decision categories)
   - Quick capture (take photos, voice notes, screenshots)

### 4. **Maintain Flexibility**
   - Adapt to different building phases
   - Support formal and informal workflows
   - Export to contractors' tools (PDFs, schedules)

### 5. **Build Trust**
   - Transparent progress tracking
   - No surprises (show full scope upfront)
   - Professional presentation (can share with contractors)

---

## User Research Summary

### Primary Users

**User Persona: Sarah (35-55, First-Time Home Builder)**
- Building custom home or significant renovation
- High involvement in decisions (wants control)
- Overwhelmed by choices and timeline
- Wants to feel organized and informed
- May lack construction knowledge

**Pain Points:**
- Forgets past decisions
- Loses track of which phase is active
- Can't prioritize decisions by urgency
- Hard to collaborate with spouse/designer
- No visibility into contractor progress

**Goals:**
- Keep all decisions in one place
- Stay on schedule
- Make confident decisions
- Feel organized and in control
- Share progress with family/contractors

### Secondary Users

- **Architects/Designers** — Want to see what homeowner decided, share recommendations
- **Contractors** — Want access to plans and material choices
- **Family Members** — Want to see progress, weigh in on decisions

---

## Information Architecture

### Top-Level Structure

```
HOME BUILDER HELPER
├── Dashboard (Overview)
│   ├── Current Status
│   ├── Next Milestone
│   └── Recent Activity
│
├── House Intake (Setup)
│   ├── Basic Info (location, type, size)
│   ├── Style Profile (modern, traditional, etc.)
│   └── Features Checklist
│
├── Plans & Documents
│   ├── Floor Plans
│   ├── Elevations
│   ├── Specifications
│   └── Vendor Documentation
│
├── Decisions (Core)
│   ├── By Phase
│   │   ├── Design Phase
│   │   ├── Construction Phase
│   │   └── Finishing Phase
│   ├── By Room
│   │   ├── Bedrooms
│   │   ├── Bathrooms
│   │   ├── Kitchen
│   │   └── Living Spaces
│   ├── By Category
│   │   ├── Structural
│   │   ├── Mechanical/Electrical
│   │   ├── Finishes
│   │   └── Appliances
│   └── Decision Tools
│       ├── Options Comparison
│       ├── Budget Tracker
│       └── Visual Inspiration
│
├── Timeline & Milestones
│   ├── Project Timeline
│   ├── Phase Progress
│   ├── Milestone Tracker
│   └── Critical Path
│
├── Team & Collaboration
│   ├── Invite Collaborators
│   ├── Share Documents
│   ├── Comment Threads
│   └── Notifications
│
├── Budget & Vendors
│   ├── Budget Tracker
│   ├── Vendor Directory
│   ├── Quote Management
│   └── Payment Tracking
│
└── Settings & Export
    ├── Profile Settings
    ├── Export to PDF
    ├── Print Ready
    └── Archive/Finish Project
```

---

## Design Concepts

### Concept A: "Command Center" (Dashboard-First)

**Visual Style:** Modern, minimal, data-forward  
**Metaphor:** Control room for a complex project  
**Tone:** Professional, informative, clear

**Key Features:**
- Large overview dashboard with key metrics
- Prominent timeline view (Gantt-style)
- Quick-access decision cards
- Status indicators (complete, pending, blocked)
- Top navigation with persistent search

**Best For:** Homeowners who want a professional, organized feel  
**Pros:** Clear information hierarchy, easy to scan status  
**Cons:** May feel corporate/less warm

---

### Concept B: "Room-Based Navigation" (Spatial Organization)

**Visual Style:** Warm, intuitive, room-focused  
**Metaphor:** Walking through your home  
**Tone:** Friendly, encouraging, collaborative

**Key Features:**
- House layout as primary navigation (visual floor plan clickable)
- Decisions organized by physical room
- Before/after photos tied to rooms
- Style inspiration board per room
- Family input (voting, comments)

**Best For:** Visual thinkers who relate to physical spaces  
**Pros:** Intuitive navigation, emotional connection to home  
**Cons:** Less effective for distributed decisions (structural, MEP)

---

### Concept C: "Decision Journal" (Progressive Narrative)

**Visual Style:** Clean, approachable, story-driven  
**Metaphor:** Living journal of the building process  
**Tone:** Warm, celebratory, narrative-focused

**Key Features:**
- Timeline as primary view (decisions logged chronologically)
- Celebration of completed decisions
- Notes and photos attached to each decision
- "Story so far" narrative
- Phase-based progression (design → construction → finishing)

**Best For:** Homeowners who want to celebrate the journey  
**Pros:** Feels personal, encouraging, archive-worthy  
**Cons:** Less efficient for looking up specific decisions

---

### Concept D: "Checklist Master" (Task-Driven)

**Visual Style:** Minimalist, GTD-inspired, action-focused  
**Metaphor:** Checklist/project management app (Todoist, Asana)  
**Tone:** Efficient, motivating, progress-oriented

**Key Features:**
- Hierarchical checklists (by phase, by room, by category)
- Progress bars and completion percentage
- Due dates and reminders
- Dependency visualization (can't finish kitchen without appliances)
- Export to project management tools

**Best For:** Detail-oriented homeowners who want control  
**Pros:** Familiar paradigm, efficient lookup, clear prioritization  
**Cons:** May feel transactional, less celebration of journey

---

## Recommended Approach: Hybrid Concept

**Blend:** Command Center (Dashboard) + Room-Based (Navigation) + Checklist (Decision Tracking)

This allows:
- **Dashboard view** for executives overview (timeline, budget, milestones)
- **Room-based navigation** for visual decision-making (which room am I thinking about?)
- **Checklist tracking** for granular progress (did we decide on kitchen counters?)
- **Search/filter** for finding specific decisions across all views

---

## Wireframes

### 1. Onboarding Flow

#### Screen 1.1: Welcome & Project Setup

```
┌─────────────────────────────────────┐
│  HOME BUILDER HELPER                │
│  Let's build your home              │
├─────────────────────────────────────┤
│                                     │
│  [Project Name Input]               │
│  "My Dream House"                   │
│                                     │
│  [Location Input]                   │
│  "Austin, TX"                       │
│                                     │
│  Project Type:                      │
│  ○ New Construction                 │
│  ○ Significant Renovation           │
│  ○ Custom Build                     │
│                                     │
│  Estimated Timeline:                │
│  □ 6-12 months                      │
│  □ 12-18 months                     │
│  □ 18+ months                       │
│                                     │
│         [Next: Upload Plans]        │
└─────────────────────────────────────┘
```

#### Screen 1.2: House Profile (Optional)

```
┌─────────────────────────────────────┐
│  HOUSE PROFILE                      │
│  (Optional - speeds up setup)       │
├─────────────────────────────────────┤
│                                     │
│  BASIC INFORMATION                  │
│  Square Footage: [____] sqft        │
│  # of Bedrooms: [2]                 │
│  # of Bathrooms: [2.5]              │
│  # of Floors: [2]                   │
│                                     │
│  STYLE PREFERENCE                   │
│  □ Modern                           │
│  □ Traditional                      │
│  □ Farmhouse                        │
│  □ Contemporary                     │
│                                     │
│  KEY FEATURES                       │
│  □ Open concept kitchen             │
│  □ Master suite                     │
│  □ Home office                      │
│  □ Garage                           │
│                                     │
│  [Create Project]                   │
└─────────────────────────────────────┘
```

---

### 2. Dashboard (Home Screen)

```
┌──────────────────────────────────────────────┐
│ HOME BUILDER HELPER                          │
│ [My Dream House] | [Settings] [Invite]      │
├──────────────────────────────────────────────┤
│                                              │
│  PROJECT STATUS                              │
│  ┌─────────────────────────────┐             │
│  │ 🏠 My Dream House           │             │
│  │ Austin, TX • 3bed 2.5bath   │             │
│  │ Started: March 15, 2026     │             │
│  │ Estimated Completion: Sept  │             │
│  └─────────────────────────────┘             │
│                                              │
│  QUICK STATS                                 │
│  ┌─────────────────┬──────────────────┐     │
│  │ Decisions Made  │ Budget Used      │     │
│  │    38 / 120     │  $45K / $250K    │     │
│  │    [32%]████    │  [18%]███        │     │
│  └─────────────────┴──────────────────┘     │
│                                              │
│  TIMELINE                                    │
│  ┌──────────────────────────────────────┐   │
│  │ DESIGN PHASE (In Progress)           │   │
│  │ ████████░░░░░░░░░ 55%              │   │
│  │ Due: April 15 • 12 days remaining   │   │
│  │                                      │   │
│  │ Next: CONSTRUCTION PHASE             │   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │ Starts: April 16 • 0 days out       │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  NEXT STEPS                                  │
│  ✓ Upload floor plans                      │
│  → Finalize kitchen selections              │
│  → Review electrical layout                 │
│  → Approve exterior colors                  │
│                                              │
│  RECENT ACTIVITY                             │
│  Sarah: Approved kitchen cabinet style      │
│  3 hours ago                                │
│                                              │
│  James: Commented on master bath design     │
│  1 day ago                                  │
│                                              │
│  [Rooms] [Decisions] [Timeline] [Team]      │
│  [Budget] [Documents] [Settings]            │
└──────────────────────────────────────────────┘
```

---

### 3. Room-Based Navigation

#### Screen 3.1: Room Selector (Visual Floor Plan)

```
┌──────────────────────────────────────────┐
│ MY HOUSE LAYOUT                          │
├──────────────────────────────────────────┤
│                                          │
│  [← Back]                [Edit Layout]   │
│                                          │
│  ┌───────────┬───────────┐               │
│  │ MASTER    │ MASTER    │               │
│  │ BED       │ BATH      │               │
│  │ 8/12      │ 4/6       │  ✓ Complete  │
│  │ decisions │ decisions │ ◐ In Progress│
│  └─────┬─────┴─────┬─────┘ ○ Not Started│
│        │ CLOSET    │                     │
│  ┌─────┴───────────┴─────┐               │
│  │  KITCHEN/DINING       │               │
│  │      11/18            │               │
│  │     decisions         │               │
│  └─────────┬─────────────┘               │
│  ┌─────────┴───────────┐                 │
│  │  LIVING / ENTRY     │                 │
│  │        7/9          │                 │
│  │      decisions      │                 │
│  └─────────────────────┘                 │
│                                          │
│  LEGEND:                                 │
│  Tap room to view decisions              │
│  Tap progress bar to add more            │
└──────────────────────────────────────────┘
```

#### Screen 3.2: Room Detail View (Kitchen Example)

```
┌──────────────────────────────────────────┐
│ KITCHEN & DINING                         │
│ [◀ Back] [Share Room] [View Photos]      │
├──────────────────────────────────────────┤
│                                          │
│  PROGRESS: 11/18 decisions (61%)         │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░│   │
│                                          │
│  ✓ COMPLETED DECISIONS (6)              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                          │
│  ✓ Layout: Galley with island           │
│    Decision made: March 18              │
│    Finalized with: Architect James      │
│    [View sketch] [Change]               │
│                                          │
│  ✓ Countertops: Quartz (White Storm)   │
│    Vendor: ABC Surfaces                 │
│    Price: $4,200 | [Photo]              │
│    [Edit] [Remove]                      │
│                                          │
│  → PENDING DECISIONS (5)               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                          │
│  → Flooring Material (due April 10)    │
│    [Not Started] [View Options]         │
│    Note: Affects finish timeline        │
│                                          │
│  → Cabinet Hardware (due April 15)     │
│    [Not Started] [View Inspirations]    │
│                                          │
│  → Backsplash (Optional)                │
│    [Not Started]                        │
│                                          │
│  [+ Add Decision] [Inspiration Board]   │
│  [Timeline] [Budget] [Vendor Info]      │
└──────────────────────────────────────────┘
```

---

### 4. Decision Capture & Management

#### Screen 4.1: Adding a New Decision

```
┌──────────────────────────────────────┐
│ NEW DECISION                         │
│ Kitchen & Dining                     │
├──────────────────────────────────────┤
│                                      │
│ WHAT ARE YOU DECIDING?               │
│ ┌──────────────────────────────────┐ │
│ │ Flooring Material          ▼     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ DECISION OPTIONS                     │
│ ☐ Oak Hardwood (warm, classic)      │
│ ☐ Porcelain Tile (modern, easy care)│
│ ☐ Luxury Vinyl (budget, durable)    │
│ ☐ Concrete (modern, industrial)     │
│ ☐ Radiant Heat + ? (add other)      │
│                                      │
│ PREFERRED OPTION                     │
│ [Porcelain Tile] (Vendors: 3)       │
│                                      │
│ ADD VENDOR QUOTE                     │
│ Company: [ABC Tile Co]              │
│ Price: [$3,500]                     │
│ Timeline: [14 days]                 │
│ [+ Add Another Quote]               │
│                                      │
│ NOTES / INSPIRATION                  │
│ [Photo] [Sketch] [Web Link]         │
│ "Like the sample at mom's house"    │
│                                      │
│ DUE DATE: [April 10, 2026]          │
│ PRIORITY: ◯ Low ◯ Medium ◉ High    │
│ STATUS: ◯ Pending ◉ Deciding        │
│                                      │
│ [Cancel] [Save Decision]            │
└──────────────────────────────────────┘
```

#### Screen 4.2: Decision Comparison Tool

```
┌──────────────────────────────────────┐
│ COMPARE OPTIONS: FLOORING            │
│ [Add Option] [Export Comparison]     │
├──────────────────────────────────────┤
│                                      │
│ ATTRIBUTE    │ OAK      │ TILE       │
│ ─────────────┼──────────┼───────────│
│ Cost         │ $6,000   │ $3,500    │
│ Install Time │ 5 days   │ 7 days    │
│ Durability   │ ★★★★☆   │ ★★★★★   │
│ Maintenance  │ High     │ Low       │
│ Warmth       │ High     │ Cool      │
│ Modern Feel  │ ☆☆☆☆☆  │ ★★★★★   │
│ Pet Friendly │ ★★☆☆☆  │ ★★★★★   │
│                                      │
│ VENDOR QUOTES                        │
│ OAK HARDWOOD                         │
│ • ABC Floors: $6,000 (5-day lead)   │
│ • XYZ Wood: $5,800 (2-week lead)    │
│ [View Details]                       │
│                                      │
│ PORCELAIN TILE                       │
│ • ABC Tile: $3,500 (14-day lead)    │
│ • Tile Masters: $3,200 (21-day)     │
│ [View Details]                       │
│                                      │
│ NOTES FROM FAMILY                    │
│ Sarah: "I love the warmth of oak"    │
│ James: "Tile is so much easier"      │
│ [Start Discussion]                   │
│                                      │
│ [Export PDF] [Save Comparison]       │
└──────────────────────────────────────┘
```

---

### 5. Timeline & Progress

#### Screen 5.1: Project Timeline

```
┌─────────────────────────────────────────┐
│ PROJECT TIMELINE                        │
│ [Linear View] [Gantt View] [Milestone]  │
├─────────────────────────────────────────┤
│                                         │
│ MARCH 2026          APRIL        MAY    │
│                                         │
│ ▓▓▓ DESIGN PHASE ▓▓▓                   │
│ ████████░░░░░░░ 55% (Due: Apr 15)      │
│ Mar 15 ──────────┤ Apr 15              │
│                                         │
│ Status:                                 │
│ ✓ Floor plan finalized                 │
│ ✓ Style direction approved             │
│ → Kitchen selections (in progress)      │
│ → Exterior colors (pending)             │
│                                         │
│ ░░░ CONSTRUCTION PHASE ░░░              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │
│                   Apr 16 ───────────────│
│                    (Estimated 12 weeks) │
│                                         │
│ Key Milestones:                         │
│ • Permit Approval (Apr 20)              │
│ • Foundation Complete (May 10)          │
│ • Framing Complete (June 1)             │
│ • Rough-ins Complete (July 1)           │
│                                         │
│ ░░░ FINISHING PHASE ░░░                 │
│                            Jul 15 ──────│
│                              (5 weeks)  │
│                                         │
│ [View Critical Path] [Export Schedule]  │
│ [Adjust Timeline] [Add Milestone]       │
└─────────────────────────────────────────┘
```

---

### 6. Collaboration & Team

#### Screen 6.1: Team Members & Sharing

```
┌─────────────────────────────────────────┐
│ TEAM & COLLABORATION                    │
│ My Dream House                          │
├─────────────────────────────────────────┤
│                                         │
│ [+ Invite Team Member]                  │
│                                         │
│ OWNERS                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Sarah Ryan                 (Owner)      │
│ sarah@email.com                         │
│ ✓ Can edit all decisions                │
│ [Remove]                                │
│                                         │
│ James Ryan                 (Owner)      │
│ james@email.com                         │
│ ✓ Can edit all decisions                │
│ [Remove]                                │
│                                         │
│ COLLABORATORS                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Architect: Tom Johnson                  │
│ tom.johnson@arch.com                    │
│ ✓ Can view & comment                    │
│ ✓ Can suggest changes                   │
│ Last active: 2 hours ago                │
│ [Edit] [Remove]                         │
│                                         │
│ Contractor: ABC Builders                │
│ contact@abcbuilders.com                 │
│ ✓ Can view project status               │
│ ✓ Can upload updates                    │
│ Last active: Yesterday                  │
│ [Edit] [Remove]                         │
│                                         │
│ SHARED DOCUMENTS                        │
│ • Floor Plans (v3)                      │
│ • Material Specifications               │
│ • Budget Summary                        │
│ [Manage Sharing]                        │
│                                         │
│ [Invite Link] [Email Invite]            │
└─────────────────────────────────────────┘
```

---

### 7. Budget Tracking

#### Screen 7.1: Budget Overview

```
┌─────────────────────────────────────────┐
│ BUDGET TRACKER                          │
│ My Dream House                          │
├─────────────────────────────────────────┤
│                                         │
│ TOTAL BUDGET: $250,000                  │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░│     │
│ SPENT: $45,200 (18%)                    │
│ REMAINING: $204,800                     │
│                                         │
│ BY CATEGORY                             │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Structure & Foundation   $85,000 │ │
│ │                                     │ │
│ │ → Kitchen                  $22,500 │ │
│ │   (Cabinets, Counters, Appliances) │ │
│ │                                     │ │
│ │ → Master Suite              $18,200 │ │
│ │   (Fixtures, Finishes)              │ │
│ │                                     │
│ │ → Bathroom 2                 $9,500 │
│ │                                     │
│ │ → Flooring                   $15,000 │ │
│ │   (Not finalized)                   │ │
│ │                                     │
│ │ ○ HVAC/Mechanical          $25,000 │ │
│ │ ○ Electrical               $18,000 │ │
│ │ ○ Exterior/Landscaping    $40,000 │ │
│ │ (Not yet quoted)                    │
│ └─────────────────────────────────────┘ │
│                                         │
│ OVER/UNDER BUDGET                       │
│ [View by Phase] [View Vendor Quotes]    │
│ [Export Budget] [Adjust Budget]         │
└─────────────────────────────────────────┘
```

---

### 8. Documents & Media Management

#### Screen 8.1: Plans & Documents Library

```
┌────────────────────────────────────────┐
│ DOCUMENTS & PLANS                      │
│ [Search] [Upload] [Organize]           │
├────────────────────────────────────────┤
│                                        │
│ FLOOR PLANS                            │
│ ┌──────────────────────────────────┐  │
│ │ [Floor Plan v3 - FINAL]          │  │
│ │ PDF • 2.3 MB • Uploaded: Mar 28  │  │
│ │ 📌 Linked to: Kitchen Decisions  │  │
│ │ [View] [Download] [Share]        │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ Floor Plan v2 (Superseded)       │  │
│ │ PDF • 2.1 MB • Uploaded: Mar 15  │  │
│ │ [View] [Archive]                 │  │
│ └──────────────────────────────────┘  │
│                                        │
│ SPECIFICATIONS                         │
│ ┌──────────────────────────────────┐  │
│ │ Material Specs & Finishes        │  │
│ │ PDF • 1.8 MB • Uploaded: Mar 25  │  │
│ │ [View] [Download] [Share]        │  │
│ └──────────────────────────────────┘  │
│                                        │
│ INSPIRATION & REFERENCE                │
│ ┌──────────────────────────────────┐  │
│ │ Kitchen Inspiration Board        │  │
│ │ 12 images • Created: Mar 22      │  │
│ │ [View Gallery] [Download]        │  │
│ └──────────────────────────────────┘  │
│                                        │
│ CONTRACTOR UPLOADS                     │
│ ┌──────────────────────────────────┐  │
│ │ Site Progress Photos - Week 3    │  │
│ │ 24 images • Uploaded: Today      │  │
│ │ [View Photos] [Add Comments]     │  │
│ └──────────────────────────────────┘  │
│                                        │
│ [+ Upload Document]                    │
│ [Organize by Room] [Organize by Phase] │
└────────────────────────────────────────┘
```

---

## Component Library

### Key UI Components (Used Across Screens)

#### 1. Progress Indicator (Linear)

```
Progress Bar (Decision Completion)
┌─────────────────────────┐
│ Kitchen & Dining        │
│ 11/18 decisions (61%)    │
│ ████████████░░░░░░░░░░│
│ (Green when 100%)        │
└─────────────────────────┘

Phase Progress (Timeline)
┌────────────────────────────────┐
│ DESIGN PHASE (In Progress)      │
│ ████████░░░░░░░░░░░░░░░░░░  55%│
│ Due: April 15 • 12 days left    │
└────────────────────────────────┘
```

#### 2. Status Badges

```
✓ Complete     (Green checkmark)
◐ In Progress  (Half-filled circle)
→ Pending      (Arrow)
○ Not Started  (Empty circle)
⚠ Blocked      (Warning icon)
🔒 Dependent   (Lock icon - waiting on another decision)
```

#### 3. Decision Card

```
┌─────────────────────────────────┐
│ ✓ Countertops                   │
│                                 │
│ Selection: Quartz (White Storm) │
│ Vendor: ABC Surfaces            │
│ Price: $4,200                   │
│ Timeline: 14 days               │
│                                 │
│ Finalized: March 25, 2026       │
│ By: Sarah Ryan                  │
│                                 │
│ [📸 Photo] [📝 Notes] [Edit]    │
└─────────────────────────────────┘
```

#### 4. Option Card (For Selection)

```
┌────────────────────┐
│ 🏠 Flooring        │
│                    │
│ Porcelain Tile     │
│ Modern Look        │
│ Easy to Clean      │
│                    │
│ 💰 $3,500          │
│ ⏱ 14 days         │
│                    │
│ ★★★★★ (12 votes) │
│                    │
│ [View Options]     │
└────────────────────┘
```

#### 5. Timeline Marker

```
 ┌────────────────────┐
 │ Apr 15             │
 │ DESIGN COMPLETE    │
 │ ✓ On Track        │
 └────────────────────┘
        │
        ▼
 ┌────────────────────┐
 │ Apr 16             │
 │ CONSTRUCTION STARTS│
 │ (In 12 days)       │
 └────────────────────┘
```

#### 6. Notification/Comment Card

```
┌──────────────────────────────────┐
│ 💬 James commented               │
│ "I prefer the oak flooring"      │
│ 2 hours ago                      │
│                                  │
│ [💬 Reply] [❤️ Like]             │
└──────────────────────────────────┘
```

---

## User Flows

### Flow 1: First-Time Setup (Onboarding)

```
Start
  ↓
[Welcome Screen]
  ↓
[Create Project]
  ├─ Project Name
  ├─ Location
  ├─ Type (New/Reno/Custom)
  └─ Timeline
  ↓
[Upload Plans OR Create Profile]
  ├─ Option A: Upload PDF plans
  └─ Option B: Fill House Profile
  ↓
[System Generates Decision Categories]
  (Based on house type, size, style)
  ↓
[Dashboard Ready]
  ↓
[Invite Collaborators (Optional)]
  ↓
→ Start Making Decisions
```

### Flow 2: Making a Decision

```
Dashboard / Room View
  ↓
[Click "Pending Decision" or "+ Add Decision"]
  ↓
[Select Decision Type]
  (Dropdown or category selector)
  ↓
[View Pre-filled Options]
  (System suggests common choices)
  ↓
[Add Vendor Quotes]
  (Compare costs, timelines)
  ↓
[Add Photos/Inspiration]
  (Upload or link)
  ↓
[Add Notes]
  (Why this choice, family preferences)
  ↓
[Set Due Date & Priority]
  ↓
[Save Draft or Submit]
  ├─ Draft: Just you
  └─ Submit: Notify collaborators
  ↓
[Share for Approval]
  (Optional: Request feedback)
  ↓
Decision Complete
  ↓
[Celebrate ✓]
  ↓
→ System updates timeline, budget, dependencies
```

### Flow 3: Collaborating (Reviewing Decisions)

```
Receive Notification
  ↓
[View Decision]
  ├─ See selection details
  ├─ See vendor options
  ├─ See budget impact
  └─ See timeline impact
  ↓
[Decision Options]
  ├─ Approve ✓
  ├─ Comment / Suggest Changes 💬
  ├─ Vote (if multiple options)
  └─ Defer to Other Stakeholder ↗
  ↓
→ Finalize or Continue Discussion
```

---

## Design Specifications

### Color Palette

**Primary Colors:**
- Brand Green: `#2D7A3F` (Trust, growth, nature)
- Action Blue: `#0066CC` (CTAs, links)
- Accent Gold: `#F4A460` (Celebrate, milestones)

**Semantic Colors:**
- Success Green: `#10B981` (Complete ✓)
- Warning Orange: `#F97316` (Pending, needs attention)
- Pending Gray: `#9CA3AF` (Not started)
- Error Red: `#EF4444` (Blocked, issues)

**Neutral:**
- Text Dark: `#1F2937` (Primary text)
- Text Light: `#6B7280` (Secondary text)
- Background: `#FFFFFF` (Primary)
- Surface: `#F9FAFB` (Secondary surfaces)
- Border: `#E5E7EB` (Dividers)

### Typography

**Font Stack:** Inter / -apple-system, BlinkMacSystemFont, segoe-ui, roboto  
**Headings:** Bold / Semi-Bold
- H1: 32px (Dashboard title)
- H2: 24px (Section headers)
- H3: 18px (Card titles)
- H4: 16px (Subsection headers)

**Body:** Regular / Medium
- Body Large: 16px (Primary content)
- Body Regular: 14px (Standard text)
- Body Small: 12px (Secondary/helper text)

### Spacing

- **Base Unit:** 8px
- Padding: 8px, 16px, 24px, 32px
- Margins: 8px, 16px, 24px, 32px
- Gap (flex): 12px, 16px, 24px

### Rounded Corners

- Buttons, Cards: `8px`
- Inputs, Small Components: `4px`
- Large Containers: `12px`

### Shadows

- Subtle: `0 1px 3px rgba(0,0,0,0.12)`
- Elevated: `0 4px 12px rgba(0,0,0,0.15)`
- Dialog: `0 10px 40px rgba(0,0,0,0.2)`

### Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

---

## Design System Tokens (For Development)

```
COLORS
  Primary: #2D7A3F
  Action: #0066CC
  Success: #10B981
  Warning: #F97316
  Error: #EF4444
  
SPACING
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  
TYPOGRAPHY
  Font: Inter
  Heading1: 32px bold
  Heading2: 24px semi-bold
  Body: 16px regular
  Small: 12px regular
  
SHADOWS
  subtle: 0 1px 3px rgba(0,0,0,0.12)
  elevated: 0 4px 12px rgba(0,0,0,0.15)
```

---

## Next Steps

### Phase 2: High-Fidelity Design (Due: April 6)
- [ ] Create Figma designs for all wireframes
- [ ] Design system components in Figma
- [ ] Create interactive prototypes for key flows
- [ ] Design mobile responsive layouts
- [ ] Create visual style guide (colors, typography, icons)
- [ ] Design custom icons and illustrations

### Phase 3: Development Handoff (Due: April 6)
- [ ] Export assets and design specifications
- [ ] Create component library documentation
- [ ] Write implementation specs for developers
- [ ] Create a/b testing plan for key features
- [ ] Define analytics tracking points

### Phase 4: Validation & Iteration (Due: April 13)
- [ ] User testing with homeowner personas
- [ ] Feedback collection and prioritization
- [ ] Design revisions based on feedback
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance optimization review

### Phase 5: Launch Readiness (Due: April 20)
- [ ] Final design QA with development
- [ ] Marketing website design
- [ ] User onboarding flows finalized
- [ ] Help documentation and FAQs
- [ ] Launch checklist completion

---

## Appendix: Use Case Examples

### Use Case 1: Sarah Building Her Dream Home (New Construction)

**Day 1:** Sarah creates project, uploads floor plans from architect  
**Day 2:** System generates decision checklist (120 decisions across 18 categories)  
**Day 5:** Sarah starts with kitchen decisions (highest impact)  
**Day 7:** Invites husband James; he reviews and votes on countertop options  
**Day 10:** Shares kitchen decisions with contractor for estimate  
**Week 3:** Kitchen finalized, moves to bathrooms  
**Week 8:** All design decisions complete; system generates construction timeline  
**Week 15:** Construction begins; contractor uploads progress photos weekly  
**Week 30:** Home complete; system guides finishing decisions and punch list  

**Outcome:** Organized homeowner, on-time project, no surprises, archived project story

---

### Use Case 2: James (Architect) Supporting Multiple Clients

**Client A (Sarah):** Reviewing her kitchen selections, providing guidance  
**Client B (Tom):** Sharing preliminary designs, waiting for feedback  
**Client C (Lisa):** Reviewing final specifications before construction  

**Benefit:** Single dashboard for all projects, version control, clear communication  

---

### Use Case 3: ABC Builders (Contractor)

**Project 1 (Sarah):** Kitchen remodel — accessing material selections and specifications  
**Project 2 (James):** Foundation details — uploading progress photos weekly  
**Project 3 (Lisa):** Requesting approval on substitutions  

**Benefit:** Single source of truth, no lost emails, clear material specs, automated updates

---

## Concept Summary Table

| Concept | Best For | Pros | Cons | Recommendation |
|---------|----------|------|------|-----------------|
| Command Center | Data-driven owners | Professional, organized, clear status | Feels corporate | ✓ Use for Dashboard |
| Room-Based | Visual thinkers | Intuitive, emotional, engaging | Less efficient for distributed decisions | ✓ Use for Navigation |
| Decision Journal | Story-focused | Celebratory, narrative, archive-worthy | Slower lookups | Option for archive view |
| Checklist Master | Detail-oriented | Familiar, efficient, task-focused | Transactional feel | ✓ Use for decision tracking |
| **HYBRID (RECOMMENDED)** | **All user types** | **All benefits, no silos** | Requires careful integration | ✓ **BUILD THIS** |

---

## Design Review Checklist

- [ ] Wireframes represent all major user flows
- [ ] Information hierarchy is clear on each screen
- [ ] Decision-making process is intuitive and non-linear
- [ ] Collaboration features feel natural and integrated
- [ ] Mobile responsiveness considered in layouts
- [ ] Status indicators (badges, colors) are consistent
- [ ] Timeline visualization is clear and scannable
- [ ] Budget impact is visible in decision context
- [ ] Vendor/quote management is streamlined
- [ ] Export/print functionality considered
- [ ] Accessibility considerations noted (color contrast, text sizes)
- [ ] Component reusability identified

---

## Timeline for Next Phase

| Milestone | Due | Owner | Status |
|-----------|-----|-------|--------|
| Concept & Wireframes ✓ | Mar 30 | Lucy | **COMPLETE** |
| High-Fidelity Design | Apr 6 | Johnny | Pending |
| Design System | Apr 6 | Johnny | Pending |
| Development Handoff | Apr 6 | Lucy | Pending |
| User Testing | Apr 13 | Product Team | Pending |
| Launch Readiness | Apr 20 | Lucy | Pending |

---

**Document Version:** 1.0  
**Last Updated:** March 30, 2026  
**Next Review:** April 3, 2026
