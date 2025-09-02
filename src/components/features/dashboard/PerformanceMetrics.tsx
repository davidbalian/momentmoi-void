"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Skeleton,
} from "@/components/ui";
import {
  ErrorBoundary,
  ErrorFallback,
  DataErrorFallback,
} from "@/components/ui/ErrorBoundary";
import { DashboardError } from "@/lib/error-handler";

interface PerformanceMetricsProps {
  avgResponseTime: string;
  pendingInquiries: number;
  monthlyGrowth: number;
  profileCompletion: number;
  loading?: boolean;
  error?: string | null;
  dashboardError?: DashboardError | null;
}

export function PerformanceMetrics({
  avgResponseTime,
  pendingInquiries,
  monthlyGrowth,
  profileCompletion,
  loading,
  error,
  dashboardError,
}: PerformanceMetricsProps) {
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataErrorFallback
            error={
              new Error(
                error ||
                  dashboardError?.userMessage ||
                  "Failed to load performance data"
              )
            }
            resetError={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary fallback={DataErrorFallback}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Avg Response Time</span>
            {loading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-sm font-medium">{avgResponseTime}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending Inquiries</span>
            {loading ? (
              <Skeleton className="h-5 w-8 rounded-full" />
            ) : (
              <Badge variant="secondary">{pendingInquiries}</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">This Month Views</span>
            {loading ? (
              <Skeleton className="h-4 w-12" />
            ) : (
              <span
                className={`text-sm font-medium ${
                  monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {monthlyGrowth >= 0 ? "+" : ""}
                {monthlyGrowth}%
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Profile Completion</span>
            {loading ? (
              <Skeleton className="h-4 w-12" />
            ) : (
              <span className="text-sm font-medium">{profileCompletion}%</span>
            )}
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
