# 📱 iOS Mission Control - Design Brief for Johnny

**To:** Johnny (App Designer)  
**From:** Lucy (Project Coordinator)  
**Project:** iOS Mission Control App  
**Role:** Design & UI/UX Lead  
**Timeline:** 2-3 days for complete design spec  

---

## Your Mission

Create comprehensive design for a native iOS Mission Control app with full-featured SwiftUI interface. You are the visual & UX architect.

---

## What to Design

### **Screen 1: Authentication Flow**
- Login screen (email + password)
- Biometric auth option (Face ID / Touch ID)
- Session management

### **Screen 2: Task Board (Main)**
- 4-column Kanban board (scrollable horizontally)
- Task cards with: title, assignee, elapsed time, description
- Drag-drop support (hint to Jarvis)
- Float action button to create tasks
- Tab bar or side navigation to other sections

### **Screen 3: Agent Activity Feed**
- List of active agents only (working/complete)
- Agent card: name, status, model, current task, output
- Real-time status indicator (pulsing when working)
- Filter by status

### **Screen 4: Team Directory**
- Org chart view or list view
- Team members by role (Orchestrator, Command Layer, Execution, Quality, Tools)
- Tap to see full details: specialty, capabilities, notes
- Edit capability (form to update name, title)

### **Screen 5: Calendar**
- Weekly view with cron jobs marked
- Upcoming jobs list with countdowns (3 days ahead)
- Tap job for details
- Month view option

### **Screen 6: Messages/Inbox**
- List of messages grouped by sender
- Message detail view
- Mark as read/unread
- Quick reply interface

### **Screen 7: Settings**
- API endpoint configuration (localhost vs remote)
- JWT token management
- Push notification preferences
- Dark/Light mode toggle
- About screen

---

## Design Principles

**iOS Native:**
- Follow Apple Human Interface Guidelines
- Use system colors, fonts, spacing
- Native iOS components (no custom reimplements)
- Gesture-driven navigation

**Performance:**
- Lightweight, scrollable lists (not grid)
- Lazy loading for large lists
- Smooth 60fps animations
- Minimize redraw on updates

**Accessibility:**
- Full VoiceOver support
- Sufficient color contrast (WCAG AA)
- Button sizing (min 44x44pt)
- Text scaling support

**Offline-First Design:**
- Indicate cached vs live data
- Show sync status
- Enable offline task viewing
- Queue actions while offline

---

## Deliverables

1. **Figma File** with all 7 screens
   - Light mode designs
   - Dark mode variants
   - iPad layout options
   - Landscape modes

2. **Design Spec Document** (`iOS_DESIGN_SPEC.md`)
   - Screen descriptions
   - Component library
   - Color palette
   - Typography
   - Spacing system
   - Navigation flow

3. **Wireframe/Flowchart**
   - How screens connect
   - Navigation patterns
   - Deep linking structure

4. **iOS HIG Checklist**
   - Compliance with Apple guidelines
   - Gesture conventions
   - Notification design

5. **Component Library**
   - Task cards
   - Agent cards
   - Navigation components
   - Form elements
   - Custom controls

---

## Success Criteria

- ✅ All 7 screens designed & pixel-perfect
- ✅ Light + Dark mode variants complete
- ✅ iPad landscape support designed
- ✅ Figma file organized & ready for Jarvis
- ✅ Design spec is 100% clear for development
- ✅ Zero ambiguity for Jarvis to implement

---

## Handoff to Jarvis

Once complete, Jarvis needs:
1. Figma link (with permissions)
2. Design spec document
3. Component specifications
4. Navigation flow diagram

Jarvis will build SwiftUI views directly from your designs.

---

## Timeline

- **Day 1:** Wireframes + screen layout
- **Day 2:** High-fidelity designs (light mode)
- **Day 3:** Dark mode + iPad variants + polish

Ready to start? Begin with the Task Board screen (most complex). That's your hero screen!

**Questions?** Ask Lucy immediately. No blockers allowed.

---

**Project Status:** 🟢 ACTIVE  
**Your Start:** Immediately  
**Your Deadline:** 3 days  

Go design something beautiful! 🎨
