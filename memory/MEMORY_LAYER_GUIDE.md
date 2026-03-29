# Lucy's Persistent Memory Layer — Setup & Usage Guide

**Created:** March 29, 2026 @ 10:20 AM EST  
**Status:** ✅ Fully Operational

---

## 📖 OVERVIEW

Lucy now has a **three-tier memory system**:

1. **recent-memory.md** — Last 48 hours of context (rolling)
2. **long-term-memory.md** — Distilled facts, proven patterns, preferences
3. **project-memory.md** — Active project state and execution status

**Plus automated consolidation:**
- Runs daily @ 10 PM EST
- Extracts key decisions from daily logs
- Promotes important insights to long-term memory
- Keeps memories fresh and relevant

---

## 🧠 THREE-TIER MEMORY SYSTEM

### Tier 1: Recent Memory (Tactical)
**File:** `memory/recent-memory.md`  
**Window:** Last 48 hours  
**Purpose:** Today's events, current decisions, active context  
**Updated:** Daily @ 10 PM EST (automated)  
**Loaded:** Inline at session startup

**What's in here:**
- Today's events and decisions
- Yesterday's summary (rolling)
- Key immediate context
- Next steps and blockers

**Usage:** Check inline for "what's happening right now?"

### Tier 2: Long-Term Memory (Strategic)
**File:** `memory/long-term-memory.md`  
**Window:** All-time (curated)  
**Purpose:** Core facts, proven patterns, operating principles  
**Updated:** When patterns prove themselves (flagged during consolidation)  
**Referenced:** By path (don't load inline)

**What's in here:**
- Core mission & goals
- Tim's preferences & communication style
- Proven architectural patterns
- Successful execution strategies
- Lessons learned
- Operating rules

**Usage:** Reference by path when: "How do I typically approach this?"

### Tier 3: Project Memory (Operational)
**File:** `memory/project-memory.md`  
**Window:** Current + recent history  
**Purpose:** All 6 projects' status, metrics, blockers  
**Updated:** Continuously + daily consolidation  
**Referenced:** By path

**What's in here:**
- Status of all 6 projects
- Current execution state
- Known issues and blockers
- Performance metrics
- Team assignments

**Usage:** Check for "What's happening with [project]?"

---

## ⚙️ AUTOMATED CONSOLIDATION

### How It Works
1. **10 PM EST Daily:** Consolidation job runs automatically
2. **Extraction:** Reads past 24 hours of daily memory files
3. **Updates:** Refreshes all three memory layers
4. **Promotion:** Flags important insights for long-term storage
5. **Report:** Logs consolidation results

### The Consolidation Script
**File:** `scripts/consolidate-memory.js`  
**Schedule:** Daily @ 10 PM EST (launchd)  
**Manual:** `node scripts/consolidate-memory.js`  

**What it does:**
- Reads `memory/YYYY-MM-DD.md` (today + yesterday)
- Updates `recent-memory.md` (rolling 48h window)
- Extracts project status → updates `project-memory.md`
- Generates consolidation report
- Logs everything to `.memory-consolidation.log`

### Log Files
- **Success log:** `.memory-consolidation.log` (normal output)
- **Error log:** `.memory-consolidation-error.log` (if errors occur)

---

## 🚀 SETUP & INSTALLATION

### Already Installed ✅
The memory layer is fully set up:
- ✅ Three memory files created
- ✅ Consolidation script installed
- ✅ Launchd automation configured
- ✅ Ready to use

### Verify Installation
```bash
# Check launchd job is loaded
launchctl list | grep consolidate-memory

# Should see: 0  com.openclaw.consolidate-memory

# Check memory files exist
ls -la memory/{recent,long-term,project}-memory.md

# View consolidation logs
tail -f .memory-consolidation.log
```

### Manual Run (Testing)
```bash
# Run consolidation immediately
node scripts/consolidate-memory.js
```

---

## 📖 LOADING AT STARTUP

### For Session Initialization
Add this to your session startup code:

```python
# Load recent memory inline (fresh context)
import os
recent_memory_path = 'memory/recent-memory.md'
with open(recent_memory_path) as f:
    recent_memory = f.read()

# Reference long-term memory by path
long_term_path = 'memory/long-term-memory.md'
project_memory_path = 'memory/project-memory.md'

# Make available in context
context = {
    'recent_memory': recent_memory,  # Inline
    'long_term_path': long_term_path,  # Reference path
    'project_memory_path': project_memory_path  # Reference path
}
```

### What This Means
- **recent-memory.md:** Load the entire file at startup (small, < 10 KB)
- **long-term-memory.md:** Keep path reference; only read when needed
- **project-memory.md:** Keep path reference; only read when needed

### Why Split Like This
- **Frequent check:** Recent memory (check daily, load inline)
- **Strategic decisions:** Long-term memory (reference as needed)
- **Operational status:** Project memory (reference as needed)

This keeps startup context lightweight while maintaining access to all memory layers.

---

## 📚 USING THE MEMORY SYSTEM

### When to Check Recent Memory
```
Current situation asks:
- "What just happened?"
- "What did Tim ask for today?"
- "What was the latest decision?"
- "What blockers came up?"
- "What's the immediate next step?"

→ Check: recent-memory.md (inline)
```

### When to Reference Long-Term Memory
```
Strategic question asks:
- "How do I typically approach this?"
- "What's Tim's preference on this?"
- "What patterns have worked before?"
- "What are our operating principles?"
- "What have we learned from past projects?"

→ Reference: long-term-memory.md (by path)
```

### When to Check Project Memory
```
Operational question asks:
- "What's the status of [project]?"
- "Who's working on what?"
- "What are the current blockers?"
- "What's our progress on [project]?"
- "Are there any known issues?"

→ Check: project-memory.md (by path)
```

---

## 🔄 DAILY WORKFLOW

### Morning (Session Start)
1. ✅ Load `recent-memory.md` inline
2. ✅ Check for high-priority items
3. ✅ Reference `long-term-memory.md` for context if needed
4. ✅ Query `project-memory.md` for current project status

### Throughout Day
- Update daily memory file (`memory/YYYY-MM-DD.md`) with events
- Check `recent-memory.md` for context on decisions
- Refer to `long-term-memory.md` for strategic guidance

### Evening (Consolidation)
- 10 PM EST: Consolidation runs automatically
- New events from daily logs → recent-memory updated
- Important patterns → flagged for long-term promotion
- Project status → automatically refreshed

---

## 📝 MEMORY FILE FORMATS

### recent-memory.md Structure
```markdown
# Lucy's Recent Memory (48-Hour Rolling Context)

**Last Updated:** [timestamp]

## 🎯 TODAY [date]
- [Events and decisions from today]

## 📅 YESTERDAY [date]
- [Summary from yesterday]

## 🔑 KEY DECISIONS
- Decision: Context + reasoning

## 🧠 IMPORTANT CONTEXT
- Item: Relevance

## 📋 IMMEDIATE NEXT STEPS
1. Step 1
2. Step 2
```

### long-term-memory.md Structure
```markdown
# Lucy's Long-Term Memory (Distilled Facts, Preferences, Patterns)

**Last Updated:** [date]

## 🎯 CORE MISSION
- [Mission statement]

## 👤 ABOUT TIM RYAN
- [Key facts]

## 🤖 LUCY'S IDENTITY & OPERATING PRINCIPLES
- [Operating rules]

## 🏗️ SYSTEM ARCHITECTURE
- [Tech stack, patterns]

## 📊 PROVEN METRICS
- [Velocity, quality, efficiency]

## 🎓 LESSONS LEARNED
- [Lesson: Context + application]
```

### project-memory.md Structure
```markdown
# Lucy's Project Memory (Active Project State)

## 📊 PROJECT DASHBOARD
| Project | Status | Progress | Next |

## 🎯 PROJECT [N]: [Name]
### Completed
- Items

### In Progress
- Items

### Known Issues
- Issues

## 🔄 CURRENT EXECUTION STATE
- Recent work
- Queued next
- Open issues
```

---

## 🔧 MAINTENANCE

### Check Consolidation Status
```bash
# View latest consolidation result
tail -20 .memory-consolidation.log

# Check for errors
cat .memory-consolidation-error.log
```

### Manual Consolidation (if needed)
```bash
# Run immediately (don't wait for 10 PM)
node scripts/consolidate-memory.js
```

### Uninstall Automation (if needed)
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.consolidate-memory.plist
```

### Reinstall Automation
```bash
bash scripts/install-memory-consolidation.sh
```

---

## 🎯 BEST PRACTICES

1. **Write daily notes** — Keep `memory/YYYY-MM-DD.md` up to date
2. **Flag for promotion** — Note patterns worth long-term storage
3. **Reference, don't reload** — Use path references for long-term memory
4. **Load recent inline** — Keep recent-memory inline for fast access
5. **Trust automation** — Let consolidation run; update memory files daily
6. **Review weekly** — Check long-term memory for accuracy & completeness

---

## 📊 SUCCESS INDICATORS

The memory system is working when:
- ✅ `recent-memory.md` updates daily (should be fresh, not stale)
- ✅ `long-term-memory.md` grows with proven patterns (monthly review)
- ✅ `project-memory.md` reflects current status accurately (continuous)
- ✅ Consolidation logs show successful runs (daily @ 10 PM EST)
- ✅ You can answer strategic questions from long-term memory
- ✅ You can answer tactical questions from recent memory
- ✅ You can answer operational questions from project memory

---

## 🔗 QUICK REFERENCE

**Files:**
- `memory/recent-memory.md` — Load at startup
- `memory/long-term-memory.md` — Reference by path
- `memory/project-memory.md` — Reference by path
- `memory/YYYY-MM-DD.md` — Daily logs (auto-created)

**Automation:**
- Consolidation: Daily @ 10 PM EST
- Script: `scripts/consolidate-memory.js`
- Logs: `.memory-consolidation.log`

**Usage:**
- Tactical: Check `recent-memory.md`
- Strategic: Reference `long-term-memory.md`
- Operational: Query `project-memory.md`

---

**Status:** ✅ Fully Operational  
**Next Consolidation:** Today @ 10 PM EST  
**Last Test:** March 29, 2026 @ 2:22 PM EST (PASSED)

🧠 **Lucy now has persistent memory!**
