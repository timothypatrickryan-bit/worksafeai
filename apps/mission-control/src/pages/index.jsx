import { useState, useEffect } from 'react'
import SidebarMinimal from '../components/Sidebar.minimal'
import DashboardMinimal from '../components/DashboardMinimal'
import GapAnalysisMinimal from '../components/GapAnalysisMinimal'
import TeamMinimal from '../components/TeamMinimal'
import ContactsMinimal from '../components/ContactsMinimal'
import CalendarMinimal from '../components/CalendarMinimal'
import MemoryMinimal from '../components/MemoryMinimal'
import DocsMinimal from '../components/DocsMinimal'
import SkillsManagement from './SkillsManagement'
import useWebSocket from '../hooks/useWebSocket'
import styles from './index.module.css'

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
      'skills': 'Skills Management',
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
              <GapAnalysisMinimal state={state} ws={ws} />
            )}
            {currentSection === 'team' && (
              <TeamMinimal state={state} ws={ws} />
            )}
            {currentSection === 'contacts' && (
              <ContactsMinimal state={state} ws={ws} />
            )}
            {currentSection === 'calendar' && (
              <CalendarMinimal state={state} ws={ws} />
            )}
            {currentSection === 'memory' && (
              <MemoryMinimal state={state} ws={ws} />
            )}
            {currentSection === 'docs' && (
              <DocsMinimal state={state} ws={ws} />
            )}
            {currentSection === 'skills' && (
              <SkillsManagement state={state} ws={ws} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
