# Briefing Generator

A powerful Node.js script that converts task objects into structured execution plans ready for the AgentBriefingApproval component.

## Overview

The Briefing Generator transforms task data into comprehensive execution briefs containing:

- **Title & Description** - Task context and goals
- **Deliverables** - Clear, actionable outputs (bulleted list)
- **Milestones** - 3-5 key checkpoints with estimated duration
- **Timeline** - Estimated hours and days to completion
- **Resources Needed** - Team, tools, infrastructure, external resources
- **Success Criteria** - Measurable ways to verify completion
- **Dependencies** - Tasks that must complete first
- **Risks** - Potential issues and mitigation strategies

## Usage

### Generate briefing for a specific task

```bash
node scripts/generate-briefing.js <taskId>
```

**Example:**
```bash
node scripts/generate-briefing.js task-1773681978523
```

**Output:** JSON object with structured execution plan to stdout

---

### Generate briefings for all tasks

```bash
node scripts/generate-briefing.js --all
```

**Output:** 
- Prints all briefings to stdout
- Saves to `.briefings.json` file

---

### Generate example briefings (5 sample tasks)

```bash
node scripts/generate-briefing.js --examples
```

**Output:**
- Displays all 5 example briefings (formatted)
- Saves to `.briefing-examples.json` file

The examples include:
1. **Design iOS Mission Control App** - Design task with Figma mockups
2. **API Hardening for iOS** - Infrastructure/security audit task
3. **DC Northeast Growth** - Business strategy task
4. **Review API Endpoint Security** - Security audit task
5. **Unified Dashboard Design** - Complex design task with dashboard integration

---

## Output Format

### JSON Structure

```json
{
  "id": "briefing-{taskId}",
  "taskId": "task-1234567890",
  "generatedAt": "2026-03-18T11:25:09.295Z",
  "task": {
    "title": "Task Title",
    "description": "Full description",
    "category": "design|development|security|research|strategy|qa|infrastructure",
    "priority": "critical|high|medium|low",
    "status": "queued|in-progress|completed|rejected",
    "assignedTo": {
      "id": "agent-id",
      "name": "Agent Name",
      "title": "Agent Title"
    },
    "dueDate": "2026-03-20T23:59:59.000Z" // or null
  },
  "executionPlan": {
    "title": "Task Title",
    "description": "Full description",
    "deliverables": [
      "Clear, actionable deliverable 1",
      "Clear, actionable deliverable 2",
      "..."
    ],
    "milestones": [
      {
        "name": "Milestone Name",
        "description": "What happens in this phase",
        "estimatedDays": 1.5
      },
      // ... 3-5 total milestones
    ],
    "timeline": {
      "estimatedHours": 24,
      "estimatedDays": 3,
      "summary": "3 days (24 hours)",
      "breakdown": [
        {
          "milestone": "Milestone Name",
          "estimatedDays": 1.5
        }
        // ...
      ]
    },
    "resourcesNeeded": {
      "team": [
        {
          "role": "Designer",
          "name": "Johnny",
          "model": "Claude Sonnet 4.6",
          "allocation": "100%"
        }
      ],
      "tools": [
        "Figma",
        "Design system / component library"
      ],
      "infrastructure": [
        "Staging environment",
        "Database access"
      ],
      "external": [
        "Third-party API access",
        "Client resources"
      ],
      "documentation": [
        "Design brief",
        "Requirements document"
      ]
    },
    "successCriteria": [
      {
        "type": "Completion",
        "description": "All deliverables completed",
        "measurement": "Checklist 100% complete"
      },
      {
        "type": "Quality",
        "description": "Meets quality standards",
        "measurement": "Code review approved"
      }
      // ...
    ],
    "dependencies": [
      {
        "type": "design",
        "description": "Design must be approved first",
        "task": "design-task-id"
      }
    ],
    "risks": [
      {
        "risk": "Scope creep",
        "likelihood": "medium|high|low",
        "impact": "critical|high|medium|low",
        "mitigation": "How to prevent or manage this risk"
      }
    ]
  }
}
```

