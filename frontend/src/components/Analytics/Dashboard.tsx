/**
 * Analytics dashboard component.
 */
import { useAnalytics } from '../../hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export function Dashboard() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const statusData = [
    { name: 'Applied', count: analytics.by_status.Applied },
    { name: 'Interviewing', count: analytics.by_status.Interviewing },
    { name: 'Offer', count: analytics.by_status.Offer },
    { name: 'Rejected', count: analytics.by_status.Rejected },
  ];

  const averageTimeData = [
    { name: 'Applied', days: analytics.average_time_per_stage.Applied },
    { name: 'Interviewing', days: analytics.average_time_per_stage.Interviewing },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.total_applications}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Offers</h3>
          <p className="text-3xl font-bold text-green-900 dark:text-green-300">{analytics.by_status.Offer}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Interviewing</h3>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">{analytics.by_status.Interviewing}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
            {(analytics.success_rate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applications by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" className="dark:text-gray-300" />
              <YAxis className="dark:text-gray-300" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Time per Stage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Average Days per Stage
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averageTimeData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" className="dark:text-gray-300" />
              <YAxis className="dark:text-gray-300" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} />
              <Bar dataKey="days" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Applications Over Time */}
      {analytics.applications_over_time.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Applications Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.applications_over_time}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis dataKey="date" className="dark:text-gray-300" />
              <YAxis className="dark:text-gray-300" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
