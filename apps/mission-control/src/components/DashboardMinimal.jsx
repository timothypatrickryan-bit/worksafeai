import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './styles/DashboardMinimal.module.css'

export default function DashboardMinimal({ state, ws }) {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({
    active: 0,
    tasks: 0,
    completion: 0,
    pending: 0,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/mission-control/projects', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        setProjects(data.projects || [])
        
        // Calculate stats
        if (data.projects) {
          const activeProjects = data.projects.filter(p => p.status === 'Active')
          const totalTasks = data.projects.reduce((sum, p) => sum + (p.taskCount || 0), 0)
          const avgCompletion = Math.round(
            data.projects.reduce((sum, p) => sum + (p.progress || 0), 0) / data.projects.length
          )
          
          setStats({
            active: activeProjects.length,
            tasks: totalTasks,
            completion: avgCompletion,
            pending: data.pendingApprovals || 3,
          })
        }
        
        setError(null)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        setError(err.message)
        // Set demo data for testing
        setProjects([
          { id: 1, name: 'WorkSafeAI', status: 'In Progress', progress: 72, owner: 'Tim Ryan', team: 'Dev Team' },
          { id: 2, name: 'Mission Control', status: 'In Progress', progress: 95, owner: 'Lucy', team: 'Platform' },
          { id: 3, name: 'Consensus', status: 'In Progress', progress: 28, owner: 'Research Team', team: 'Data' },
          { id: 4, name: 'LinkedIn Automation', status: 'Active', progress: 100, owner: 'Lucy', team: 'Marketing' },
          { id: 5, name: 'Hyperscaler Briefings', status: 'Active', progress: 100, owner: 'Lucy', team: 'Marketing' },
          { id: 6, name: 'Project Warp Speed', status: 'Active', progress: 15, owner: 'Tim Ryan', team: 'Strategy' },
        ])
        setStats({ active: 12, tasks: 47, completion: 68, pending: 3 })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'all') return p.status !== 'archived'
    if (activeTab === 'completed') return p.status === 'completed'
    if (activeTab === 'archived') return p.status === 'archived'
    return true
  })

  const recentUpdates = [
    { id: 1, activity: 'Mission Control redesign specs delivered', time: '2 hours ago', status: 'Complete' },
    { id: 2, activity: 'LinkedIn post generated and published', time: '5 hours ago', status: 'Complete' },
    { id: 3, activity: 'Gap Analysis assessment saved', time: '1 day ago', status: 'Complete' },
  ]

  return (
    <div className={styles.container} data-testid="dashboard-minimal">
      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Projects</h2>
        <p className={styles.pageDescription}>Overview of all active projects and tasks</p>
      </div>

      {/* STATS GRID */}
      <div className={styles.statsGrid} data-testid="stats-grid">
        <div className={styles.statCard} data-testid="stat-active">
          <div className={styles.statLabel}>Active</div>
          <div className={styles.statValue}>{stats.active}</div>
          <div className={styles.statMeta}>Projects</div>
        </div>
        <div className={styles.statCard} data-testid="stat-tasks">
          <div className={styles.statLabel}>Tasks</div>
          <div className={styles.statValue}>{stats.tasks}</div>
          <div className={styles.statMeta}>In progress</div>
        </div>
        <div className={styles.statCard} data-testid="stat-completion">
          <div className={styles.statLabel}>Completion</div>
          <div className={styles.statValue}>{stats.completion}%</div>
          <div className={styles.statMeta}>Overall rate</div>
        </div>
        <div className={styles.statCard} data-testid="stat-pending">
          <div className={styles.statLabel}>Pending</div>
          <div className={styles.statValue}>{stats.pending}</div>
          <div className={styles.statMeta}>Approvals</div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className={styles.errorBox} data-testid="error-message">
          ⚠️ API Error: {error}. Showing demo data.
        </div>
      )}

      {/* SECTION HEADER */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Active Projects</h3>
        <button className={styles.btnPrimary} data-testid="btn-new-project">
          New Project
        </button>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
          data-testid="tab-all"
        >
          All ({projects.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'completed' ? styles.active : ''}`}
          onClick={() => setActiveTab('completed')}
          data-testid="tab-completed"
        >
          Completed (24)
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'archived' ? styles.active : ''}`}
          onClick={() => setActiveTab('archived')}
          data-testid="tab-archived"
        >
          Archived (2)
        </button>
      </div>

      {/* PROJECTS TABLE */}
      <div className={styles.projectsTable} data-testid="projects-table">
        <div className={styles.tableHeader}>
          <div>Name</div>
          <div>Status</div>
          <div>Progress</div>
          <div>Action</div>
        </div>
        
        {loading ? (
          <div className={styles.tableRow} data-testid="loading-message">
            <div>Loading projects...</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={styles.tableRow} data-testid="empty-message">
            <div>No projects found</div>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className={styles.tableRow} data-testid={`project-row-${project.id}`}>
              <div className={styles.projectName}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  {project.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Owner: {project.owner}
                </div>
              </div>
              <div className={styles.projectStatus}>{project.status}</div>
              <div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${project.progress}%` }}
                    data-testid={`progress-bar-${project.id}`}
                  ></div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {project.progress}%
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => router.push(`/projects/${project.id}`)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '0.8'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                  data-testid={`btn-view-${project.id}`}
                >
                  View
                </button>
                <button
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '0.8'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                  data-testid={`btn-edit-${project.id}`}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RECENT UPDATES */}
      <div style={{ marginTop: '48px' }}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Updates</h3>
        </div>

        <div className={styles.projectsTable}>
          <div className={styles.tableHeader} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
            <div>Activity</div>
            <div>Time</div>
            <div>Status</div>
          </div>
          
          {recentUpdates.map((update) => (
            <div key={update.id} className={styles.tableRow} style={{ gridTemplateColumns: '2fr 1fr 1fr' }} data-testid={`update-row-${update.id}`}>
              <div className={styles.projectName}>{update.activity}</div>
              <div className={styles.projectStatus}>{update.time}</div>
              <div className={styles.projectStatus} style={{ color: '#16a34a' }}>
                {update.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
