import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVendorDashboard } from "./useVendorDashboard";
import { useClientDashboard } from "./useClientDashboard";

export interface DashboardData {
  // Common data for all user types
  userType: "planner" | "vendor" | "viewer";
  businessName?: string;
  eventName?: string;
  
  // Vendor-specific data
  vendorStats?: {
    totalInquiries: number;
    pendingInquiries: number;
    totalBookings: number;
    profileViews: number;
    responseRate: number;
    avgResponseTime: string;
    businessName: string;
  };
  recentInquiries?: any[];
  upcomingEvents?: any[];
  profileCompletion?: number;
  monthlyGrowth?: number;
  
  // Planner-specific data
  eventData?: {
    event: any;
    partner: any;
    stats: {
      daysUntilEvent: number;
      totalGuests: number;
      confirmedGuests: number;
      totalBudget: number;
      spentBudget: number;
      completedTasks: number;
      totalTasks: number;
    };
    recentActivity: any[];
    upcomingDeadlines: any[];
  };
  
  // Viewer-specific data
  viewerData?: {
    savedVendors: any[];
    recentSearches: any[];
  };
}

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  userType: "planner" | "vendor" | "viewer" | null;
}

export function useDashboard(): UseDashboardReturn {
  const { user, userType: centralizedUserType, profile, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always call both hooks to maintain hook order consistency
  const vendorDashboard = useVendorDashboard();
  const clientDashboard = useClientDashboard();

  // Use centralized user type
  const userType = centralizedUserType;

  // Combine data based on user type
  useEffect(() => {
    console.log("🔄 useDashboard - Combining data for userType:", userType, "user:", user?.id, "authLoading:", authLoading);

    // Wait for auth to finish loading and user type to be available
    if (authLoading || !userType) {
      console.log("🔄 useDashboard - Waiting for auth or userType, returning early");
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let dashboardData: DashboardData = {
        userType,
      };

      if (userType === "vendor") {
        console.log("🏪 useDashboard - Setting up vendor dashboard data:", {
          vendorStats: vendorDashboard.vendorStats,
          hasRecentInquiries: !!vendorDashboard.recentInquiries,
          hasUpcomingEvents: !!vendorDashboard.upcomingEvents,
          profileCompletion: vendorDashboard.profileCompletion,
          monthlyGrowth: vendorDashboard.monthlyGrowth
        });

        // Use vendor dashboard data
        dashboardData = {
          ...dashboardData,
          vendorStats: vendorDashboard.vendorStats || undefined,
          recentInquiries: vendorDashboard.recentInquiries,
          upcomingEvents: vendorDashboard.upcomingEvents,
          profileCompletion: vendorDashboard.profileCompletion,
          monthlyGrowth: vendorDashboard.monthlyGrowth,
          businessName: vendorDashboard.vendorStats?.businessName || profile?.business_name || "Your Business",
        };

        setError(vendorDashboard.error);
      } else if (userType === "planner") {
        // Use client dashboard data for planners
        dashboardData = {
          ...dashboardData,
          eventData: clientDashboard.data || undefined,
          eventName: clientDashboard.data?.event?.event_type || "Your Event",
        };

        setError(clientDashboard.error);
      } else if (userType === "viewer") {
        // Viewer dashboard - minimal data
        dashboardData = {
          ...dashboardData,
          viewerData: {
            savedVendors: [],
            recentSearches: [],
          },
        };
      }

      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    userType,
    authLoading,
    profile,
    vendorDashboard.vendorStats,
    vendorDashboard.recentInquiries,
    vendorDashboard.upcomingEvents,
    vendorDashboard.profileCompletion,
    vendorDashboard.monthlyGrowth,
    vendorDashboard.error,
    clientDashboard.data,
    clientDashboard.error
  ]);

  // Refetch function
  const refetch = useCallback(async () => {
    if (userType === "vendor") {
      await vendorDashboard.refetch();
    } else if (userType === "planner") {
      await clientDashboard.refetch();
    }
  }, [userType, vendorDashboard, clientDashboard]);

  return {
    data,
    loading: authLoading || loading || (userType === "vendor" ? vendorDashboard.loading : false) || (userType === "planner" ? clientDashboard.loading : false),
    error,
    refetch,
    userType,
  };
}
