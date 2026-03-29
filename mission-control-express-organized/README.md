# Mission Control (Express + React + Vite)

Rewrite of the Next.js Mission Control app using Express backend and React/Vite frontend.

## Quick Start

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build frontend + start server
npm start
# → http://localhost:3001

# OR development mode (hot reload)
npm run dev
# → API on :3001, Vite on :5173
```

## Architecture

```
mission-control-express/
├── server/
│   ├── index.js          # Express API server
│   └── data/             # Persisted project JSON (auto-created)
├── client/
│   ├── src/
│   │   ├── App.jsx       # Layout with sidebar + router outlet
│   │   ├── main.jsx      # Entry point with React Router
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Project list with stats
│   │   │   ├── ProjectDetail.jsx  # Project detail with metrics/milestones/tasks
│   │   │   └── ProjectEdit.jsx    # Edit project form
│   │   └── data/
│   │       └── projectMetadata.js # Static project sections/metrics/tasks
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── package.json
```

## API Endpoints

| Method | Path              | Description          |
|--------|-------------------|----------------------|
| GET    | /api/projects     | List all projects    |
| GET    | /api/projects/:id | Get single project   |
| PUT    | /api/projects/:id | Update project       |
| POST   | /api/projects     | Create new project   |

## Features

- 6 projects: WorkSafeAI, Mission Control, Consensus, LinkedIn Automation, Hyperscaler Briefings, Project Warp Speed
- Project detail pages with metrics, milestones, and tasks
- Edit functionality with real persistence (JSON file)
- Tailwind CSS styling
- SPA routing with React Router
- Vite dev server with API proxy
- Production build served by Express
