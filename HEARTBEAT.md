# HEARTBEAT.md - Periodic Tasks

## JTSA Code Reviews (Every 30 minutes)

- Spawn Opus 4.6 subagent to review `/Users/timothyryan/.openclaw/workspace/jtsa-backend/`
- Focus: Security, bugs, design issues, missing code
- Auto-fix any issues found (don't wait for approval)
- Report summary of findings + fixes applied
- If no issues: silent, just track that review passed
