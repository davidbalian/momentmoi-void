"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { createClientComponentClient } from "@/lib/supabase";
import { Database } from "@/types/database";
import { BookingService } from "@/lib/booking-service";

type Inquiry = Database["public"]["Tables"]["vendor_inquiries"]["Row"];
type Booking = Database["public"]["Tables"]["vendor_bookings"]["Row"];

export default function TestBookingPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const supabase = createClientComponentClient();

      // Get vendor profile
      const { data: vendorProfile, error: profileError } = await supabase
        .from("vendor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !vendorProfile) {
        console.error("Error fetching vendor profile:", profileError);
        return;
      }

      // Load inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from("vendor_inquiries")
        .select("*")
        .eq("vendor_id", vendorProfile.id)
        .order("created_at", { ascending: false });

      if (inquiriesError) {
        console.error("Error fetching inquiries:", inquiriesError);
      } else {
        setInquiries(inquiriesData || []);
      }

      // Load bookings
      const bookingService = new BookingService();
      const bookingsData = await bookingService.getVendorBookings(
        vendorProfile.id,
        new Date().toISOString().split("T")[0],
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      );

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTestBooking = async () => {
    if (!user || inquiries.length === 0) return;

    setLoading(true);
    try {
      const supabase = createClientComponentClient();

      // Get vendor profile
      const { data: vendorProfile, error: profileError } = await supabase
        .from("vendor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !vendorProfile) {
        console.error("Error fetching vendor profile:", profileError);
        return;
      }

      // Find an inquiry that's not already booked
      const availableInquiry = inquiries.find(
        (i) => i.status !== "booked" && i.event_date
      );

      if (!availableInquiry) {
        alert(
          "No available inquiries to book. All inquiries are already booked or don't have event dates."
        );
        return;
      }

      // Create booking
      const bookingService = new BookingService();
      const booking = await bookingService.createBookingFromInquiry(
        availableInquiry
      );

      if (booking) {
        // Update inquiry status
        await supabase
          .from("vendor_inquiries")
          .update({ status: "booked" })
          .eq("id", availableInquiry.id);

        alert(
          `Successfully created booking for ${availableInquiry.client_name}!`
        );
        loadData(); // Reload data
      } else {
        alert("Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating test booking:", error);
      alert("Error creating test booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Booking Integration Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiries */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Inquiries ({inquiries.length})
            </h2>
            <Button onClick={loadData} disabled={loading} size="sm">
              Refresh
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {inquiries.length === 0 ? (
              <p className="text-gray-500">No inquiries found</p>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Bookings ({bookings.length})
            </h2>
            <Button onClick={createTestBooking} disabled={loading} size="sm">
              Create Test Booking
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings found</p>
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

      {/* Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Inquiries</div>
            <div className="text-2xl font-bold">{inquiries.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Booked Inquiries</div>
            <div className="text-2xl font-bold">
              {inquiries.filter((i) => i.status === "booked").length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">
              Inquiries Missing Bookings
            </div>
            <div className="text-2xl font-bold text-red-600">
              {inquiries.filter((i) => i.status === "booked").length -
                bookings.length}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
