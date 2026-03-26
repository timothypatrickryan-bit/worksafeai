# QC + Deployment Workflow

**Established:** March 26, 2026 @ 8:58 AM EST  
**Purpose:** Ensure continuous improvement delivery with zero-defect production deployments

## Pattern Overview

```
Agent Work Complete
       ↓
    QC GATE
       ↓
  Pass → Commit to Git
       ↓
  Push to GitHub
       ↓
  GitHub Actions → Vercel Auto-Deploy
       ↓
  LIVE IN PRODUCTION
```

## Quality Control Checklist (Per Feature/Fix)

### Code Quality
- [ ] All TypeScript strict mode (no `any` types)
- [ ] No console.logs left in production code
- [ ] No hardcoded credentials or secrets
- [ ] Follow existing code style/patterns
- [ ] Proper error handling (try/catch, validation)

### Testing
- [ ] Unit tests pass (if applicable)
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing on feature (happy path + edge cases)
- [ ] No regressions in related features
- [ ] Performance impact acceptable (< 5% slower)

### API / Database
- [ ] New API endpoints documented
- [ ] Database migrations tested (if applicable)
- [ ] Query performance verified
- [ ] No SQL injection vulnerabilities
- [ ] Proper authentication/authorization

### Frontend (Web/Mobile)
- [ ] Component renders correctly (desktop, tablet, mobile)
- [ ] No console errors in browser dev tools
- [ ] Accessibility check (tab navigation, screen reader, color contrast)
- [ ] Loading states / error states handled
- [ ] No layout shifts or broken layouts

### Deployment
- [ ] Staging environment tested (full end-to-end flow)
- [ ] Rollback plan documented (if needed)
- [ ] No breaking changes to API contracts
- [ ] Environment variables configured in Vercel
- [ ] Secrets properly managed (never in code)

## Responsibility Matrix

| Role | Responsibility |
|------|-----------------|
| **Development Agent** | Implement feature, write tests, verify locally |
| **QA/Velma** | Execute QC checklist, approve for deployment |
| **Lucy (Orchestrator)** | Gate: require QC sign-off before commit/push |
| **CI/CD (GitHub Actions)** | Auto-deploy when pushed to main |
| **Vercel** | Host and serve production code |

## Workflow Steps

### Step 1: Agent Completes Work
- Feature/fix implemented
- Tests written + passing locally
- Self-tested in local environment

### Step 2: Submit for QC
- Agent marks task as "ready-for-qa"
- Create QC briefing with:
  - What changed (summary)
  - How to test it
  - Expected outcomes
  - Any risks/edge cases

### Step 3: QA Reviews (Velma or assigned QA agent)
- Execute QC checklist above
- Test in staging environment
- Document findings

### Step 4: Pass/Fail Decision
**IF PASS:**
- Agent commits changes to git
- Push to GitHub main branch
- GitHub Actions triggers auto-deploy
- Monitor Vercel deployment
- Verify in production (smoke tests)
- Close task as DONE

**IF FAIL:**
- Create QC findings document
- Tag issues as blockers
- Return to agent with prioritized fixes
- Agent fixes + resubmit for QC

### Step 5: Post-Deployment
- Monitor error logs (Vercel, Sentry, etc.)
- Verify feature working in production
- Update CHANGELOG / release notes
- Mark task complete with deployment timestamp

## Specific Apps: QC Details

### WorkSafeAI (Node.js + React)
**QC Focus:**
- Stripe integration: test all payment flows (free trial, paid, upgrade, downgrade, cancellation)
- Auth flows: test signup, login, password reset, session expiry
- JTSA workflow: create hazard, mitigation, approve, PDF export
- Email sending: verify welcome, verification, password reset emails
- Database: verify all tables, RLS policies working

**Staging:**
- https://staging-worksafeai.elevationaiwork.com (if available)
- Otherwise test locally against staging Supabase project

**Tests:**
```bash
npm test  # runs Jest suite
npm run test:integration  # end-to-end flows
```

### Consensus (Node.js + React)
**QC Focus:**
- New searchers working (Wirecutter, ATK, Outside)
- Search results returning correctly
- Ranking algorithm scoring properly
- Category coverage complete
- Links all valid (404 check)
- Performance: < 3s search response

**Tests:**
```bash
npm test  # searcher unit tests
npm run test:searchers  # integration with live sources
```

**Manual Test Cases:**
1. Search for common products (laptop, chair, router)
2. Verify all 8 sources represented in results
3. Check result rankings (most relevant first)
4. Validate all article links are working

### Mission Control (Next.js)
**QC Focus:**
- Dashboard renders all projects/tasks
- Real-time updates working (WebSocket)
- Approve/reject workflow functions
- No console errors
- Mobile responsive

**Tests:**
```bash
npm test  # Jest component tests
npm run test:e2e  # Playwright E2E tests
```

## Git Commit Standards

**Before pushing, commit message must follow:**

```
type(scope): brief description

Longer explanation if needed.

QC Status: PASS (or FAIL with details)
QC By: [Velma|Agent Name]
Test Results: 44/44 passing
Deployment: [staging|production]
Timestamp: 2026-03-26T12:58:00Z
```

**Examples:**
```
feat(stripe): Add subscription tier pricing

- Implemented Stripe billing API integration
- Added 3 tiers (Starter/Pro/Enterprise)
- Configured webhooks for payment events
- Full test coverage (44/44 passing)

QC Status: PASS
QC By: Velma
Test Results: npm test (44/44), integration tests (12/12)
Deployment: production
Timestamp: 2026-03-26T08:58:00Z

fix(consensus): Correct Wirecutter article scraping

- Fixed HTML parsing bug in WirecutterSearcher
- Added error handling for missing fields
- Validated 50 sample articles

QC Status: PASS
QC By: Scout
Test Results: searchers.integration.test.js (8/8 passing)
Deployment: production
Timestamp: 2026-03-26T09:15:00Z
```

## Rollback Procedure

If production issue detected after deployment:

1. **Immediate:** Revert last commit to main branch
2. **GitHub:** `git revert <commit-hash>`
3. **Push:** Triggers GitHub Actions → Vercel redeploys previous version
4. **Document:** Log incident + root cause in memory
5. **Fix:** Create blocker issue, agent fixes, resubmit for QC

**Estimated Rollback Time:** 3-5 minutes

## Metrics to Track

- QC pass rate (% of first-pass approvals)
- Time from "ready-for-qa" to deployed (target: < 30 min)
- Production incidents per deployment (target: < 1%)
- Test coverage (target: > 80%)

## Status Quo

**Current Setup:**
- ✅ GitHub Actions auto-deploy configured
- ✅ Vercel connected (auto-deploys on git push)
- ✅ Environment variables configured
- ✅ Need: Formal QC gating + testing protocols

**Next Steps:**
1. Assign Velma as primary QA/QC reviewer
2. Create QC briefing template
3. Set up staging environment for testing
4. Establish 30-min deployment window (QC → production)

---

**This workflow ensures:**
- 🎯 Zero broken production deployments
- ✅ Continuous improvement delivery
- 🔍 Full visibility into what's live
- 📊 Measurable quality metrics
- 🚀 Fast, safe iteration
