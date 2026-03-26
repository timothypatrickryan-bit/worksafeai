import { useState, useEffect } from 'react'
import styles from './styles/CalendarMinimal.module.css'

export default function CalendarMinimal({ state, ws }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/calendar', {
          headers: { 'Accept': 'application/json' },
        })
        if (!response.ok) throw new Error(`API Error: ${response.status}`)
        const data = await response.json()
        setEvents(data.events || [])
      } catch (err) {
        // Demo data
        setEvents([
          { id: 1, title: 'LinkedIn Auto-Post', time: '9:00 AM', type: 'scheduled', date: '2026-03-26' },
          { id: 2, title: 'Daily Gap Analysis Review', time: '10:00 AM', type: 'daily', date: '2026-03-25' },
          { id: 3, title: 'Autonomy Loop Check', time: 'Every 30 min', type: 'recurring', date: '2026-03-25' },
          { id: 4, title: 'Mission Control Heartbeat', time: 'Every 60 min', type: 'recurring', date: '2026-03-25' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const todayEvents = events.filter(e => {
    const today = new Date().toISOString().split('T')[0]
    return e.date === today
  })

  const upcomingEvents = events.filter(e => {
    const today = new Date().toISOString().split('T')[0]
    return e.date > today
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Calendar & Schedule</h2>
        <p className={styles.subtitle}>{events.length} scheduled events</p>
      </div>

      {loading && (
        <div className={styles.loading}>Loading calendar...</div>
      )}

      <div className={styles.sections}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Today</h3>
          {todayEvents.length === 0 ? (
            <p className={styles.empty}>No events today</p>
          ) : (
            <div className={styles.eventsList}>
              {todayEvents.map((event) => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventIcon}>
                    {event.type === 'scheduled' && '📅'}
                    {event.type === 'daily' && '⏰'}
                    {event.type === 'recurring' && '🔁'}
                  </div>
                  <div className={styles.eventInfo}>
                    <h4>{event.title}</h4>
                    <p className={styles.time}>{event.time}</p>
                  </div>
                  <span className={`${styles.badge} ${styles[event.type]}`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Upcoming</h3>
          {upcomingEvents.length === 0 ? (
            <p className={styles.empty}>No upcoming events</p>
          ) : (
            <div className={styles.eventsList}>
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventIcon}>
                    {event.type === 'scheduled' && '📅'}
                    {event.type === 'daily' && '⏰'}
                    {event.type === 'recurring' && '🔁'}
                  </div>
                  <div className={styles.eventInfo}>
                    <h4>{event.title}</h4>
                    <p className={styles.date}>{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`${styles.badge} ${styles[event.type]}`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Cron Jobs</h3>
          <div className={styles.jobsList}>
            <div className={styles.jobItem}>
              <div className={styles.jobStatus}>🟢</div>
              <div>
                <h4>LinkedIn Auto-Poster</h4>
                <p>Tue/Thu/Sat @ 9:00 AM EST</p>
              </div>
            </div>
            <div className={styles.jobItem}>
              <div className={styles.jobStatus}>🟢</div>
              <div>
                <h4>Autonomy Loop</h4>
                <p>Every 30 minutes</p>
              </div>
            </div>
            <div className={styles.jobItem}>
              <div className={styles.jobStatus}>🟢</div>
              <div>
                <h4>Mission Control Heartbeat</h4>
                <p>Every 60 minutes</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
