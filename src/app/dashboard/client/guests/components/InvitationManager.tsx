"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function InvitationManager() {
  // TODO: Replace with actual data and functionality
  const invitationStats = {
    totalInvitations: 25,
    sentInvitations: 20,
    pendingInvitations: 5,
    responseRate: 72, // percentage
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Invitation Management</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{invitationStats.totalInvitations}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{invitationStats.sentInvitations}</div>
          <div className="text-sm text-gray-600">Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{invitationStats.pendingInvitations}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{invitationStats.responseRate}%</div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          Send Reminders
        </Button>
        <Button size="sm" variant="outline">
          Export List
        </Button>
        <Button size="sm" variant="outline">
          Track Responses
        </Button>
      </div>
    </Card>
  );
}
