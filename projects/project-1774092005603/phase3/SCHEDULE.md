# Phase 3 Schedule Configuration — Hyperscaler Briefing Automation

**Purpose:** Detailed scheduling configuration for the daily briefing automation  
**Current Schedule:** 8:00 AM EST, Monday-Friday (weekdays only)  
**System:** macOS launchd  
**Last Updated:** March 23, 2026

---

## 📅 Current Schedule

**Time:** 8:00 AM EST (Eastern Standard Time)  
**Frequency:** Weekdays only (Monday–Friday)  
**Weekends:** Skipped (Saturday, Sunday)  
**System:** macOS LaunchAgent (runs when Tim is logged in)

**Execution Timeline:**
- 8:00:00 AM — LaunchAgent triggers job
- 8:00-8:02 AM — briefing-generator.js researches and generates briefing
- 8:02-8:03 AM — email-delivery.js sends email via Gmail SMTP
- 8:03:XX AM — Job completes, logs written

**Result:** Tim receives briefing email by 8:03 AM every weekday morning

---

## 🗓️ Detailed Schedule Specification

The schedule is defined in `briefing-automation.plist` using the `StartCalendarInterval` key:

### Monday 8:00 AM
```xml
<dict>
    <key>Weekday</key>
    <integer>1</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

### Tuesday 8:00 AM
```xml
<dict>
    <key>Weekday</key>
    <integer>2</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

### Wednesday 8:00 AM
```xml
<dict>
    <key>Weekday</key>
    <integer>3</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

### Thursday 8:00 AM
```xml
<dict>
    <key>Weekday</key>
    <integer>4</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

### Friday 8:00 AM
```xml
<dict>
    <key>Weekday</key>
    <integer>5</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

**Note:** Saturday (6) and Sunday (0) are intentionally excluded.

---

## ⏰ Timezone Handling

### Local Time vs. System Time

macOS launchd `StartCalendarInterval` uses **local time** (your system timezone), not UTC.

**Current Setup:**
- Machine timezone: America/New_York (EST/EDT)
- Configured time: 8:00 AM local time
- This is correct for sending briefings at 8:00 AM EST

### If Timezone Changes

If you move or change your system timezone, briefings will run at 8:00 AM in the new timezone:

```bash
# View current timezone
date +%Z  # Should show "EST" or "EDT"

# View system timezone setting
systemsetup -gettimezone

# If needed, adjust system timezone (requires sudo)
# Then briefings will automatically run at 8:00 AM in the new timezone
```

---

## 🔄 Alternative Schedule Options

If you want a **different schedule**, modify `briefing-automation.plist`:

### 7 Days a Week (Including Weekends)

Add Saturday (6) and Sunday (0) to the schedule:

```bash
# Open plist file in text editor
nano ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Find the </array> tag after the Friday entry
# Add these two blocks before </array>:
```

```xml
<!-- Saturday 8:00 AM -->
<dict>
    <key>Weekday</key>
    <integer>6</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
<!-- Sunday 8:00 AM -->
<dict>
    <key>Weekday</key>
    <integer>0</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

Then reload the job:

```bash
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
```

---

### Different Time (e.g., 6:00 AM or 10:00 AM)

Change the `Hour` value in all entries:

```bash
# Edit plist
nano ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Find and replace:
# <integer>8</integer> (hour) → <integer>6</integer> (for 6:00 AM)
# OR
# <integer>8</integer> (hour) → <integer>10</integer> (for 10:00 AM)
```

Valid hour values: 0–23 (0=midnight, 8=8 AM, 17=5 PM, etc.)

Then reload:

```bash
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
```

---

### Different Minutes (e.g., 8:15 AM or 8:30 AM)

Change the `Minute` value:

```bash
# Edit plist
nano ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Find and replace:
# <integer>0</integer> (minute) → <integer>15</integer> (for 8:15 AM)
# OR
# <integer>0</integer> (minute) → <integer>30</integer> (for 8:30 AM)
```

Valid minute values: 0–59

Then reload the job.

---

### Custom Weekday Combinations

You can run briefings on specific weekdays only. For example, **Monday, Wednesday, Friday only**:

Edit the plist to include only these days:

```xml
<dict>
    <key>Weekday</key>
    <integer>1</integer>  <!-- Monday -->
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
<dict>
    <key>Weekday</key>
    <integer>3</integer>  <!-- Wednesday -->
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
<dict>
    <key>Weekday</key>
    <integer>5</integer>  <!-- Friday -->
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

Then reload the job.

---

## 🛠️ How to Modify the Schedule

### Step 1: Open the plist file

```bash
# Use a text editor (nano is easiest)
nano ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Or use your preferred editor
code ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist  # VSCode
```

### Step 2: Find the StartCalendarInterval section

Look for:
```xml
<key>StartCalendarInterval</key>
<array>
    <!-- Schedule entries here -->
