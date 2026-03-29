/**
 * SAMPLE_DATA.js
 * Example data structure for testing the redesigned Unified Dashboard
 * 
 * Copy this into your state initialization to test the new 3-level hierarchy
 */

export const SAMPLE_PROJECTS = [
  {
    id: "project-1",
    name: "AI Agent Velocity Framework",
    description: "Implement AI agent velocity principles to compress timelines by 5-10x",
    status: "active",
    owner: "Tim Ryan",
    team: ["Alice Johnson", "Bob Smith"],
    dueDate: "2026-05-31",
    
    orchestratorPlan: {
      objective: "Build a comprehensive framework for AI agents to operate at optimal velocity, parallelizing work and compressing timelines by 5-10x compared to human pace.",
      phases: [
        "Phase 1: Framework Design & Architecture (2 weeks)",
        "Phase 2: Core Components Development (3 weeks)",
        "Phase 3: Integration & Testing (2 weeks)",
        "Phase 4: Documentation & Launch (1 week)"
      ],
      timeline: "8 weeks",
      metrics: [
        "Framework successfully handles 100+ concurrent tasks",
        "Documentation complete with examples",
        "90% test coverage",
        "Zero critical bugs at launch"
      ]
    }
  },
  
  {
    id: "project-2",
    name: "WorkSafeAI Platform Enhancement",
    description: "Modernize the WorkSafeAI platform with real-time analytics and ML-powered insights",
    status: "active",
    owner: "Sarah Chen",
    team: ["Michael Lee", "Jessica Davis"],
    dueDate: "2026-06-30",
    
    orchestratorPlan: {
      objective: "Transform WorkSafeAI into a real-time intelligent platform with predictive safety analytics and automated incident prevention.",
      phases: [
        "Phase 1: Requirements & UI/UX Design (1 week)",
        "Phase 2: Backend API Development (3 weeks)",
        "Phase 3: Frontend Implementation (2 weeks)",
        "Phase 4: ML Model Integration (2 weeks)",
        "Phase 5: QA & Performance Optimization (1 week)"
      ],
      timeline: "9 weeks",
      metrics: [
        "Real-time incident alerts with <30s latency",
        "Predictive accuracy of 85%+",
        "User adoption rate >75%",
        "Support ticket reduction by 40%"
      ]
    }
  },
  
  {
    id: "project-3",
    name: "Legacy System Migration",
    description: "Migrate legacy monolithic system to microservices architecture",
    status: "completed",
    owner: "David Kumar",
    team: ["Emma Wilson", "Frank Martinez"],
    dueDate: "2026-03-15",
    
    orchestratorPlan: {
      objective: "Complete migration of the legacy monolithic system to a modern microservices architecture with improved scalability and maintainability.",
      phases: [
        "Phase 1: Architecture Planning (1 week)",
        "Phase 2: Service Extraction (3 weeks)",
        "Phase 3: Data Migration (2 weeks)",
        "Phase 4: Integration Testing (1 week)",
        "Phase 5: Production Cutover (1 week)"
      ],
      timeline: "8 weeks",
      metrics: [
        "100% data integrity maintained",
        "Zero downtime during cutover",
        "API response time improved by 60%",
        "Infrastructure costs reduced by 35%"
      ]
    }
  },
  
  {
    id: "project-4",
    name: "Mobile App Development",
    description: "Build iOS and Android mobile apps for the platform",
    status: "cancelled",
    owner: "Lisa Wong",
    team: [],
    dueDate: "2026-08-31",
    
    orchestratorPlan: {
      objective: "Develop native iOS and Android applications to extend the platform's reach to mobile users.",
      phases: [
        "Phase 1: Design & Prototyping (2 weeks)",
        "Phase 2: iOS Development (4 weeks)",
        "Phase 3: Android Development (4 weeks)",
        "Phase 4: Beta Testing (2 weeks)"
      ],
      timeline: "12 weeks",
      metrics: [
        "Both platforms achieve app store approval",
        "4.5+ star rating",
        "50k+ installs in first month",
        "Offline mode functionality"
      ]
    }
  }
];

