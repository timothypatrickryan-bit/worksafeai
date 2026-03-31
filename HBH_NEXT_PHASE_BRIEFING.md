# Home Builder Helper — Next Phase Briefing for Johnny

**For:** Johnny (Frontend/Design Engineer)  
**Phase:** High-Fidelity Design  
**Start Date:** April 1, 2026  
**Due Date:** April 6, 2026  
**Duration:** 6 days  
**Status:** Ready to start

---

## 🎯 Your Mission

Take the wireframes and concepts created in Phase 1 and turn them into high-fidelity, production-ready Figma designs that developers can build from.

**Deliverables:**
1. Complete Figma design file with all screens at high fidelity
2. Full design system (colors, typography, spacing, components)
3. 60+ reusable components with all states (default, hover, active, disabled, loading, error)
4. Interactive prototypes for key user flows
5. Responsive layouts (mobile, tablet, desktop)
6. Design specifications ready for developer handoff

---

## 📚 What You're Working From

**Three comprehensive design documents are ready for you:**

### Document 1: Design Concepts (Main Reference)
**File:** `HOME_BUILDER_HELPER_DESIGN_CONCEPTS.md`

Read this first. It contains:
- Product overview and vision
- User research (homeowner persona, pain points)
- 4 design concept approaches
- **Recommended approach:** Hybrid (Dashboard + Room-Based + Checklist)
- Complete information architecture
- 10+ wireframes with detailed descriptions
- Component library specs
- Design principles and tokens

**Key Sections for You:**
- Design Principles (page 3) — follow these
- Recommended Approach (page 7) — this is what to build
- Color Palette (page 27) — use these exact colors
- Typography (page 28) — font stack and sizes
- Spacing (page 29) — base unit is 8px

### Document 2: Wireframe Details (Layout Reference)
**File:** `HBH_WIREFRAME_VISUAL_REFERENCE.md`

Technical reference with:
- ASCII wireframes with exact spacing/layout
- Component states (completed, pending, blocked)
- Color application examples
- Interactive states (hover, active, disabled)
- Responsive design patterns
- Annotation guidelines for developer handoff

**Use This When:**
- You need exact spacing and alignment
- You want to see component states
- You need responsive layout patterns
- You're annotating for developers

### Document 3: Implementation Checklist (Your Roadmap)
**File:** `HBH_DESIGN_IMPLEMENTATION_CHECKLIST.md`

Detailed phase-by-phase checklist including:
- Phase 2: High-Fidelity Design (YOUR PHASE)
  - Figma setup instructions
  - Component checklist (60+ items)
  - Screen-by-screen requirements
  - Responsive design requirements
  - QA criteria

**Use This To:**
- Know what to build (detailed checklist)
- Track progress
- Ensure you don't miss anything
- Know the QA criteria for completion

---

## 🎨 Design System Reference

**Quick Design Token Summary:**

### Colors
```
Brand Green (Primary):     #2D7A3F
Action Blue (CTA):         #0066CC
Accent Gold (Celebration): #F4A460

Semantic Colors:
Success Green:   #10B981 (✓ Complete)
Warning Orange:  #F97316 (→ Pending)
Error Red:       #EF4444 (🔒 Blocked)
Neutral Gray:    #9CA3AF (Not started)

Neutral Palette:
Text Dark:       #1F2937
Text Light:      #6B7280
Background:      #FFFFFF
Surface:         #F9FAFB
Border:          #E5E7EB
```

### Typography
```
Font Stack: Inter / -apple-system, BlinkMacSystemFont, segoe-ui, roboto

Headings (Bold/Semi-Bold):
H1: 32px
H2: 24px
H3: 18px
H4: 16px

Body (Regular/Medium):
Large: 16px
Regular: 14px
Small: 12px

Line Height: 1.5 (body), 1.3 (headings)
Letter Spacing: 0 (normal)
```

### Spacing
```
Base Unit: 8px

Scale: 4px, 8px, 16px, 24px, 32px
(Also: 12px for small gaps)

Padding (cards): 16px, 24px
Margin (sections): 16px, 24px, 32px
Gap (flex): 12px, 16px, 24px

Grid: 8px base grid
```

### Shadows
```
Subtle (default):     0 1px 3px rgba(0,0,0,0.12)
Elevated (hover):     0 4px 12px rgba(0,0,0,0.15)
Dialog (modals):      0 10px 40px rgba(0,0,0,0.2)
```

