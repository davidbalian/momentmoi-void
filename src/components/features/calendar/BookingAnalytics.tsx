"use client";

import { Card, CardContent } from "@/components/ui";
import { Calendar, Euro, TrendingUp, Users } from "lucide-react";

interface BookingAnalyticsProps {
  bookings: any[];
  month: string;
}

export default function BookingAnalytics({
  bookings,
  month,
}: BookingAnalyticsProps) {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled"
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.budget_amount)
    .reduce((sum, b) => sum + parseFloat(b.budget_amount), 0);

  // Calculate average booking value
  const bookingsWithBudget = bookings.filter((b) => b.budget_amount);
  const averageBookingValue = bookingsWithBudget.length > 0 
    ? totalRevenue / bookingsWithBudget.length 
    : 0;

  // Get upcoming bookings (confirmed and in the future)
  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.event_date) >= new Date()
  ).length;

  // Get completion rate
  const completionRate = totalBookings > 0 
    ? Math.round((completedBookings / totalBookings) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Booking Analytics - {month}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold">{totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {confirmedBookings}
                </p>
                {totalBookings > 0 && (
                  <p className="text-xs text-gray-500">
                    {Math.round((confirmedBookings / totalBookings) * 100)}%
                  </p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-green-600">
                  {completedBookings}
                </p>
                <p className="text-xs text-gray-500">
                  {completionRate}% rate
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-green-600">
                  €{totalRevenue.toFixed(0)}
                </p>
                {bookingsWithBudget.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Avg: €{averageBookingValue.toFixed(0)}
                  </p>
                )}
              </div>
              <Euro className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-xl font-semibold text-orange-600">
                {upcomingBookings}
              </p>
              <p className="text-xs text-gray-500">Confirmed events</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-xl font-semibold text-red-600">
                {cancelledBookings}
              </p>
              {totalBookings > 0 && (
                <p className="text-xs text-gray-500">
                  {Math.round((cancelledBookings / totalBookings) * 100)}% rate
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-xl font-semibold text-green-600">
                {completionRate}%
              </p>
              <p className="text-xs text-gray-500">Success rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Summary */}
      {bookings.length > 0 && (
        <Card variant="elevated">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {bookings
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 3)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-blue-500' :
                        booking.status === 'completed' ? 'bg-green-500' :
                        booking.status === 'cancelled' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="font-medium">{booking.client_name}</span>
                    </div>
                    <div className="text-gray-500">
                      {new Date(booking.event_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
