const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '.mission-control-state.json');

function readState() {
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

const tasks = [
  {
    id: `task-unified-dashboard-plan-${Date.now()}`,
    title: "Plan: Unified Dashboard Architecture & Wireframes",
    description: "Create comprehensive plan for consolidating Task Progress, Tasks, Briefings, and Projects pages into one unified project management dashboard",
    assignedTo: "johnny",
    status: "briefing",
    priority: 1,
    pillar: "VALUE",
    createdAt: new Date().toISOString(),
    briefing: {
      executionPlan: {
        timeline: { summary: "2 days" },
        deliverables: [
          "Information architecture document (4 view levels: Portfolio → Project → Task → Approval)",
          "User journey map showing navigation flows",
          "Wireframe sketches (desktop, tablet, mobile)",
          "Data flow diagram connecting tasks, briefings, projects",
          "Feature priority matrix (MVP vs enhancements)"
        ],
        milestones: [
          { name: "Analyze Current Pages", description: "Review Task Progress, Tasks, Briefings, Projects sections", estimatedDays: 0.5 },
          { name: "Create IA & Wireframes", description: "Design information architecture and wireframes", estimatedDays: 1 },
          { name: "Define Interactions", description: "Document all user interactions and workflows", estimatedDays: 0.5 }
        ]
      }
    }
  },
  {
    id: `task-unified-dashboard-design-${Date.now()}`,
    title: "Design: Unified Dashboard UI Components & Visuals",
    description: "Create high-fidelity visual design system and interactive prototype for the unified dashboard with all components and responsive specs",
    assignedTo: "johnny",
    status: "briefing",
    priority: 2,
    pillar: "VALUE",
    createdAt: new Date().toISOString(),
    briefing: {
      executionPlan: {
        timeline: { summary: "2.5 days" },
        deliverables: [
          "Full visual design system (colors, typography, spacing, shadows)",
          "Component library (project cards, task cards, briefing modals, Kanban)",
          "Interactive prototype (Figma or Adobe XD)",
          "Design tokens for developer implementation",
          "Responsive design specifications (desktop, tablet, mobile)"
        ],
        milestones: [
          { name: "Visual Design System", description: "Define colors, typography, and component library", estimatedDays: 0.5 },
          { name: "Component Design", description: "Design all UI components with states", estimatedDays: 1 },
          { name: "Prototype & Specs", description: "Create interactive prototype and handoff specs", estimatedDays: 1 }
        ]
      }
    }
  },
  {
    id: `task-unified-dashboard-implement-${Date.now()}`,
    title: "Implement: Unified Dashboard Frontend & Real-Time State",
    description: "Build the unified dashboard React component with portfolio view, project details, Kanban board, real-time updates, and inline approval workflow",
    assignedTo: "chief",
    status: "briefing",
    priority: 2,
    pillar: "VALUE",
    createdAt: new Date().toISOString(),
    briefing: {
      executionPlan: {
        timeline: { summary: "3.5 days" },
        deliverables: [
          "Unified dashboard page component (Next.js page)",
          "Portfolio view with project cards and summary stats",
          "Project detail view with Kanban board for task states",
          "Task detail modal with briefing, deliverables, milestones",
          "Real-time WebSocket integration for live updates",
          "Inline approval workflow (Approve/Reject buttons)",
          "Responsive design implementation"
        ],
        milestones: [
          { name: "Component Structure", description: "Build all React components and layout", estimatedDays: 1 },
          { name: "Data Integration", description: "Connect to backend API and state management", estimatedDays: 1 },
          { name: "Real-time Updates", description: "Implement WebSocket for live progress", estimatedDays: 1 },
          { name: "Responsive Polish", description: "Mobile and tablet optimization", estimatedDays: 0.5 }
        ]
      }
    }
  },
  {
    id: `task-unified-dashboard-test-${Date.now()}`,
    title: "Test & Review: Unified Dashboard QA & E2E Testing",
    description: "Execute comprehensive testing including E2E scenarios, performance benchmarks, accessibility audit, and usability testing",
    assignedTo: "chief",
    status: "briefing",
    priority: 3,
    pillar: "RELIABILITY",
    createdAt: new Date().toISOString(),
    briefing: {
      executionPlan: {
        timeline: { summary: "2.5 days" },
        deliverables: [
          "End-to-end test scenarios (40+ user flows)",
          "Performance benchmarks (page load, real-time updates)",
          "Mobile responsiveness verification report",
          "Accessibility audit (WCAG 2.1 AA compliance)",
          "Usability testing report with recommendations"
        ],
        milestones: [
          { name: "Test Plan Creation", description: "Define test scenarios", estimatedDays: 0.5 },
          { name: "E2E Testing", description: "Execute all test scenarios", estimatedDays: 1 },
          { name: "Performance & Accessibility", description: "Performance and accessibility audit", estimatedDays: 1 }
        ]
      }
    }
  },
  {
    id: `task-unified-dashboard-deploy-${Date.now()}`,
    title: "Deploy: Unified Dashboard to Production & Monitor",
    description: "Deploy the unified dashboard to production with monitoring, analytics, and rollback procedures in place",
    assignedTo: "chief",
    status: "briefing",
    priority: 3,
    pillar: "RELIABILITY",
    createdAt: new Date().toISOString(),
    briefing: {
      executionPlan: {
        timeline: { summary: "1.5 days" },
        deliverables: [
          "Production deployment procedure and checklist",
          "Monitoring and alerting setup",
          "Performance monitoring (APM integration)",
          "User analytics integration",
          "Rollback and recovery procedures"
        ],
        milestones: [
          { name: "Deploy to Staging", description: "Stage and smoke test", estimatedDays: 0.5 },
          { name: "Monitoring Setup", description: "Configure monitoring and alerts", estimatedDays: 0.5 },
          { name: "Production Deployment", description: "Deploy to production", estimatedDays: 0.5 }
        ]
      }
    }
  }
];

const state = readState();
state.tasks.push(...tasks);
writeState(state);

console.log(`✅ Queued ${tasks.length} unified dashboard tasks`);
tasks.forEach(t => console.log(`   - ${t.title} → ${t.assignedTo}`));
