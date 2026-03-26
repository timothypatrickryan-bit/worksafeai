import { useState, useEffect } from 'react'
import styles from './styles/DocsMinimal.module.css'

export default function DocsMinimal({ state, ws }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/docs', {
          headers: { 'Accept': 'application/json' },
        })
        if (!response.ok) throw new Error(`API Error: ${response.status}`)
        const data = await response.json()
        setDocs(data.docs || [])
      } catch (err) {
        // Demo data
        setDocs([
          {
            id: 1,
            title: 'QUICK_START.md',
            category: 'setup',
            description: 'How to run Mission Control',
            updated: '2026-03-25',
          },
          {
            id: 2,
            title: 'FIX_SUMMARY.md',
            category: 'technical',
            description: 'Technical details of recent fixes',
            updated: '2026-03-25',
          },
          {
            id: 3,
            title: 'QUALITY_REPORT.md',
            category: 'review',
            description: 'Comprehensive quality verification',
            updated: '2026-03-25',
          },
          {
            id: 4,
            title: 'AUTONOMY_WORKFLOW.md',
            category: 'workflow',
            description: 'Core autonomy loop pattern',
            updated: '2026-03-20',
          },
          {
            id: 5,
            title: 'API_REFERENCE.md',
            category: 'api',
            description: 'Complete API endpoint documentation',
            updated: '2026-03-18',
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const filteredDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categoryIcons = {
    setup: '🚀',
    technical: '⚙️',
    review: '✅',
    workflow: '🔄',
    api: '📡',
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Documentation</h2>
        <p className={styles.subtitle}>{docs.length} documents</p>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search docs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading && (
        <div className={styles.loading}>Loading docs...</div>
      )}

      <div className={styles.docsList}>
        {filteredDocs.map((doc) => (
          <a
            key={doc.id}
            href={`/docs/${doc.title}`}
            className={styles.docCard}
          >
            <div className={styles.docIcon}>
              {categoryIcons[doc.category] || '📄'}
            </div>
            <div className={styles.docInfo}>
              <h3>{doc.title}</h3>
              <p className={styles.description}>{doc.description}</p>
              <p className={styles.date}>Updated: {new Date(doc.updated).toLocaleDateString()}</p>
            </div>
            <div className={styles.arrow}>→</div>
          </a>
        ))}
      </div>

      {filteredDocs.length === 0 && !loading && (
        <div className={styles.empty}>
          No documents found
        </div>
      )}

      <div className={styles.quickLinks}>
        <h3>Quick Links</h3>
        <ul>
          <li><a href="/README.md">Project README</a></li>
          <li><a href="/SOUL.md">Lucy's Soul</a></li>
          <li><a href="/USER.md">About Tim</a></li>
          <li><a href="/MEMORY.md">Long-term Memory</a></li>
        </ul>
      </div>
    </div>
  )
}