</array>
```

### Step 3: Modify entries as needed

- **Change time:** Modify `<integer>8</integer>` under `<key>Hour</key>`
- **Change minutes:** Modify `<integer>0</integer>` under `<key>Minute</key>`
- **Add day:** Copy a `<dict>...</dict>` block and change the `<key>Weekday</key>` value
- **Remove day:** Delete the entire `<dict>...</dict>` block for that day

### Step 4: Save and reload

```bash
# Save file (if using nano: Ctrl+X, then Y, then Enter)

# Unload the old configuration
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Load the new configuration
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Verify it loaded
launchctl list com.elevationai.hyperscaler-update
```

### Step 5: Verify syntax

```bash
# Validate plist format (should return 0 if valid)
plutil -lint ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Should output: OK
```

---

## 📋 Weekday Reference

When editing the plist, use these weekday numbers:

| Number | Day |
|--------|-----|
| 0 | Sunday |
| 1 | Monday |
| 2 | Tuesday |
| 3 | Wednesday |
| 4 | Thursday |
| 5 | Friday |
| 6 | Saturday |

---

## 🔍 Verify Current Schedule

To see the current scheduled times:

```bash
# View the plist file
cat ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist | grep -A 20 "StartCalendarInterval"

# Or use plist utilities
plutil -p ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist | grep -A 30 StartCalendarInterval
```

Expected output for current (weekdays only) schedule:
```
StartCalendarInterval = (
  {
    Hour = 8;
    Minute = 0;
    Weekday = 1;
  }
  {
    Hour = 8;
    Minute = 0;
    Weekday = 2;
  }
  ... (3, 4, 5 for Wed, Thu, Fri)
)
```

---

## ⏱️ Timing Precision

### When Does the Job Actually Run?

macOS launchd attempts to run the job at the specified time, but:

- **Precision:** ±1 minute (usually within 10 seconds of scheduled time)
- **Requirement:** Mac must be awake and Tim must be logged in
- **If Mac is asleep:** Job runs when Mac wakes up (with some delay)
- **If Tim is logged out:** Job does not run (LaunchAgent, not LaunchDaemon)

### Monitoring Job Execution

```bash
# View system log for job execution
log stream --predicate 'eventMessage contains[c] "hyperscaler"' --level debug

# Or check the log files directly
tail -50 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stdout.log
tail -50 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stderr.log
```

---

## 🔧 Advanced: Using Cron as Alternative

If you prefer standard cron scheduling (doesn't require Mac to stay awake), you can use cron instead:

```bash
# Edit crontab
crontab -e

# Add this line for 8:00 AM EST weekdays:
0 8 * * 1-5 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3/run-briefing.sh
```

**Cron advantages:**
- Works even if Mac is asleep
- Standard Unix scheduling syntax
- More reliable for long-running automation

**Cron disadvantages:**
- Doesn't run if Mac is turned off
- Requires separate .sh wrapper script

See the `run-briefing.sh` example below if you want to switch to cron.

---

## 📝 Example: run-briefing.sh (For Cron)

If you prefer cron, create this shell script:

```bash
#!/bin/bash

# /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3/run-briefing.sh

set -e

PHASE3_DIR="/Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3"
LOG_DIR="/Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs"
TIMESTAMP=$(date +%Y-%m-%d)

# Create log directory
mkdir -p "$LOG_DIR"

# Change to phase3 directory
cd "$PHASE3_DIR"

# Source environment variables (if using .zshrc)
source ~/.zshrc 2>/dev/null || true

# Generate briefing
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Generating briefing..." >> "$LOG_DIR/cron.log"
node briefing-generator.js --date "$TIMESTAMP" >> "$LOG_DIR/generator-$TIMESTAMP.log" 2>&1

# Send email
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Sending email..." >> "$LOG_DIR/cron.log"
node email-delivery.js --date "$TIMESTAMP" >> "$LOG_DIR/delivery-$TIMESTAMP.log" 2>&1

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Briefing complete" >> "$LOG_DIR/cron.log"
```

Then make it executable and add to crontab:

```bash
# Make executable
chmod +x /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3/run-briefing.sh

# Edit crontab
crontab -e

# Add line:
0 8 * * 1-5 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3/run-briefing.sh
```

---

## 🚀 Schedule Change Checklist

When changing the schedule:

- [ ] Edit plist file: `~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist`
- [ ] Verify syntax: `plutil -lint <plist file>`
- [ ] Unload old configuration: `launchctl unload <plist file>`
- [ ] Load new configuration: `launchctl load <plist file>`
- [ ] Verify it loaded: `launchctl list com.elevationai.hyperscaler-update`
- [ ] Test manually: `node briefing-generator.js && node email-delivery.js`
- [ ] Wait for next scheduled time to verify it runs
- [ ] Check logs: `tail logs/automation.log`

---

## 📞 Support

- **General operations:** See OPERATIONS.md
- **Setup issues:** See DEPLOYMENT.md
- **Email config:** See GMAIL_SETUP.md
- **Tim's quick-start:** See TIM_BRIEFING.md

---

**Current Schedule Summary:**
- ⏰ **Time:** 8:00 AM EST
- 📅 **Days:** Monday-Friday (weekdays only)
- 🔄 **System:** macOS LaunchAgent
- 📍 **Config:** `~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist`

Ready to customize? Follow the modification steps above, or contact support.
