import React from 'react';
import { useQuery } from 'react-query';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { data: accountInfo, error: accountError } = useQuery(
    'accountInfo',
    async () => {
      try {
        const response = await axios.get('/api/account');
        return response.data;
      } catch (error) {
        return {
          balance: 0,
          dailyPL: 0
        };
      }
    },
    { initialData: { balance: 0, dailyPL: 0 } }
  );

  const { data: positions = [], error: positionsError } = useQuery(
    'positions',
    async () => {
      try {
        const response = await axios.get('/api/positions');
        return response.data;
      } catch (error) {
        return [];
      }
    },
    { initialData: [] }
  );

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Account Value',
        data: [10000, 10500, 10300, 10800, 11000, 10900],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Account Performance'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Account Balance</h3>
          <p className="text-3xl font-bold text-green-600">
            ${accountInfo?.balance?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Open Positions</h3>
          <p className="text-3xl font-bold text-blue-600">
            {positions?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Daily P/L</h3>
          <p className="text-3xl font-bold text-indigo-600">
            ${accountInfo?.dailyPL?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}