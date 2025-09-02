import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";
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
  const { user } = useAuth();
  const [userType, setUserType] = useState<"planner" | "vendor" | "viewer" | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  // Always call both hooks to maintain hook order consistency
  const vendorDashboard = useVendorDashboard();
  const clientDashboard = useClientDashboard();

  // Get user type from profile
  const getUserType = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error getting user type:", profileError);
        return null;
      }

      return profile?.user_type as "planner" | "vendor" | "viewer" | null;
    } catch (err) {
      console.error("Error getting user type:", err);
      return null;
    }
  }, [user?.id, supabase]);

  // Initialize user type
  useEffect(() => {
    const initUserType = async () => {
      if (user?.id) {
        const type = await getUserType();
        setUserType(type);
      }
    };

    initUserType();
  }, [user?.id, getUserType]);

  // Combine data based on user type
  useEffect(() => {
    if (!userType) return;

    setLoading(true);
    setError(null);

    try {
      let dashboardData: DashboardData = {
        userType,
      };

      if (userType === "vendor") {
        // Use vendor dashboard data
        dashboardData = {
          ...dashboardData,
          vendorStats: vendorDashboard.vendorStats || undefined,
          recentInquiries: vendorDashboard.recentInquiries,
          upcomingEvents: vendorDashboard.upcomingEvents,
          profileCompletion: vendorDashboard.profileCompletion,
          monthlyGrowth: vendorDashboard.monthlyGrowth,
          businessName: vendorDashboard.vendorStats?.businessName,
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
    loading: loading || (userType === "vendor" ? vendorDashboard.loading : false) || (userType === "planner" ? clientDashboard.loading : false),
    error,
    refetch,
    userType,
  };
}
