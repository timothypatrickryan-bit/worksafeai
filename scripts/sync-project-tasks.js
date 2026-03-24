#!/usr/bin/env node

/**
 * Sync Project Tasks
 * 
 * Syncs the 3 Data Center Weekly Update tasks into the mission control state.
 * This adds the queued tasks to the state file so the dashboard can track them.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.mission-control-state.json');

// Tasks for Data Center Weekly Update project
const newTasks = [
  {
    id: 'task-dcwu-1-email-automation',
    projectId: 'project-1774041827180', // Data Center Weekly Update
    title: 'Email Automation Setup',
    description: 'Configure Vercel cron endpoint to send Friday morning emails at 9 AM EST',
    status: 'queued',
    priority: 1,
    assignedTo: 'Lucy',
    createdAt: new Date().toISOString(),
    dueDate: new Date(2026, 2, 28, 8, 0, 0).toISOString(), // Friday March 28, 8 AM
    effort: '1.5 hours',
    briefing: {
      executionPlan: {
        timeline: { summary: '1.5 hours' },
        deliverables: [
          'Vercel cron endpoint created and deployed',
          'Email template designed (HTML + plain-text)',
          'Gmail SMTP relay configured',
          'Test email sent and received',
          'Automation verified and ready'
        ],
        milestones: [
          { name: 'Email Template', estimatedDays: 0.25 },
          { name: 'Vercel Endpoint', estimatedDays: 0.3 },
          { name: 'Gmail SMTP Setup', estimatedDays: 0.15 },
          { name: 'Testing & Verification', estimatedDays: 0.3 }
        ]
      }
    }
  },
  {
    id: 'task-dcwu-2-research-framework',
    projectId: 'project-1774041827180', // Data Center Weekly Update
    title: 'Research Framework Setup',
    description: 'Define data sources, research methodology, and analysis framework for weekly briefings',
    status: 'queued',
    priority: 1,
    assignedTo: 'Scout',
    createdAt: new Date().toISOString(),
    dueDate: new Date(2026, 2, 26, 17, 0, 0).toISOString(), // Wednesday March 26, 5 PM
    effort: '2-3 hours',
    briefing: {
      executionPlan: {
        timeline: { summary: '2-3 hours' },
        deliverables: [
          '10+ qualified data sources identified and vetted',
          'Geographic focus confirmed (upstate NY, NJ, PA)',
          'Analysis template defined',
          'Data collection process documented',
          'Quality standards established'
        ],
        milestones: [
          { name: 'Source Research', estimatedDays: 0.75 },
          { name: 'Vetting & Selection', estimatedDays: 0.5 },
          { name: 'Template Design', estimatedDays: 0.75 },
          { name: 'Process Documentation', estimatedDays: 0.5 }
        ]
      }
    }
  },
  {
    id: 'task-dcwu-3-first-email',
    projectId: 'project-1774041827180', // Data Center Weekly Update
    title: 'First Email Draft & Delivery',
    description: 'Create first polished, analysis-rich email following the framework and send via automation system',
    status: 'queued',
    priority: 1,
    assignedTo: 'Steven',
    createdAt: new Date().toISOString(),
    dueDate: new Date(2026, 2, 28, 8, 45, 0).toISOString(), // Friday March 28, 8:45 AM
    effort: '2-3 hours',
    briefing: {
      executionPlan: {
        timeline: { summary: '2-3 hours' },
        deliverables: [
          'Market analysis for DC construction in Northeast',
          'Geographic breakdown (upstate NY, NJ, PA)',
          'Key trends & insights identified',
          'Clean, polished email format',
          'Proof that email sent successfully'
        ],
        milestones: [
          { name: 'Research & Analysis', estimatedDays: 1 },
          { name: 'Writing & Formatting', estimatedDays: 0.75 },
          { name: 'Testing & Delivery', estimatedDays: 0.25 }
        ]
      }
    }
  }
];

function main() {
  try {
    // Read current state
    const stateRaw = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(stateRaw);

    // Find Data Center Weekly Update project
    const dcwuProject = state.projects.find(p => p.id === 'project-1774041827180');
    if (!dcwuProject) {
      console.error('❌ Data Center Weekly Update project not found');
      process.exit(1);
    }

    console.log(`📊 Syncing tasks for: ${dcwuProject.name}`);
    console.log(`   Current tasks: ${state.tasks.length}`);

    // Add new tasks (avoid duplicates)
    let added = 0;
    newTasks.forEach(task => {
      const exists = state.tasks.some(t => t.id === task.id);
      if (!exists) {
        state.tasks.push(task);
        added++;
        console.log(`   ✅ Added: ${task.title}`);
      } else {
        console.log(`   ⏭️  Skipped (exists): ${task.title}`);
      }
    });

    // Update project stats
    const projectTasks = state.tasks.filter(t => t.projectId === dcwuProject.id);
    dcwuProject.taskCount = projectTasks.length;
    dcwuProject.progress = 0; // No tasks complete yet

    // Write back
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

    console.log(`\n✅ Sync complete:`);
    console.log(`   Added: ${added} tasks`);
    console.log(`   Project now has: ${projectTasks.length} tasks`);
    console.log(`   Total tasks in system: ${state.tasks.length}`);
  } catch (error) {
    console.error(`❌ Sync failed: ${error.message}`);
    process.exit(1);
  }
}

main();
