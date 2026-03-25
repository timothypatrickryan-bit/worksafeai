import styles from './styles/Sidebar.minimal.module.css'

export default function SidebarMinimal({ currentSection, setCurrentSection, state }) {
  const navItems = [
    { id: 'unified-dashboard', label: 'Dashboard' },
    { id: 'gap-analysis', label: 'Gap Analysis' },
    { id: 'team', label: 'Team' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'memory', label: 'Memory' },
    { id: 'docs', label: 'Docs' },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Navigation</div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSection(item.id)}
            className={`${styles.navItem} ${currentSection === item.id ? styles.active : ''}`}
            data-testid={`nav-${item.id}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter} data-testid="sidebar-status">
        <div className={styles.statusDot}></div>
        <span>Connected</span>
      </div>
    </aside>
  )
}
