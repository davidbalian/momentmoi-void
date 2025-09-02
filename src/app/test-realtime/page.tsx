"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVendorDashboard } from "@/hooks/useVendorDashboard";
import {
  testRealTimeSubscriptions,
  testVendorSpecificSubscription,
} from "@/lib/test-realtime-subscriptions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export default function TestRealTimePage() {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [isVendor, setIsVendor] = useState(false);

  const {
    vendorStats,
    recentInquiries,
    profileCompletion,
    monthlyGrowth,
    loading,
    error,
    refetch,
  } = useVendorDashboard();

  // Check if user is a vendor
  useEffect(() => {
    const checkUserType = async () => {
      if (!user?.id) return;

      try {
        const { createClientComponentClient } = await import("@/lib/supabase");
        const supabase = createClientComponentClient();

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserType(profile.user_type);
          setIsVendor(profile.user_type === "vendor");
        }
      } catch (err) {
        console.error("Error checking user type:", err);
      }
    };

    checkUserType();
  }, [user?.id]);

  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const runGeneralTest = async () => {
    setIsTesting(true);
    addTestResult("Starting general real-time subscription test...");

    try {
      const result = await testRealTimeSubscriptions();
      if (result.success) {
        addTestResult("✅ General real-time test completed successfully");
      } else {
        addTestResult(`❌ General real-time test failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ General real-time test error: ${error}`);
    }

    setIsTesting(false);
  };

  const runVendorSpecificTest = async () => {
    if (!user?.id) {
      addTestResult("❌ No user ID available for vendor-specific test");
      return;
    }

    setIsTesting(true);
    addTestResult(`Starting vendor-specific test for user: ${user.id}`);

    try {
      const result = await testVendorSpecificSubscription(user.id);
      if (result.success) {
        addTestResult(
          "✅ Vendor-specific real-time test completed successfully"
        );
      } else {
        addTestResult(
          `❌ Vendor-specific real-time test failed: ${result.error}`
        );
      }
    } catch (error) {
      addTestResult(`❌ Vendor-specific real-time test error: ${error}`);
    }

    setIsTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-light text-gray-900">
        Real-time Subscriptions Test
      </h1>

      {/* Vendor Status Check */}
      {userType && !isVendor && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                Vendor Dashboard Access Required
              </p>
              <p className="text-sm text-yellow-700">
                This test page is designed for vendor accounts. Your account
                type is: <strong>{userType}</strong>. The vendor dashboard hook
                will show errors because you don't have a vendor profile.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                onClick={runGeneralTest}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? "Testing..." : "Test General Real-time"}
              </Button>

              <Button
                onClick={runVendorSpecificTest}
                disabled={isTesting || !user?.id}
                variant="outline"
                className="w-full"
              >
                {isTesting ? "Testing..." : "Test Vendor-Specific Real-time"}
              </Button>

              <Button onClick={clearResults} variant="ghost" className="w-full">
                Clear Results
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>User ID:</strong> {user?.id || "Not logged in"}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || "N/A"}
              </p>
              <p>
                <strong>User Type:</strong> {userType || "Loading..."}
              </p>
              <p>
                <strong>Is Vendor:</strong> {isVendor ? "Yes" : "No"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Data Status */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Data Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Loading:</span>
                <span
                  className={loading ? "text-orange-600" : "text-green-600"}
                >
                  {loading ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Error:</span>
                <span className={error ? "text-red-600" : "text-green-600"}>
                  {error || "None"}
                </span>
              </div>

              {error && !isVendor && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  <strong>Note:</strong> This error is expected if you're not a
                  vendor. The vendor dashboard hook requires a vendor profile to
                  function properly.
                </div>
              )}

              <div className="flex justify-between">
                <span>Vendor Stats:</span>
                <span
                  className={vendorStats ? "text-green-600" : "text-gray-600"}
                >
                  {vendorStats ? "Loaded" : "Not loaded"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Recent Inquiries:</span>
                <span className="text-blue-600">
                  {recentInquiries.length} items
                </span>
              </div>

              <div className="flex justify-between">
                <span>Profile Completion:</span>
                <span className="text-blue-600">{profileCompletion}%</span>
              </div>

              <div className="flex justify-between">
                <span>Monthly Growth:</span>
                <span className="text-blue-600">{monthlyGrowth}%</span>
              </div>
            </div>

            <Button
              onClick={refetch}
              size="sm"
              variant="outline"
              className="w-full"
            >
              Refresh Dashboard Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-gray-500">
              No test results yet. Run a test to see results here.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="text-sm font-mono bg-gray-50 p-2 rounded"
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Vendor Statistics</h4>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(vendorStats, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recent Inquiries</h4>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(recentInquiries, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