export const SAMPLE_TASKS = [
  // Project 1: AI Agent Velocity Framework - ACTIVE
  {
    id: "task-1",
    projectId: "project-1",
    title: "Define AI Agent Velocity Principles",
    description: "Document and formalize the core principles of AI agent velocity",
    status: "completed",
    assignedTo: "Alice Johnson",
    priority: 1,
    progress: 100,
    activity: [
      { timestamp: "2026-03-18 14:30", message: "Task marked as completed" },
      { timestamp: "2026-03-15 10:00", message: "Task started" }
    ]
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Build Task Parallelization Engine",
    description: "Implement the core engine for parallelizing independent tasks",
    status: "executing",
    assignedTo: "Bob Smith",
    priority: 1,
    progress: 65,
    activity: [
      { timestamp: "2026-03-18 16:45", message: "Progress update: 65% complete" }
    ]
  },
  {
    id: "task-3",
    projectId: "project-1",
    title: "Create Subagent Orchestrator",
    description: "Design and implement the subagent orchestration system",
    status: "queued",
    assignedTo: "Alice Johnson",
    priority: 2,
    activity: []
  },
  {
    id: "task-4",
    projectId: "project-1",
    title: "Write Framework Documentation",
    description: "Comprehensive documentation with examples and best practices",
    status: "planned",
    assignedTo: "Bob Smith",
    priority: 3,
    activity: []
  },
  {
    id: "task-5",
    projectId: "project-1",
    title: "Review & Approve Framework Design",
    description: "Conduct architecture review and get stakeholder approval",
    status: "briefing",
    assignedTo: "Tim Ryan",
    priority: 1,
    briefing: {
      executionPlan: {
        timeline: {
          summary: "2-day review cycle"
        },
        deliverables: [
          "Architecture document",
          "Design diagrams",
          "Risk assessment"
        ],
        milestones: [
          { name: "Initial Review", estimatedDays: 1, description: "Tim reviews design" },
          { name: "Feedback Incorporation", estimatedDays: 1, description: "Update based on feedback" }
        ],
        successCriteria: [
          { type: "Approval", description: "Design approved by stakeholders" },
          { type: "Risk", description: "All risks identified and mitigated" }
        ]
      }
    }
  },

  // Project 2: WorkSafeAI Platform Enhancement - ACTIVE
  {
    id: "task-6",
    projectId: "project-2",
    title: "Design Real-Time Analytics Dashboard",
    description: "Create UI/UX for real-time safety analytics dashboard",
    status: "executing",
    assignedTo: "Jessica Davis",
    priority: 1,
    progress: 45,
    activity: [
      { timestamp: "2026-03-18 13:00", message: "Wireframes submitted for review" }
    ]
  },
  {
    id: "task-7",
    projectId: "project-2",
    title: "Implement Incident Detection API",
    description: "Build API for real-time incident detection and alerting",
    status: "executing",
    assignedTo: "Michael Lee",
    priority: 1,
    progress: 30,
    activity: []
  },
  {
    id: "task-8",
    projectId: "project-2",
    title: "Develop Predictive Safety Model",
    description: "Create ML model for predicting safety incidents",
    status: "queued",
    assignedTo: "Michael Lee",
    priority: 1,
    activity: []
  },
  {
    id: "task-9",
    projectId: "project-2",
    title: "Frontend Implementation - Dashboard UI",
    description: "Build the real-time dashboard frontend components",
    status: "planned",
    assignedTo: "Jessica Davis",
    priority: 2,
    activity: []
  },
  {
    id: "task-10",
    projectId: "project-2",
    title: "Approve ML Model Architecture",
    description: "Review and approve the predictive model design",
    status: "briefing",
    assignedTo: "Sarah Chen",
    priority: 1,
    briefing: {
      executionPlan: {
        timeline: {
          summary: "3-day review and approval"
        },
        deliverables: [
          "Model architecture document",
          "Training dataset specification",
          "Performance benchmarks"
        ],
        milestones: [
          { name: "Design Review", estimatedDays: 1, description: "Review architecture" },
          { name: "Benchmark Validation", estimatedDays: 1, description: "Verify performance" },
          { name: "Approval", estimatedDays: 1, description: "Final approval" }
        ]
      }
    }
  },

  // Project 3: Legacy System Migration - COMPLETED
  {
    id: "task-11",
    projectId: "project-3",
    title: "Extract Database Service",
    description: "Separate database operations into independent microservice",
    status: "completed",
    assignedTo: "Emma Wilson",
    priority: 1,
    progress: 100,
    activity: [
      { timestamp: "2026-03-10 17:30", message: "Service deployed to production" }
    ]
  },
  {
    id: "task-12",
    projectId: "project-3",
    title: "Extract API Service",
    description: "Separate API operations into independent microservice",
    status: "completed",
    assignedTo: "Frank Martinez",
    priority: 1,
    progress: 100,
    activity: [
      { timestamp: "2026-03-08 14:00", message: "Service deployed to production" }
    ]
  },
  {
    id: "task-13",
    projectId: "project-3",
    title: "Migrate Data to New Schema",
    description: "Migrate all data from monolithic to microservices schema",
    status: "completed",
    assignedTo: "Emma Wilson",
    priority: 1,
    progress: 100,
    activity: [
      { timestamp: "2026-03-05 11:20", message: "Data migration completed with zero errors" }
    ]
  },
  {
    id: "task-14",
    projectId: "project-3",
    title: "Conduct Production Cutover",
    description: "Execute the final production cutover with zero downtime",
    status: "completed",
    assignedTo: "David Kumar",
    priority: 1,
    progress: 100,
    activity: [
      { timestamp: "2026-03-01 23:45", message: "Cutover completed successfully" }
    ]
  }
];

/**
 * Usage in Your Component:
 * 
 * import { SAMPLE_PROJECTS, SAMPLE_TASKS } from './SAMPLE_DATA.js';
 * 
 * const [state, setState] = useState({
 *   projects: SAMPLE_PROJECTS,
 *   tasks: SAMPLE_TASKS
 * });
 * 
 * <UnifiedDashboardSection state={state} />
 */
