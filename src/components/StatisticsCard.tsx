import React from 'react';
import { Statistics } from '../types';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface StatisticsCardProps {
  statistics: Statistics;
}

export function StatisticsCard({ statistics }: StatisticsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-green-600">{statistics.completedToday}</div>
          <div className="text-sm text-gray-600">Completed Today</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-blue-600">{statistics.completedThisWeek}</div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mx-auto mb-2">
            <Clock className="text-amber-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-amber-600">{statistics.pendingTasks}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-red-600">{statistics.overdueTasks}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Completion Rate</span>
          <span className="text-sm font-bold text-gray-900">{statistics.completionRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${statistics.completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}