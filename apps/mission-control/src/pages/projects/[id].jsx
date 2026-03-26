import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import SidebarMinimal from '../../components/Sidebar.minimal'

// Project metadata by ID - what information matters for each project
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
        ]
      },
      {
        title: 'Milestones',
        items: [
          { name: 'MVP Shipped', date: 'Mar 8, 2026', status: '✅ Complete', link: 'https://github.com/timothypatrickryan-bit/worksafeai/releases' },
          { name: 'Production Deployment', date: 'Mar 8, 2026', status: '✅ Complete', link: 'https://worksafeai.elevationaiwork.com' },
          { name: 'Stripe Billing', date: 'Mar 20, 2026', status: '✅ Complete', link: '/docs/worksafeai-stripe' },
          { name: 'iOS Testing', date: 'Apr 15, 2026', status: '⏳ In Progress' },
        ]
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
        ]
      },

    ]
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
        ]
      },
      {
        title: 'Components',
        items: [
          { name: 'Unified Dashboard', date: 'Mar 25, 2026', status: '✅ Live' },
          { name: 'Gap Analysis', date: 'Mar 18, 2026', status: '✅ Live' },
          { name: 'Team Coordination', date: 'Mar 15, 2026', status: '✅ Live' },
          { name: 'Real-time Sync', date: 'Apr 1, 2026', status: '⏳ Planned' },
        ]
      },

    ]
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
        ]
      },
      {
        title: 'Integrations',
        items: [
          { name: 'Amazon Reviews', date: 'Integrated', status: '✅ Live' },
          { name: 'YouTube Reviews', date: 'Integrated', status: '✅ Live' },
          { name: 'Reddit Analysis', date: 'Integrated', status: '✅ Live' },
          { name: 'Twitter Sentiment', date: 'TBD', status: '🔵 Planned' },
        ]
      },

    ]
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
        ]
      },
      {
        title: 'Automation Status',
        items: [
          { name: 'Brave Search Integration', date: 'Tue/Thu/Sat', status: '✅ Active' },
          { name: 'Post Generation', date: 'Hourly', status: '✅ Active' },
          { name: 'Browser Relay Posting', date: 'Real-time', status: '✅ Active' },
          { name: 'Analytics Tracking', date: 'Daily', status: '✅ Active' },
        ]
      },

    ]
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
        ]
      },
      {
        title: 'Schedule & Status',
        items: [
          { name: 'Daily Execution', date: 'Mon-Fri @ 8 AM EST', status: '✅ Automated' },
          { name: 'Brave Search Integration', date: 'Real-time', status: '✅ Active' },
          { name: 'Link Validation', date: 'Per article', status: '✅ Active' },
          { name: 'Report Generation', date: 'Daily', status: '✅ Active' },
        ]
      },

    ]
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
        ]
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
        ]
      },

    ]
  }
}

export default function ProjectDetail() {
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/mission-control/projects?id=${id}`)
        if (!response.ok) throw new Error('Failed to fetch project')
        const data = await response.json()
        
        const proj = data.projects?.find(p => p.id === parseInt(id))
        if (!proj) throw new Error('Project not found')
        
        setProject(proj)
        setError(null)
      } catch (err) {
        setError(err.message)
        setProject(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const metadata = id ? projectMetadata[parseInt(id)] : null

  const [currentSection, setCurrentSection] = useState('unified-dashboard')

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-red-600 text-center">Error: {error}</div>
  if (!project) return <div className="p-8 text-center">Project not found</div>

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarMinimal currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-12 space-y-8">
          <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-gray-600 text-sm mt-1">{project.description}</p>
        </div>

        {/* Key Stats Bar */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">Status</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{project.status}</div>
          </div>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">Progress</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{project.progress}%</div>
          </div>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">Tasks</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{project.taskCount}</div>
          </div>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">Owner</div>
            <div className="text-sm font-bold text-gray-900 mt-1">{project.owner || 'Team'}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Overall Progress</h3>
            <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Sections */}
        {metadata && metadata.sections && (
          <div className="space-y-6">
            {metadata.sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-gray-900">{section.title}</h2>
                </div>
                <div className="p-4">
                  {/* Metrics Grid */}
                  {section.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {section.metrics.map((metric, i) => (
                        <div key={i} className="border border-gray-200 rounded p-3">
                          <div className="text-xs text-gray-600 font-semibold">{metric.label}</div>
                          <div className="text-xl font-bold text-gray-900 mt-1">{metric.value}</div>
                          <div className="text-xs text-gray-500 mt-1">{metric.trend}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status Items / Milestones */}
                  {section.items && (
                    <div className="space-y-2">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {item.link ? (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {item.name} ↗
                                </a>
                              ) : (
                                item.name
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{item.date}</div>
                          </div>
                          <div className="text-sm font-bold">{item.status}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tasks List */}
                  {section.tasks && (
                    <div className="space-y-2">
                      {section.tasks.map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                            <div className="text-xs text-gray-600">Assigned to: {task.assignee}</div>
                          </div>
                          <div className="text-sm font-bold">{task.status}</div>
                        </div>
                      ))}
                    </div>
                  )}


                </div>
              </div>
            ))}
          </div>
        )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/projects/${id}/edit`)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition"
              >
                Edit Project
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded hover:bg-gray-300 transition"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
