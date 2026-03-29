import React, { useState, useMemo } from 'react';
import styles from '../styles/UnifiedDashboard.module.css';
import ProjectCreationModal from '../modals/ProjectCreationModal';
import TaskCreationForm from '../modals/TaskCreationForm';

/**
 * UNIFIED DASHBOARD SECTION - 3-LEVEL HIERARCHY
 * 
 * LEVEL 1: Portfolio View with PROJECT STATUS tabs
 *   - Active Projects | Completed Projects | Cancelled Projects
 *   - Shows project cards with orchestrator plan highlights
 *   - "Create Project" button at top
 * 
 * LEVEL 2: Project Detail View
 *   - Full project info + orchestrator plan
 *   - Tasks organized by STATUS (not workflow)
 *   - APPROVALS NEEDED section
 *   - "Create Task" button
 * 
 * LEVEL 3: Task Detail View
 *   - Full briefing + milestones + deliverables
 *   - Inline approval workflow
 */

const UnifiedDashboardSection = ({ state, onApprove, onReject, onUpdateTask }) => {
  const [view, setView] = useState('portfolio'); // portfolio | project | task
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // active | completed | cancelled
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Handle approve task
  const handleApprove = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'user' }),
      });
      if (response.ok) {
        const result = await response.json();
        alert('✅ Task approved and queued for execution');
        console.log('✅ Task approved:', result);
        if (onApprove) onApprove(taskId);
      } else {
        const error = await response.text();
        alert('❌ Error: ' + error);
        console.error('Approval failed:', error);
      }
    } catch (error) {
      console.error('Failed to approve task:', error);
      alert('❌ Error approving task: ' + error.message);
    }
  };

  // Handle reject task
  const handleReject = async (taskId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: 'user', reason }),
      });
      if (response.ok) {
        alert('❌ Briefing rejected - awaiting changes');
        if (onReject) onReject(taskId);
      }
    } catch (error) {
      console.error('Failed to reject task:', error);
      alert('❌ Error rejecting task');
    }
  };

  // Calculate project stats and organize by status
  const projectStats = useMemo(() => {
    let projects = state.projects || [];
    if (projects && typeof projects === 'object' && !Array.isArray(projects)) {
      projects = Object.values(projects);
    }

    return (Array.isArray(projects) ? projects : []).map(project => {
      const projectTasks = (state.tasks || []).filter(t => t.projectId === project.id);
      
      // Organize tasks by STATUS (not internal workflow)
      const queued = projectTasks.filter(t => t.status === 'queued').length;
      const inProgress = projectTasks.filter(t => t.status === 'executing').length;
      const whatsNext = projectTasks.filter(t => t.status === 'planned' || t.status === 'backlog').length;
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const total = projectTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Health indicator
      const health = progress > 75 ? 'green' : progress > 50 ? 'yellow' : 'red';

      return {
        ...project,
        status: project.status || 'active', // active, completed, cancelled
        stats: { queued, inProgress, whatsNext, completed, total, progress },
        health,
        tasks: projectTasks,
      };
    });
  }, [state.projects, state.tasks]);

  // Filter projects by status
  const filteredProjects = useMemo(() => {
    return projectStats.filter(p => p.status === activeTab);
  }, [projectStats, activeTab]);

  const selectedProject = projectStats.find(p => p.id === selectedProjectId);
  const selectedTask = state.tasks?.find(t => t.id === selectedTaskId);

  // Group tasks by status for Project Detail view
  const tasksByStatus = useMemo(() => {
    if (!selectedProject) return {};
    return {
      queued: selectedProject.tasks.filter(t => t.status === 'queued'),
      inProgress: selectedProject.tasks.filter(t => t.status === 'executing'),
      whatsNext: selectedProject.tasks.filter(t => t.status === 'planned' || t.status === 'backlog'),
      completed: selectedProject.tasks.filter(t => t.status === 'completed'),
    };
  }, [selectedProject]);

  // Get pending approvals for selected project
  const pendingApprovals = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.tasks.filter(t => t.status === 'briefing');
  }, [selectedProject]);

  // Handle project creation success
  const handleProjectSuccess = (newProject) => {
    // Refresh the dashboard - in a real app, this would trigger a data fetch
    // For now, the parent component will handle state updates
    console.log('Project created:', newProject);
  };

  // Handle task creation success
  const handleTaskSuccess = (newTask) => {
    // Refresh the project view - in a real app, this would trigger a data fetch
    console.log('Task created:', newTask);
  };

  // ============ LEVEL 1: PORTFOLIO VIEW ============
  if (view === 'portfolio') {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h2>📊 Unified Project Management Dashboard</h2>
              <p>Your single source of truth for all projects, tasks, and approvals</p>
            </div>
            <button 
              className={styles.createProjectBtn}
              onClick={() => setShowProjectModal(true)}
            >
              🚀 Create Project
            </button>
          </div>
        </div>

        {/* Project Creation Modal */}
        <ProjectCreationModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSuccess={handleProjectSuccess}
        />

        {/* Summary Stats */}
        <div className={styles.summaryStats}>
          <div className={styles.stat}>
            <span className={styles.label}>Active Projects</span>
            <span className={styles.value}>{projectStats.filter(p => p.status === 'active').length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Total Tasks</span>
            <span className={styles.value}>{state.tasks?.length || 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Completion Rate</span>
            <span className={styles.value}>
              {projectStats.length > 0
                ? Math.round(
                    projectStats.reduce((sum, p) => sum + p.stats.progress, 0) /
                      projectStats.length
                  )
                : 0}
              %
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Pending Approvals</span>
            <span className={styles.value}>
              {(state.tasks || []).filter(t => t.status === 'briefing').length}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tab} ${activeTab === 'active' ? styles.active : ''}`}
            onClick={() => setActiveTab('active')}
          >
            ✨ Active Projects ({projectStats.filter(p => p.status === 'active').length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'completed' ? styles.active : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            ✅ Completed Projects ({projectStats.filter(p => p.status === 'completed').length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'cancelled' ? styles.active : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            ❌ Cancelled Projects ({projectStats.filter(p => p.status === 'cancelled').length})
          </button>
        </div>

        {/* Project Cards */}
        <div className={styles.projectGrid}>
          {filteredProjects.map(project => (
            <div key={project.id} className={`${styles.projectCard} ${styles[`health-${project.health}`]}`}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div>
                  <h3>{project.name}</h3>
                  <span className={styles.statusLabel}>
                    {project.status === 'active' ? '✨ Active' : project.status === 'completed' ? '✅ Completed' : '❌ Cancelled'}
                  </span>
                </div>
                <span className={`${styles.healthBadge} ${styles[`health-${project.health}`]}`}>
                  {project.health === 'green' ? '🟢' : project.health === 'yellow' ? '🟡' : '🔴'}
                </span>
              </div>

              {/* Description */}
              <p className={styles.description}>{project.description}</p>

              {/* Orchestrator Plan Highlight */}
              {project.orchestratorPlan && (
                <div className={styles.orchestratorHighlight}>
                  <h4>🎯 Strategic Plan</h4>
                  <div className={styles.planItem}>
                    <strong>Objective:</strong>
                    <p>{project.orchestratorPlan.objective}</p>
                  </div>
                  {project.orchestratorPlan.phases && project.orchestratorPlan.phases.length > 0 && (
                    <div className={styles.planItem}>
                      <strong>Phases:</strong>
                      <p>{project.orchestratorPlan.phases.join(' → ')}</p>
                    </div>
                  )}
                  {project.orchestratorPlan.timeline && (
                    <div className={styles.planItem}>
                      <strong>Timeline:</strong>
                      <p>{project.orchestratorPlan.timeline}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              <div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: `${project.stats.progress}%` }} />
              </div>
              <span className={styles.progressText}>{project.stats.progress}% Complete</span>

              {/* Quick Stats */}
              <div className={styles.taskSummary}>
                <div className={styles.taskCount}>
                  <span className={styles.queuedCount}>{project.stats.queued}</span>
                  <span className={styles.label}>Queued</span>
                </div>
                <div className={styles.taskCount}>
                  <span className={styles.inProgressCount}>{project.stats.inProgress}</span>
                  <span className={styles.label}>In Progress</span>
                </div>
                <div className={styles.taskCount}>
                  <span className={styles.completedCount}>{project.stats.completed}</span>
                  <span className={styles.label}>Completed</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className={styles.cardFooter}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setView('project');
                  }}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className={styles.empty}>
            <p>📭 No {activeTab} projects yet.</p>
          </div>
        )}
      </div>
    );
  }

  // ============ LEVEL 2: PROJECT DETAIL VIEW ============
  if (view === 'project' && selectedProject) {
    return (
      <div className={styles.section}>
        {/* Header with Back Button and Create Task Button */}
        <div className={styles.header}>
          <div>
            <button className={styles.backBtn} onClick={() => setView('portfolio')}>
              ← Back to Portfolio
            </button>
            <h2>{selectedProject.name}</h2>
            <p className={styles.projectMeta}>
              Status: {selectedProject.status} • {selectedProject.stats.total} tasks • {selectedProject.stats.progress}% complete
            </p>
          </div>
          <button 
            className={styles.createTaskBtn}
            onClick={() => setShowTaskModal(true)}
          >
            📝 Create Task
          </button>
        </div>

        {/* Task Creation Modal */}
        <TaskCreationForm
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSuccess={handleTaskSuccess}
          projectId={selectedProject.id}
          teamMembers={[]} // Can be passed from parent if available
        />

        {/* Full Project Info + Orchestrator Plan */}
        {selectedProject.orchestratorPlan && (
          <div className={styles.projectInfoSection}>
            <h3>🎯 Orchestrator Plan</h3>
            <div className={styles.planGrid}>
              <div className={styles.planCard}>
                <h4>Strategic Objective</h4>
                <p>{selectedProject.orchestratorPlan.objective}</p>
              </div>
              
              {selectedProject.orchestratorPlan.phases && selectedProject.orchestratorPlan.phases.length > 0 && (
                <div className={styles.planCard}>
                  <h4>Key Phases</h4>
                  <ol className={styles.phasesList}>
                    {selectedProject.orchestratorPlan.phases.map((phase, idx) => (
                      <li key={idx}>{phase}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {selectedProject.orchestratorPlan.timeline && (
                <div className={styles.planCard}>
                  <h4>Overall Timeline</h4>
                  <p>{selectedProject.orchestratorPlan.timeline}</p>
                </div>
              )}
              
              {selectedProject.orchestratorPlan.metrics && selectedProject.orchestratorPlan.metrics.length > 0 && (
                <div className={styles.planCard}>
                  <h4>Success Metrics</h4>
                  <ul className={styles.metricsList}>
                    {selectedProject.orchestratorPlan.metrics.map((metric, idx) => (
                      <li key={idx}>✓ {metric}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tasks Organized by Status */}
        <div className={styles.tasksSection}>
          <h3>📋 Tasks by Status</h3>
          <div className={styles.statusColumns}>
            {/* QUEUED Column */}
            <div className={styles.statusColumn}>
              <div className={styles.columnHeader}>
                <h4>📋 QUEUED</h4>
                <span className={styles.count}>{tasksByStatus.queued.length}</span>
              </div>
              <div className={styles.taskList}>
                {tasksByStatus.queued.map(task => (
                  <div
                    key={task.id}
                    className={styles.taskItem}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setView('task');
                    }}
                  >
                    <h5>{task.title}</h5>
                    <p className={styles.taskMeta}>👤 {task.assignedTo || 'Unassigned'}</p>
                  </div>
                ))}
                {tasksByStatus.queued.length === 0 && <p className={styles.emptyColumn}>No queued tasks</p>}
              </div>
            </div>

            {/* IN-PROGRESS Column */}
            <div className={styles.statusColumn}>
              <div className={styles.columnHeader}>
                <h4>⚙️ IN-PROGRESS</h4>
                <span className={styles.count}>{tasksByStatus.inProgress.length}</span>
              </div>
              <div className={styles.taskList}>
                {tasksByStatus.inProgress.map(task => (
                  <div
                    key={task.id}
                    className={styles.taskItem}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setView('task');
                    }}
                  >
                    <h5>{task.title}</h5>
                    {task.progress !== undefined && (
                      <div className={styles.miniProgress}>
                        <div className={styles.progress} style={{ width: `${task.progress}%` }} />
                      </div>
                    )}
                    <p className={styles.taskMeta}>👤 {task.assignedTo || 'Unassigned'}</p>
                  </div>
                ))}
                {tasksByStatus.inProgress.length === 0 && <p className={styles.emptyColumn}>No tasks in progress</p>}
              </div>
            </div>

            {/* WHAT'S NEXT Column */}
            <div className={styles.statusColumn}>
              <div className={styles.columnHeader}>
                <h4>🎯 WHAT'S NEXT</h4>
                <span className={styles.count}>{tasksByStatus.whatsNext.length}</span>
              </div>
              <div className={styles.taskList}>
                {tasksByStatus.whatsNext.map(task => (
                  <div
                    key={task.id}
                    className={styles.taskItem}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setView('task');
                    }}
                  >
                    <h5>{task.title}</h5>
                    <p className={styles.taskMeta}>👤 {task.assignedTo || 'Unassigned'}</p>
                  </div>
                ))}
                {tasksByStatus.whatsNext.length === 0 && <p className={styles.emptyColumn}>No planned tasks</p>}
              </div>
            </div>

            {/* COMPLETED Column */}
            <div className={styles.statusColumn}>
              <div className={styles.columnHeader}>
                <h4>✅ COMPLETED</h4>
                <span className={styles.count}>{tasksByStatus.completed.length}</span>
              </div>
              <div className={styles.taskList}>
                {tasksByStatus.completed.map(task => (
                  <div
                    key={task.id}
                    className={styles.taskItem}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setView('task');
                    }}
                  >
                    <h5>{task.title}</h5>
                    <p className={styles.taskMeta}>👤 {task.assignedTo || 'Unassigned'}</p>
                  </div>
                ))}
                {tasksByStatus.completed.length === 0 && <p className={styles.emptyColumn}>No completed tasks</p>}
              </div>
            </div>
          </div>
        </div>

        {/* APPROVALS NEEDED Section */}
        {pendingApprovals.length > 0 && (
          <div className={styles.approvalsSection}>
            <h3>🎯 Approvals Needed</h3>
            <p className={styles.approvalsCount}>{pendingApprovals.length} briefing(s) awaiting approval</p>
            <div className={styles.approvalsList}>
              {pendingApprovals.map(briefing => (
                <div key={briefing.id} className={styles.approvalItem}>
                  <div className={styles.approvalInfo}>
                    <h5>{briefing.title}</h5>
                    <p className={styles.approvalMeta}>
                      👤 {briefing.assignedTo || 'Unassigned'} • 
                      <span className={styles.timeline}>
                        {briefing.briefing?.executionPlan?.timeline?.summary || 'Timeline TBD'}
                      </span>
                    </p>
                  </div>
                  <div className={styles.approvalButtons}>
                    <button
                      className={styles.inlineApproveBtn}
                      onClick={() => handleApprove(briefing.id)}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className={styles.inlineRejectBtn}
                      onClick={() => handleReject(briefing.id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ LEVEL 3: TASK DETAIL VIEW ============
  if (view === 'task' && selectedTask) {
    const isBriefing = selectedTask.status === 'briefing';
    const plan = selectedTask.briefing?.executionPlan;

    return (
      <div className={styles.section}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => setView('project')}>
            ← Back to Project
          </button>
          <h2>{selectedTask.title}</h2>
          <span className={`${styles.statusBadge} ${styles[selectedTask.status]}`}>
            {selectedTask.status.toUpperCase()}
          </span>
        </div>

        {/* Task Progress */}
        {selectedTask.progress !== undefined && (
          <div className={styles.taskProgressBar}>
            <div className={styles.progress} style={{ width: `${selectedTask.progress}%` }} />
            <span className={styles.progressText}>{selectedTask.progress}%</span>
          </div>
        )}

        <div className={styles.taskDetailLayout}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Assignment */}
            <div className={styles.detailSection}>
              <h4>Assignment</h4>
              <div className={styles.field}>
                <label>Assigned To</label>
                <p>{selectedTask.assignedTo || 'Unassigned'}</p>
              </div>
              <div className={styles.field}>
                <label>Priority</label>
                <p>
                  {selectedTask.priority === 1 ? '🔴 Critical' : selectedTask.priority === 2 ? '🟠 High' : '🟡 Medium'}
                </p>
              </div>
            </div>

            {/* Execution Plan */}
            {plan && (
              <div className={styles.detailSection}>
                <h4>📋 Execution Plan</h4>
                {plan.timeline && (
                  <div className={styles.field}>
                    <label>Timeline</label>
                    <p>{plan.timeline.summary || 'Not specified'}</p>
                  </div>
                )}

                {plan.deliverables && plan.deliverables.length > 0 && (
                  <div className={styles.field}>
                    <label>Deliverables</label>
                    <ul className={styles.list}>
                      {plan.deliverables.map((d, i) => (
                        <li key={i}>✓ {d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.milestones && plan.milestones.length > 0 && (
                  <div className={styles.field}>
                    <label>Milestones</label>
                    <ul className={styles.milestones}>
                      {plan.milestones.map((m, i) => (
                        <li key={i}>
                          <span className={styles.milestone}>
                            {m.name} ({m.estimatedDays || m.days || '?'} days)
                          </span>
                          <p>{m.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Success Criteria */}
            {plan?.successCriteria && plan.successCriteria.length > 0 && (
              <div className={styles.detailSection}>
                <h4>Success Criteria</h4>
                <ul className={styles.list}>
                  {plan.successCriteria.map((s, i) => (
                    <li key={i}>
                      <strong>{s.type}:</strong> {s.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activity Log */}
            {selectedTask.activity && selectedTask.activity.length > 0 && (
              <div className={styles.detailSection}>
                <h4>Activity Log</h4>
                <div className={styles.activityLog}>
                  {selectedTask.activity.slice(0, 5).map((a, i) => (
                    <div key={i} className={styles.activityItem}>
                      <span className={styles.time}>{a.timestamp}</span>
                      <p>{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Approval Panel (Inline) */}
          {isBriefing && (
            <div className={styles.approvalPanel}>
              <h4>🎯 Ready for Approval</h4>
              <p className={styles.approvalDesc}>
                Review the execution plan and approve to queue this task for execution.
              </p>
              <div className={styles.approvalActions}>
                <button
                  className={`${styles.btn} ${styles.approveBtn}`}
                  onClick={() => handleApprove(selectedTask.id)}
                >
                  ✅ Approve & Queue
                </button>
                <button
                  className={`${styles.btn} ${styles.rejectBtn}`}
                  onClick={() => handleReject(selectedTask.id)}
                >
                  ❌ Request Changes
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.closeBtn} onClick={() => setView('project')}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default UnifiedDashboardSection;
