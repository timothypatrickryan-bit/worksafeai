# Using Opus-4-6 for Tough Problems

Opus-4-6 is now available as a secondary model for complex tasks. Here's how to use it.

---

## 📊 Model Comparison

| Model | Speed | Intelligence | Cost | Best For |
|-------|-------|--------------|------|----------|
| **Haiku 4-5** | ⚡ Fast | Good | $ | Daily tasks, quick answers, code reviews |
| **Sonnet 4-6** | ⚙️ Balanced | Excellent | $$ | Complex coding, analysis, planning |
| **Opus 4-6** | 🧠 Slow | Best | $$$ | Hardest problems, deep analysis, reasoning |

---

## When to Use Opus

**Use Opus when:**
- Problem is truly complex (architectural decisions, deep refactoring)
- Need extended reasoning (multi-step logic, novel problems)
- Sonnet's answer isn't satisfactory
- Working on novel/cutting-edge problems
- Need detailed explanations for hard concepts

**Don't use Opus for:**
- Simple questions (use Haiku)
- Fast iteration (code suggestions, quick fixes)
- Routine tasks (formatting, basic debugging)

---

## How to Spawn Opus for a Task

### Option 1: Direct Spawn (One-shot)

```bash
# Ask Lucy to spawn Opus for a specific problem
"Can you spawn Opus-4-6 to [hard problem here]"
```

Lucy will:
1. Spawn Opus subagent
2. Give it the full context
3. Run it to completion
4. Report results back to you

### Option 2: Request Model Override

Within a conversation:
```
"Use Opus-4-6 for this: [complex analysis]"
```

Lucy can request a session model override.

---

## Examples

### Example 1: Architecture Design
**Problem:** "Design a scalable microservices architecture for WorkSafeAI that handles 100k concurrent users"

**Ask:** "Spawn Opus-4-6 to design a scalable microservices architecture for WorkSafeAI..."

---

### Example 2: Deep Code Review
**Problem:** "Review the entire WorkSafeAI backend for security, performance, and architectural issues"

**Ask:** "Can you use Opus-4-6 for a comprehensive security + performance review?"

---

### Example 3: Algorithm Design
**Problem:** "Create an efficient algorithm to detect anomalies in job task completion patterns"

**Ask:** "Spawn Opus-4-6 to design an anomaly detection algorithm..."

---

## Cost Considerations

| Task | Model | Cost | Time |
|------|-------|------|------|
| Simple fix | Haiku | $0.01 | 10 sec |
| Complex feature | Sonnet | $0.10 | 30 sec |
| Architectural review | Opus | $1.00 | 2 min |

**Tip:** Use Opus strategically. Haiku + Sonnet handle 90% of tasks.

---

## Available Models (Config)

Current `.openclaw/openclaw.json` has:
- ✅ `anthropic/claude-haiku-4-5` (default)
- ✅ `anthropic/claude-sonnet-4-6`
- ✅ `anthropic/claude-opus-4-6` (new)

---

## When Lucy Should Suggest Opus

If you ask Lucy something complex and she detects it needs deep reasoning, she might suggest:

> "This needs extended reasoning. Should I spawn Opus-4-6 for this?"

You can say yes, or stick with Sonnet (faster + cheaper).

---

## No Subagent Available?

If subagents aren't configured, Lucy can still:
- Use Opus for the current session (slower responses in chat)
- Suggest you spawn it manually later

---

## Future: Opus for Code Reviews

Once subagent config is finalized, we can set up:

```bash
# Automated Opus code reviews (every 30 min)
# .github/workflows/opus-review.yml
- Runs Opus security review on every commit
- Auto-fixes critical issues
- Reports findings
```

---

**TL;DR:**
- Default: Haiku (fast daily work)
- Tough problems: Ask for Opus
- Cost: ~$1/use vs $0.01-0.10 for others
- Speed: Worth it for hard problems

---

**Status:** ✅ Opus-4-6 configured and ready  
**Last Updated:** March 8, 2026
