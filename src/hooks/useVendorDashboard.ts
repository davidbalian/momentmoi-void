import { useState, useEffect, useRef, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { 
  handleSupabaseError, 
  createErrorContext, 
  retryOperation,
  DASHBOARD_ERROR_MESSAGES,
  type DashboardError 
} from "@/lib/error-handler";

export interface VendorStats {
  totalInquiries: number;
  pendingInquiries: number;
  totalBookings: number;
  profileViews: number;
  responseRate: number;
  avgResponseTime: string;
  businessName: string;
}

export interface RecentInquiry {
  id: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  message: string;
  status: "new" | "responded" | "booked" | "declined" | "archived";
  createdAt: string;
}

export interface UpcomingEvent {
  id: string;
  clientName: string;
  clientEmail: string;
  eventType: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  guestCount?: number;
  budgetAmount?: number;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string;
  createdAt: string;
}

// Cache interface
interface DashboardCache {
  stats: VendorStats | null;
  inquiries: RecentInquiry[];
  upcomingEvents: UpcomingEvent[];
  profileCompletion: number;
  monthlyGrowth: number;
  timestamp: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Vendor Dashboard Hook
 * 
 * This hook is designed specifically for vendor accounts. It will:
 * 1. Check if the current user has a vendor profile
 * 2. Load vendor-specific dashboard data (stats, inquiries, events, etc.)
 * 3. Set up real-time subscriptions for vendor data
 * 4. Provide appropriate error messages for non-vendor users
 * 
 * Expected behavior for non-vendor users:
 * - Will show an error message indicating vendor profile is required
 * - Will not attempt to load vendor-specific data
 * - Will not set up real-time subscriptions
 * 
 * @returns Vendor dashboard data and state management
 */
export function useVendorDashboard() {
  const { user } = useAuth();
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);
  
  // Individual loading states for better UX
  const [statsLoading, setStatsLoading] = useState(false);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [growthLoading, setGrowthLoading] = useState(false);
  
  // Overall loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<DashboardError | null>(null);
  
  // Cache state
  const [cache, setCache] = useState<DashboardCache>({
    stats: null,
    inquiries: [],
    upcomingEvents: [],
    profileCompletion: 0,
    monthlyGrowth: 0,
    timestamp: 0,
  });
  
  // Track vendor ID for real-time subscriptions
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorIdLookupCompleted, setVendorIdLookupCompleted] = useState(false);
  const subscriptionsRef = useRef<RealtimeChannel[]>([]);

  const supabase = createClientComponentClient();

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }, [cache.timestamp]);

  // Get vendor profile ID with error handling and retry logic
  const getVendorId = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available for vendor profile lookup");
      return null;
    }

    const context = createErrorContext('useVendorDashboard', 'getVendorId', user.id);

    // Retry logic for vendor profile lookup
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting to get vendor ID (attempt ${attempt}/${maxRetries})`);

        // First check if user has a profile and is a vendor
        const { data: userProfile, error: userProfileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        console.log(`🔍 useVendorDashboard - Profile query result (attempt ${attempt}):`, {
          userId: user.id,
          userProfile,
          userProfileError,
          userProfileErrorCode: userProfileError?.code,
          context
        });

        if (userProfileError) {
          console.error("Error getting user profile:", {
            error: userProfileError,
            userId: user.id,
            context: context,
            attempt
          });

          // If it's the last attempt, return null
          if (attempt === maxRetries) return null;

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        if (!userProfile) {
          console.error("No user profile found for user:", user.id);
          return null;
        }

        console.log("✅ useVendorDashboard - User profile found:", {
          userId: user.id,
          userType: userProfile.user_type,
          context
        });

        if (userProfile.user_type !== 'vendor') {
          console.log("❌ User is not a vendor, user_type:", userProfile.user_type, {
            userId: user.id,
            context
          });
          return null;
        }

        // Now get the vendor profile with better error handling
        const { data: vendorProfile, error: profileError } = await supabase
          .from("vendor_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          // Check if this is a "not found" error that might resolve with retry
          if (profileError.code === 'PGRST116' && attempt < maxRetries) {
            console.log(`Vendor profile not found, retrying in ${retryDelay}ms (attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }

          const dashboardError = handleSupabaseError(profileError, context);
          console.error("Error getting vendor ID:", {
            error: profileError,
            dashboardError: dashboardError,
            userId: user.id,
            userType: userProfile.user_type,
            context: context,
            attempt
          });
          return null;
        }

        if (!vendorProfile) {
          console.log("No vendor profile found for user:", user.id);
          return null;
        }

        console.log("Successfully found vendor profile:", vendorProfile.id);
        return vendorProfile.id;
      } catch (err) {
        console.error(`Error in getVendorId attempt ${attempt}:`, err);

        // If it's the last attempt, handle the error
        if (attempt === maxRetries) {
          const dashboardError = handleSupabaseError(err, context);
          console.error("Error getting vendor ID after all retries:", {
            error: err,
            dashboardError: dashboardError,
            userId: user.id,
            context: context
          });
          return null;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    return null;
  }, [user?.id]); // Only include user.id as dependency to prevent infinite loops

  // Fetch vendor statistics with enhanced error handling
  const fetchVendorStats = useCallback(async (forceRefresh = false) => {
    if (!vendorId) {
      console.log("Cannot fetch vendor stats: no vendor ID available");
      return;
    }

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cache.stats && isCacheValid()) {
      setVendorStats(cache.stats);
      return;
    }

    setStatsLoading(true);
    setError(null);
    setDashboardError(null);

    const context = createErrorContext('useVendorDashboard', 'fetchVendorStats', user?.id, vendorId);

    try {
      const stats = await retryOperation(async () => {
        // Get total inquiries
        const { count: totalInquiries, error: inquiriesError } = await supabase
          .from("vendor_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendorId);

        if (inquiriesError) throw inquiriesError;

        // Get pending inquiries (new status)
        const { count: pendingInquiries, error: pendingError } = await supabase
          .from("vendor_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendorId)
          .eq("status", "new");

        if (pendingError) throw pendingError;

        // Get total booked inquiries
        const { count: totalBookedInquiries, error: bookedInquiriesError } = await supabase
          .from("vendor_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendorId)
          .eq("status", "booked");

        if (bookedInquiriesError) throw bookedInquiriesError;

        // Calculate response rate
        const { count: respondedInquiries, error: respondedError } = await supabase
          .from("vendor_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendorId)
          .in("status", ["responded", "booked"]);

        if (respondedError) throw respondedError;

        const responseRate = totalInquiries
          ? Math.round(((respondedInquiries || 0) / totalInquiries) * 100)
          : 0;

        // Calculate average response time
        const { data: responseTimes, error: responseTimesError } = await supabase
          .from("vendor_inquiries")
          .select("created_at, responded_at")
          .eq("vendor_id", vendorId)
          .not("responded_at", "is", null);

        if (responseTimesError) throw responseTimesError;

        const avgResponseTime = calculateAverageResponseTime(responseTimes || []);

        // Get profile views from analytics table
        const { data: analyticsData, error: analyticsError } = await supabase
          .from("vendor_analytics")
          .select("profile_views")
          .eq("vendor_id", vendorId)
          .gte("date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .order("date", { ascending: false });

        if (analyticsError) throw analyticsError;

        // Sum up profile views for current month
        const totalProfileViews = analyticsData?.reduce((sum, record) => sum + (record.profile_views || 0), 0) || 0;

        // Get business name from vendor profile
        const { data: vendorProfile, error: profileError } = await supabase
          .from("vendor_profiles")
          .select("business_name")
          .eq("user_id", user?.id)
          .single();

        if (profileError) {
          console.warn("Could not fetch business name:", profileError);
        }

        return {
          totalInquiries: totalInquiries || 0,
          pendingInquiries: pendingInquiries || 0,
          totalBookings: totalBookedInquiries || 0,
          profileViews: totalProfileViews,
          responseRate,
          avgResponseTime,
          businessName: vendorProfile?.business_name || "Your Business",
        };
      }, 3, 1000, context);

      setVendorStats(stats);
      
      // Update cache
      setCache(prev => ({
        ...prev,
        stats,
        timestamp: Date.now(),
      }));
    } catch (err) {
      const dashboardError = handleSupabaseError(err, context);
      setError(dashboardError.userMessage);
      setDashboardError(dashboardError);
      console.error("Error fetching vendor stats:", dashboardError);
    } finally {
      setStatsLoading(false);
    }
  }, [cache.stats, isCacheValid, supabase, user?.id, vendorId]);

  // Fetch recent inquiries with enhanced error handling
  const fetchRecentInquiries = useCallback(async (forceRefresh = false) => {
    if (!vendorId) {
      console.log("Cannot fetch recent inquiries: no vendor ID available");
      return;
    }

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cache.inquiries.length > 0 && isCacheValid()) {
      setRecentInquiries(cache.inquiries);
      return;
    }

    setInquiriesLoading(true);
    setError(null);
    setDashboardError(null);

    const context = createErrorContext('useVendorDashboard', 'fetchRecentInquiries', user?.id, vendorId);

    try {
      const inquiries = await retryOperation(async () => {
        const { data: inquiries, error } = await supabase
          .from("vendor_inquiries")
          .select(
            `
            id,
            created_at,
            message,
            status,
            event_type,
            event_date,
            client_name
          `
          )
          .eq("vendor_id", vendorId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedInquiries: RecentInquiry[] = (inquiries || []).map(
          (inquiry) => ({
            id: inquiry.id,
            clientName: inquiry.client_name || "Anonymous",
            eventType: inquiry.event_type || "Event",
            eventDate: inquiry.event_date || "",
            message: inquiry.message || "",
            status: inquiry.status as "new" | "responded" | "booked" | "declined" | "archived",
            createdAt: inquiry.created_at,
          })
        );

        return formattedInquiries;
      }, 3, 1000, context);

      setRecentInquiries(inquiries);
      
      // Update cache
      setCache(prev => ({
        ...prev,
        inquiries,
        timestamp: Date.now(),
      }));
    } catch (err) {
      const dashboardError = handleSupabaseError(err, context);
      setError(dashboardError.userMessage);
      setDashboardError(dashboardError);
      console.error("Error fetching recent inquiries:", dashboardError);
    } finally {
      setInquiriesLoading(false);
    }
  }, [cache.inquiries, isCacheValid, supabase, user?.id, vendorId]);

  // Fetch upcoming events with enhanced error handling
  const fetchUpcomingEvents = useCallback(async (forceRefresh = false) => {
    if (!vendorId) {
      console.log("Cannot fetch upcoming events: no vendor ID available");
      return;
    }

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cache.upcomingEvents.length > 0 && isCacheValid()) {
      setUpcomingEvents(cache.upcomingEvents);
      return;
    }

    setEventsLoading(true);
    setError(null);
    setDashboardError(null);

    const context = createErrorContext('useVendorDashboard', 'fetchUpcomingEvents', user?.id, vendorId);

    try {
      const events = await retryOperation(async () => {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const { data: bookedInquiries, error } = await supabase
          .from("vendor_inquiries")
          .select(
            `
            id,
            client_name,
            client_email,
            event_type,
            event_date,
            guest_count,
            location,
            budget_range,
            message,
            created_at
          `
          )
          .eq("vendor_id", vendorId)
          .eq("status", "booked")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(10);

        if (error) throw error;

        const formattedEvents: UpcomingEvent[] = (bookedInquiries || []).map(
          (inquiry) => ({
            id: inquiry.id,
            clientName: inquiry.client_name || "Anonymous",
            clientEmail: inquiry.client_email || "",
            eventType: inquiry.event_type || "Event",
            eventDate: inquiry.event_date,
            startTime: undefined, // Not available in inquiries table
            endTime: undefined, // Not available in inquiries table
            location: inquiry.location || undefined,
            guestCount: inquiry.guest_count || undefined,
            budgetAmount: inquiry.budget_range ? parseBudgetRange(inquiry.budget_range) || undefined : undefined,
            status: "confirmed" as const, // All booked inquiries are confirmed
            notes: inquiry.message || undefined,
            createdAt: inquiry.created_at,
          })
        );

        return formattedEvents;
      }, 3, 1000, context);

      setUpcomingEvents(events);
      
      // Update cache
      setCache(prev => ({
        ...prev,
        upcomingEvents: events,
        timestamp: Date.now(),
      }));
    } catch (err) {
      const dashboardError = handleSupabaseError(err, context);
      setError(dashboardError.userMessage);
      setDashboardError(dashboardError);
      console.error("Error fetching upcoming events:", dashboardError);
    } finally {
      setEventsLoading(false);
    }
  }, [cache.upcomingEvents, isCacheValid, supabase, user?.id, vendorId]);

  // Calculate profile completion with enhanced error handling
  const calculateProfileCompletion = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cache.profileCompletion > 0 && isCacheValid()) {
      setProfileCompletion(cache.profileCompletion);
      return;
    }

    setProfileLoading(true);
    setError(null);
    setDashboardError(null);

    const context = createErrorContext('useVendorDashboard', 'calculateProfileCompletion', user.id);

    try {
      const completionPercentage = await retryOperation(async () => {
        const { data: profile, error } = await supabase
          .from("vendor_profiles")
          .select(
            `
            business_name,
            description,
            logo_url,
            business_category,
            event_types
          `
          )
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (!profile) {
          return 0;
        }

        const requiredFields = [
          "business_name",
          "description",
          "business_category",
        ];

        const completedFields = requiredFields.filter(
          (field) => {
            const value = profile[field as keyof typeof profile];
            return value && value.toString().trim() !== "";
          }
        );

        return Math.round(
          (completedFields.length / requiredFields.length) * 100
        );
      }, 2, 1000, context);

      setProfileCompletion(completionPercentage);
      
      // Update cache
      setCache(prev => ({
        ...prev,
        profileCompletion: completionPercentage,
        timestamp: Date.now(),
      }));
    } catch (err) {
      const dashboardError = handleSupabaseError(err, context);
      setError(dashboardError.userMessage);
      setDashboardError(dashboardError);
      console.error("Error calculating profile completion:", dashboardError);
      setProfileCompletion(0);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id, cache.profileCompletion, isCacheValid, supabase]);

  // Calculate monthly growth with enhanced error handling
  const calculateMonthlyGrowth = useCallback(async (forceRefresh = false) => {
    if (!vendorId) {
      console.log("Cannot calculate monthly growth: no vendor ID available");
      return;
    }

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cache.monthlyGrowth !== 0 && isCacheValid()) {
      setMonthlyGrowth(cache.monthlyGrowth);
      return;
    }

    setGrowthLoading(true);
    setError(null);
    setDashboardError(null);

    const context = createErrorContext('useVendorDashboard', 'calculateMonthlyGrowth', user?.id, vendorId);

    try {
      const growth = await retryOperation(async () => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get profile views for last month
        const { data: lastMonthData, error: lastMonthError } = await supabase
          .from("vendor_analytics")
          .select("profile_views")
          .eq("vendor_id", vendorId)
          .gte("date", lastMonth.toISOString().split('T')[0])
          .lt("date", thisMonth.toISOString().split('T')[0]);

        if (lastMonthError) throw lastMonthError;

        // Get profile views for this month
        const { data: thisMonthData, error: thisMonthError } = await supabase
          .from("vendor_analytics")
          .select("profile_views")
          .eq("vendor_id", vendorId)
          .gte("date", thisMonth.toISOString().split('T')[0]);

        if (thisMonthError) throw thisMonthError;

        const lastMonthViews = lastMonthData?.reduce((sum, record) => sum + (record.profile_views || 0), 0) || 0;
        const thisMonthViews = thisMonthData?.reduce((sum, record) => sum + (record.profile_views || 0), 0) || 0;

        return lastMonthViews > 0
          ? Math.round(((thisMonthViews - lastMonthViews) / lastMonthViews) * 100)
          : 0;
      }, 2, 1000, context);

      setMonthlyGrowth(growth);
      
      // Update cache
      setCache(prev => ({
        ...prev,
        monthlyGrowth: growth,
        timestamp: Date.now(),
      }));
    } catch (err) {
      const dashboardError = handleSupabaseError(err, context);
      setError(dashboardError.userMessage);
      setDashboardError(dashboardError);
      console.error("Error calculating monthly growth:", dashboardError);
      setMonthlyGrowth(0);
    } finally {
      setGrowthLoading(false);
    }
  }, [cache.monthlyGrowth, isCacheValid, supabase, user?.id, vendorId]);

  // Utility function to calculate average response time
  const calculateAverageResponseTime = (responseTimes: any[]): string => {
    if (responseTimes.length === 0) return "N/A";

    const totalHours = responseTimes.reduce((total, inquiry) => {
      const created = new Date(inquiry.created_at);
      const responded = new Date(inquiry.responded_at);
      const diffHours =
        (responded.getTime() - created.getTime()) / (1000 * 60 * 60);
      return total + diffHours;
    }, 0);

    const avgHours = totalHours / responseTimes.length;

    if (avgHours < 1) {
      return `${Math.round(avgHours * 60)} minutes`;
    } else if (avgHours < 24) {
      return `${avgHours.toFixed(1)} hours`;
    } else {
      return `${Math.round(avgHours / 24)} days`;
    }
  };

  // Parse budget range string to numeric value
  const parseBudgetRange = (budgetRange: string): number | null => {
    try {
      // Extract the first number from ranges like "€5000-€10000"
      const match = budgetRange.match(/[\d,]+/);
      if (match) {
        return parseFloat(match[0].replace(/,/g, ""));
      }
      return null;
    } catch {
      return null;
    }
  };

  // Setup real-time subscriptions with error handling
  const setupRealTimeSubscriptions = async () => {
    if (!vendorId) {
      console.log("Cannot setup real-time subscriptions: no vendor ID available");
      return;
    }

    // Clean up existing subscriptions
    cleanupSubscriptions();

    const context = createErrorContext('useVendorDashboard', 'setupRealTimeSubscriptions', user?.id, vendorId);

    try {
      // Subscribe to vendor_inquiries changes
      const inquiriesSubscription = supabase
        .channel(`vendor-inquiries-${vendorId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "vendor_inquiries",
            filter: `vendor_id=eq.${vendorId}`,
          },
          (payload) => {
            console.log("Inquiries real-time update:", payload);
            // Refetch both stats and recent inquiries when inquiries change
            fetchVendorStats(true); // Force refresh
            fetchRecentInquiries(true); // Force refresh
          }
        )
        .subscribe();

      // Subscribe to vendor_inquiries changes for upcoming events (booked inquiries)
      const bookedInquiriesSubscription = supabase
        .channel(`vendor-inquiries-booked-${vendorId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "vendor_inquiries",
            filter: `vendor_id=eq.${vendorId}`,
          },
          (payload) => {
            console.log("Booked inquiries real-time update:", payload);
            // Refetch stats and upcoming events when booked inquiries change
            fetchVendorStats(true); // Force refresh
            fetchUpcomingEvents(true); // Force refresh
          }
        )
        .subscribe();

      // Subscribe to vendor_analytics changes
      const analyticsSubscription = supabase
        .channel(`vendor-analytics-${vendorId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "vendor_analytics",
            filter: `vendor_id=eq.${vendorId}`,
          },
          (payload) => {
            console.log("Analytics real-time update:", payload);
            // Refetch stats and monthly growth when analytics change
            fetchVendorStats(true); // Force refresh
            calculateMonthlyGrowth(true); // Force refresh
          }
        )
        .subscribe();

      // Subscribe to vendor_profiles changes
      const profileSubscription = supabase
        .channel(`vendor-profile-${user?.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "vendor_profiles",
            filter: `user_id=eq.${user?.id}`,
          },
          (payload) => {
            console.log("Profile real-time update:", payload);
            // Refetch profile completion when profile changes
            calculateProfileCompletion(true); // Force refresh
          }
        )
        .subscribe();

      // Store subscriptions for cleanup
      subscriptionsRef.current = [
        inquiriesSubscription,
        bookedInquiriesSubscription,
        analyticsSubscription,
        profileSubscription,
      ];

      console.log("Real-time subscriptions established for vendor:", vendorId);
    } catch (err) {
      const dashboardError = handleSupabaseError(err, context);
      console.error("Error setting up real-time subscriptions:", dashboardError);
      // Don't set global error for real-time connection issues
      // Just log it and continue with static data
    }
  };

  // Cleanup subscriptions
  const cleanupSubscriptions = () => {
    subscriptionsRef.current.forEach((subscription) => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    });
    subscriptionsRef.current = [];
  };

  // Load all data with enhanced error handling
  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!vendorId) {
      console.log("Cannot load dashboard data: no vendor ID available (this should not happen in normal flow)");
      // Don't set error here since this function should only be called when vendorId is available
      // The error should be handled by the useEffect that calls this function
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setDashboardError(null);

    // Check if we can use cache for initial load (cache checks are handled in individual fetch functions)
    // For initial load, we'll let individual functions handle their own cache logic

    try {
      await Promise.all([
        fetchVendorStats(forceRefresh),
        fetchRecentInquiries(forceRefresh),
        fetchUpcomingEvents(forceRefresh),
        calculateProfileCompletion(forceRefresh),
        calculateMonthlyGrowth(forceRefresh),
      ]);
    } catch (err) {
      const context = createErrorContext('useVendorDashboard', 'loadDashboardData', user?.id || undefined, vendorId || undefined);
      const dashboardError = handleSupabaseError(err, context);
      setError(dashboardError.userMessage);
      setDashboardError(dashboardError);
    } finally {
      setLoading(false);
    }
  }, [fetchVendorStats, fetchRecentInquiries, fetchUpcomingEvents, calculateProfileCompletion, calculateMonthlyGrowth, user?.id, vendorId]);

  // Selective refresh functions for better UX
  const refreshStats = useCallback(() => {
    return fetchVendorStats(true);
  }, [fetchVendorStats]);

  const refreshInquiries = useCallback(() => {
    return fetchRecentInquiries(true);
  }, [fetchRecentInquiries]);

  const refreshEvents = useCallback(() => {
    return fetchUpcomingEvents(true);
  }, [fetchUpcomingEvents]);

  const refreshProfileData = useCallback(() => {
    return Promise.all([
      calculateProfileCompletion(true),
      calculateMonthlyGrowth(true)
    ]);
  }, [calculateProfileCompletion, calculateMonthlyGrowth]);

  // Smart refresh that only refreshes dynamic data
  const smartRefresh = useCallback(() => {
    // Only refresh data that changes frequently
    return Promise.all([
      refreshStats(),
      refreshInquiries(),
      refreshEvents(),
      refreshProfileData()
    ]);
  }, [refreshStats, refreshInquiries, refreshEvents, refreshProfileData]);

  // Initialize vendor ID and setup
  useEffect(() => {
    const initializeVendor = async () => {
      if (!user) {
        console.log("No user available for vendor initialization");
        return;
      }

      if (!user.id) {
        console.log("User exists but no ID available");
        return;
      }

      console.log("Initializing vendor for user:", user.id);
      try {
        const id = await getVendorId();
        console.log("Vendor ID result:", id);
        setVendorId(id);
      } catch (error) {
        console.error("Error during vendor initialization:", error);
        setError("Failed to initialize vendor dashboard. Please try refreshing the page.");
        setLoading(false);
      } finally {
        setVendorIdLookupCompleted(true);
      }
    };

    initializeVendor();
  }, [user]);

  // Setup real-time subscriptions when vendor ID is available
  useEffect(() => {
    if (vendorId) {
      setupRealTimeSubscriptions();
    }

    // Cleanup on unmount or when vendor ID changes
    return () => {
      cleanupSubscriptions();
    };
  }, [vendorId]);

  // Load data when vendor ID is available
  useEffect(() => {
    // Only proceed if vendor ID lookup is completed and we have a definitive result
    if (vendorIdLookupCompleted) {
      if (vendorId) {
        console.log("Loading dashboard data for vendor:", vendorId);
        // Clear any previous error when we successfully find vendor profile
        setError(null);
        setDashboardError(null);
        loadDashboardData();
      } else if (vendorId === null) {
        // Vendor ID lookup completed but no vendor profile found
        console.log("Vendor ID lookup completed - no vendor profile found");
        if (user?.id) {
          setError("Vendor profile not found. This dashboard is only available for vendor accounts. If you believe this is an error, please complete vendor onboarding or contact support.");
        }
        setLoading(false);
      }
    }
    // Don't do anything if vendor ID lookup is still in progress
  }, [vendorId, vendorIdLookupCompleted, user?.id]); // Removed loadDashboardData from dependencies to prevent infinite loop

  return {
    vendorStats,
    recentInquiries,
    upcomingEvents,
    profileCompletion,
    monthlyGrowth,
    loading,
    statsLoading,
    inquiriesLoading,
    eventsLoading,
    profileLoading,
    growthLoading,
    error,
    dashboardError,
    refetch: smartRefresh, // Use smart refresh instead of full refresh
    refreshStats,
    refreshInquiries,
    refreshEvents,
    refreshProfileData,
  };
}
