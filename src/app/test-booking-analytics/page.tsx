"use client";

import { BookingAnalytics } from "@/components/features/calendar";

export default function TestBookingAnalyticsPage() {
  // Sample booking data for testing
  const sampleBookings = [
    {
      id: "1",
      vendor_id: "vendor-1",
      inquiry_id: "inquiry-1",
      client_name: "John & Sarah Smith",
      client_email: "john.smith@email.com",
      client_phone: "+357 99 123 456",
      event_type: "wedding",
      event_date: "2024-06-15",
      guest_count: 150,
      location: "Limassol",
      budget_amount: 7500.0,
      notes: "Full day wedding photography coverage",
      status: "confirmed",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      vendor_id: "vendor-1",
      inquiry_id: "inquiry-2",
      client_name: "Maria & Andreas",
      client_email: "maria@email.com",
      client_phone: "+357 99 789 012",
      event_type: "christening",
      event_date: "2024-06-20",
      guest_count: 80,
      location: "Nicosia",
      budget_amount: 3500.0,
      notes: "Christening ceremony and reception",
      status: "completed",
      created_at: "2024-01-10T14:30:00Z",
      updated_at: "2024-01-10T14:30:00Z",
    },
    {
      id: "3",
      vendor_id: "vendor-1",
      inquiry_id: "inquiry-3",
      client_name: "Elena & Costas",
      client_email: "elena@email.com",
      client_phone: "+357 99 456 789",
      event_type: "wedding",
      event_date: "2024-07-10",
      guest_count: 200,
      location: "Paphos",
      budget_amount: 12000.0,
      notes: "Luxury wedding with full coverage",
      status: "confirmed",
      created_at: "2024-01-20T09:15:00Z",
      updated_at: "2024-01-20T09:15:00Z",
    },
    {
      id: "4",
      vendor_id: "vendor-1",
      inquiry_id: "inquiry-4",
      client_name: "Sophia & Dimitris",
      client_email: "sophia@email.com",
      client_phone: "+357 99 321 654",
      event_type: "birthday",
      event_date: "2024-05-25",
      guest_count: 50,
      location: "Larnaca",
      budget_amount: 2500.0,
      notes: "50th birthday celebration",
      status: "cancelled",
      created_at: "2024-01-05T16:45:00Z",
      updated_at: "2024-01-05T16:45:00Z",
    },
    {
      id: "5",
      vendor_id: "vendor-1",
      inquiry_id: "inquiry-5",
      client_name: "Anna & George",
      client_email: "anna@email.com",
      client_phone: "+357 99 987 654",
      event_type: "wedding",
      event_date: "2024-08-15",
      guest_count: 120,
      location: "Ayia Napa",
      budget_amount: 8000.0,
      notes: "Beach wedding ceremony",
      status: "confirmed",
      created_at: "2024-01-25T11:20:00Z",
      updated_at: "2024-01-25T11:20:00Z",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Booking Analytics Component Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <BookingAnalytics bookings={sampleBookings} month="June 2024" />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sample Data Used
          </h2>
          <div className="text-sm text-gray-600">
            <p>• 5 total bookings</p>
            <p>• 3 confirmed bookings</p>
            <p>• 1 completed booking</p>
            <p>• 1 cancelled booking</p>
            <p>• Total revenue: €33,500</p>
            <p>• Average booking value: €6,700</p>
          </div>
        </div>
      </div>
    </div>
  );
}
