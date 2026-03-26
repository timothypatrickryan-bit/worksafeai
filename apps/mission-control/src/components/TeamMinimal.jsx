import { useState, useEffect } from 'react'
import styles from './styles/TeamMinimal.module.css'

export default function TeamMinimal({ state, ws }) {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/team', {
          headers: { 'Accept': 'application/json' },
        })
        if (!response.ok) throw new Error(`API Error: ${response.status}`)
        const data = await response.json()
        setTeam(data.members || [])
        setError(null)
      } catch (err) {
        console.error('Failed to fetch team:', err)
        // Demo data
        setTeam([
          { id: 1, name: 'Lucy', role: 'AI Assistant', status: 'active', lastSeen: '2 min ago', specialty: 'General purpose, task coordination' },
          { id: 2, name: 'Opus Review Agent', role: 'Code Reviewer', status: 'active', lastSeen: '5 min ago', specialty: 'Code quality, security audits' },
          { id: 3, name: 'Velma', role: 'QA Engineer', status: 'active', lastSeen: '10 min ago', specialty: 'Testing, bug reports' },
          { id: 4, name: 'Laura', role: 'Brand Strategist', status: 'idle', lastSeen: '2 hours ago', specialty: 'Brand positioning, marketing' },
        ])
        setError(null)
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Team Members</h2>
        <p className={styles.subtitle}>{team.length} members</p>
      </div>

      {loading && (
        <div className={styles.loading}>Loading team...</div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      <div className={styles.teamGrid}>
        {team.map((member) => (
          <div
            key={member.id}
            className={`${styles.memberCard} ${selectedMember?.id === member.id ? styles.selected : ''}`}
            onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
          >
            <div className={styles.memberHeader}>
              <div className={styles.memberInfo}>
                <h3>{member.name}</h3>
                <p className={styles.role}>{member.role}</p>
              </div>
              <div className={`${styles.statusDot} ${styles[member.status]}`}></div>
            </div>

            <div className={styles.specialty}>
              <strong>Specialty:</strong> {member.specialty}
            </div>

            <div className={styles.lastSeen}>
              Last seen: {member.lastSeen}
            </div>

            {selectedMember?.id === member.id && (
              <div className={styles.expandedInfo}>
                <div className={styles.section}>
                  <h4>Recent Activity</h4>
                  <ul>
                    <li>Completed 12 tasks this week</li>
                    <li>95% quality score</li>
                    <li>4.2 avg response time (hours)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
