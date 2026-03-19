import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import useWebSocket from '../hooks/useWebSocket';

export default function Home() {
  const [activeSection, setActiveSection] = useState('agents');
  const { state, connected, error } = useWebSocket('ws://localhost:3000');

  return (
    <div className="flex h-screen bg-light">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-dark">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <div className="text-xs px-3 py-1 rounded-full bg-red-100 text-danger font-medium">
                ❌ Connection Error
              </div>
            )}
            {connected ? (
              <div className="text-xs px-3 py-1 rounded-full bg-green-100 text-success font-medium">
                🟢 Connected
              </div>
            ) : (
              <div className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-warning font-medium">
                🟡 Connecting...
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <Dashboard state={state} activeSection={activeSection} />
      </div>
    </div>
  );
}
