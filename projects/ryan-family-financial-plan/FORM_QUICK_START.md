# Interactive Intake Form — Quick Start Guide

**Project:** Ryan Family Financial Plan  
**Form ID:** ryan-family-financial-plan-intake  
**Status:** ✅ Live in Mission Control

---

## How to Use

### 1. View the Form
```bash
node scripts/intake-form-handler.js read
```
This displays all 8 sections and all fields with instructions.

---

### 2. Fill Out Your Information

**Create a JSON file** with your answers (e.g., `my-answers.json`):

```json
{
  "name": "Timothy Ryan",
  "email": "tim.ryan@pro-tel.com",
  "phone": "+1 (607) 123-4567",
  "household-status": "Single",
  "dependents": 0,
  "employment-status": "Self-Employed",
  "employer": "Pro-Tel (Professional Teleconcepts, LLC)",
  "annual-salary": 150000,
  "bonus-comp": 25000,
  "other-income": 5000,
  "years-in-role": 5,
  "employment-stability": "Stable",
  "checking-balance": 15000,
  "savings-balance": 45000,
  "emergency-fund-target": 60000,
  "investments-401k": 250000,
  "brokerage-balance": 50000,
  "real-estate-equity": 0,
  "business-equity": 500000,
  "other-assets": 0,
  "credit-card-balance": 0,
  "credit-card-rate": 0,
  "mortgage-balance": 0,
  "mortgage-rate": 0,
  "auto-loan-balance": 0,
  "student-loan-balance": 0,
  "other-debt": 0,
  "housing-total": 2000,
  "transportation-total": 800,
  "food-total": 600,
  "healthcare-total": 400,
  "personal-lifestyle": 300,
  "family-dependents": 0,
  "other-expenses": 200,
  "short-term-goals": "Optimize tax strategy, improve business efficiency",
  "medium-term-goals": "Expand Pro-Tel, invest in infrastructure",
  "long-term-goals": "Build generational wealth, sustainable business",
  "financial-concerns": "Want to maximize growth and tax efficiency",
  "risk-tolerance": "Moderate",
  "financial-values": "Growth"
}
```

**Tips:**
- Estimates are OK (we'll refine later)
- Leave blank if you don't know
- Currency fields: just numbers (no $ or commas)
- Percentages: decimal (e.g., 5.5 for 5.5%)

---

### 3. Validate Your Answers (Optional)
```bash
node scripts/intake-form-handler.js validate ryan-family-financial-plan my-answers.json
```
Checks for errors before submitting.

---

### 4. Submit Your Form
```bash
node scripts/intake-form-handler.js submit ryan-family-financial-plan my-answers.json
```

**You'll see:**
✅ Confirmation that submission was received  
📊 Automatic financial summary (calculated from your data)  
📝 Confirmation that Maxwell will review within 2-3 business days

---

### 5. Check Form Status
```bash
node scripts/intake-form-handler.js status ryan-family-financial-plan
```
Shows how many submissions received.

---

## What Gets Calculated Automatically

Once you submit, Maxwell's system auto-calculates:

| Metric | Formula |
|--------|---------|
| **Total Assets** | Checking + Savings + Investments + Real Estate + Business Equity + Other |
| **Total Debt** | Credit Cards + Mortgage + Auto Loan + Student Loans + Other |
| **Net Worth** | Total Assets - Total Debt |
| **Monthly Expenses** | Sum of all monthly expense categories |
| **Annual Income** | Salary + Bonus + Other Income |
| **Annual Burn Rate** | Monthly Expenses × 12 |
| **Savings Rate** | (Annual Income - Annual Burn Rate) ÷ Annual Income |

---

## Form Sections (8 Total)

1. **Personal Information** — Name, household, employment status
2. **Income & Employment** — Salary, business income, stability
3. **Assets** — Bank accounts, investments, real estate, business equity
4. **Debts & Liabilities** — Credit cards, mortgages, loans
5. **Monthly Expenses** — Housing, transportation, food, healthcare, lifestyle
6. **Financial Goals** — Short/medium/long-term goals and concerns
7. **Risk Tolerance & Values** — Your approach to money
8. **Summary** — Auto-calculated totals (read-only)

---

## After Submission

**Timeline:**
- ✅ Immediate: Form accepted, financial summary calculated
- 📋 2-3 days: Maxwell reviews your intake
- 📊 5-7 days: Initial financial dashboard created
- 🎯 Week 2: First action plan delivered

**What You Get:**
1. Financial Dashboard (one-page overview)
2. Monthly Budget (where your money should go)
3. Action Plan (3/6/12-month priorities)
4. Monthly Reports (tracking, alerts, progress)
5. Regular Check-ins (stay on track)

---

## Example: Sample Submission & Results

**Input:** `my-answers.json` with Tim's estimated figures

**Output (automatically calculated):**
```
✅ SUBMISSION RECEIVED

📁 Saved to: /submissions/submission-2026-03-28T22:15:00.json

📊 FINANCIAL SUMMARY:

   Total Assets:        $860,000.00
   Total Debt:          $0.00
   Net Worth:           $860,000.00
   Monthly Expenses:    $4,300.00
   Annual Income:       $180,000.00
   Annual Burn Rate:    $51,600.00
   Savings Rate:        71.3%

✨ Maxwell Reid will review this within 2-3 business days.
```

**Key Insights:**
- Strong net worth position ($860K)
- Excellent savings rate (71.3%)
- Solid monthly cashflow
- Ready for wealth-building strategy

---

## Commands Summary

| Command | Purpose |
|---------|---------|
| `node scripts/intake-form-handler.js read` | Display full form |
| `node scripts/intake-form-handler.js validate ryan-family-financial-plan my-answers.json` | Check for errors |
| `node scripts/intake-form-handler.js submit ryan-family-financial-plan my-answers.json` | Submit form |
| `node scripts/intake-form-handler.js status ryan-family-financial-plan` | Check status |

---

## Troubleshooting

**"Command not found"**
→ Make sure you're in `/Users/timothyryan/.openclaw/workspace/`

**"Validation failed"**
→ Check required fields (marked with ✓ in form): name, email, household-status, employment-status, employer, annual-salary

**"JSON error"**
→ Use valid JSON syntax. Check quotes, commas, field names match exactly.

**Missing fields**
→ That's OK! Leave them blank if you don't have the info yet.

---

## Next: What Maxwell Does

Once your intake is submitted, Maxwell will:

1. ✅ Review all your data
2. ✅ Calculate key financial metrics
3. ✅ Identify immediate concerns or opportunities
4. ✅ Create your personalized financial dashboard
5. ✅ Develop 3/6/12-month action plan
6. ✅ Set up monthly tracking and reviews

**You'll hear back in 2-3 business days with your first report.** 📊

---

**Questions?** Reply to Maxwell Reid directly via Telegram. He'll help! 🍀
