import React from 'react';
import { MoreHorizontal, Sparkles } from 'lucide-react';

interface ChartWidgetProps {
  title: string;
  description: string;
  className?: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ 
  title, 
  description,
  className = '' 
}) => {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center rounded-lg border border-gray-700/50 bg-gray-800/30">
          <div className="text-center">
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};