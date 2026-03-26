import { useState, useEffect } from 'react'
import styles from './styles/ContactsMinimal.module.css'

export default function ContactsMinimal({ state, ws }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/contacts', {
          headers: { 'Accept': 'application/json' },
        })
        if (!response.ok) throw new Error(`API Error: ${response.status}`)
        const data = await response.json()
        setContacts(data.contacts || [])
      } catch (err) {
        // Demo data
        setContacts([
          { id: 1, name: 'Tim Ryan', platform: 'Telegram', handle: '@tryanz92', status: 'active' },
          { id: 2, name: 'Kelly', platform: 'WhatsApp', handle: '+1-XXX-XXX-XXXX', status: 'active' },
          { id: 3, name: 'Project Slack', platform: 'Slack', handle: '#mission-control', status: 'active' },
          { id: 4, name: 'Discord Community', platform: 'Discord', handle: 'clawd', status: 'idle' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.platform.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Contacts & Platforms</h2>
        <p className={styles.subtitle}>{contacts.length} contacts</p>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading && (
        <div className={styles.loading}>Loading contacts...</div>
      )}

      <div className={styles.contactsList}>
        {filteredContacts.map((contact) => (
          <div key={contact.id} className={styles.contactItem}>
            <div className={styles.contactIcon}>
              {contact.platform === 'Telegram' && '📱'}
              {contact.platform === 'WhatsApp' && '💬'}
              {contact.platform === 'Slack' && '⚡'}
              {contact.platform === 'Discord' && '🎮'}
            </div>
            <div className={styles.contactInfo}>
              <h3>{contact.name}</h3>
              <p className={styles.platform}>{contact.platform}</p>
              <p className={styles.handle}>{contact.handle}</p>
            </div>
            <div className={`${styles.statusBadge} ${styles[contact.status]}`}>
              {contact.status}
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && !loading && (
        <div className={styles.empty}>
          No contacts found
        </div>
      )}
    </div>
  )
}
