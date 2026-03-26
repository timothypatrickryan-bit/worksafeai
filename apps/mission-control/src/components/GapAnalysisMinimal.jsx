import { useState, useEffect } from 'react'
import styles from './styles/GapAnalysisMinimal.module.css'

export default function GapAnalysisMinimal({ state, ws }) {
  const [assessment, setAssessment] = useState(null)
  const [scores, setScores] = useState({})
  const [notes, setNotes] = useState({})
  const [expandedSwimlane, setExpandedSwimlane] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const swimlanes = [
    {
      id: 'autonomy',
      title: '🤖 Autonomy & Independence',
      description: 'Agents should make decisions independently',
      priority: 'Critical',
      assessments: [
        {
          id: 'autonomy-decision-making',
          title: 'Decision Making',
          description: 'Can agents make independent decisions?',
          targetState: 'Agents autonomously make 80%+ of decisions without human input',
        },
        {
          id: 'autonomy-error-recovery',
          title: 'Error Recovery',
          description: 'How well do agents recover from failures?',
          targetState: 'Agents detect and recover from 95%+ of errors automatically',
        },
        {
          id: 'autonomy-learning',
          title: 'Learning & Adaptation',
          description: 'Do agents improve their performance over time?',
          targetState: 'Agents continuously improve accuracy and speed',
        },
      ],
    },
    {
      id: 'value',
      title: '💰 Value Generation & Delivery',
      description: 'Measurable output & business impact',
      priority: 'Critical',
      assessments: [
        {
          id: 'value-output',
          title: 'Output Quality',
          description: 'Is work output valuable and correct?',
          targetState: '98%+ of output meets quality standards on first pass',
        },
        {
          id: 'value-throughput',
          title: 'Throughput',
          description: 'How much work can be completed per unit time?',
          targetState: 'Process 500+ tasks per day with high quality',
        },
        {
          id: 'value-impact',
          title: 'Business Impact',
          description: 'Does work create measurable business value?',
          targetState: 'Every task directly contributes to defined business goals',
        },
      ],
    },
    {
      id: 'organization',
      title: '🏗️ Organization & Structure',
      description: 'Clear roles, coordination, specialization',
      priority: 'High',
      assessments: [
        {
          id: 'org-roles',
          title: 'Role Clarity',
          description: 'Are roles and responsibilities clear?',
          targetState: 'Each agent has specialized, distinct responsibilities',
        },
        {
          id: 'org-coordination',
          title: 'Coordination',
          description: 'Do agents coordinate work effectively?',
          targetState: 'Agents coordinate with zero manual intervention',
        },
        {
          id: 'org-specialization',
          title: 'Specialization',
          description: 'Are agents specialized in their domains?',
          targetState: 'Each agent is expert-level in their specialization',
        },
      ],
    },
    {
      id: 'scalability',
      title: '📈 Scalability & Growth',
      description: 'Grow team/workload efficiently',
      priority: 'High',
      assessments: [
        {
          id: 'scale-team',
          title: 'Team Scaling',
          description: 'Can team scale up/down easily?',
          targetState: 'Add/remove agents with zero overhead or retraining',
        },
        {
          id: 'scale-workload',
          title: 'Workload Scaling',
          description: 'Can system handle 10x workload?',
          targetState: 'System scales linearly with workload, no degradation',
        },
        {
          id: 'scale-efficiency',
          title: 'Efficiency at Scale',
          description: 'Does efficiency improve or degrade at scale?',
          targetState: 'Efficiency improves due to specialization and experience',
        },
      ],
    },
    {
      id: 'reliability',
      title: '🛡️ Reliability & Resilience',
      description: 'Uptime, error recovery, data integrity',
      priority: 'High',
      assessments: [
        {
          id: 'reliability-uptime',
          title: 'System Uptime',
          description: 'What is system availability?',
          targetState: '99.9%+ uptime with zero data loss',
        },
        {
          id: 'reliability-recovery',
          title: 'Disaster Recovery',
          description: 'Can system recover from major failures?',
          targetState: 'Full recovery from any failure in < 5 minutes',
        },
        {
          id: 'reliability-data',
          title: 'Data Integrity',
          description: 'Is data always accurate and consistent?',
          targetState: 'Zero data corruption or loss incidents',
        },
      ],
    },
    {
      id: 'collaboration',
      title: '👤 Human-AI Collaboration',
      description: 'Transparency, feedback loops, trust',
      priority: 'Medium',
      assessments: [
        {
          id: 'collab-transparency',
          title: 'Transparency',
          description: 'Can humans understand agent decisions?',
          targetState: 'All agent decisions are explainable and auditable',
        },
        {
          id: 'collab-feedback',
          title: 'Feedback Loops',
          description: 'Can humans provide feedback to agents?',
          targetState: 'Feedback is collected and applied automatically',
        },
        {
          id: 'collab-trust',
          title: 'Trust',
          description: 'Do humans trust the autonomous system?',
          targetState: 'Humans fully trust system to operate autonomously',
        },
      ],
    },
  ]

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/gap-analysis/assessment', {
          headers: { 'Accept': 'application/json' },
        })
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }
        
        const data = await response.json()
        setAssessment(data)
        
        // Initialize scores from API data
        if (data.scores) {
          setScores(data.scores)
        }
        
        setError(null)
      } catch (err) {
        console.error('Failed to fetch assessment:', err)
        setError(err.message)
        // Set default assessment data
        setAssessment({
          lastUpdated: new Date().toISOString(),
          summary: {
            overallScore: 0,
            averageScore: 0,
            critical: 0,
            high: 0,
            medium: 0,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [])

  const handleScoreChange = (assessmentId, score) => {
    setScores(prev => ({ ...prev, [assessmentId]: score }))
  }

  const handleNoteChange = (assessmentId, note) => {
    setNotes(prev => ({ ...prev, [assessmentId]: note }))
  }

  const handleSaveAssessment = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/gap-analysis/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          notes,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save assessment:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getAverageScore = () => {
    const scoreValues = Object.values(scores).filter(s => s)
    return scoreValues.length > 0 ? Math.round(scoreValues.reduce((a, b) => a + b) / scoreValues.length) : 0
  }

  return (
    <div className={styles.container} data-testid="gap-analysis">
      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Gap Analysis</h2>
        <p className={styles.pageDescription}>
          Assess progress toward autonomous organization across 6 strategic dimensions
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className={styles.errorBox} data-testid="error-message">
          ⚠️ API Error: {error}. Using default assessment structure.
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {saveSuccess && (
        <div className={styles.successBox} data-testid="success-message">
          ✅ Assessment saved successfully
        </div>
      )}

      {/* OVERALL SCORE */}
      <div className={styles.overallScoreCard} data-testid="overall-score">
        <div className={styles.scoreValue}>{getAverageScore()}</div>
        <div className={styles.scoreLabel}>Overall Score</div>
        <div className={styles.scoreDescription}>Across all 6 dimensions</div>
      </div>

      {/* SWIMLANES */}
      <div className={styles.swimlanes}>
        {swimlanes.map((swimlane) => (
          <div key={swimlane.id} className={styles.swimlane} data-testid={`swimlane-${swimlane.id}`}>
            {/* SWIMLANE HEADER */}
            <button
              className={styles.swimlaneHeader}
              onClick={() => setExpandedSwimlane(expandedSwimlane === swimlane.id ? null : swimlane.id)}
              data-testid={`swimlane-header-${swimlane.id}`}
            >
              <div className={styles.swimlaneTitle}>
                <span>{swimlane.title}</span>
                <span className={styles.priorityBadge} data-priority={swimlane.priority.toLowerCase()}>
                  {swimlane.priority}
                </span>
              </div>
              <span className={styles.chevron}>
                {expandedSwimlane === swimlane.id ? '▼' : '▶'}
              </span>
            </button>

            {/* SWIMLANE DESCRIPTION */}
            <div className={styles.swimlaneDescription}>{swimlane.description}</div>

            {/* SWIMLANE ASSESSMENTS */}
            {expandedSwimlane === swimlane.id && (
              <div className={styles.assessments} data-testid={`assessments-${swimlane.id}`}>
                {swimlane.assessments.map((assessment) => (
                  <div key={assessment.id} className={styles.assessmentCard} data-testid={`assessment-${assessment.id}`}>
                    <div className={styles.assessmentTitle}>{assessment.title}</div>
                    <div className={styles.assessmentDescription}>{assessment.description}</div>
                    <div className={styles.assessmentTarget}>
                      <strong>Target State:</strong> {assessment.targetState}
                    </div>

                    {/* SCORE BUTTONS */}
                    <div className={styles.scoreButtons}>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          className={`${styles.scoreButton} ${scores[assessment.id] === score ? styles.active : ''}`}
                          onClick={() => handleScoreChange(assessment.id, score)}
                          data-testid={`score-${assessment.id}-${score}`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>

                    {/* NOTES */}
                    <textarea
                      className={styles.notesField}
                      placeholder="Add notes for this assessment..."
                      value={notes[assessment.id] || ''}
                      onChange={(e) => handleNoteChange(assessment.id, e.target.value)}
                      data-testid={`notes-${assessment.id}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SAVE BUTTON */}
      <div className={styles.saveSection} data-testid="save-section">
        <button
          className={styles.saveButton}
          onClick={handleSaveAssessment}
          disabled={saving}
          data-testid="save-button"
        >
          {saving ? 'Saving...' : '💾 Save Assessment'}
        </button>
      </div>
    </div>
  )
}
