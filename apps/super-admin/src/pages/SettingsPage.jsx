import { useState } from 'react';
import useAppStore from '../stores/appStore';
import useAuthStore from '../stores/authStore';
import { Settings, Key, Webhook } from 'lucide-react';
import Modal from '../components/Modal';

export default function SettingsPage() {
  const { apps, selectedApp, setSelectedApp } = useAppStore();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [apiKey] = useState('sk_test_' + Math.random().toString(36).substr(2, 24));

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your admin account and console settings</p>
      </div>

      {/* Account Settings */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Email Address</p>
            <p className="text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Role</p>
            <p className="text-white capitalize">{user?.role}</p>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* App Selection */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Selected App
        </h2>
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name} - {app.description}
            </option>
          ))}
        </select>
        <p className="text-slate-400 text-sm mt-2">
          Select which app you want to manage. All navigation and data will be scoped to this app.
        </p>
      </div>

      {/* API Keys */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Keys
        </h2>
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <p className="text-slate-400 text-sm mb-2">Test API Key</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-white break-all">{apiKey}</code>
              <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Use this key to authenticate API requests. Keep it secret!
            </p>
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Webhook className="w-5 h-5" />
          Webhooks
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Configure webhooks to receive real-time updates about events in your system.
        </p>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Add Webhook
        </button>
      </div>

      {/* Feature Flags */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Feature Flags</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 rounded"
            />
            <span className="text-white">Enable company bulk operations</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 rounded"
            />
            <span className="text-white">Enable advanced analytics</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-4 h-4 rounded"
            />
            <span className="text-white">Enable beta features</span>
          </label>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        actions={{
          primary: { label: 'Logout', onClick: handleLogout },
          secondary: { label: 'Cancel', onClick: () => setShowLogoutModal(false) },
        }}
      >
        <p className="text-slate-300">
          Are you sure you want to logout? You'll need to sign in again to access the admin console.
        </p>
      </Modal>
    </div>
  );
}
