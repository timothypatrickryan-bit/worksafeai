# Mission Control - Quick Reference Card

## The Three Commands You Need

### Development (Testing Code Changes)
```bash
./scripts/mission-control.sh dev start
# http://localhost:3000
```

### Production (Stable, Real Work)
```bash
./scripts/mission-control.sh prod start
# http://localhost:3001
```

### Both (Development + Production)
```bash
./scripts/mission-control.sh all start
# Dev: 3000 | Prod: 3001
```

---

## Status & Logs

```bash
# Check what's running
./scripts/mission-control.sh status

# Watch logs
./scripts/mission-control.sh dev logs
./scripts/mission-control.sh prod logs

# Stop everything
./scripts/mission-control.sh all stop
```

---

## When You Make Code Changes

1. **Changes are in:** `/apps/mission-control/src/`

2. **Start dev:** `./scripts/mission-control.sh dev start`
   - Rebuilds from your changes
   - View at http://localhost:3000

3. **Test it works**

4. **Deploy to prod:**
   ```bash
   ./scripts/mission-control.sh prod rebuild
   ./scripts/mission-control.sh prod start
   ```
   - View at http://localhost:3001

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `./scripts/mission-control.sh dev stop` |
| Port 3001 in use | `./scripts/mission-control.sh prod stop` |
| Changes not showing | Make sure you're on correct port (dev=3000, prod=3001) |
| Server won't start | Check logs: `./scripts/mission-control.sh dev logs` |

---

## Architecture

```
Mission Control
├── DEV (3000)
│   └── Full rebuild on start
│   └── For development work
├── PROD (3001)
│   └── Pre-built version
│   └── For real operations
└── Both can run simultaneously
```

**See full docs:** `/MISSION_CONTROL_SETUP.md`

---

**Last Updated:** March 22, 2026 @ 4:00 PM EST  
**Status:** ✅ Fully operational
