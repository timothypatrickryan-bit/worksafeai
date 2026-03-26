import { useState, useEffect } from 'react'
import styles from './styles/MemoryMinimal.module.css'

export default function MemoryMinimal({ state, ws }) {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState(null)

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/memories/load-longterm', {
          headers: { 'Accept': 'application/json' },
        })
        if (!response.ok) throw new Error(`API Error: ${response.status}`)
        const data = await response.json()
        setMemories(data.memories || [])
      } catch (err) {
        // Demo data
        setMemories([
          {
            id: 1,
            title: 'Mission Statement',
            category: 'core',
            content: 'Build an autonomous organization of AI agents that does work 24/7',
            lastUpdated: '2026-03-20',
          },
          {
            id: 2,
            title: 'AI Agent Velocity Principle',
            category: 'principle',
            content: 'Work at AI pace (hours/days), parallelize everything, compress timelines 5-10x',
            lastUpdated: '2026-03-16',
          },
          {
            id: 3,
            title: 'Tech Stack Decision',
            category: 'technical',
            content: 'Backend: Node.js + Express + Supabase. Frontend: React + Vercel. AI: Anthropic Claude.',
            lastUpdated: '2026-03-08',
          },
          {
            id: 4,
            title: 'Team Specialties',
            category: 'team',
            content: 'Lucy: General purpose & coordination. Opus: Code review. Velma: QA. Laura: Brand strategy.',
            lastUpdated: '2026-03-15',
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchMemories()
  }, [])

  const categoryColors = {
    core: '#0ea5e9',
    principle: '#8b5cf6',
    technical: '#10b981',
    team: '#f59e0b',
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Memory & Journal</h2>
        <p className={styles.subtitle}>{memories.length} saved memories</p>
      </div>

      {loading && (
        <div className={styles.loading}>Loading memories...</div>
      )}

      <div className={styles.memoriesList}>
        {memories.map((memory) => (
          <div
            key={memory.id}
            className={`${styles.memoryCard} ${selectedMemory?.id === memory.id ? styles.selected : ''}`}
            onClick={() => setSelectedMemory(selectedMemory?.id === memory.id ? null : memory)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.categoryTag} style={{ background: categoryColors[memory.category] }}>
                {memory.category}
              </div>
              <span className={styles.date}>
                {new Date(memory.lastUpdated).toLocaleDateString()}
              </span>
            </div>

            <h3 className={styles.title}>{memory.title}</h3>

            <p className={styles.preview}>{memory.content.substring(0, 80)}...</p>

            {selectedMemory?.id === memory.id && (
              <div className={styles.expandedContent}>
                <div className={styles.divider}></div>
                <p className={styles.fullContent}>{memory.content}</p>
                <div className={styles.actions}>
                  <button className={styles.button}>Edit</button>
                  <button className={styles.button}>Archive</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {memories.length === 0 && !loading && (
        <div className={styles.empty}>
          No memories yet. Start documenting important decisions and learnings!
        </div>
      )}
    </div>
  )
}
