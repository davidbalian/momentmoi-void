"use client";

import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { ChecklistStats as ChecklistStatsType } from "@/types/checklist";

interface ChecklistStatsProps {
  stats: ChecklistStatsType;
}

export function ChecklistStats({ stats }: ChecklistStatsProps) {
  const completionPercentage = Math.round(stats.completionRate);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Tasks */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon name="CheckSquare" size="sm" className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </Card>

      {/* Completed */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Icon name="CheckCircle" size="sm" className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
          </div>
        </div>
      </Card>

      {/* Overdue */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Icon name="AlertTriangle" size="sm" className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>
      </Card>

      {/* Upcoming */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Icon name="Clock" size="sm" className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Upcoming</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.upcoming}
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card className="p-4 md:col-span-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Overall Progress
              </h3>
              <span className="text-sm font-semibold text-gray-900">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