### Border Radius
```
Buttons, Cards:  8px
Inputs:          4px
Large Containers: 12px
```

---

## 📱 Key Screens to Design

**10 Major Screen Groups** (from wireframes):

### Group 1: Onboarding (2 screens)
- Welcome with project setup form
- Optional house profile form
- *Reference: Design Concepts, page 13*

### Group 2: Dashboard (1 main, multiple sub-components)
- Project overview
- Status cards (decisions, budget)
- Timeline mini-view
- Next steps section
- Activity feed
- *Reference: Design Concepts, page 15*

### Group 3: Room Navigation (2 screens)
- Room grid/floor plan view
- Room detail view with decision list
- Progress indicators
- *Reference: Design Concepts, page 18-19*

### Group 4: Decision Management (4 screens)
- New decision form
- Decision detail view (long, multiple sections)
- Comparison matrix (options side-by-side)
- Decision card variants (completed, pending, blocked)
- *Reference: Design Concepts, page 22-25*

### Group 5: Timeline (2 screens)
- Linear timeline view
- Gantt chart view (or alternative)
- Phase breakdown
- Milestone markers
- Dependency visualization
- *Reference: Design Concepts, page 26-27*

### Group 6: Collaboration (2 screens)
- Team member list and management
- Activity/comment threads
- Approval workflows
- *Reference: Design Concepts, page 28-29*

### Group 7: Budget (1 screen)
- Budget overview and progress
- Category breakdown
- Vendor quotes
- *Reference: Design Concepts, page 30-31*

### Group 8: Documents (1 screen)
- File library with filters
- Upload area
- File organization
- *Reference: Design Concepts, page 32-33*

---

## 🎯 Component Library (60+)

**You need to create components for:**

### Buttons (5 variants)
- [ ] Primary button (default, hover, active, disabled, loading)
- [ ] Secondary button (same states)
- [ ] Tertiary/ghost button (same states)
- [ ] Small/medium/large size variants
- [ ] Icon buttons

### Forms (10 types)
- [ ] Text input
- [ ] Textarea
- [ ] Select dropdown
- [ ] Checkbox (3 states)
- [ ] Radio button
- [ ] Toggle switch
- [ ] Date/time picker
- [ ] File upload
- [ ] Search with autocomplete

### Cards (8 types)
- [ ] Decision card (3 variants: completed, pending, blocked)
- [ ] Status card
- [ ] Room card with progress
- [ ] Option comparison card
- [ ] Timeline/milestone card
- [ ] Activity/comment card
- [ ] Quote/vendor card
- [ ] Modal/dialog container

### Navigation
- [ ] Top navigation bar
- [ ] Sidebar (desktop)
- [ ] Bottom nav (mobile)
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Accordion
- [ ] Dropdown menu

### Data Display
- [ ] Progress bar (linear)
- [ ] Progress ring (circular)
- [ ] Status badge (4 types: complete, pending, blocked, dependent)
- [ ] Tag/chip
- [ ] Avatar + avatar group
- [ ] Timeline visualization
- [ ] Table/data grid
- [ ] List with icons
- [ ] Alert/banner

### Feedback
- [ ] Success notification
- [ ] Error notification
- [ ] Warning notification
- [ ] Loading spinner
- [ ] Skeleton loader
- [ ] Empty state
- [ ] Error state

---

## 📋 Your Checklist for April 1-6

### Day 1 (April 1): Setup & Planning
- [ ] Read all three design documents
- [ ] Create Figma project "Home Builder Helper"
- [ ] Set up file structure (11 files: Design System, Components, Screens 1-10, Prototypes)
- [ ] Plan sprint: Which components first? Which screens first?
- [ ] Identify any clarifications needed

### Days 2-3 (April 2-3): Design System & Components
- [ ] Create design system file in Figma
  - [ ] Colors (primary, semantic, neutral)
  - [ ] Typography (font, sizes, weights, line heights)
  - [ ] Spacing (margin, padding, gap values)
  - [ ] Shadows and elevation
  - [ ] Border radius values
- [ ] Start building component library
  - [ ] Buttons (all variants and states)
  - [ ] Form inputs (all types)
  - [ ] Navigation components
  - [ ] Card components

### Days 3-4 (April 3-4): Screen Design
- [ ] Design high-priority screens
  - [ ] Onboarding flows (critical for first-time users)
  - [ ] Dashboard (main entry point)
  - [ ] Room detail view (core feature)
  - [ ] Decision detail view (core feature)
