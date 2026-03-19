# 💻 iOS Mission Control - Development Brief for Jarvis

**To:** Jarvis (App Developer)  
**From:** Lucy (Project Coordinator)  
**Project:** iOS Mission Control App  
**Role:** Lead iOS Developer (SwiftUI)  
**Timeline:** 7-10 days for full implementation  

---

## Your Mission

Build a production-quality iOS app in SwiftUI that mirrors the web Mission Control dashboard with full API integration, real-time WebSocket updates, and offline support.

---

## Tech Stack (Locked In)

**Language:** Swift 5.9+  
**Framework:** SwiftUI (iOS 15.0+)  
**State Management:** @StateObject + Combine framework  
**HTTP Client:** URLSession with AsyncAwait  
**WebSocket:** Starscream or native WebSocket  
**Networking:** URLSession with custom middleware  
**Storage:** UserDefaults (small data) + Core Data (offline cache)  
**Local DB:** Core Data for offline task caching  

**Optional Libraries:**
- Starscream (WebSocket) — If native WebSocket insufficient
- Alamofire — If custom URLSession not enough
- Kingfisher — Image caching (for agent avatars)

---

## Architecture

### **Project Structure**
```
MissionControl/
├── App/
│   └── MissionControlApp.swift
├── Models/
│   ├── Task.swift
│   ├── Agent.swift
│   ├── Team.swift
│   └── Message.swift
├── Services/
│   ├── APIClient.swift
│   ├── WebSocketManager.swift
│   ├── AuthService.swift
│   └── CacheManager.swift
├── ViewModels/
│   ├── TaskBoardViewModel.swift
│   ├── AgentActivityViewModel.swift
│   ├── TeamViewModel.swift
│   └── AuthViewModel.swift
├── Views/
│   ├── Authentication/
│   ├── TaskBoard/
│   ├── AgentActivity/
│   ├── Team/
│   ├── Calendar/
│   ├── Messages/
│   └── Settings/
└── Utilities/
    ├── Constants.swift
    └── Extensions.swift
```

---

## Core Features to Implement

### **1. Authentication (Week 1)**
- JWT login (email + password)
- Biometric auth (Face ID / Touch ID)
- Token refresh flow
- Session persistence
- Logout with cleanup

### **2. Task Board (Week 1-2)**
- 4-column Kanban layout (horizontal scroll)
- Task cards: title, assignee, time elapsed, description
- Drag-drop between columns (iOS gestures)
- Create task modal
- Task detail view with full description
- Real-time status updates via WebSocket

### **3. Agent Activity (Week 1-2)**
- List of active agents (working/complete only)
- Agent cards: name, status, model, task, output
- Real-time pulsing animation when working
- Tap for agent details
- Filter by status

### **4. Team Directory (Week 2)**
- Hierarchical team display (Orchestrator → Command → Execution → Quality → Tools)
- Team member cards
- Tap to expand full details
- Edit agent form (name, title, specialty)
- Search/filter by role

### **5. Calendar (Week 2)**
- Weekly view with cron job markers
- Upcoming jobs list (3 days ahead)
- Countdown timers to next job
- Month view toggle
- Tap job for details

### **6. Messages (Week 2)**
- Message list grouped by sender
- Message detail view
- Mark read/unread
- Delete messages
- Quick reply interface

### **7. Offline Mode (Week 3)**
- Cache all data locally (Core Data)
- Indicate cached vs live data
- Queue actions while offline
- Sync when back online
- Show sync status indicator

### **8. Real-time Updates (Week 3)**
- WebSocket connection manager
- Auto-reconnect on disconnect
- Handle network transitions
- Update UI in real-time
- Graceful degradation if WebSocket unavailable

### **9. Dark Mode (Week 3)**
- Native iOS dark mode support
- All screens tested light + dark
- Proper color contrast
- No hardcoded colors

### **10. Polish & Performance (Week 3-4)**
- Smooth animations (task transitions, agent status)
- Optimized re-renders
- Lazy loading for lists
- Image caching
- Memory profiling

---

## API Integration

### **Base URL Configuration**
```swift
// Development: localhost:3000
// Remote: https://mission-control-api.elevationaiwork.com (via Cloudflare tunnel)
// User configurable in Settings
```

### **Endpoints to Integrate**
```
GET /api/status                    → Dashboard state
GET /api/team                      → Team members
GET /api/tasks                     → All tasks
POST /api/tasks/add                → Create task
PUT /api/tasks/:id/status          → Update task status
POST /api/tasks/:id/approve        → Approve task
GET /api/memories                  → Messages/inbox
WS ws://localhost:3000             → WebSocket for real-time
```

### **JWT Flow**
- Store tokens in Keychain (NOT UserDefaults)
- Auto-refresh access token
- Handle 401 → logout flow
- Biometric unlock for sensitive actions

---

## Critical Implementation Notes

### **WebSocket Management**
- Maintain persistent connection
- Auto-reconnect on disconnect
- Handle network transitions (WiFi ↔ cellular)
- Message queueing while disconnected
- Clean disconnect on logout

### **Offline First**
- All data cached to Core Data
- Sync on reconnect
- Show "offline" indicator
- Queue task updates while offline
- Conflict resolution (server wins)

### **Performance**
- Lazy load lists (pagination)
- Cache images with Kingfisher
- Profile with Instruments
- Aim for 60fps scrolling
- <100ms response times for UI

### **Accessibility**
- VoiceOver labels on all controls
- Color contrast >= WCAG AA
- Button size >= 44x44pt
- Text scaling support
- No gestures-only controls

---

## Deliverables

1. **Xcode Project** (.xcodeproj)
   - All features implemented
   - Compiles without warnings
   - Runs on iOS 15+

2. **Code Documentation**
   - Inline comments for complex logic
   - README with setup instructions
   - Architecture overview

3. **Test Builds**
   - Multiple intermediate builds for QA
   - TestFlight-ready for final

4. **Performance Report**
   - Memory usage
   - Battery impact
   - Network efficiency

---

## Success Criteria

- ✅ App launches without crashes
- ✅ Authentication works (login/biometric)
- ✅ Task board fully functional (scrolling, filtering, drag-drop)
- ✅ Real-time updates working (WebSocket connected)
- ✅ Offline mode functional (cache + sync)
- ✅ Dark mode looks great
- ✅ iPad landscape supported
- ✅ Zero critical bugs
- ✅ Smooth 60fps performance
- ✅ All accessibility guidelines met

---

## Timeline

- **Day 1-2:** Project setup, API client, auth flow
- **Day 3-4:** Task board core + API integration
- **Day 5:** Agent activity + team directory
- **Day 6:** Calendar + messages
- **Day 7:** Offline mode + WebSocket
- **Day 8-10:** Dark mode, iPad support, polish, QA fixes

---

## Handoffs

**From Johnny (Day 3):**
- Figma file with all designs
- Design spec document
- Component specifications

**From Chief (Day 3):**
- API audit report
- CORS configuration confirmed
- Tunnel setup for remote testing

**To Opus (Day 11):**
- Complete codebase
- Build ready for security review
- All features documented

---

## Blockers & Communication

**Daily:** Post progress in Task Board (30-second standup)  
**Blocker:** Ping Lucy immediately (no "I'll figure it out" delays)  
**Questions:** Ask in task comments (async-friendly)  

Questions about architecture? Ask now. Design feedback? Ask Johnny directly.

---

**Project Status:** 🟢 ACTIVE  
**Your Start:** Tomorrow (after Johnny shares Figma)  
**Your Deadline:** 10 days  
**Success:** Production-quality iOS app ready for TestFlight  

Let's build something beautiful! 💻
