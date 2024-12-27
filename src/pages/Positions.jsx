import { useQuery } from 'react-query';
import axios from 'axios';

export default function Positions() {
  const { data: positions } = useQuery('positions', async () => {
    const response = await axios.get('/api/positions');
    return response.data;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Open Positions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P/L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {positions?.map((position) => (
                <tr key={position.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      position.direction === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {position.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${position.entryPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${position.currentPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={position.pl >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${position.pl}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => closePosition(position.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}