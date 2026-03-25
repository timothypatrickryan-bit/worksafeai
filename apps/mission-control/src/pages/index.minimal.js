import { useState, useEffect } from 'react'
import SidebarMinimal from '../components/Sidebar.minimal'
import DashboardMinimal from '../components/DashboardMinimal'
import useWebSocket from '../hooks/useWebSocket'
import styles from './index.minimal.module.css'

export default function Home() {
  const [currentSection, setCurrentSection] = useState('unified-dashboard')
  const [state, isConnected, ws] = useWebSocket()

  const getSectionTitle = (section) => {
    const titles = {
      'unified-dashboard': 'Dashboard',
      'gap-analysis': 'Gap Analysis',
      'team': 'Team',
      'contacts': 'Contacts',
      'calendar': 'Calendar',
      'memory': 'Memory',
      'docs': 'Docs',
    }
    return titles[section] || 'Dashboard'
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <SidebarMinimal 
        currentSection={currentSection} 
        setCurrentSection={setCurrentSection}
        state={state}
      />

      {/* Main Content */}
      <div className={styles.mainWrapper}>
        {/* Top Navigation */}
        <div className={styles.topnav}>
          <div className={styles.topnavLeft}>
            <h1 className={styles.topnavTitle}>{getSectionTitle(currentSection)}</h1>
          </div>
          <div className={styles.topnavRight}>
            <div className={styles.statusIndicator} data-testid="status-indicator">
              <div className={`${styles.statusDot} ${isConnected ? styles.online : styles.offline}`}></div>
              <span>{isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.mainContent}>
          <div className={styles.contentPadding}>
            {currentSection === 'unified-dashboard' && (
              <DashboardMinimal state={state} ws={ws} />
            )}
            {currentSection === 'gap-analysis' && (
              <div data-testid="gap-analysis-section">Gap Analysis coming soon...</div>
            )}
            {currentSection === 'team' && (
              <div data-testid="team-section">Team coming soon...</div>
            )}
            {currentSection === 'contacts' && (
              <div data-testid="contacts-section">Contacts coming soon...</div>
            )}
            {currentSection === 'calendar' && (
              <div data-testid="calendar-section">Calendar coming soon...</div>
            )}
            {currentSection === 'memory' && (
              <div data-testid="memory-section">Memory coming soon...</div>
            )}
            {currentSection === 'docs' && (
              <div data-testid="docs-section">Docs coming soon...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
