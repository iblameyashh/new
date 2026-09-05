import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function OwnerSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportEmail: '',
    aiEnabled: true,
    aiProvider: 'openai',
    maintenanceMode: false,
    allowRegistration: true
  });
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const loadSettings = async () => {
      try {
        const res = await api.get('/owner/settings/');
        setSettings(res.data.settings || {});
        setApiKeys(res.data.api_keys || {});
      } catch (err) {
        console.error('Error loading settings:', err);
        // Use defaults if API fails
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage('');

    try {
      await api.post('/owner/settings/', {
        settings: {
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          contactEmail: settings.contactEmail,
          supportEmail: settings.supportEmail,
          aiEnabled: settings.aiEnabled,
          aiProvider: settings.aiProvider,
          maintenanceMode: settings.maintenanceMode,
          allowRegistration: settings.allowRegistration
        },
        api_keys: apiKeys
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-[85vh] flex items-center justify-center text-gray-500">Loading settings...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Website Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure general settings for your Learnique platform
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="px-8 py-6">
            <div className="space-y-6">
              {/* Site Information */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Site Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                      placeholder="Learnique"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Description
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                      rows="3"
                      placeholder="Describe your educational platform..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                      placeholder="contact@learnique.com"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                      placeholder="support@learnique.com"
                    />
                  </div>
                </div>
              </div>

              {/* AI Configuration */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  AI Assistant Configuration
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={settings.aiEnabled}
                      onChange={(e) => setSettings({...settings, aiEnabled: e.target.checked})}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    Enable AI Assistant
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    Allow students and teachers to use the Learnique AI for educational help
                  </p>
                </div>
                <div className={!settings.aiEnabled ? 'space-y-4 opacity-50' : 'space-y-4'}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Provider
                  </label>
                  <select
                    value={settings.aiProvider}
                    onChange={(e) => setSettings({...settings, aiProvider: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    disabled={!settings.aiEnabled}
                  >
                    <option value="openai">OpenAI GPT</option>
                    <option value="anthropic">Anthropic Claude</option>
                  </select>
                </div>
              </div>

              {/* API Keys (placeholder - in reality these would be handled more securely) */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  API Keys
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  For security reasons, API keys should be configured in the backend environment variables.
                  This interface is for demonstration purposes only.
                </p>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Anthropic API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys({...apiKeys, anthropic: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    placeholder="sk-ant-..."
                  />
                </div>
              </div>

              {/* Platform Settings */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Platform Settings
                </h3>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    Maintenance Mode
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    Temporarily disable platform access for maintenance
                  </p>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    Allow New Registrations
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    Enable or disable user registration
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold transition-colors disabled:opacity-50"
              disabled={submitLoading}
            >
              {submitLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}