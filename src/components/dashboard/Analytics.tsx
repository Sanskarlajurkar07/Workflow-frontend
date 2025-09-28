import React from 'react';
import { BarChart, Activity, Users } from 'lucide-react';

const MetricCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
}> = ({ icon, title, value, change }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          {icon}
        </div>
        <span className={`text-sm font-medium ${
          change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

export const Analytics: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            icon={<BarChart className="w-6 h-6 text-blue-500" />}
            title="Total Executions"
            value="12,456"
            change="+23%"
          />
          <MetricCard
            icon={<Activity className="w-6 h-6 text-green-500" />}
            title="Success Rate"
            value="98.5%"
            change="+2.1%"
          />
          <MetricCard
            icon={<Users className="w-6 h-6 text-purple-500" />}
            title="Active Users"
            value="1,234"
            change="+15%"
          />
        </div>
      </div>
    </div>
  );
};