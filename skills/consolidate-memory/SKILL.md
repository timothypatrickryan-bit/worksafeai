# Consolidate Memory Skill

**Purpose:** Extract key decisions, preferences, and facts from conversation logs and update memory files  
**Trigger:** Daily @ 10 PM EST (automated)  
**Runtime:** ~5-10 minutes  
**Output:** Updated memory files + consolidation report

---

## 📋 PROCESS

### Phase 1: Extract (2 min)
1. Read past 24 hours of conversation logs (from message history or session transcripts)
2. Identify key decisions made
3. Extract important preferences or operating rules
4. Note new facts, patterns, or insights
5. Flag items for promotion to long-term memory

### Phase 2: Update Recent Memory (2 min)
1. Add new events to `recent-memory.md`
2. Remove items older than 48 hours (rolling window)
3. Add new decisions/context
4. Update status of ongoing work
5. Note any blockers or alerts

### Phase 3: Consolidate Long-Term (3 min)
1. Review items flagged for promotion
2. Add proven patterns to `long-term-memory.md`
3. Update operating rules if needed
4. Archive outdated information
5. Reorganize sections for clarity

### Phase 4: Update Project Memory (2 min)
1. Review project status updates
2. Update `project-memory.md` with current state
3. Note completions and in-progress items
4. Update metrics where available
5. Flag any critical blockers

### Phase 5: Report (1 min)
1. Create consolidation report
2. Log to `.memory-consolidation.log`
3. Archive report to memory/consolidation-reports/

---

## 🔍 EXTRACTION RULES

### What to Extract
- **Decisions:** What was decided, why, who decided
- **Preferences:** Operating rules, communication style, time constraints
- **Facts:** Technical details, metrics, completion status
- **Patterns:** Recurring themes, successful approaches
- **Blockers:** Issues preventing progress, escalation needed

### What to Promote to Long-Term
- ✅ Proven patterns (> 2 confirmations)
- ✅ Core operating rules (used consistently)
- ✅ Mission-critical facts (affect multiple projects)
- ✅ Lessons learned (inform future decisions)
- ❌ Temporary context (scheduled tasks, one-off events)
- ❌ Resolved issues (already fixed, not recurring)

### What to Archive to Recent-Memory
- ✅ Today's events and decisions
- ✅ Current task status
- ✅ Ongoing issues
- ✅ New context affecting today's work
- ❌ Stale status (>48 hours old)
- ❌ Resolved tasks (move to project-memory)

---

## 📝 MEMORY FILE STRUCTURE

### recent-memory.md (48-hour rolling)
```markdown
# Lucy's Recent Memory (48-Hour Rolling Context)

**Last Updated:** [YYYY-MM-DD HH:MM:SS]
**Scope:** Last 48 hours of key events, decisions, and context

## 🎯 TODAY ([DATE])
- [Events and decisions from today]

## [YESTERDAY'S DATE]
- [Events and decisions from yesterday]

## 🔑 KEY DECISIONS
- Decision 1: Context + reasoning
- Decision 2: Context + reasoning

## 🧠 IMPORTANT CONTEXT
- Context 1: Relevance and impact

## 📋 IMMEDIATE NEXT STEPS
1. Action 1
2. Action 2

## 🔗 See Also
- References to other memory files
```

### long-term-memory.md (consolidated facts)
```markdown
# Lucy's Long-Term Memory

**Last Updated:** [DATE]
**Scope:** Core facts, proven patterns, preferences

## 🎯 CORE MISSION
- Mission statement

## 👤 ABOUT TIM RYAN
- Key facts about user

## 🤖 LUCY'S IDENTITY & PRINCIPLES
- Operating principles
- Decision-making rules
- Preferred approaches

## 🏗️ SYSTEM ARCHITECTURE
- Tech stack (locked in)
- Proven patterns
- Scaling approach

## 📊 PROVEN METRICS
- Velocity metrics
- Quality metrics
- Efficiency metrics

## 🎓 LESSONS LEARNED
- Lesson 1: Context + application
- Lesson 2: Context + application
```

