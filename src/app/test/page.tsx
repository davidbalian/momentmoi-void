"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TestPage() {
  const { user } = useAuth();
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
  const [externalEvents, setExternalEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Test calendar URL loading
  const testCalendarUrl = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Testing calendar URL loading...");
      const response = await fetch("/api/vendor/calendar-link");
      console.log("📡 Calendar link response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Calendar link data:", data);
        setCalendarUrl(data.url);
      } else {
        const errorText = await response.text();
        console.error("❌ Calendar link error:", errorText);
        setError(
          `Failed to load calendar URL: ${response.status} ${response.statusText}`
        );
      }
    } catch (err) {
      console.error("❌ Calendar URL test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Test external events loading
  const testExternalEvents = async () => {
    if (!calendarUrl) {
      setError("No calendar URL available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Testing external events loading...");
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const response = await fetch(
        `/api/vendor/external-events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      console.log("📡 External events response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ External events data:", data);
        setExternalEvents(data.events || []);
      } else {
        const errorText = await response.text();
        console.error("❌ External events error:", errorText);
        setError(
          `Failed to load external events: ${response.status} ${response.statusText}`
        );
      }
    } catch (err) {
      console.error("❌ External events test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Debug vendor profile
  const debugVendorProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Debugging vendor profile...");
      const response = await fetch("/api/debug/vendor-profile");
      console.log("📡 Debug response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Debug data:", data);
        setDebugInfo(data);
      } else {
        const errorText = await response.text();
        console.error("❌ Debug error:", errorText);
        setError(
          `Failed to get debug info: ${response.status} ${response.statusText}`
        );
      }
    } catch (err) {
      console.error("❌ Debug test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">External Calendar Events Test</h1>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Test Results</h2>

            <div className="space-y-4">
              <div>
                <Button onClick={testCalendarUrl} disabled={loading}>
                  {loading ? "Testing..." : "Test Calendar URL Loading"}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Calendar URL: {calendarUrl || "Not loaded"}
                </p>
              </div>

              <div>
                <Button
                  onClick={testExternalEvents}
                  disabled={loading || !calendarUrl}
                >
                  {loading ? "Testing..." : "Test External Events Loading"}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  External Events: {externalEvents.length} found
                </p>
              </div>

              <div>
                <Button
                  onClick={debugVendorProfile}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? "Debugging..." : "Debug Vendor Profile"}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Check vendor profile status and configuration
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700">Error: {error}</p>
                </div>
              )}

              {externalEvents.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">External Events:</h3>
                  <div className="space-y-2">
                    {externalEvents.map((event, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <p>
                          <strong>Title:</strong> {event.title}
                        </p>
                        <p>
                          <strong>Start:</strong>{" "}
                          {new Date(event.start).toLocaleString()}
                        </p>
                        <p>
                          <strong>End:</strong>{" "}
                          {new Date(event.end).toLocaleString()}
                        </p>
                        {event.description && (
                          <p>
                            <strong>Description:</strong> {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugInfo && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Debug Info:</h3>
                  <div className="p-3 bg-gray-50 rounded space-y-2">
                    <p>
                      <strong>User:</strong> {debugInfo.user.email}
                    </p>
                    <p>
                      <strong>User Type:</strong> {debugInfo.debug.userType}
                    </p>
                    <p>
                      <strong>Has User Profile:</strong>{" "}
                      {debugInfo.debug.hasUserProfile ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Has Vendor Profile:</strong>{" "}
                      {debugInfo.debug.hasVendorProfile ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Onboarding Completed:</strong>{" "}
                      {debugInfo.debug.onboardingCompleted ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Table Exists:</strong>{" "}
                      {debugInfo.tableExists ? "Yes" : "No"}
                    </p>
                    {debugInfo.vendorProfile && (
                      <>
                        <p>
                          <strong>Business Name:</strong>{" "}
                          {debugInfo.vendorProfile.business_name}
                        </p>
                        <p>
                          <strong>Has Calendar URL:</strong>{" "}
                          {debugInfo.vendorProfile.has_calendar_url
                            ? "Yes"
                            : "No"}
                        </p>
                      </>
                    )}
                    {debugInfo.debug.userProfileError && (
                      <p className="text-red-600">
                        <strong>User Profile Error:</strong>{" "}
                        {debugInfo.debug.userProfileError}
                      </p>
                    )}
                    {debugInfo.debug.vendorProfileError && (
                      <p className="text-red-600">
                        <strong>Vendor Profile Error:</strong>{" "}
                        {debugInfo.debug.vendorProfileError}
                      </p>
                    )}
                    {debugInfo.tableError && (
                      <p className="text-red-600">
                        <strong>Table Error:</strong> {debugInfo.tableError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
