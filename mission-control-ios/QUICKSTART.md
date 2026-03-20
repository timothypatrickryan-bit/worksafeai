# Mission Control iOS - Quick Start Guide

## 30-Second Start

```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-ios/Mission
npm run ios
```

The app will open in iOS simulator with **all 5 screens ready to use**.

---

## 5 Screens at a Glance

| # | Screen | Icon | Purpose |
|---|--------|------|---------|
| 1 | **Dashboard** | 📊 | Real-time stats, health, activity |
| 2 | **Tasks** | ✅ | Task list, search, filter, create |
| 3 | **Memory** | 📄 | Daily notes, search, markdown viewer |
| 4 | **Task Detail** | 📋 | Edit task, timeline, mark complete |
| 5 | **Settings** | ⚙️ | API URL, connection test, cache clear |

All navigation is in the **bottom tab bar**.

---

## What You Can Do Right Now

### Dashboard
- 📊 See mock stats: 24 tasks, 3 executing, 18 completed, 4 agents
- 🟢 Health indicator (green = good)
- 📈 Progress bars for task completion
- 🔄 Pull down to refresh
- 📰 Recent activity feed

### Tasks
- 📋 See 6 sample tasks
- 🔍 Search by task name or project
- 🎯 Filter by: All / Executing / Completed / Queued
- 🏷️ View priority (Low/Medium/High/Critical)
- 🔗 Tap task → opens full detail view

### Memory
- 📅 Notes grouped by date (Today, Yesterday, etc.)
- 📌 MEMORY.md pinned at top
- 🔍 Search all notes
- 📖 Tap note → full markdown viewer

### Settings
- 🔌 Configure tunnel URL (for API connection)
- 🌐 Test connection button
- 📦 App info (version 1.0.0)
- 🗑️ Clear cache (with confirmation)

---

## Connect Real API (Optional)

### Step 1: Start Your Backend
```bash
npm run dev  # or your backend command
# Should run on http://localhost:3001 (or your port)
```

### Step 2: Create Tunnel (If Remote)
```bash
ngrok http 3001
# You'll see: https://abc123.ngrok.io
```

### Step 3: Configure in App
1. Tap **Settings** tab (⚙️)
2. Tap "Edit" next to "Tunnel URL Configuration"
3. Enter your API URL: `https://abc123.ngrok.io` (or `http://localhost:3001` if local)
4. Tap "Save"
5. Tap "Test Connection" → should see 🟢 Connected

### Step 4: See Real Data
- Go back to Dashboard
- Tap refresh (pull down)
- Should now show real data from your API

---

## API Endpoints Used

The app expects these endpoints:

```
GET  /api/status              ← Dashboard needs this
GET  /api/tasks               ← Tasks list
GET  /api/tasks/:id           ← Task details
PATCH /api/tasks/:id          ← Update task (body: {status})
GET  /api/health              ← Connection test (Settings)
```

**Mock data** is used if these fail, so you can test without an API.

---

## Keyboard Shortcuts (Simulator)

| Key | Action |
|-----|--------|
| `Cmd + D` | Open Dev Menu |
| `Cmd + K` | Reload app |
| `Cmd + T` | Open tab (simulator only) |

---

## File Locations

- **Dashboard:** `app/(tabs)/index.tsx`
- **Tasks:** `app/(tabs)/missions.tsx`
- **Memory:** `app/(tabs)/memory.tsx`
- **Settings:** `app/(tabs)/settings.tsx`
- **Task Detail:** `app/task-detail.tsx`
- **Memory Detail:** `app/memory-detail.tsx`
- **Theme:** `constants/theme.ts` (dark blue colors)
- **API Client:** `src/api/client.ts` (Axios setup)

---

## Common Tasks

### Search Tasks
1. Go to Tasks tab
2. Type in search box
3. Results filter in real-time

### Filter Tasks by Status
1. Go to Tasks tab
2. Tap filter buttons: All / Executing / Completed / Queued

### Mark Task as Complete
1. Go to Tasks tab
2. Tap a task
3. Tap "Mark as Complete" button
4. Status updates ✅

### View Memory Notes
1. Go to Memory tab
2. Scroll to find a note
3. Tap it → see full content with markdown formatting

### Change API URL
1. Go to Settings tab
2. Tap "Edit"
3. Change URL
4. Tap "Save"
5. Tap "Test Connection"

### Clear All Data
1. Go to Settings tab
2. Tap "Clear Local Cache"
3. Confirm in dialog
4. All stored data deleted (settings preserved)

---

## Colors Used

- **Background:** Dark blue `#0F172A`
- **Cards:** Darker blue `#1E293B`
- **Accent:** Bright blue `#3B82F6`
- **Text:** Light `#F1F5F9`
- **Success:** Green `#10B981` ✅
- **Warning:** Yellow `#F59E0B` ⚠️
- **Error:** Red `#EF4444` ❌

---

## What's Included

✅ **5 Complete Screens**
- Dashboard with real-time stats
- Tasks with search & filter
- Task detail editor
- Memory with markdown viewer
- Settings with API config

✅ **Dark Blue Theme**
- Glassmorphic design
- Color-coded status badges
- Loading indicators
- Empty states

✅ **Ready for API**
- Axios HTTP client
- Fallback mock data
- Settings persistence
- Connection testing

✅ **TypeScript**
- Strict mode
- Full type safety
- No `any` types

✅ **Navigation**
- Tab bar (4 main screens)
- Stack routing (detail views)
- Smooth transitions

---

## Troubleshooting

**App won't start?**
```bash
cd Mission && npm install && npm run ios
```

**Stuck on splash screen?**
Press `Cmd + K` to reload.

**Can't connect to API?**
1. Check your backend is running
2. Check tunnel URL in Settings (no trailing slash)
3. Tap "Test Connection" button

**Lost settings?**
App stores settings in AsyncStorage, which persists across restarts. If deleted, Settings returns to defaults.

**Want to reset everything?**
Go to Settings → "Clear Local Cache" (keeps your API URL).

---

## Next: Capture Screenshots

Once you're happy with how it looks:

1. Open iOS simulator
2. Navigate to each screen
3. Take screenshots: **Simulator → Device → Screenshot**
4. Save to `screenshots/` folder:
   - `01-dashboard.png`
   - `02-tasks.png`
   - `03-task-detail.png`
   - `04-memory.png`
   - `05-settings.png`

---

## Ready to Deploy?

```bash
# Build for iOS
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios
```

---

## Need More Info?

- **Full docs:** `README.md`
- **Screen details:** `SCREENS_IMPLEMENTATION.md`
- **Architecture:** `ARCHITECTURE.md` (in Mission/)

---

**That's it! Enjoy your app! 🚀**
