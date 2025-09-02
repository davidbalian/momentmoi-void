"use client";

import { Card, CardContent, Skeleton } from "@/components/ui";
import {
  ErrorBoundary,
  ErrorFallback,
  DataErrorFallback,
} from "@/components/ui/ErrorBoundary";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { DashboardError } from "@/lib/error-handler";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  dashboardError?: DashboardError | null;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  loading,
  error,
  dashboardError,
  className,
}: StatsCardProps) {
  // Determine error type for better error display
  const getErrorType = () => {
    if (dashboardError) {
      return dashboardError.type;
    }
    if (error?.toLowerCase().includes("network")) {
      return "network";
    }
    if (error?.toLowerCase().includes("auth")) {
      return "auth";
    }
    return "data";
  };

  const errorType = getErrorType();

  if (error || dashboardError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            {errorType === "network" ? (
              <div className="text-orange-600">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Connection Issue</p>
                <p className="text-xs text-gray-500 mt-1">
                  Check your internet connection
                </p>
              </div>
            ) : errorType === "auth" ? (
              <div className="text-red-600">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Authentication Error</p>
                <p className="text-xs text-gray-500 mt-1">
                  Please log in again
                </p>
              </div>
            ) : (
              <div className="text-blue-600">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Data Loading Issue</p>
                <p className="text-xs text-gray-500 mt-1">
                  Try refreshing the page
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary fallback={DataErrorFallback}>
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <div className="flex-1">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-gray-900">
                    {typeof value === "number" ? value.toLocaleString() : value}
                  </p>
                  <p className="text-sm text-gray-500">{title}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
