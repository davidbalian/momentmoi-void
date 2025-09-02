"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout, ClientDashboardLayout } from "@/components/layout";
import { useDashboard } from "@/hooks/useDashboard";
import {
  StatsCard,
  RecentInquiries,
  PerformanceMetrics,
  UpcomingEvents,
} from "@/components/features/dashboard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  SkeletonWelcomeHeader,
  SkeletonQuickActions,
} from "@/components/ui";
import { ErrorBoundary, ErrorFallback } from "@/components/ui/ErrorBoundary";
import {
  Calendar,
  MessageSquare,
  CheckCircle,
  Eye,
  TrendingUp,
  Plus,
  Building2,
  MapPin,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Users,
  Heart,
  Clock,
  DollarSign,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: dashboardData,
    loading: dataLoading,
    error,
    refetch,
    userType,
  } = useDashboard();

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user && !authLoading) {
        console.log("Checking onboarding for user:", user.id);
        const { createClientComponentClient } = await import("@/lib/supabase");
        const supabase = createClientComponentClient();

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed, user_type")
          .eq("id", user.id)
          .single();

        console.log("Profile data:", profile);
        console.log("Profile error:", error);
        console.log("Profile error details:", JSON.stringify(error, null, 2));

        // If profile doesn't exist, create it
        if (error && error.code === "PGRST116") {
          console.log("Profile doesn't exist, creating it...");
          const userType = user.user_metadata?.user_type || "viewer";
          const fullName = user.user_metadata?.full_name || "";

          try {
            const { data: createData, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: user.email,
                full_name: fullName,
                user_type: userType,
                onboarding_completed: false,
              })
              .select();

            if (createError) {
              console.error("Error creating profile:", createError);
              console.error(
                "Error details:",
                JSON.stringify(createError, null, 2)
              );

              // Check if profile was actually created despite the error
              const { data: checkProfile } = await supabase
                .from("profiles")
                .select("onboarding_completed, user_type")
                .eq("id", user.id)
                .single();

              if (checkProfile) {
                console.log("Profile exists despite error:", checkProfile);
                if (!checkProfile.onboarding_completed) {
                  router.push("/onboarding");
                  return;
                }
              } else {
                // Profile creation failed and doesn't exist, show error
                console.error("Profile creation failed completely");
                alert(
                  "Failed to create user profile. Please try logging in again."
                );
                return;
              }
            } else {
              console.log("Profile created successfully:", createData);
              console.log("Profile created, redirecting to onboarding");
              router.push("/onboarding");
              return;
            }
          } catch (createException) {
            console.error(
              "Exception during profile creation:",
              createException
            );
            alert(
              "Failed to create user profile. Please try logging in again."
            );
            return;
          }
        }

        // If onboarding not completed, redirect to onboarding
        if (profile && !profile.onboarding_completed) {
          console.log(
            "Profile found but onboarding not completed, redirecting to onboarding"
          );
          console.log("Profile data:", profile);
          router.push("/onboarding");
          return;
        } else if (profile && profile.onboarding_completed) {
          console.log("Profile found and onboarding completed");
          console.log("Profile data:", profile);
        } else {
          console.log("No profile found or profile check failed");
        }
      }
    };

    checkOnboarding();
  }, [user, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-body text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get display name based on user type
  const getDisplayName = () => {
    if (userType === "vendor") {
      return dashboardData?.businessName || "Your Business";
    } else if (userType === "planner") {
      return dashboardData?.eventName || "Your Event";
    } else {
      return user.user_metadata?.full_name || "Welcome";
    }
  };

  // Determine error type for better error display
  const getErrorType = () => {
    if (error?.toLowerCase().includes("network")) {
      return "network";
    }
    if (error?.toLowerCase().includes("auth")) {
      return "auth";
    }
    return "data";
  };

  const errorType = getErrorType();

  // Render vendor dashboard
  if (userType === "vendor") {
    return (
      <ErrorBoundary fallback={ErrorFallback}>
        <DashboardLayout>
          <div className="space-y-6 max-w-8xl mx-auto">
            {/* Welcome Header with Refresh Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-light text-gray-900">
                    Welcome back, {getDisplayName()}! 👋
                  </h1>
                  <p className="text-gray-600">
                    Here's what's happening with your business today
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || dataLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div
                className={`border rounded-lg p-4 ${
                  errorType === "network"
                    ? "bg-orange-50 border-orange-200"
                    : errorType === "auth"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {errorType === "network" ? (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  ) : errorType === "auth" ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        errorType === "network"
                          ? "text-orange-800"
                          : errorType === "auth"
                          ? "text-red-800"
                          : "text-blue-800"
                      }`}
                    >
                      {errorType === "network"
                        ? "Connection Issue"
                        : errorType === "auth"
                        ? "Authentication Error"
                        : "Data Loading Issue"}
                    </p>
                    <p
                      className={`text-sm ${
                        errorType === "network"
                          ? "text-orange-700"
                          : errorType === "auth"
                          ? "text-red-700"
                          : "text-blue-700"
                      }`}
                    >
                      {error}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`${
                      errorType === "network"
                        ? "text-orange-700 hover:text-orange-800"
                        : errorType === "auth"
                        ? "text-red-700 hover:text-red-800"
                        : "text-blue-700 hover:text-blue-800"
                    }`}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Inquiries"
                value={dashboardData?.vendorStats?.totalInquiries || 0}
                icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
                loading={dataLoading}
                error={error}
              />

              <StatsCard
                title="Total Bookings"
                value={dashboardData?.vendorStats?.totalBookings || 0}
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                loading={dataLoading}
                error={error}
              />

              <StatsCard
                title="Profile Views"
                value={dashboardData?.vendorStats?.profileViews || 0}
                icon={<Eye className="w-5 h-5 text-purple-600" />}
                loading={dataLoading}
                error={error}
              />

              <StatsCard
                title="Response Rate"
                value={`${dashboardData?.vendorStats?.responseRate || 0}%`}
                icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
                loading={dataLoading}
                error={error}
              />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => router.push("/dashboard/services/new")}
                      >
                        <Plus className="w-4 h-4" />
                        Add New Service
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => router.push("/dashboard/calendar")}
                      >
                        <Calendar className="w-4 h-4" />
                        Update Availability
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => router.push("/dashboard/profile")}
                      >
                        <Building2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => router.push("/dashboard/profile")}
                      >
                        <MapPin className="w-4 h-4" />
                        Manage Locations
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <PerformanceMetrics
                  avgResponseTime={
                    dashboardData?.vendorStats?.avgResponseTime || "N/A"
                  }
                  pendingInquiries={
                    dashboardData?.vendorStats?.pendingInquiries || 0
                  }
                  monthlyGrowth={dashboardData?.monthlyGrowth || 0}
                  profileCompletion={dashboardData?.profileCompletion || 0}
                  loading={dataLoading}
                  error={error}
                />
              </div>

              {/* Recent Inquiries */}
              <div className="lg:col-span-2">
                <RecentInquiries
                  inquiries={dashboardData?.recentInquiries || []}
                  loading={dataLoading}
                  error={error}
                />
              </div>
            </div>

            {/* Upcoming Events */}
            <UpcomingEvents
              events={dashboardData?.upcomingEvents || []}
              loading={dataLoading}
              error={error}
              dashboardError={null}
            />
          </div>
        </DashboardLayout>
      </ErrorBoundary>
    );
  }

  // Render planner dashboard
  if (userType === "planner") {
    const eventData = dashboardData?.eventData;

    return (
      <ErrorBoundary fallback={ErrorFallback}>
        <ClientDashboardLayout>
          <div className="space-y-6 max-w-8xl mx-auto">
            {/* Welcome Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-light text-gray-900">
                    Welcome back! 👋
                  </h1>
                  <p className="text-gray-600">
                    Here's your event planning progress
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || dataLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">
                      Data Loading Issue
                    </p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-red-700 hover:text-red-800"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Event Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Days Until Event"
                value={eventData?.stats?.daysUntilEvent || 0}
                icon={<Clock className="w-5 h-5 text-blue-600" />}
                loading={dataLoading}
                error={error}
              />

              <StatsCard
                title="Total Guests"
                value={eventData?.stats?.totalGuests || 0}
                icon={<Users className="w-5 h-5 text-green-600" />}
                loading={dataLoading}
                error={error}
              />

              <StatsCard
                title="Confirmed Guests"
                value={eventData?.stats?.confirmedGuests || 0}
                icon={<CheckCircle className="w-5 h-5 text-purple-600" />}
                loading={dataLoading}
                error={error}
              />

              <StatsCard
                title="Budget Spent"
                value={`$${eventData?.stats?.spentBudget || 0}`}
                icon={<DollarSign className="w-5 h-5 text-orange-600" />}
                loading={dataLoading}
                error={error}
              />
            </div>

            {/* Quick Actions & Event Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => router.push("/dashboard/client/guests")}
                      >
                        <Users className="w-4 h-4" />
                        Manage Guests
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() =>
                          router.push("/dashboard/client/checklist")
                        }
                      >
                        <CheckCircle className="w-4 h-4" />
                        View Checklist
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => router.push("/dashboard/client/budget")}
                      >
                        <DollarSign className="w-4 h-4" />
                        Track Budget
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => router.push("/dashboard/client/vendors")}
                      >
                        <Building2 className="w-4 h-4" />
                        Find Vendors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dataLoading ? (
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                    ) : eventData?.event ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {eventData.event.event_type} Event
                          </h3>
                          <p className="text-gray-600">
                            {eventData.event.event_date
                              ? new Date(
                                  eventData.event.event_date
                                ).toLocaleDateString()
                              : "Date TBD"}
                          </p>
                        </div>
                        {eventData.event.location && (
                          <div>
                            <h4 className="font-medium text-gray-700">
                              Location
                            </h4>
                            <p className="text-gray-600">
                              {eventData.event.location}
                            </p>
                          </div>
                        )}
                        {eventData.event.guest_count && (
                          <div>
                            <h4 className="font-medium text-gray-700">
                              Guest Count
                            </h4>
                            <p className="text-gray-600">
                              {eventData.event.guest_count}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No event information available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ClientDashboardLayout>
      </ErrorBoundary>
    );
  }

  // Render viewer dashboard
  if (userType === "viewer") {
    return (
      <ErrorBoundary fallback={ErrorFallback}>
        <ClientDashboardLayout>
          <div className="space-y-6 max-w-8xl mx-auto">
            {/* Welcome Header */}
            <div className="space-y-2">
              <div>
                <h1 className="text-3xl font-light text-gray-900">
                  Welcome to MomentMoi! 👋
                </h1>
                <p className="text-gray-600">
                  Discover amazing vendors for your special day
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Get Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => router.push("/dashboard/client/vendors")}
                    >
                      <Building2 className="w-4 h-4" />
                      Browse Vendors
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => router.push("/dashboard/client/profile")}
                    >
                      <Heart className="w-4 h-4" />
                      Saved Vendors
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => router.push("/dashboard/client/profile")}
                    >
                      <MapPin className="w-4 h-4" />
                      Set Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ClientDashboardLayout>
      </ErrorBoundary>
    );
  }

  // Loading state while determining user type
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-body text-text-secondary">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}
