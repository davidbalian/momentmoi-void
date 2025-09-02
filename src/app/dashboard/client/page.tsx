"use client";

import React from "react";
import { ClientDashboardLayout } from "@/components/layout/ClientDashboardLayout";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ClientDashboardPage() {
  const { data, loading, error } = useClientDashboard();

  if (loading) {
    return (
      <ClientDashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (error) {
    return (
      <ClientDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Icon name="AlertCircle" size="lg" className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (!data) {
    return (
      <ClientDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Icon name="Calendar" size="lg" className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Event Found</h3>
            <p className="text-gray-600 mb-4">You haven't set up your event yet.</p>
            <Link href="/dashboard/client/event/setup">
              <Button>Set Up Your Event</Button>
            </Link>
          </div>
        </div>
      </ClientDashboardLayout>
    );
  }

  const { event, partner, stats, recentActivity, upcomingDeadlines } = data;

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {event?.event_type ? `${event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} Planning` : "Event Planning"}
            </h1>
            <p className="text-gray-600 mt-1">
              {event?.event_date 
                ? `${stats.daysUntilEvent} days until your special day`
                : "Set up your event to get started"
              }
            </p>
          </div>
          <Link href="/dashboard/client/event">
            <Button variant="outline">
              <Icon name="Settings" size="sm" className="mr-2" />
              Event Settings
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days Until Event</p>
                <p className="text-2xl font-bold text-primary-600">{stats.daysUntilEvent}</p>
              </div>
              <Icon name="Clock" size="lg" className="text-primary-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Guests</p>
                <p className="text-2xl font-bold text-primary-600">
                  {stats.confirmedGuests}/{stats.totalGuests}
                </p>
                <p className="text-xs text-gray-500">Confirmed</p>
              </div>
              <Icon name="Users" size="lg" className="text-primary-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-2xl font-bold text-primary-600">
                  €{stats.spentBudget.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  of €{stats.totalBudget.toLocaleString()}
                </p>
              </div>
              <Icon name="DollarSign" size="lg" className="text-primary-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-primary-600">
                  {stats.completedTasks}/{stats.totalTasks}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <Icon name="CheckSquare" size="lg" className="text-primary-500" />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Link href="/dashboard/client/checklist">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Activity" size="lg" className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon 
                      name={activity.type === "guest_added" ? "UserPlus" : "CheckCircle"} 
                      size="sm" 
                      className="text-primary-500 mt-0.5" 
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              <Link href="/dashboard/client/checklist">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Calendar" size="lg" className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Icon name="Clock" size="sm" className="text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-orange-600">
                        Due: {new Date(task.due_date!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Partner Status */}
        {partner && (
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Icon name="Heart" size="lg" className="text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Planning with {partner.full_name || partner.email}
                </h3>
                <p className="text-gray-600">You're both working on this event together</p>
              </div>
              <Link href="/dashboard/client/partner">
                <Button variant="outline" size="sm">
                  Partner Settings
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/client/guests">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="UserPlus" size="sm" className="mr-2" />
                Add Guest
              </Button>
            </Link>
            <Link href="/dashboard/client/vendors">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Store" size="sm" className="mr-2" />
                Find Vendors
              </Button>
            </Link>
            <Link href="/dashboard/client/checklist">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Plus" size="sm" className="mr-2" />
                Add Task
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
