import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  className?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  className = ''
}) => {
  return (
    <div className={`rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-gray-700/50">
          {icon}
        </div>
        <div className={`flex items-center ${
          trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
};