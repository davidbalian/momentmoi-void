"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { BookingDetailsModal } from "@/components/features/calendar";

export default function TestBookingModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sampleBooking = {
    id: "test-booking-1",
    vendor_id: "test-vendor-1",
    inquiry_id: "test-inquiry-1",
    client_name: "John & Sarah Smith",
    client_email: "john.smith@email.com",
    client_phone: "+357 99 123 456",
    event_type: "wedding",
    event_date: "2024-06-15",
    guest_count: 150,
    location: "Limassol Marina",
    budget_amount: 7500.00,
    notes: "Full day wedding photography coverage including engagement shoot and wedding album. Bride prefers natural, candid style photography.",
    status: "confirmed" as const,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    console.log("Status update requested:", { bookingId, status });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Status updated successfully");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Booking Details Modal Test
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(sampleBooking, null, 2)}
          </pre>
          
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)}>
              Open Booking Details Modal
            </Button>
          </div>
        </div>

        <BookingDetailsModal
          booking={sampleBooking}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}
