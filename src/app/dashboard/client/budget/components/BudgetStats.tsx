"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { BudgetStats as BudgetStatsType } from "@/types/budget";

interface BudgetStatsProps {
  stats: BudgetStatsType;
}

export function BudgetStats({ stats }: BudgetStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getBudgetStatusColor = () => {
    if (stats.percentageSpent > 100) return "text-red-600";
    if (stats.percentageSpent > 80) return "text-orange-600";
    return "text-green-600";
  };

  const getBudgetStatusBg = () => {
    if (stats.percentageSpent > 100) return "bg-red-50 border-red-200";
    if (stats.percentageSpent > 80) return "bg-orange-50 border-orange-200";
    return "bg-green-50 border-green-200";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Estimated */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Estimated</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(stats.totalEstimated)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Icon name="DollarSign" size="lg" className="text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Total Spent */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(stats.totalSpent)}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
            <Icon name="TrendingDown" size="lg" className="text-red-600" />
          </div>
        </div>
      </Card>

      {/* Remaining Budget */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Remaining Budget
            </p>
            <p
              className={`text-2xl font-semibold ${
                stats.remainingBudget >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(Math.abs(stats.remainingBudget))}
            </p>
            {stats.remainingBudget < 0 && (
              <p className="text-xs text-red-600 mt-1">Over budget</p>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stats.remainingBudget >= 0 ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <Icon
              name={stats.remainingBudget >= 0 ? "TrendingUp" : "AlertTriangle"}
              size="lg"
              className={
                stats.remainingBudget >= 0 ? "text-green-600" : "text-red-600"
              }
            />
          </div>
        </div>
      </Card>

      {/* Budget Progress */}
      <Card className={`p-6 ${getBudgetStatusBg()}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Budget Used</p>
            <p className={`text-2xl font-semibold ${getBudgetStatusColor()}`}>
              {stats.percentageSpent.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.percentageSpent > 100
                    ? "bg-red-500"
                    : stats.percentageSpent > 80
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(stats.percentageSpent, 100)}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <Icon name="Target" size="lg" className={getBudgetStatusColor()} />
          </div>
        </div>
      </Card>

      {/* Additional Stats */}
      <Card className="md:col-span-2 lg:col-span-4 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalItems}
            </p>
            <p className="text-sm text-gray-600">Budget Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {stats.completedItems}
            </p>
            <p className="text-sm text-gray-600">Items Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {stats.categoriesCount}
            </p>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalItems > 0
                ? ((stats.completedItems / stats.totalItems) * 100).toFixed(0)
                : 0}
              %
            </p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
