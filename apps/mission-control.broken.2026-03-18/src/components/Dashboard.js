import AgentsSection from './sections/AgentsSection';
import ProjectsSection from './sections/ProjectsSection';
import InboxSection from './sections/InboxSection';
import AlertsSection from './sections/AlertsSection';
import ContactsSection from './sections/ContactsSection';

const Dashboard = ({ state, activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'agents':
        return <AgentsSection state={state} />;
      case 'projects':
        return <ProjectsSection state={state} />;
      case 'inbox':
        return <InboxSection state={state} />;
      case 'alerts':
        return <AlertsSection state={state} />;
      case 'contacts':
        return <ContactsSection state={state} />;
      default:
        return <AgentsSection state={state} />;
    }
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-secondary text-lg mb-2">Loading state...</p>
          <p className="text-xs text-secondary">Connecting to mission control server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">{renderSection()}</div>
    </div>
  );
};

export default Dashboard;