## Smart Category Detection

The generator automatically classifies tasks by analyzing the description:

| Category | Keywords |
|----------|----------|
| **design** | design, ui, ux, mockup, figma |
| **development** | develop, code, build, api, backend, frontend |
| **security** | audit, review, security, vulnerability |
| **research** | research, analysis, investigate, competitor, trend |
| **strategy** | strategy, plan, positioning, growth, market |
| **qa** | test, qa, quality, validation |
| **infrastructure** | deploy, infra, infrastructure, devops, ci/cd |

Tasks can also include explicit `category` field to override auto-detection.

## Intelligent Timeline Estimation

Timelines are estimated based on:

1. **Category baseline**: Each category has a default effort estimate
2. **Complexity indicators**: Keywords like "multiple", "complex", "large" increase estimates
3. **Platform complexity**: "mobile" and "responsive" add 20% overhead
4. **Integration complexity**: "integration" and "api" add 10% overhead

**Examples:**
- Simple design: ~20 hours (2.5 days)
- Complex design with mobile: ~30 hours (3.75 days)
- Full-stack development: ~48 hours (6 days)
- Security audit: ~24 hours (3 days)
- Strategic planning: ~20 hours (2.5 days)

## Milestone Generation

Each category has specialized milestone patterns:

### Design Milestones
1. Discovery & Requirements (0.5d)
2. Wireframes & Flow (1d)
3. High-Fidelity Design (1.5d)
4. Design Review & Iteration (1d)
5. Handoff & Documentation (0.5d)

### Development Milestones
1. Architecture & Setup (1d)
2. Core Implementation (2.5d)
3. Testing & Optimization (1.5d)
4. Code Review & Integration (1d)
5. Staging & Deployment (0.5d)

### Security Audit Milestones
1. Scope & Planning (0.5d)
2. Vulnerability Assessment (2d)
3. Analysis & Documentation (1d)
4. Remediation Plan (1d)
5. Verification & Sign-off (0.5d)

_And similar patterns for research, strategy, QA, and infrastructure tasks._

## Resource Recommendations

Resources are automatically recommended based on task category and assigned agent:

- **Team**: Primary agent + secondary agents for complex tasks (e.g., QA for dev work)
- **Tools**: Category-specific tools (Figma for design, Git for development, etc.)
- **Infrastructure**: Access needed (staging, databases, APIs)
- **External**: Third-party services or resources required
- **Documentation**: Reference materials needed to complete the task

## Success Criteria Templates

Each category has specific success criteria templates:

### Design Success Criteria
- ✅ Quality: Mockups match brand guidelines
- ✅ Usability: Intuitive and follows UX best practices
- ✅ Technical Readiness: Feasible to implement
- ✅ Documentation: Comprehensive handoff

### Development Success Criteria
- ✅ Functionality: All features work as specified
- ✅ Quality: >80% test coverage, code review approved
- ✅ Performance: Meets performance requirements
- ✅ Deployment: Ready for production

### Security Audit Success Criteria
- ✅ Findings: All vulnerabilities identified
- ✅ Critical Issues: Remediation plan for all critical/high issues
- ✅ Compliance: Meets compliance requirements
- ✅ Remediation: Clear implementation guidance

_And similar criteria for other categories._

## Risk Assessment

The generator identifies category-specific risks:

- **Design**: Scope creep, stakeholder disagreement
- **Development**: Technical complexity, scope creep, integration issues
- **Security**: Undiscovered vulnerabilities, false positives
- **Research**: Data quality issues, biased conclusions
- **Strategy**: Market conditions change, poor execution
- **QA**: Incomplete test coverage, test environment issues
- **Infrastructure**: Deployment issues, performance degradation

Additional risks are detected from description keywords (e.g., "mobile" → platform fragmentation risk).

