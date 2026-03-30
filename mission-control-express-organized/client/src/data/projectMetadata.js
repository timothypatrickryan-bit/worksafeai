/**
 * Static project metadata - sections, metrics, milestones, tasks
 * Keyed by project ID
 */
const projectMetadata = {
  1: {
    // WorkSafeAI
    sections: [
      {
        title: 'Key Metrics',
        metrics: [
          { label: 'Users Onboarded', value: '5', trend: '+3 this week' },
          { label: 'JTSAs Completed', value: '47', trend: '+12 this month' },
          { label: 'API Uptime', value: '99.8%', trend: 'Excellent' },
          { label: 'Avg Completion Time', value: '4.2 min', trend: '-0.8 min' },
        ],
      },
      {
        title: 'Milestones',
        items: [
          { name: 'MVP Shipped', date: 'Mar 8, 2026', status: '✅ Complete', link: 'https://github.com/timothypatrickryan-bit/worksafeai/releases' },
          { name: 'Production Deployment', date: 'Mar 8, 2026', status: '✅ Complete', link: 'https://worksafeai.elevationaiwork.com' },
          { name: 'Stripe Billing', date: 'Mar 20, 2026', status: '✅ Complete', link: '/docs/worksafeai-stripe' },
          { name: 'iOS Testing', date: 'Apr 15, 2026', status: '⏳ In Progress' },
        ],
      },
      {
        title: 'Tasks',
        tasks: [
          { name: 'Setup Supabase database', status: '✅', assignee: 'Lucy' },
          { name: 'Create user authentication flow', status: '✅', assignee: 'Lucy' },
          { name: 'Build JTSA form component', status: '✅', assignee: 'Lucy' },
          { name: 'Integrate OpenAI hazard analysis', status: '✅', assignee: 'Lucy' },
          { name: 'Implement Stripe billing', status: '✅', assignee: 'Lucy' },
          { name: 'Create admin dashboard', status: '✅', assignee: 'Lucy' },
          { name: 'iOS app development (Week 2)', status: '⏳', assignee: 'Dev Team' },
          { name: 'Android app development', status: '🔵', assignee: 'Planned' },
          { name: 'Real-time collaboration features', status: '🔵', assignee: 'Planned' },
        ],
      },
    ],
  },
  2: {
    // Mission Control
    sections: [
      {
        title: 'Key Metrics',
        metrics: [
          { label: 'Dashboard Uptime', value: '100%', trend: '7 days' },
          { label: 'Agent Coordination Events', value: '342', trend: '+50 today' },
          { label: 'Task Automation Rate', value: '87%', trend: '+5% this week' },
          { label: 'Avg Response Time', value: '240ms', trend: '-80ms' },
        ],
      },
      {
        title: 'Components',
        items: [
          { name: 'Unified Dashboard', date: 'Mar 25, 2026', status: '✅ Live' },
          { name: 'Gap Analysis', date: 'Mar 18, 2026', status: '✅ Live' },
          { name: 'Team Coordination', date: 'Mar 15, 2026', status: '✅ Live' },
          { name: 'Real-time Sync', date: 'Apr 1, 2026', status: '⏳ Planned' },
        ],
      },
    ],
  },
  3: {
    // Consensus
    sections: [
      {
        title: 'Key Metrics',
        metrics: [
          { label: 'Product Reviews Analyzed', value: '1,247', trend: '+89 today' },
          { label: 'Data Sources', value: '40+', trend: 'Growing' },
          { label: 'Avg Sentiment Score', value: '7.8/10', trend: 'Positive' },
          { label: 'Search Latency', value: '320ms', trend: 'Good' },
        ],
      },
      {
        title: 'Integrations',
        items: [
          { name: 'Amazon Reviews', date: 'Integrated', status: '✅ Live' },
          { name: 'YouTube Reviews', date: 'Integrated', status: '✅ Live' },
          { name: 'Reddit Analysis', date: 'Integrated', status: '✅ Live' },
          { name: 'Twitter Sentiment', date: 'TBD', status: '🔵 Planned' },
        ],
      },
    ],
  },
  4: {
    // LinkedIn Automation
    sections: [
      {
        title: 'Campaign Metrics',
        metrics: [
          { label: 'Posts Published', value: '12', trend: 'This month' },
          { label: 'Avg Impressions', value: '2,400', trend: '+34%' },
          { label: 'Engagement Rate', value: '4.2%', trend: '+0.8%' },
          { label: 'Follower Growth', value: '+145', trend: 'This month' },
        ],
      },
      {
        title: 'Automation Status',
        items: [
          { name: 'Brave Search Integration', date: 'Tue/Thu/Sat', status: '✅ Active' },
          { name: 'Post Generation', date: 'Hourly', status: '✅ Active' },
          { name: 'Browser Relay Posting', date: 'Real-time', status: '✅ Active' },
          { name: 'Analytics Tracking', date: 'Daily', status: '✅ Active' },
        ],
      },
    ],
  },
  5: {
    // Hyperscaler Briefings
    sections: [
      {
        title: 'Publishing Metrics',
        metrics: [
          { label: 'Articles Published', value: '18/month', trend: 'Avg' },
          { label: 'Link Verification Rate', value: '100%', trend: 'All validated' },
          { label: 'Topics Covered', value: '6', trend: 'Data center + Fiber' },
          { label: 'Automation Uptime', value: '100%', trend: 'No failures' },
        ],
      },
      {
        title: 'Schedule & Status',
        items: [
          { name: 'Daily Execution', date: 'Mon-Fri @ 8 AM EST', status: '✅ Automated' },
          { name: 'Brave Search Integration', date: 'Real-time', status: '✅ Active' },
          { name: 'Link Validation', date: 'Per article', status: '✅ Active' },
          { name: 'Report Generation', date: 'Daily', status: '✅ Active' },
        ],
      },
    ],
  },
  6: {
    // Project Warp Speed
    sections: [
      {
        title: 'Strategic Metrics',
        metrics: [
          { label: 'TAM (Northeast)', value: '$5.9-7.6B', trend: 'Data Center Infra' },
          { label: 'Target 2026 Revenue', value: '$15-25M', trend: '0.25-0.4% share' },
          { label: 'Timeline Completion', value: '6 months', trend: 'Sep 25, 2026' },
          { label: 'Team Investment', value: '+5-8 hires', trend: 'Ongoing' },
        ],
      },
      {
        title: 'Work Streams (7 Total)',
        items: [
          { name: 'Market Research', date: 'Apr 15', status: '✅ Complete' },
          { name: 'Strategic Planning', date: 'Apr 30', status: '⏳ In Progress' },
          { name: 'Capabilities Assessment', date: 'May 15', status: '🔵 Queued' },
          { name: 'Marketing Plan', date: 'May 30', status: '🔵 Queued' },
          { name: 'BD Plan', date: 'Jun 15', status: '🔵 Queued' },
          { name: 'Hiring', date: 'Ongoing', status: '⏳ In Progress' },
          { name: 'Monthly Reviews', date: '1st Thu @ 9 AM EST', status: '✅ Active' },
        ],
      },
    ],
  },
  8: {
    // Home Builder Helper
    sections: [
      {
        title: 'Project Overview',
        metrics: [
          { label: 'Phase', value: 'Design', trend: 'In Progress' },
          { label: 'Design Briefings', value: '5', trend: 'Ready to execute' },
          { label: 'Target Launch', value: 'Q2 2026', trend: '6-8 weeks' },
          { label: 'Team Size', value: '1-2', trend: 'Design + Dev' },
        ],
      },
      {
        title: 'Design Phase Tasks',
        items: [
          { name: 'Concept & Wireframes', date: 'Week 1', status: '⏳ Queued' },
          { name: 'High-fidelity Design', date: 'Week 2', status: '⏳ Queued' },
          { name: 'Design System', date: 'Week 2-3', status: '⏳ Queued' },
          { name: 'Handoff & Specs', date: 'Week 3', status: '⏳ Queued' },
          { name: 'Validation & Iteration', date: 'Week 4', status: '⏳ Queued' },
        ],
      },
      {
        title: 'Key Features',
        items: [
          { name: 'Upload Design Plans', date: 'Core', status: '✨ Planned' },
          { name: 'Building Intake Form', date: 'Core', status: '✨ Planned' },
          { name: 'Timeline Management', date: 'Core', status: '✨ Planned' },
          { name: 'Decision Tracking', date: 'Core', status: '✨ Planned' },
          { name: 'Phase 2: Design Phase Tools', date: 'Future', status: '🔵 Backlog' },
        ],
      },
    ],
  },
};

export default projectMetadata;
