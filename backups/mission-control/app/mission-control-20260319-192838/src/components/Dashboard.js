import React from 'react'
import MemorySection from './sections/MemorySection'
import CalendarSection from './sections/CalendarSection'
import TeamSection from './sections/TeamSection'
import ContactsSection from './sections/ContactsSection'
import DocsSection from './sections/DocsSection'
import GapAnalysisSection from './sections/GapAnalysisSection'
import UnifiedDashboardSection from './sections/UnifiedDashboardSection'

export default function Dashboard({ section, state, ws }) {
  const renderSection = () => {
    // Just render the section — let it handle its own loading state
    // Remove the blocking check that was preventing display

    switch (section) {
      case 'unified-dashboard':
        return <UnifiedDashboardSection state={state} onApprove={(id) => console.log('Approved:', id)} onReject={(id) => console.log('Rejected:', id)} onUpdateTask={(id, updates) => console.log('Updated:', id, updates)} />
      case 'memory':
        return <MemorySection state={state} />
      case 'calendar':
        return <CalendarSection state={state} />
      case 'team':
        return <TeamSection state={state} />
      case 'contacts':
        return <ContactsSection state={state} />
      case 'docs':
        return <DocsSection state={state} />
      case 'gap-analysis':
        return <GapAnalysisSection state={state} />
      default:
        return <UnifiedDashboardSection state={state} onApprove={(id) => console.log('Approved:', id)} onReject={(id) => console.log('Rejected:', id)} onUpdateTask={(id, updates) => console.log('Updated:', id, updates)} />
    }
  }

  return <div>{renderSection()}</div>
}
