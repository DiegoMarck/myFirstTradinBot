import { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';

export default function Settings() {
  const [settings, setSettings] = useState({
    apiKey: '',
    maxRiskPerTrade: 2,
    minRiskRewardRatio: 2,
    maxPositionsOpen: 3,
    trailingStopActivation: 50,
    breakevenThreshold: 30
  });

  const updateSettingsMutation = useMutation((newSettings) => {
    return axios.post('/api/settings', newSettings);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Bot Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Capital.com API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Risk Per Trade (%)
              </label>
              <input
                type="number"
                value={settings.maxRiskPerTrade}
                onChange={(e) => setSettings({ ...settings, maxRiskPerTrade: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Risk/Reward Ratio
              </label>
              <input
                type="number"
                value={settings.minRiskRewardRatio}
                onChange={(e) => setSettings({ ...settings, minRiskRewardRatio: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Open Positions
              </label>
              <input
                type="number"
                value={settings.maxPositionsOpen}
                onChange={(e) => setSettings({ ...settings, maxPositionsOpen: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trailing Stop Activation (%)
              </label>
              <input
                type="number"
                value={settings.trailingStopActivation}
                onChange={(e) => setSettings({ ...settings, trailingStopActivation: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}