import React from 'react'
import TasksSection from './sections/TasksSection'
import MemorySection from './sections/MemorySection'
import CalendarSection from './sections/CalendarSection'
import TeamSection from './sections/TeamSection'
import ProjectsSection from './sections/ProjectsSection'
import InboxSection from './sections/InboxSection'
import AlertsSection from './sections/AlertsSection'
import ContactsSection from './sections/ContactsSection'
import DocsSection from './sections/DocsSection'
import GapAnalysisSection from './sections/GapAnalysisSection'
import TaskProgressDashboard from './sections/TaskProgressDashboard'
import AgentBriefingApproval from './sections/AgentBriefingApproval'

export default function Dashboard({ section, state, ws }) {
  const renderSection = () => {
    switch (section) {
      case 'tasks':
        return <TasksSection state={state} ws={ws} />
      case 'task-progress':
        return <TaskProgressDashboard />
      case 'agent-briefing-approval':
        return <AgentBriefingApproval taskId="demo-task" agentName="Demo Agent" briefing={{}} />
      case 'memory':
        return <MemorySection state={state} />
      case 'calendar':
        return <CalendarSection state={state} />
      case 'team':
        return <TeamSection state={state} />
      case 'projects':
        return <ProjectsSection state={state} />
      case 'inbox':
        return <InboxSection state={state} />
      case 'alerts':
        return <AlertsSection state={state} />
      case 'contacts':
        return <ContactsSection state={state} />
      case 'docs':
        return <DocsSection state={state} />
      case 'gap-analysis':
        return <GapAnalysisSection state={state} />
      default:
        return <div>Select a section</div>
    }
  }

  return <div>{renderSection()}</div>
}
