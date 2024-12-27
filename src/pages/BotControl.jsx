import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

export default function BotControl() {
  const [selectedSymbols, setSelectedSymbols] = React.useState([]);
  const queryClient = useQueryClient();

  const { data: availableSymbols = [], error: symbolsError } = useQuery(
    'symbols',
    async () => {
      try {
        const response = await axios.get('/api/symbols');
        return response.data;
      } catch (error) {
        return [];
      }
    },
    { initialData: [] }
  );

  const { data: botStatus = { isRunning: false }, error: statusError } = useQuery(
    'botStatus',
    async () => {
      try {
        const response = await axios.get('/api/bot/status');
        return response.data;
      } catch (error) {
        return { isRunning: false };
      }
    },
    {
      initialData: { isRunning: false },
      refetchInterval: 5000
    }
  );

  const startBotMutation = useMutation(
    (symbols) => axios.post('/api/bot/start', { symbols }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('botStatus');
      }
    }
  );

  const stopBotMutation = useMutation(
    () => axios.post('/api/bot/stop'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('botStatus');
      }
    }
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Bot Control Panel</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Trading Pairs
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableSymbols.map(symbol => (
              <label key={symbol.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSymbols.includes(symbol.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSymbols([...selectedSymbols, symbol.id]);
                    } else {
                      setSelectedSymbols(selectedSymbols.filter(s => s !== symbol.id));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span>{symbol.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => startBotMutation.mutate(selectedSymbols)}
            disabled={botStatus.isRunning || selectedSymbols.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Start Bot
          </button>
          <button
            onClick={() => stopBotMutation.mutate()}
            disabled={!botStatus.isRunning}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Stop Bot
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bot Status</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${botStatus.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{botStatus.isRunning ? 'Running' : 'Stopped'}</span>
          </div>
          <div>
            <h4 className="font-medium">Active Pairs:</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSymbols.map(symbol => (
                <span key={symbol} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}