# iOS App Architecture

Design decisions and technical architecture for the Mission Control iOS companion app.

## Overview

Mission Control iOS is a native React Native app that provides real-time access to projects, tasks, and briefings from the Mission Control dashboard. It synchronizes state with the backend via REST API and maintains offline capability through local Zustand stores.

## Key Design Decisions

### 1. React Native + Expo (vs. Swift)

**Decision:** Use React Native with Expo, not native Swift.

**Rationale:**
- Faster development (JavaScript vs. Swift learning curve)
- Code sharing potential (React web + React Native)
- Expo handles iOS complexity (signing, certificates, TestFlight)
- Rapid iteration in early phases
- Cost: Lower development time, lower complexity

**Trade-off:** Slightly slower performance than native Swift, but acceptable for dashboard app.

### 2. Bottom Tab Navigation

**Decision:** Tab-based navigation (Dashboard, Projects, Tasks, Settings).

**Rationale:**
- Simple, discoverable navigation pattern
- Matches web dashboard layout
- No deep nesting (reduces cognitive load)
- Easy to add more tabs later

**Structure:**
```
App (Navigator)
├── Dashboard (default tab)
├── Projects (tab 2)
├── Tasks (tab 3)
└── Settings (tab 4)
```

### 3. Zustand for State Management

**Decision:** Zustand (not Redux, MobX, or Context API).

**Rationale:**
- Minimal boilerplate (half the code of Redux)
- Persistent store out of box (saves to AsyncStorage)
- Async actions built-in
- Works great with React Native

**Example:**
```typescript
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
    }),
    { name: 'auth-store' }
  )
);
```

### 4. REST API Integration (vs. GraphQL)

**Decision:** REST API to Mission Control backend.

**Rationale:**
- Simpler than GraphQL for now
- Backend already built with REST
- Less bandwidth overhead
- Easier caching strategy

**Endpoints:**
```
GET  /api/projects          → list all projects
GET  /api/projects/:id      → project details
GET  /api/tasks             → user's tasks
PUT  /api/tasks/:id/status  → update task status
GET  /api/briefings         → latest briefings
```

### 5. JWT Authentication

**Decision:** JWT stored locally, refreshed on app startup.

**Rationale:**
- Stateless auth (no session management)
- Works with REST API
- Can validate locally
- 1-hour expiry + 7-day refresh token

**Flow:**
```
1. User logs in (username/password)
2. Backend returns JWT + refresh token
3. Store in AsyncStorage + Zustand
4. Send JWT in Authorization header
5. On expiry, use refresh token to get new JWT
6. If refresh fails, redirect to login
```

### 6. Offline Support Strategy

**Decision:** Read-only offline mode, queue writes for sync when online.

**Rationale:**
- Full offline would be complex
- Users can view projects/tasks offline
- Writes are rare on mobile
- Sync when connection restored

**Implementation:**
```typescript
const useNetworkSync = () => {
  const online = useNetworkState().isConnected;
  const queue = useOfflineQueueStore();
  
  useEffect(() => {
    if (online && queue.length > 0) {
      processQueuedActions();
    }
  }, [online]);
};
```

### 7. Push Notifications

**Decision:** Expo Notifications for task updates + briefings.

**Rationale:**
- Seamless with Expo
- No third-party service needed
- Can send from backend
- User can enable/disable per device

**Flow:**
```
1. App requests notification permission (iOS)
2. App registers with Expo for push token
3. Backend stores device token
4. On task update: backend sends notification
5. App receives in foreground/background
6. Tapping notification opens app to task detail
```

## Component Hierarchy

```
<App>
  <NavigationContainer>
    <Stack.Navigator>
      {authenticated ? (
        <DashboardTabs>
          <Dashboard>
            <ProjectCard />
            <TaskCard />
          </Dashboard>
          <Projects>
            <ProjectList>
              <ProjectItem />
            </ProjectList>
          </Projects>
          <Tasks>
            <TaskList>
              <TaskItem />
            </TaskList>
          </Tasks>
          <Settings>
            <ProfileSection />
            <NotificationSettings />
          </Settings>
        </DashboardTabs>
      ) : (
        <Auth />
      )}
    </Stack.Navigator>
  </NavigationContainer>
</App>
```

## Data Flow

### State Management

```
Zustand Stores:
├── authStore          (token, user, isAuthenticated)
├── projectStore       (projects, selectedProject, loading)
├── taskStore          (tasks, selectedTask, filters)
└── settingsStore      (theme, notifications, timezone)
```

### API Integration

```
API Client (src/api/client.ts)
├── GET /projects      → projectStore.setProjects()
├── GET /tasks         → taskStore.setTasks()
├── PUT /tasks/:id     → taskStore.updateTask() → sync to backend
└── Error handling     → retry with exponential backoff
```

### Sync Pattern

```
1. User opens app
2. Check if online (Expo Network module)
3. If online:
   - Fetch projects, tasks, briefings
   - Update Zustand stores
   - Process offline queue (if any)
4. If offline:
   - Show cached data from AsyncStorage
   - Queue user actions
   - Attempt sync every 30 seconds
```

## Performance Considerations

### Memory

- List virtualization (FlatList with `removeClippedSubviews`)
- Pagination for large lists (projects > 100)
- Memoized components (React.memo for list items)

### Network

- Debounce rapid API calls (e.g., scroll pagination)
- Cache API responses (1-minute TTL)
- Compress JSON payloads
- Lazy load images/assets

### Battery

- Only fetch when necessary
- Batch notifications (5-minute window)
- Disable location tracking
- Disable video/heavy animations

## Security

### Auth

- JWT stored in AsyncStorage (encrypted on iOS keychain)
- No hardcoded API keys
- HTTPS only in production
- SSL certificate pinning (optional, future)

### Data

- Never log sensitive data (tokens, passwords)
- Validate all inputs
- Clear cache on logout
- Don't persist sensitive user data

## Testing Strategy

### Unit Tests (Jest)

```typescript
// Example: authStore.test.ts
describe('authStore', () => {
  it('should set token on login', () => {
    const { setToken } = useAuthStore.getState();
    setToken('jwt-token');
    expect(useAuthStore.getState().token).toBe('jwt-token');
  });
});
```

### Integration Tests

- API client with mock server (MSW)
- Navigation flow
- Offline sync behavior

### Manual Testing

- QA on physical iPhone
- TestFlight beta (Phase 2)
- App Store review (Phase 3)

## Deployment

### Development

- Expo Dev Server (local WiFi)
- iOS Simulator via Xcode
- Android Emulator via Android Studio

### Beta (TestFlight)

- Expo build → TestFlight
- Internal testers (week 1)
- Beta testers (week 2)

### Production (App Store)

- App Store review process
- Submission via App Store Connect
- Release management

## Future Enhancements

1. **Siri Integration** — Voice commands for tasks
2. **Widgets** — Home screen quick access
3. **Background Sync** — Sync every 30 min
4. **Offline Editing** — Full offline support
5. **Team Collaboration** — Real-time comments
6. **Analytics** — Usage tracking (with consent)

## References

- [React Navigation Docs](https://reactnavigation.org/)
- [Expo API Documentation](https://docs.expo.dev/versions/latest/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [iOS Development Best Practices](https://developer.apple.com/design/human-interface-guidelines/ios)

---

**Last Updated:** April 4, 2026
