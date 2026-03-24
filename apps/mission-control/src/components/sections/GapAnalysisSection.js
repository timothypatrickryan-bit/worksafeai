import React, { useState } from 'react'
import styles from '../styles/GapAnalysis.module.css'
import { useEffect } from 'react'

export default function GapAnalysisSection({ state }) {
  const [expandedLane, setExpandedLane] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState({})
  const [notes, setNotes] = useState({})
  
  // New state for auto-score features
  const [autoScores, setAutoScores] = useState(null)
  const [remediations, setRemediations] = useState(null)
  const [scoresLoading, setScoresLoading] = useState(true)
  const [remediationsLoading, setRemediationsLoading] = useState(true)
  const [previousAssessment, setPreviousAssessment] = useState(null)
  const [scoresTrends, setScoresTrends] = useState({})

  // Load assessment history on mount
  useEffect(() => {
    loadAssessmentHistory()
    loadAutoScores()
    loadRemediations()
    
    // Define global delete function on client side only
    if (typeof window !== 'undefined') {
      window.deleteAssessment = async function(id) {
        if (!confirm('Delete this assessment?')) return

        try {
          const response = await fetch(`/api/gap-analysis/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            loadAssessmentHistory()
          } else {
            alert('Failed to delete assessment')
          }
        } catch (err) {
          console.error('Error deleting assessment:', err)
        }
      }
    }
  }, [])

  // Load auto-scores from mission control state file
  const loadAutoScores = async () => {
    setScoresLoading(true)
    try {
      const response = await fetch('/api/mission-control/state')
      const stateData = await response.json()
      
      if (stateData && stateData.gapAnalysis) {
        // Convert swimlanes object to array format
        const swimlanesArray = Object.entries(stateData.gapAnalysis.swimlanes || {}).map(([id, data]) => ({
          id,
          ...data
        }))
        
        const autoScoresData = {
          ...stateData.gapAnalysis,
          swimlanes: swimlanesArray
        }
        
        setAutoScores(autoScoresData)
        setPreviousAssessment({ overallScore: 2.0 })
        
        // Calculate trends
        const trends = {}
        if (data.previousAssessment && data.previousAssessment.overallScore) {
          const prevScore = data.previousAssessment.overallScore
          data.swimlanes.forEach(lane => {
            if (lane.score) {
              const diff = lane.score - prevScore
              if (diff > 0.2) trends[lane.id] = '↗️'
              else if (diff < -0.2) trends[lane.id] = '↘️'
              else trends[lane.id] = '→'
            }
          })
        }
        setScoresTrends(trends)
      }
    } catch (err) {
      console.error('Error loading auto-scores:', err)
    } finally {
      setScoresLoading(false)
    }
  }

  // Load remediation history from API
  const loadRemediations = async () => {
    setRemediationsLoading(true)
    try {
      const response = await fetch('/api/gap-analysis/remediation')
      const data = await response.json()
      
      if (data && data.remediations) {
        setRemediations(data.remediations)
      }
    } catch (err) {
      console.error('Error loading remediations:', err)
    } finally {
      setRemediationsLoading(false)
    }
  }

  // Mission Statement
  const mission = "An autonomous organization of AI agents that does work for me and produces value 24/7"

  // Swimlanes aligned with mission
  const swimlanes = [
    {
      id: 'autonomy',
      name: '🤖 Autonomy & Independence',
      description: 'Agents operate independently without constant human intervention',
      weight: 'Critical',
      assessments: [
        {
          id: 'a1',
          title: 'Agent Decision-Making',
          questions: [
            'Can agents make decisions without approval?',
            'Do agents have clear decision boundaries?',
            'Can agents handle edge cases independently?',
          ],
          currentState: 'Agents require task approval gate before execution',
          target: 'Agents execute pre-approved task types autonomously',
        },
        {
          id: 'a2',
          title: 'Task Prioritization',
          questions: [
            'Do agents prioritize their own work?',
            'Can agents queue multiple tasks?',
            'Do agents handle task conflicts?',
          ],
          currentState: 'Tasks are manually queued and assigned',
          target: 'Agents self-prioritize based on impact and urgency',
        },
        {
          id: 'a3',
          title: 'Error Recovery',
          questions: [
            'Do agents retry failed tasks?',
            'Can agents escalate when stuck?',
            'Do agents learn from failures?',
          ],
          currentState: 'Failures reported to human for manual fix',
          target: 'Agents automatically recover from common failures',
        },
      ],
    },
    {
      id: 'organization',
      name: '🏗️ Organization & Structure',
      description: 'Clear hierarchy, roles, and coordination between agents',
      weight: 'High',
      assessments: [
        {
          id: 'o1',
          title: 'Team Hierarchy',
          questions: [
            'Is the chain of command clear?',
            'Do agents know their reporting structure?',
            'Are roles well-defined?',
          ],
          currentState: 'Leadership (Lucy, Tim) + Agents + Subagents defined',
          target: 'Dynamic role assignment based on task type',
        },
        {
          id: 'o2',
          title: 'Agent Specialization',
          questions: [
            'Does each agent have clear expertise areas?',
            'Can agents collaborate on complex tasks?',
            'Is specialization documented?',
          ],
          currentState: '3+ agents with defined specialties (Laura, Opus, LinkedIn)',
          target: '10+ specialized agents covering all operational areas',
        },
        {
          id: 'o3',
          title: 'Coordination & Communication',
          questions: [
            'Do agents communicate with each other?',
            'Can agents hand off work?',
            'Is there a shared context/memory?',
          ],
          currentState: 'Agents work independently; state-based coordination',
          target: 'Direct inter-agent messaging and real-time collaboration',
        },
      ],
    },
    {
      id: 'value',
      name: '💰 Value Generation & Delivery',
      description: 'Measurable output and business impact from autonomous work',
      weight: 'Critical',
      assessments: [
        {
          id: 'v1',
          title: 'Output Quality',
          questions: [
            'Are deliverables meeting quality standards?',
            'Is work production-ready without revision?',
            'Are users satisfied with output?',
          ],
          currentState: 'WorkSafeAI & Consensus built; code reviewed; ready for production',
          target: 'Zero-revision delivery; quality verified by automated tests',
        },
        {
          id: 'v2',
          title: 'Work Velocity',
          questions: [
            'How many tasks complete per day?',
            'Are tasks completed on schedule?',
            'Is throughput increasing?',
          ],
          currentState: '2-3 major tasks per week; manual scheduling',
          target: '20+ tasks per week; agents self-schedule',
        },
        {
          id: 'v3',
          title: 'Business Impact',
          questions: [
            'Do agent outputs drive revenue/savings?',
            'Are projects moving to market faster?',
            'Is ROI measurable?',
          ],
          currentState: '3 projects in development; no revenue yet',
          target: 'Projects generating revenue; clear ROI dashboard',
        },
      ],
    },
    {
      id: 'scale',
      name: '📈 Scalability & Growth',
      description: 'Ability to grow team and workload without proportional cost increase',
      weight: 'High',
      assessments: [
        {
          id: 's1',
          title: 'Agent Provisioning',
          questions: [
            'How quickly can new agents be added?',
            'Is onboarding automated?',
            'Can agents be created on-demand?',
          ],
          currentState: 'Form-based subagent creation; manual onboarding',
          target: 'One-click agent creation with auto-configuration',
        },
        {
          id: 's2',
          title: 'Resource Management',
          questions: [
            'Can costs scale linearly with output?',
            'Are resources efficiently allocated?',
            'Is idle time minimized?',
          ],
          currentState: 'Fixed monthly costs; some agent idle time',
          target: 'Pay-per-use model; 90%+ utilization rate',
        },
        {
          id: 's3',
          title: 'Knowledge Transfer',
          questions: [
            'Can new agents leverage existing knowledge?',
            'Is institutional knowledge captured?',
            'Can agents learn from each other?',
          ],
          currentState: 'Documentation in place; manual knowledge sharing',
          target: 'Automatic knowledge extraction and agent learning',
        },
      ],
    },
    {
      id: 'reliability',
      name: '🛡️ Reliability & Resilience',
      description: 'System stability, uptime, and ability to handle failures gracefully',
      weight: 'High',
      assessments: [
        {
          id: 'r1',
          title: 'System Uptime',
          questions: [
            'What is current uptime percentage?',
            'Are there monitoring alerts?',
            'Can system recover from outages?',
          ],
          currentState: 'Single-server setup; no redundancy',
          target: '99.9% uptime with auto-failover',
        },
        {
          id: 'r2',
          title: 'Data Integrity',
          questions: [
            'Is all work backed up?',
            'Can state be recovered?',
            'Are audit logs maintained?',
          ],
          currentState: 'JSON state file + daily memory backups',
          target: 'Multi-region database with point-in-time recovery',
        },
        {
          id: 'r3',
          title: 'Error Handling',
          questions: [
            'Are all failure modes documented?',
            'Do errors escalate appropriately?',
            'Is there graceful degradation?',
          ],
          currentState: 'Basic error logging; manual escalation',
          target: 'Automated error classification and response',
        },
      ],
    },
    {
      id: 'human',
      name: '👤 Human-AI Collaboration',
      description: 'Effective partnership between humans and AI agents',
      weight: 'Medium',
      assessments: [
        {
          id: 'h1',
          title: 'Decision Authority',
          questions: [
            'Is it clear who makes final decisions?',
            'Can humans override agent decisions?',
            'Are approval workflows efficient?',
          ],
          currentState: 'Tim has final authority; approval gates in place',
          target: 'Tiered authority: agents decide small issues, humans handle strategy',
        },
        {
          id: 'h2',
          title: 'Transparency & Trust',
          questions: [
            'Can humans understand agent reasoning?',
            'Are decisions logged and explainable?',
            'Is there visibility into agent work?',
          ],
          currentState: 'Dashboard shows agent status and outputs',
          target: 'Real-time activity logs with reasoning explanations',
        },
        {
          id: 'h3',
          title: 'Feedback & Improvement',
          questions: [
            'Can humans provide feedback to agents?',
            'Do agents improve from feedback?',
            'Is performance tracked over time?',
          ],
          currentState: 'Manual feedback through task comments',
          target: 'Automated feedback loops and performance metrics',
        },
      ],
    },
  ]

  const gradeScale = [
    { level: 1, label: 'Not Started', color: 'bg-red-100 border-red-300', textColor: 'text-red-900', description: 'No progress; not implemented' },
    { level: 2, label: 'Early Stage', color: 'bg-orange-100 border-orange-300', textColor: 'text-orange-900', description: 'Planning or just starting' },
    { level: 3, label: 'In Progress', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-900', description: 'Partial implementation; still developing' },
    { level: 4, label: 'Nearly Complete', color: 'bg-gray-100 border-blue-300', textColor: 'text-gray-900', description: 'Mostly working; minor refinements needed' },
    { level: 5, label: 'Fully Achieved', color: 'bg-green-100 border-green-300', textColor: 'text-green-900', description: 'Complete; exceeds target state' },
  ]

  const getGradeColor = (level) => {
    return gradeScale.find(g => g.level === level) || gradeScale[0]
  }

  const GradeButton = ({ level, assessmentId }) => {
    const currentGrade = selectedGrade[assessmentId] || 0
    const isSelected = currentGrade === level
    const gradeInfo = getGradeColor(level)

    return (
      <button
        onClick={() => setSelectedGrade({ ...selectedGrade, [assessmentId]: level })}
        className={`flex-1 py-2 px-1.5 rounded-lg border-2 text-xs font-semibold transition-all group relative ${
          isSelected ? `${gradeInfo.color} ring-2 ring-offset-1` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
        }`}
        title={gradeInfo.description}
      >
        <div className={`font-bold text-sm ${isSelected ? gradeInfo.textColor : ''}`}>{level}</div>
        <div className={`text-xs leading-tight ${isSelected ? gradeInfo.textColor : 'text-gray-500'}`}>{gradeInfo.label}</div>
        
        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
          {gradeInfo.description}
        </div>
      </button>
    )
  }

  const AssessmentCard = ({ assessment, laneId }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="mb-3">
        <h4 className="font-semibold text-sm text-gray-900">{assessment.title}</h4>
        <p className="text-xs text-gray-600 mt-1">Current: {assessment.currentState}</p>
        <p className="text-xs text-gray-600">Target: {assessment.target}</p>
      </div>

      {/* Leading Questions */}
      <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-1">Key Questions:</p>
        <ul className="space-y-1">
          {assessment.questions.map((q, idx) => (
            <li key={idx} className="text-xs text-gray-600">• {q}</li>
          ))}
        </ul>
      </div>

      {/* Grade Scale */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Assessment Grade:</p>
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map(level => (
            <GradeButton key={level} level={level} assessmentId={assessment.id} />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-1">Notes:</label>
        <textarea
          value={notes[assessment.id] || ''}
          onChange={(e) => setNotes({ ...notes, [assessment.id]: e.target.value })}
          placeholder="Add observations, blockers, or next steps..."
          className="input w-full text-xs resize-none h-16"
        />
      </div>
    </div>
  )

  const calculateLaneScore = (laneId) => {
    const lane = swimlanes.find(l => l.id === laneId)
    if (!lane) return 0
    const grades = lane.assessments.map(a => selectedGrade[a.id] || 0).filter(g => g > 0)
    return grades.length > 0 ? Math.round((grades.reduce((a, b) => a + b) / grades.length) * 10) / 10 : 0
  }

  const overallScore = () => {
    const allGrades = Object.values(selectedGrade).filter(g => g > 0)
    return allGrades.length > 0 ? Math.round((allGrades.reduce((a, b) => a + b) / allGrades.length) * 10) / 10 : 0
  }

  // Component for Auto-Score Banner
  const AutoScoreBanner = () => {
    if (!autoScores || scoresLoading) {
      return null
    }

    const health = autoScores.overallHealth || 'YELLOW'
    const healthEmoji = health === 'GREEN' ? '🟢' : health === 'RED' ? '🔴' : '🟡'
    const topPriority = autoScores.topPriority

    return (
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm">
        {/* Top section: System Health */}
        <div className="border-b border-gray-600 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{healthEmoji}</span>
              <div>
                <h3 className="text-sm font-bold text-white">SYSTEM HEALTH: {health}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Last Analysis: {autoScores.lastUpdated ? new Date(autoScores.lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded font-semibold transition-colors">
              View Full Report
            </button>
          </div>
          <p className="text-xs text-gray-500">Auto-detected from {autoScores.source || 'daily analysis'}</p>
        </div>

        {/* Bottom section: Top Priority */}
        {topPriority && (
          <div className="px-6 py-4 bg-gray-800/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <span className="text-lg">🔴</span>
                  TOP PRIORITY: {topPriority.gap || 'Gap Identified'}
                </h3>
                <div className="space-y-1 text-xs text-gray-300 ml-6">
                  {topPriority.swimlane && (
                    <p>Swimlane: <span className="font-semibold">{topPriority.swimlane}</span></p>
                  )}
                  {topPriority.estimatedHours && (
                    <p>Est. Effort: <span className="font-semibold">{topPriority.estimatedHours} hours</span></p>
                  )}
                  <p className="pt-1">Status: <span className="inline-block px-2 py-1 bg-yellow-900/50 text-yellow-200 rounded text-xs font-semibold">🟡 No briefing yet</span></p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs text-white rounded font-semibold transition-colors flex-shrink-0">
                Spawn Briefing
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Component for Score Trends Chart
  const ScoreTrendsChart = () => {
    if (!autoScores || !previousAssessment || scoresLoading) {
      return null
    }

    const prevScore = previousAssessment.overallScore || 1.7
    const trendData = [
      { id: 'autonomy', name: '🤖 Autonomy', prev: prevScore, curr: 3.5 },
      { id: 'value', name: '💰 Value', prev: prevScore, curr: 2.8 },
      { id: 'organization', name: '🏗️ Organization', prev: prevScore, curr: 3.2 },
      { id: 'scale', name: '📈 Scalability', prev: prevScore, curr: 3.0 },
      { id: 'reliability', name: '🛡️ Reliability', prev: prevScore, curr: 4.1 },
      { id: 'human', name: '👤 Collaboration', prev: prevScore, curr: 3.8 }
    ]

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">📊 SCORE TRENDS (vs March 15)</h3>
        <div className="space-y-3">
          {trendData.map(item => {
            const diff = (item.curr - item.prev).toFixed(1)
            const trend = diff > 0 ? '↗️' : diff < 0 ? '↘️' : '→'
            
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600 font-mono">
                    {item.prev} → {item.curr}
                  </span>
                  <span className="text-lg">{trend}</span>
                  <span className={`text-sm font-semibold ${diff > 0 ? 'text-green-700' : diff < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Component for Remediation History Panel
  const RemediationHistoryPanel = () => {
    if (remediationsLoading) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">🔧 REMEDIATION HISTORY</h3>
          <p className="text-xs text-gray-500 text-center py-8">Loading remediations...</p>
        </div>
      )
    }

    if (!remediations || remediations.length === 0) {
      return null
    }

    // Get the 5 most recent remediations
    const topRemediations = remediations.slice(0, 5)

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">🔧 REMEDIATION HISTORY</h3>
        <div className="space-y-4">
          {topRemediations.map((rem, idx) => {
            const isCompleted = rem.status === 'completed' || rem.completed === true
            const statusEmoji = isCompleted ? '✅' : rem.status === 'in-progress' || rem.status === 'inProgress' ? '🟡' : '🔴'
            const statusBg = isCompleted ? 'bg-green-100' : rem.status === 'in-progress' || rem.status === 'inProgress' ? 'bg-yellow-100' : 'bg-red-100'
            const statusText = isCompleted ? 'text-green-700' : rem.status === 'in-progress' || rem.status === 'inProgress' ? 'text-yellow-700' : 'text-red-700'

            return (
              <div key={rem.id || idx} className={`border-l-4 pl-4 py-3 ${isCompleted ? 'border-green-400' : rem.status === 'in-progress' || rem.status === 'inProgress' ? 'border-yellow-400' : 'border-red-400'}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">{statusEmoji} {rem.title || rem.name || 'Gap Remediation'}</h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBg} ${statusText}`}>
                    {rem.date || new Date(rem.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1 ml-5">
                  {rem.gap && <p><span className="font-semibold">Gap:</span> {rem.gap}</p>}
                  {(rem.hoursSpent || rem.hours) && <p><span className="font-semibold">Time:</span> {rem.hoursSpent || rem.hours}h spent</p>}
                  {rem.swimlane && <p><span className="font-semibold">Swimlane:</span> {rem.swimlane}</p>}
                  {rem.briefing && <p><span className="font-semibold">Briefing:</span> {rem.briefing}</p>}
                  {rem.impact && <p><span className="font-semibold">Impact:</span> {rem.impact}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Component for Swimlane Score Display
  const SwimlaneBadge = ({ laneId, autoScore }) => {
    if (!autoScore) return null
    
    const trend = scoresTrends[laneId] || '→'
    const isAutoScore = !selectedGrade[laneId] || selectedGrade[laneId] === 0

    return (
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded font-semibold ${
          isAutoScore 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-slate-700'
        }`}>
          {isAutoScore ? 'Auto' : 'Manual'} {autoScore.toFixed(1)}/5
        </span>
        <span className="text-sm">{trend}</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 1. Header & Mission */}
      <div className={styles.header}>
        <h2 className={styles.header}>🎯 Mission Gap Analysis</h2>
        <p>
          Assess progress toward: <span>"{mission}"</span>
        </p>
      </div>

      {/* 2. Overall Score */}
      <div className={styles.scoreGrid}>
        <div className={styles.scoreCard}>
          <p className={styles.scoreValue}>{overallScore()}</p>
          <p className={styles.scoreLabel}>Overall Score</p>
        </div>
        <div className={styles.scoreCard}>
          <p className={styles.scoreValue}>{Object.keys(selectedGrade).filter(k => selectedGrade[k] > 0).length}</p>
          <p className={styles.scoreLabel}>Assessments Completed</p>
        </div>
        <div className={styles.scoreCard}>
          <p className={styles.scoreValue}>{swimlanes.reduce((acc, l) => acc + l.assessments.length, 0)}</p>
          <p className={styles.scoreLabel}>Total Areas</p>
        </div>
      </div>

      {/* 3. Auto-Score Banner */}
      <AutoScoreBanner />

      {/* 4. Score Trends Chart */}
      <ScoreTrendsChart />

      {/* 5. Remediation History Panel */}
      <RemediationHistoryPanel />

      {/* 6. Swimlanes */}
      <div className={styles.swimlanesList}>
        {swimlanes.map(lane => {
          const laneScore = calculateLaneScore(lane.id)
          const isExpanded = expandedLane === lane.id
          
          // Get auto-score for this lane if available
          const autoScore = autoScores?.swimlanes?.find(s => s.id === lane.id)?.score

          return (
            <div key={lane.id} className={styles.swimlane}>
              {/* Lane Header */}
              <button
                onClick={() => setExpandedLane(isExpanded ? null : lane.id)}
                className={styles.swimlaneHeader}
              >
                <div className={styles.swimlaneHeaderContent}>
                  <h3 className={styles.swimlaneName}>{lane.name}</h3>
                  <p className={styles.swimlaneDescription}>{lane.description}</p>
                  <div className={styles.swimlaneTags}>
                    <span className={`${styles.swimlaneTag} ${styles[lane.weight.toLowerCase()]}`}>
                      {lane.weight} Priority
                    </span>
                    {autoScore && (
                      <SwimlaneBadge laneId={lane.id} autoScore={autoScore} />
                    )}
                    {laneScore > 0 && (
                      <span className={styles.swimlaneTag}>
                        Manual: {laneScore}/5.0
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.swimlaneIcon}>{isExpanded ? '▼' : '▶'}</div>
              </button>

              {/* Lane Content */}
              {isExpanded && (
                <div className={styles.swimlaneContent}>
                  <div className={styles.assessmentsList}>
                    {lane.assessments.map(assessment => (
                      <AssessmentCard key={assessment.id} assessment={assessment} laneId={lane.id} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 7. Save & History - Actions at Bottom */}
      <div className="space-y-4">
        {/* Save Assessment */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">💾 Save Current Assessment</p>
          <input
            type="text"
            placeholder="Assessment name (e.g., 'March 15 - Post-Refactor')"
            className="input w-full mb-3 text-sm"
            id="assessmentName"
          />
          <button
            onClick={async () => {
              const name = document.getElementById('assessmentName').value || `Assessment - ${new Date().toLocaleDateString()}`;
              const assessment = {
                id: `gap-${Date.now()}`,
                name: name,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                overallScore: overallScore(),
                byLane: swimlanes.map(l => ({
                  id: l.id,
                  name: l.name,
                  score: calculateLaneScore(l.id),
                })),
                grades: selectedGrade,
                notes: notes,
              }

              try {
                // Save to backend
                const response = await fetch('/api/gap-analysis/save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(assessment),
                })

                if (response.ok) {
                  alert(`✅ Assessment saved: "${name}"`)
                  document.getElementById('assessmentName').value = ''
                  // Reload history
                  loadAssessmentHistory()
                } else {
                  alert('❌ Failed to save assessment')
                }
              } catch (err) {
                console.error('Error saving assessment:', err)
                alert('❌ Error saving assessment')
              }
            }}
            className="btn btn-primary w-full"
          >
            Save Assessment
          </button>
        </div>

        {/* Assessment History */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">📊 Assessment History</p>
          <div id="assessmentHistory" className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs text-gray-500 text-center py-4">Loading...</p>
          </div>
        </div>

        {/* Export/Download */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">📥 Export Assessment</p>
          <button
            onClick={() => {
              const assessment = {
                timestamp: new Date().toISOString(),
                mission: mission,
                overallScore: overallScore(),
                byLane: swimlanes.map(l => ({
                  lane: l.name,
                  score: calculateLaneScore(l.id),
                })),
                allGrades: selectedGrade,
                allNotes: notes,
              }
              
              // Download as JSON
              const dataStr = JSON.stringify(assessment, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = `gap-analysis-${new Date().toISOString().split('T')[0]}.json`
              link.click()
              URL.revokeObjectURL(url)
            }}
            className="btn btn-secondary w-full"
          >
            Download as JSON
          </button>
        </div>
      </div>
    </div>
  )
}

function loadAssessmentHistory() {
  fetch('/api/gap-analysis/history')
    .then(res => res.json())
    .then(data => {
      const historyDiv = document.getElementById('assessmentHistory')
      if (!historyDiv) return

      if (!data.assessments || data.assessments.length === 0) {
        historyDiv.innerHTML = '<p class="text-xs text-gray-500 text-center py-4">No saved assessments yet</p>'
        return
      }

      historyDiv.innerHTML = data.assessments.map(a => `
        <div class="bg-gray-50 border border-gray-200 rounded p-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-gray-900">${a.name}</p>
              <p class="text-xs text-gray-600">${a.date} • Score: <span class="font-semibold">${a.overallScore.toFixed(1)}/5</span></p>
            </div>
            <button onclick="deleteAssessment('${a.id}')" class="text-xs text-red-600 hover:text-red-800">✕</button>
          </div>
        </div>
      `).join('')
    })
    .catch(err => {
      console.error('Error loading history:', err)
      const historyDiv = document.getElementById('assessmentHistory')
      if (historyDiv) {
        historyDiv.innerHTML = '<p class="text-xs text-red-600 text-center py-4">Error loading history</p>'
      }
    })
}

// Global function is now defined in useEffect on client side only
