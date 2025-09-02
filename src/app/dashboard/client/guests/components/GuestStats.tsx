"use client";

import { Card } from "@/components/ui/Card";
import { useGuests } from "@/hooks/useGuests";

export function GuestStats() {
  const { guests, loading, getGuestStats } = useGuests();

  if (loading) return <div>Loading stats...</div>;

  const stats = getGuestStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
        <div className="text-sm text-gray-600">Total Guests</div>
      </Card>
      <Card className="p-4">
        <div className="text-2xl font-bold text-green-600">
          {stats.confirmed}
        </div>
        <div className="text-sm text-gray-600">Confirmed</div>
      </Card>
      <Card className="p-4">
        <div className="text-2xl font-bold text-orange-600">{stats.maybe}</div>
        <div className="text-sm text-gray-600">Maybe</div>
      </Card>
      <Card className="p-4">
        <div className="text-2xl font-bold text-yellow-600">
          {stats.pending}
        </div>
        <div className="text-sm text-gray-600">Pending</div>
      </Card>
      <Card className="p-4">
        <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
        <div className="text-sm text-gray-600">Declined</div>
      </Card>
    </div>
  );
}
