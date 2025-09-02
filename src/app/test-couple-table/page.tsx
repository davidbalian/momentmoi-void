"use client";

import { useState } from "react";
import { testCoupleTableAccess } from "@/lib/test-couple-table-access";

export default function TestCoupleTablePage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testCoupleTableAccess();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Couple Profiles Table Test</h1>

        <button
          onClick={runTest}
          disabled={loading}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? "Running Test..." : "Run Table Access Test"}
        </button>

        {testResult && (
          <div className="mt-6 p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
