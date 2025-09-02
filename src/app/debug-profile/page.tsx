"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { createClientComponentClient } from "@/lib/supabase";

export default function DebugProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkProfile = async () => {
    if (!user) {
      setError("No user logged in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClientComponentClient();

      console.log("Checking profile for user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile check error:", error);
        setError(`Profile check failed: ${error.message}`);
      } else {
        console.log("Profile found:", data);
        setProfileData(data);
      }
    } catch (err) {
      console.error("Exception during profile check:", err);
      setError(
        `Exception: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) {
      setError("No user logged in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClientComponentClient();

      console.log("Creating profile for user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "Test User",
          user_type: user.user_metadata?.user_type || "viewer",
          onboarding_completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Profile creation error:", error);
        setError(`Profile creation failed: ${error.message}`);
      } else {
        console.log("Profile created:", data);
        setProfileData(data);
      }
    } catch (err) {
      console.error("Exception during profile creation:", err);
      setError(
        `Exception: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Debug Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : "No user logged in"}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={checkProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Check Profile"}
            </button>
            <button
              onClick={createProfile}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Create Profile"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {profileData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
