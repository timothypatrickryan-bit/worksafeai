#!/bin/bash
set -e

# App Scaffolding Script
# Creates a complete new app with api, web, and admin templates
# Usage: ./scripts/create-app.sh <APP_NAME>
# Example: ./scripts/create-app.sh myapp

APP_NAME=$1
APP_NAME_NICE=$(echo "$APP_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\U\1/g')

if [ -z "$APP_NAME" ]; then
  echo "❌ Usage: $0 <APP_NAME>"
  echo "Example: $0 myapp"
  exit 1
fi

if [ -d "apps/$APP_NAME" ]; then
  echo "❌ Error: apps/$APP_NAME already exists"
  exit 1
fi

echo "🚀 Creating new app: $APP_NAME"
echo ""

# Create directory structure
echo "→ Creating directories..."
mkdir -p "apps/$APP_NAME/api/src/routes"
mkdir -p "apps/$APP_NAME/api/src/middleware"
mkdir -p "apps/$APP_NAME/api/src/services"
mkdir -p "apps/$APP_NAME/api/src/validation"
mkdir -p "apps/$APP_NAME/web/src/components"
mkdir -p "apps/$APP_NAME/web/src/pages"
mkdir -p "apps/$APP_NAME/web/src/stores"
mkdir -p "apps/$APP_NAME/.github/workflows"

# Backend: package.json
echo "→ Creating backend package.json..."
cat > "apps/$APP_NAME/api/package.json" << 'PKGJSON'
{
  "name": "APPNAME-api",
  "version": "1.0.0",
  "description": "API server for APPNAME",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --detectOpenHandles --forceExit",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^5.2.1",
    "helmet": "^8.1.0",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "@supabase/supabase-js": "^2.98.0",
    "jsonwebtoken": "^9.0.3",
    "bcrypt": "^6.0.0",
    "zod": "^4.3.6",
    "nodemailer": "^8.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
PKGJSON

# Replace APPNAME
sed -i '' "s/APPNAME/$APP_NAME/g" "apps/$APP_NAME/api/package.json"

# Backend: .env
echo "→ Creating backend .env..."
cat > "apps/$APP_NAME/api/.env" << 'ENVFILE'
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRY=3600
CORS_ORIGIN=http://localhost:5173
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
ENVFILE

# Backend: .gitignore
echo "→ Creating backend .gitignore..."
cat > "apps/$APP_NAME/api/.gitignore" << 'GITIGNORE'
node_modules/
.env
.env.local
.env.*.local
dist/
.vercel
.vercel/
*.log
GITIGNORE

# Backend: vercel.json
echo "→ Creating backend vercel.json..."
cat > "apps/$APP_NAME/api/vercel.json" << 'VERCEL'
{
  "version": 2,
  "buildCommand": "npm install",
  "env": {
    "NODE_ENV": "production"
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/src/server.js" }
  ]
}
VERCEL

# Backend: server.js
echo "→ Creating backend server.js..."
cat > "apps/$APP_NAME/api/src/server.js" << 'SERVERJS'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes go here
// app.use('/api/auth', require('./routes/auth'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});

module.exports = app;
SERVERJS

# Frontend: package.json
echo "→ Creating frontend package.json..."
cat > "apps/$APP_NAME/web/package.json" << 'PKGJSON'
{
  "name": "APPNAME-web",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "echo 'tests not configured'"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "@supabase/supabase-js": "^2.98.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
PKGJSON

sed -i '' "s/APPNAME/$APP_NAME/g" "apps/$APP_NAME/web/package.json"

# Frontend: .env
echo "→ Creating frontend .env..."
cat > "apps/$APP_NAME/web/.env" << 'ENVFILE'
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
ENVFILE

# Frontend: vite.config.js
echo "→ Creating frontend vite.config.js..."
cat > "apps/$APP_NAME/web/vite.config.js" << 'VITECONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
VITECONFIG

# Frontend: index.html
echo "→ Creating frontend index.html..."
cat > "apps/$APP_NAME/web/index.html" << 'HTMLFILE'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APPNAME_NICE</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
HTMLFILE

sed -i '' "s/APPNAME_NICE/$APP_NAME_NICE/g" "apps/$APP_NAME/web/index.html"

# Frontend: tailwind.config.js
echo "→ Creating frontend tailwind.config.js..."
cat > "apps/$APP_NAME/web/tailwind.config.js" << 'TAILWIND'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
TAILWIND

# Frontend: src/main.jsx
echo "→ Creating frontend src/main.jsx..."
cat > "apps/$APP_NAME/web/src/main.jsx" << 'MAIN'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
MAIN

# Frontend: src/index.css
echo "→ Creating frontend src/index.css..."
cat > "apps/$APP_NAME/web/src/index.css" << 'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
CSS

# Frontend: src/App.jsx
echo "→ Creating frontend src/App.jsx..."
cat > "apps/$APP_NAME/web/src/App.jsx" << 'APP'
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to APPNAME_NICE</h1>
        <p className="text-lg text-gray-600">Your new app is ready to build.</p>
      </div>
    </div>
  )
}
APP

sed -i '' "s/APPNAME_NICE/$APP_NAME_NICE/g" "apps/$APP_NAME/web/src/App.jsx"

# GitHub Actions workflow
echo "→ Creating GitHub Actions workflow..."
cat > "apps/$APP_NAME/.github/workflows/deploy.yml" << 'GHACTIONS'
name: Deploy to Vercel

on:
  push:
    branches: [main]

env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel deploy --prod --token $VERCEL_TOKEN
GHACTIONS

# Frontend: .gitignore
echo "→ Creating frontend .gitignore..."
cat > "apps/$APP_NAME/web/.gitignore" << 'GITIGNORE'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local
.env
.vercel
GITIGNORE

# Root README
echo "→ Creating app README..."
cat > "apps/$APP_NAME/README.md" << 'README'
# APPNAME_NICE

Your new app scaffolded with React, Express, and Supabase.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies (both frontend and backend)
cd apps/APPNAME/api && npm install
cd ../web && npm install
```

### Configuration

1. **Backend (.env)**
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Supabase
   - `JWT_SECRET` for authentication

2. **Frontend (.env)**
   - `VITE_API_URL` (backend URL)
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Development

```bash
# Terminal 1: Start backend
cd apps/APPNAME/api
npm run dev

# Terminal 2: Start frontend
cd apps/APPNAME/web
npm run dev
```

Visit `http://localhost:5173`

### Deployment

```bash
# Deploy to Vercel
cd apps/APPNAME/api
vercel deploy --prod

cd ../web
vercel deploy --prod
```

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Express + Node.js
- **Database:** PostgreSQL (via Supabase)
- **Hosting:** Vercel

## File Structure

```
apps/APPNAME/
├── api/               # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── web/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Next Steps

1. Configure environment variables
2. Set up database schema in Supabase
3. Create API routes
4. Build UI components
5. Deploy!

---

**Generated:** $(date)
README

sed -i '' "s/APPNAME/$APP_NAME/g" "apps/$APP_NAME/README.md"
sed -i '' "s/APPNAME_NICE/$APP_NAME_NICE/g" "apps/$APP_NAME/README.md"

echo ""
echo "✅ App scaffolding complete!"
echo ""
echo "📁 Created structure:"
echo "   apps/$APP_NAME/"
echo "   ├── api/          (Express backend)"
echo "   ├── web/          (React frontend)"
echo "   ├── .github/      (GitHub Actions)"
echo "   └── README.md"
echo ""
echo "🚀 Next steps:"
echo "   1. cd apps/$APP_NAME"
echo "   2. cd api && npm install"
echo "   3. cd ../web && npm install"
echo "   4. Configure .env files with real credentials"
echo "   5. npm run dev (from each directory in separate terminals)"
echo ""
echo "⏱️  Time saved: ~40 minutes! 🎉"