- [ ] Apply design system to all screens
- [ ] Ensure responsive layouts (mobile/tablet/desktop)

### Days 4-5 (April 4-5): Complete Screens & Polish
- [ ] Finish remaining screens
- [ ] Complete component library
- [ ] Add all interactive states (hover, active, disabled, loading, error)
- [ ] Create empty/error state variants
- [ ] Polish visual details (shadows, spacing, alignment)
- [ ] Test color contrast (ensure WCAG AA)

### Day 6 (April 6): Prototypes & Handoff Prep
- [ ] Create interactive prototypes for key flows:
  - [ ] Onboarding flow
  - [ ] Decision making flow
  - [ ] Collaboration flow
  - [ ] Timeline navigation
- [ ] Test prototypes
- [ ] Organize Figma for developer handoff
- [ ] Add specs/annotations for developers
- [ ] Final review and polish

---

## 🎨 Design Best Practices (Your North Star)

### 1. Consistency is Key
- Use the design system tokens for EVERY color, spacing, font size
- Don't invent new values
- Use components instead of duplicating
- Create variants for different states (not separate components)

### 2. Accessibility First
- Color contrast: Minimum WCAG AA (4.5:1 for text)
- Text size: Never smaller than 12px for body text
- Touch targets: Minimum 44px for mobile
- Focus states: Visible outline for keyboard navigation
- Use semantic colors (don't rely on color alone to convey meaning)

### 3. Responsive Design
- Design for mobile first
- Then tablet (640px breakpoint)
- Then desktop (1024px breakpoint)
- Show stacking, reflow, and adaptation at each breakpoint

### 4. Components = Efficiency
- Every reusable element should be a component
- Create variants (not separate components) for states
- Link components across screens (changes propagate)
- Use component tokens for colors, sizing, spacing

### 5. Clarity Over Beauty
- Hierarchy should be immediately obvious
- Important things should be prominent
- Action buttons should be discoverable
- Status should be clear at a glance

---

## 🚀 Success Criteria for Phase 2

Your work is complete when:

✅ All 10 screen groups are designed at high fidelity  
✅ 60+ components created with all state variants  
✅ Design system complete (colors, typography, spacing, shadows)  
✅ Responsive layouts for mobile/tablet/desktop shown  
✅ Interactive prototypes created for key flows  
✅ Color contrast meets WCAG AA  
✅ Figma organized and annotated for developers  
✅ Team sign-off obtained  
✅ Ready for developer handoff (Phase 3)  

---

## 📞 Questions? Ask Lucy

**Questions About:**
- Product vision or requirements → Lucy
- Design approach or principles → Lucy
- Wireframes or layout details → Reference the documents
- Component specifications → Reference Design Concepts, page 24

**Lucy's role:** Help clarify requirements, approve designs, prepare for developer handoff

---

## 🎯 Timeline Reminder

- **Start:** April 1, 2026
- **Due:** April 6, 2026
- **Duration:** 6 days
- **Effort:** ~40 hours (compressed AI agent timeline)
- **Parallel Work:** Jarvis can start backend architecture simultaneously
- **Next Phase:** Developer handoff (April 6) → Development (April 7+)

---

## 📊 Estimated Effort Breakdown

**Design System:** 4 hours  
**Component Library:** 8 hours  
**Screen Design:** 12 hours  
**Responsive Layouts:** 6 hours  
**Prototypes & Interactions:** 4 hours  
**Polish, Review, Prep:** 6 hours  
**Total:** ~40 hours  

**Parallel Path:** Jarvis can start API/database design while you work on UI

---

## 🏁 Final Notes

This is a **high-impact, high-visibility project**. The Home Builder Helper solves a real problem for homeowners and has strong product-market fit potential.

Your design will determine:
- How intuitive the app is for first-time users
- Whether decision-making feels overwhelming or manageable
- Whether collaboration actually works
- Whether the timeline builds confidence or confusion

**Get the design right, and development will be fast. Get it wrong, and rework will be painful.**

The wireframes give you a strong foundation. Trust the design system. Build the components right. Test everything. You've got this.

---

**Questions before you start? Ask now.** Then dive in on April 1.

Good luck! 🎨

---

**Next Phase Briefing Version:** 1.0  
**Created:** March 30, 2026  
**For:** Johnny  
**Prepared By:** Lucy
