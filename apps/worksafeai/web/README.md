# JTSA Frontend

React web UI for the JTSA (Job Task Safety Assessment) Tool.

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ (same as backend)
- Backend running on `http://localhost:3000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── pages/           # Main page components
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── DashboardPage.jsx
├── components/      # Reusable components
│   └── Layout.jsx
├── stores/          # Zustand state management
│   └── authStore.js
├── api/             # API client setup
│   └── client.js
├── App.jsx          # Main app with routing
├── main.jsx         # Entry point
└── index.css        # Tailwind CSS
```

## Environment Variables

`.env` file:
```
VITE_API_URL=http://localhost:3000/api
```

For production, update to your deployed API URL.

## Current Pages

### Implemented
- **Login** (`/login`) - Sign in with email/password
- **Register** (`/register`) - Create new account + company
- **Dashboard** (`/dashboard`) - Overview stats, quick actions

### In Development
- JTSA list & create
- Project management
- Billing UI
- Admin panel
- User management

## Design Notes

All pages use:
- **Color scheme:** Blue primary, green secondary, light gray backgrounds
- **Typography:** System fonts, Tailwind classes
- **Layout:** Sidebar nav (authenticated pages), centered forms (auth pages)
- **Components:** Simple Tailwind + Lucide icons (no shadcn yet)

## API Integration

All API calls go through `src/api/client.js` which:
- Adds JWT token from cookies to every request
- Handles token refresh automatically
- Sets proper CORS headers
- Redirects to login on 401

## Next Steps

1. **Feedback on look/feel** - Tim reviews and suggests design changes
2. **JTSA workflows** - Create, view, update, complete JTSA
3. **Billing UI** - Subscribe, change tier, view status
4. **Admin features** - Manage users, audit log, reports
5. **Mobile-responsive** - Ensure works on tablets/phones

## Scripts

```bash
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Lint with ESLint (if configured)
```

## Known Issues / TODO

- [ ] Add form validation feedback
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Add modal/dialog components
- [ ] Add table component for lists
- [ ] Add date picker for JTSA creation
- [ ] Add file upload for PDFs
- [ ] Add search/filter on lists
- [ ] Add responsive mobile views
- [ ] Add dark mode toggle (optional)

---

Ready for Tim's design feedback! Current UI is minimal and clean, easy to customize.