## Integration with AgentBriefingApproval

The briefing JSON output is formatted for direct use with the AgentBriefingApproval component:

```javascript
// Example React integration
import { AgentBriefingApproval } from '@components/AgentBriefingApproval';

function TaskApprovalFlow({ taskId }) {
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    // Fetch briefing from generate-briefing.js
    fetch(`/api/briefing/${taskId}`)
      .then(r => r.json())
      .then(setBriefing);
  }, [taskId]);

  return (
    <AgentBriefingApproval
      briefing={briefing}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
}
```

## Files Generated

When running the generator:

- **`.briefing-examples.json`** - Generated when using `--examples` flag
  - Contains 5 sample briefings for all current task types
  - ~8KB JSON file with complete briefing structures

- **`.briefings.json`** - Generated when using `--all` flag
  - Contains briefings for all tasks in mission control state
  - Updated each time the generator runs

- **Individual JSON** - Printed to stdout when specifying a single taskId
  - Can be redirected to file: `node generate-briefing.js <id> > briefing.json`

## Module Exports

The generator can be imported as a module:

```javascript
const {
  generateBriefing,
  generateAllBriefings,
  generateExampleBriefings,
  formatBriefing
} = require('./scripts/generate-briefing.js');

// Generate for single task
const state = readState();
const task = state.tasks[0];
const briefing = generateBriefing(task, state);

// Generate all
const allBriefings = generateAllBriefings(state);

// Get formatted output
const formatted = formatBriefing(briefing);
```

## Performance

- **Single task briefing**: <50ms
- **All tasks (5-10 tasks)**: <200ms
- **All tasks + file write**: <300ms

Memory efficient - can handle 100+ tasks.

## Customization

To customize briefing templates, edit these functions in `generate-briefing.js`:

- `generateDeliverables()` - Change deliverable templates per category
- `generateMilestones()` - Customize milestone structures
- `estimateHours()` - Adjust timeline estimation logic
- `generateResources()` - Modify resource recommendations
- `generateSuccessCriteria()` - Change success criteria templates
- `identifyRisks()` - Add/remove risk categories

## Examples

### Example 1: iOS Design Task
```bash
node scripts/generate-briefing.js task-iphone-missioncontrol-design
```

Generates briefing with:
- 5 design deliverables (mockups, specs, interactions, responsive, handoff)
- 5 milestones spanning 2.5 days
- Design-specific resources (Figma, design system, prototyping tools)
- Quality, usability, and documentation success criteria

### Example 2: Infrastructure Task
```bash
node scripts/generate-briefing.js task-iphone-missioncontrol-api-hardening
```

Generates briefing with:
- 2 infrastructure deliverables (audit report, implementation)
- 5 milestones spanning 5.25 days
- Infrastructure resources (scanning tools, access, documentation)
- Reliability, security, scalability success criteria

### Example 3: Strategy Task
```bash
node scripts/generate-briefing.js task-1773681978523
```

Generates briefing with:
- 5 strategic deliverables (plan, analysis, roadmap, KPIs, summary)
- 5 milestones spanning 4 days
- Research and planning resources
- Viability, alignment, clarity, measurability success criteria

## Troubleshooting

**"Task not found" error:**
- Verify taskId matches exactly (case-sensitive)
- Check `.mission-control-state.json` to see all available tasks

**Missing deliverables:**
- Check task description for explicit "Deliverables:" section
- Categories without matches use default templates
- Edit `generateDeliverables()` to customize

**Incorrect timeline:**
- Timeline is estimated based on category and complexity
- Edit `estimateHours()` to adjust baseline estimates
- Add keywords to trigger complexity multipliers

**Wrong category:**
- Add explicit `category` field to task object
- Or add keywords to task description that match category detection

## Support

For issues or suggestions, update the task in `.mission-control-state.json` and re-run:

```bash
node scripts/generate-briefing.js <taskId>
```

Generator will auto-detect updates and regenerate briefing.
