# Workspace Structure

This workspace is organized to support multiple applications with shared infrastructure.

## 📁 Directory Structure

```
/workspace/
├── apps/                     # Application projects
│   ├── worksafeai/           # WorkSafeAI: Intelligence That Protects
│   │   ├── api/              # Backend (Node.js, Express, Supabase)
│   │   ├── web/              # Frontend (React, Vite, Tailwind)
│   │   ├── assets/           # App icons, branding, design files
│   │   ├── docs/             # App-specific documentation
│   │   └── README.md         # WorkSafeAI project overview
│   │
│   ├── app2/                 # Future applications
│   └── app3/
│
├── shared/                   # Shared code and utilities
│   ├── components/           # Reusable React components
│   ├── utils/                # Shared utility functions
│   ├── constants/            # Shared constants
│   └── types/                # TypeScript type definitions
│
├── tools/                    # Scripts and automation
│   ├── scripts/              # Utility scripts
│   └── generators/           # Code generators
│
├── docs/                     # Global documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DEPLOYMENT.md         # Deployment guides
│   └── CONTRIBUTING.md       # Contribution guidelines
│
├── memory/                   # Session logs and context
│   └── YYYY-MM-DD.md         # Daily session notes
│
├── MEMORY.md                 # Long-term memory & decisions
├── SOUL.md                   # Agent persona & values
├── USER.md                   # User (Tim) context
├── WORKSPACE.md              # This file
├── BRANDING.md               # Global branding guidelines
├── EMAIL_SETUP.md            # Email configuration
└── .email-config.json        # Email credentials (git-ignored)
```

## 🚀 **Getting Started**

### WorkSafeAI Development

**Backend:**
```bash
cd apps/worksafeai/api
npm install
npm run dev
```

**Frontend:**
```bash
cd apps/worksafeai/web
npm install
npm run dev
```

### Running Tests
```bash
cd apps/worksafeai/api
npm test
```

## 📋 **Key Files**

- **BRANDING.md** — App names, colors, messaging guidelines
- **EMAIL_SETUP.md** — Gmail configuration for WorkSafeAI
- **MEMORY.md** — Long-term decisions and context
- **.email-config.json** — Email credentials (never commit!)

## 🔧 **Adding a New App**

To add a new application:

1. Create the app directory:
   ```bash
   mkdir -p apps/newapp/{api,web,assets,docs}
   ```

2. Initialize backend and frontend in their respective folders

3. Create `apps/newapp/README.md` with project overview

4. Document app-specific decisions in `apps/newapp/docs/`

## 📚 **Documentation**

- **Global:** See `docs/` folder
- **App-specific:** See `apps/{appname}/docs/`
- **Agent memory:** See `memory/` folder

## 🔐 **Security Notes**

- `.email-config.json` is git-ignored (never commit credentials)
- Each app has its own `.env` (git-ignored)
- Credentials are environment variables only

---

**Last Updated:** 2026-03-07
