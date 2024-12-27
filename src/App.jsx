import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BotControl from './pages/BotControl';
import Positions from './pages/Positions';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      onError: (error) => {
        console.error('Query Error:', error?.message || 'An error occurred');
      }
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation Error:', error?.message || 'An error occurred');
      }
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bot" element={<BotControl />} />
              <Route path="/positions" element={<Positions />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;