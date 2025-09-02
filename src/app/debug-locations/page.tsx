"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useState } from "react";

export default function DebugLocationsPage() {
  const { user } = useAuth();
  const { profile, locations, saveProfile } = useVendorProfile();
  const [testLocations, setTestLocations] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");

  const testSave = async () => {
    if (!profile) return;


    
    const testData = {
      business_name: profile.business_name,
      description: profile.description || "",
      business_category: profile.business_category,
      event_types: profile.event_types,
      contacts: [],
      locations: testLocations,
    };

    const saveResult = await saveProfile(testData);
    setResult(JSON.stringify(saveResult, null, 2));
  };

  const addLocation = (location: string) => {
    setTestLocations(prev => [...prev, location]);
  };

  const removeLocation = (location: string) => {
    setTestLocations(prev => prev.filter(loc => loc !== location));
  };

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug Locations</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Current Profile</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ profile, locations }, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Locations</h2>
        <div className="flex gap-2">
          {["nicosia", "limassol", "larnaca", "paphos"].map(location => (
            <button
              key={location}
              onClick={() => addLocation(location)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Add {location}
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          <h3>Selected Locations:</h3>
          {testLocations.map(location => (
            <div key={location} className="flex items-center gap-2">
              <span>{location}</span>
              <button
                onClick={() => removeLocation(location)}
                className="px-2 py-1 bg-red-500 text-white rounded text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={testSave}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Save
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Save Result</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
