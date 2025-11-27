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
    { name: 'Applied', count: analytics.byStatus.Applied },
    { name: 'Interviewing', count: analytics.byStatus.Interviewing },
    { name: 'Offer', count: analytics.byStatus.Offer },
    { name: 'Rejected', count: analytics.byStatus.Rejected },
  ];

  const averageTimeData = [
    { name: 'Applied', days: analytics.averageTimePerStage.Applied },
    { name: 'Interviewing', days: analytics.averageTimePerStage.Interviewing },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Total Applications</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalApplications}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 mb-1 sm:mb-2">Offers</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-300">{analytics.byStatus.Offer}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400 mb-1 sm:mb-2">Interviewing</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-300">{analytics.byStatus.Interviewing}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-400 mb-1 sm:mb-2">Success Rate</h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-300">
            {(analytics.successRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Applications by Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Applications by Status</h3>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="name"
                className="dark:text-gray-300"
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis className="dark:text-gray-300" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '14px'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Time per Stage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Average Days per Stage
          </h3>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={averageTimeData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="name"
                className="dark:text-gray-300"
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis className="dark:text-gray-300" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '14px'
                }}
              />
              <Bar dataKey="days" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Applications Over Time */}
      {analytics.applicationsOverTime.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Applications Over Time
          </h3>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <LineChart data={analytics.applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                className="dark:text-gray-300"
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis className="dark:text-gray-300" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '14px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
