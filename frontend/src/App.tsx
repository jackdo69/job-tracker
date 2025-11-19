/**
 * Main application component.
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeToggle } from './components/common/ThemeToggle';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login, Register, GoogleCallback } from './components/Auth';
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';
import { JobFormModal } from './components/JobForm/JobFormModal';
import { Dashboard } from './components/Analytics/Dashboard';
import type { JobApplication } from './types/job';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function MainApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [activeView, setActiveView] = useState<'board' | 'analytics'>('board');
  const { user, logout } = useAuth();

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleNewJob = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Tracker</h1>
              {user && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {user.full_name || user.email}
                </p>
              )}
            </div>
            <div className="flex gap-4 items-center">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('board')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'board'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'analytics'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Analytics
                </button>
              </div>

              {/* New Application Button */}
              <button
                onClick={handleNewJob}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Application
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeView === 'board' ? (
          <KanbanBoard onEdit={handleEdit} />
        ) : (
          <Dashboard />
        )}
      </main>

      {/* Job Form Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={editingJob}
      />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainApp />
                  </ProtectedRoute>
                }
              />

              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