### project-memory.md (active project state)
```markdown
# Lucy's Project Memory

**Last Updated:** [DATE]
**Scope:** Current status of all active projects

## 📊 PROJECT DASHBOARD
| Project | Status | Progress | Next |

## 🎯 PROJECT 1: [Name]
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

## 📈 SUCCESS METRICS
- Metrics

## 🎓 ACTIVE LEARNING
- Successes
- Improvements
```

---

## ⚙️ IMPLEMENTATION

### Script Location
`scripts/consolidate-memory.js`

### Schedule
- **Trigger:** 10 PM EST daily (via launchd)
- **Job:** `com.openclaw.consolidate-memory`
- **Frequency:** Once per day
- **Timeout:** 15 minutes

### Manual Run
```bash
node scripts/consolidate-memory.js
```

### Automation Setup
```bash
# Create launchd job
cat > ~/Library/LaunchAgents/com.openclaw.consolidate-memory.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.consolidate-memory</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/timothyryan/.openclaw/workspace/scripts/consolidate-memory.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>22</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/timothyryan/.openclaw/workspace/.memory-consolidation.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/timothyryan/.openclaw/workspace/.memory-consolidation-error.log</string>
</dict>
</plist>
EOF

# Load the job
launchctl load ~/Library/LaunchAgents/com.openclaw.consolidate-memory.plist
```

---

## 📊 SAMPLE OUTPUT

### Consolidation Report
```
✅ MEMORY CONSOLIDATION — 2026-03-29 @ 22:00 EST

📖 RECENT MEMORY UPDATED:
   • Added 12 new events
   • Removed 5 stale items (>48h)
   • Updated 8 ongoing tasks
   • Flagged 3 items for long-term promotion

🧠 LONG-TERM MEMORY UPDATED:
   • Added 2 new proven patterns
   • Updated 5 operating principles
   • Promoted 1 lesson learned
   • Consolidated 3 sections for clarity

📋 PROJECT MEMORY UPDATED:
   • 6 projects reviewed
   • 8 status updates
   • 2 completions logged
   • 1 blocker flagged

📈 STATISTICS:
   • Total items processed: 26
   • Items promoted: 6
   • Items archived: 5
   • New insights: 3

⏱️ PERFORMANCE:
   • Extraction: 2m 14s
   • Updates: 3m 42s
   • Reporting: 1m 03s
   • Total: 6m 59s

✅ NEXT CONSOLIDATION: 2026-03-30 @ 22:00 EST
```

---

## 🔗 INTEGRATION

### Load at Startup
In session init, add:
```python
# Load recent memory inline
with open('memory/recent-memory.md') as f:
    recent_memory = f.read()
    
# Reference long-term memory by path
long_term_reference = 'memory/long-term-memory.md'
project_reference = 'memory/project-memory.md'
```

### Use During Conversation
- **Recent decisions:** Check `recent-memory.md` inline
- **Operating principles:** Reference `long-term-memory.md` by path
- **Project status:** Query `project-memory.md` by path
- **Daily context:** Load `memory/YYYY-MM-DD.md` if needed

---

## ✅ SUCCESS CRITERIA

The consolidate-memory skill is working when:
- ✅ Recent memory is updated daily with new context
- ✅ Long-term memory grows with proven patterns
- ✅ Project memory reflects current status accurately
- ✅ Consolidation reports are generated every run
- ✅ No memory inconsistencies or duplicates
- ✅ Lucy loads recent-memory.md at startup
- ✅ Startup context is available instantly

---

## 📝 NOTES

- **Data quality matters:** Extract with intent; bad consolidation hurts future decisions
- **Promotion threshold:** Require >2 confirmations before promoting to long-term
- **Archive, don't delete:** Keep old files in memory/archive/ for historical reference
- **Time sensitivity:** Recent memory should feel fresh; remove stale items promptly
- **Cross-linking:** Link between memory files for context discovery

---

**Created:** March 29, 2026  
**Status:** Ready to implement  
**Maintenance:** Automatic (daily @ 10 PM EST)
