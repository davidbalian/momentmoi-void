"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  testBookingIntegration,
  testCreateBookingFromInquiry,
} from "@/lib/test-booking-integration";
import { createClientComponentClient } from "@/lib/supabase";
import { Database } from "@/types/database";

type Inquiry = Database["public"]["Tables"]["vendor_inquiries"]["Row"];
type Booking = Database["public"]["Tables"]["vendor_bookings"]["Row"];

export default function DebugBookingPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("");

  const addResult = (message: string) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testIntegration = async () => {
    setLoading(true);
    setResults([]);

    try {
      addResult("Starting booking integration test...");

      // Override console.log to capture output
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        addResult(args.join(" "));
        originalLog(...args);
      };

      console.error = (...args) => {
        addResult(`ERROR: ${args.join(" ")}`);
        originalError(...args);
      };

      await testBookingIntegration();

      // Restore console
      console.log = originalLog;
      console.error = originalError;

      addResult("Test completed!");
    } catch (error) {
      addResult(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("vendor_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        addResult(`Error loading inquiries: ${error.message}`);
      } else {
        setInquiries(data || []);
        addResult(`Loaded ${data?.length || 0} inquiries`);
      }
    } catch (error) {
      addResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("vendor_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        addResult(`Error loading bookings: ${error.message}`);
      } else {
        setBookings(data || []);
        addResult(`Loaded ${data?.length || 0} bookings`);
      }
    } catch (error) {
      addResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createBookingForInquiry = async () => {
    if (!selectedInquiryId) {
      addResult("Please select an inquiry first");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      addResult(`Creating booking for inquiry: ${selectedInquiryId}`);

      // Override console.log to capture output
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        addResult(args.join(" "));
        originalLog(...args);
      };

      console.error = (...args) => {
        addResult(`ERROR: ${args.join(" ")}`);
        originalError(...args);
      };

      await testCreateBookingFromInquiry(selectedInquiryId);

      // Restore console
      console.log = originalLog;
      console.error = originalError;

      addResult("Booking creation test completed!");

      // Reload data
      await loadInquiries();
      await loadBookings();
    } catch (error) {
      addResult(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Booking Integration Debug</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="space-y-4">
            <Button
              onClick={testIntegration}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Test Booking Integration"}
            </Button>

            <Button
              onClick={loadInquiries}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Load Inquiries
            </Button>

            <Button
              onClick={loadBookings}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Load Bookings
            </Button>
          </div>
        </Card>

        {/* Create Booking */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create Booking</h2>
          <div className="space-y-4">
            <select
              value={selectedInquiryId}
              onChange={(e) => setSelectedInquiryId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select an inquiry...</option>
              {inquiries.map((inquiry) => (
                <option key={inquiry.id} value={inquiry.id}>
                  {inquiry.client_name} - {inquiry.event_type} -{" "}
                  {inquiry.status}
                </option>
              ))}
            </select>

            <Button
              onClick={createBookingForInquiry}
              disabled={loading || !selectedInquiryId}
              className="w-full"
            >
              Create Booking for Selected Inquiry
            </Button>
          </div>
        </Card>
      </div>

      {/* Results */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Test Results</h2>
        <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500">
              No test results yet. Run a test to see output.
            </p>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiries */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Inquiries</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {inquiries.length === 0 ? (
              <p className="text-gray-500">No inquiries loaded</p>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-3 border rounded">
                  <div className="font-medium">{inquiry.client_name}</div>
                  <div className="text-sm text-gray-600">
                    {inquiry.event_type} - {inquiry.status}
                  </div>
                  <div className="text-sm text-gray-500">
                    {inquiry.event_date} - {inquiry.location}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Bookings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings loaded</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-3 border rounded">
                  <div className="font-medium">{booking.client_name}</div>
                  <div className="text-sm text-gray-600">
                    {booking.event_type} - {booking.status}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.event_date} - {booking.location}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
