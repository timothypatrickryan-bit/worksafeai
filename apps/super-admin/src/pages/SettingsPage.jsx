import { useState } from 'react';
import { Save, Key, Bell, Shield, Mail, Globe, CheckCircle } from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';
import useAuthStore from '../stores/authStore';

export default function SettingsPage() {
  const { addNotification } = useNotificationStore();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // General settings
  const [general, setGeneral] = useState({
    siteName: 'WorkSafeAI',
    supportEmail: 'support@worksafeai.com',
    defaultTimezone: 'America/New_York',
    maintenanceMode: false,
  });

  // Email settings
  const [email, setEmail] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromName: 'WorkSafeAI',
    fromEmail: 'noreply@worksafeai.com',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    newCompanyAlert: true,
    subscriptionAlert: true,
    errorAlert: true,
    weeklyReport: true,
    dailyDigest: false,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Persist to API when endpoints are ready
      await new Promise(resolve => setTimeout(resolve, 500));
      addNotification('Settings saved successfully', 'success');
    } catch (err) {
      addNotification(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-slate-300 text-sm">{label}</span>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${checked ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'}`} />
        </div>
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Platform configuration and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={general.siteName}
                    onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Default Timezone</label>
                  <select
                    value={general.defaultTimezone}
                    onChange={(e) => setGeneral({ ...general, defaultTimezone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <Toggle
                  checked={general.maintenanceMode}
                  onChange={(e) => setGeneral({ ...general, maintenanceMode: e.target.checked })}
                  label="Maintenance Mode"
                />
                {general.maintenanceMode && (
                  <p className="text-amber-400 text-xs">⚠️ Maintenance mode will prevent all non-admin access</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Email Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={email.smtpHost}
                      onChange={(e) => setEmail({ ...email, smtpHost: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Port</label>
                    <input
                      type="text"
                      value={email.smtpPort}
                      onChange={(e) => setEmail({ ...email, smtpPort: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Username</label>
                    <input
                      type="text"
                      value={email.smtpUser}
                      onChange={(e) => setEmail({ ...email, smtpUser: e.target.value })}
                      placeholder="username"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Password</label>
                    <input
                      type="password"
                      value={email.smtpPassword}
                      onChange={(e) => setEmail({ ...email, smtpPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">From Name</label>
                    <input
                      type="text"
                      value={email.fromName}
                      onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">From Email</label>
                    <input
                      type="email"
                      value={email.fromEmail}
                      onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
              <div className="space-y-4">
                <Toggle
                  checked={notifications.newCompanyAlert}
                  onChange={(e) => setNotifications({ ...notifications, newCompanyAlert: e.target.checked })}
                  label="New company registration alerts"
                />
                <Toggle
                  checked={notifications.subscriptionAlert}
                  onChange={(e) => setNotifications({ ...notifications, subscriptionAlert: e.target.checked })}
                  label="Subscription change alerts"
                />
                <Toggle
                  checked={notifications.errorAlert}
                  onChange={(e) => setNotifications({ ...notifications, errorAlert: e.target.checked })}
                  label="System error alerts"
                />
                <Toggle
                  checked={notifications.weeklyReport}
                  onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                  label="Weekly summary report"
                />
                <Toggle
                  checked={notifications.dailyDigest}
                  onChange={(e) => setNotifications({ ...notifications, dailyDigest: e.target.checked })}
                  label="Daily activity digest"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Current Admin</span>
                  </div>
                  <p className="text-slate-400 text-sm">{user?.email || 'Not logged in'}</p>
                  <p className="text-slate-500 text-xs mt-1">Role: {user?.role || '—'}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-slate-300 text-sm mb-3">Session management and API key generation will be available in a future update.</p>
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>JWT authentication active</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Token auto-refresh enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
