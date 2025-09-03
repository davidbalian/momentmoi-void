"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { createClientComponentClient } from "@/lib/supabase";
import { testVendorCreation } from "@/lib/test-vendor-creation";
import { testSupabaseConfig } from "@/lib/test-supabase-config";
import { testVendorOnboardingFlow } from "@/lib/test-vendor-onboarding";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export default function DebugPage() {
  const { user, signUp } = useAuth();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResults((prev: Record<string, any>) => ({
        ...prev,
        [testName]: result,
      }));
    } catch (error) {
      setResults((prev: Record<string, any>) => ({
        ...prev,
        [testName]: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testConfig = () => runTest("config", async () => testSupabaseConfig());

  const testDatabase = () =>
    runTest("database", async () => testVendorCreation());

  const testProfileCreation = async () => {
    return runTest("profileCreation", async () => {
      const supabase = createClientComponentClient();

      // Test creating a profile manually
      const testUserId = crypto.randomUUID();
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: testUserId,
          email: "test@example.com",
          full_name: "Test User",
          user_type: "viewer",
          onboarding_completed: false,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      // Clean up
      await supabase.from("profiles").delete().eq("id", testUserId);

      return { success: true, data };
    });
  };

  const testAuthSignup = async () => {
    return runTest("authSignup", async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const result = await signUp(testEmail, "testpassword123", {
        full_name: "Test User",
        user_type: "viewer",
      });

      return result;
    });
  };

  const testVendorProfileCreation = async () => {
    return runTest("vendorProfileCreation", async () => {
      const supabase = createClientComponentClient();

      if (!user) {
        return { success: false, error: "No authenticated user" };
      }

      const { data, error } = await supabase
        .from("vendor_profiles")
        .insert({
          user_id: user.id,
          business_name: "Test Business",
          description: "Test Description",
          business_category: "photographer" as any,
          event_types: ["wedding"] as any,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      // Clean up
      await supabase.from("vendor_profiles").delete().eq("id", data.id);

      return { success: true, data };
    });
  };

  const testVendorOnboarding = async () => {
    return runTest("vendorOnboardingFlow", async () => {
      if (!user) {
        return { success: false, error: "No authenticated user" };
      }

      return await testVendorOnboardingFlow(user.id);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-text-primary">Debug Page</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={testConfig}
                  disabled={loading}
                  className="w-full"
                >
                  Test Supabase Config
                </Button>

                <Button
                  onClick={testDatabase}
                  disabled={loading}
                  className="w-full"
                >
                  Test Database Connection
                </Button>

                <Button
                  onClick={testProfileCreation}
                  disabled={loading}
                  className="w-full"
                >
                  Test Profile Creation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auth Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={testAuthSignup}
                  disabled={loading}
                  className="w-full"
                >
                  Test Auth Signup
                </Button>

                <Button
                  onClick={testVendorProfileCreation}
                  disabled={loading}
                  className="w-full"
                >
                  Test Vendor Profile Creation
                </Button>

                <Button
                  onClick={testVendorOnboarding}
                  disabled={loading}
                  className="w-full"
                >
                  Test Full Vendor Onboarding Flow
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
