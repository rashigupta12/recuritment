// app/(dashboard)/dashboard/sales-user/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, TrendingUp, Users } from 'lucide-react';

export default function SalesUserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
        <p className="text-muted-foreground">Manage your leads and track your sales performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+1 from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="btn-primary h-24">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <div>Add New Lead</div>
            </div>
          </Button>
          <Button variant="outline" className="h-24">
            <div className="text-center">
              <Target className="h-6 w-6 mx-auto mb-2" />
              <div>View All Leads</div>
            </div>
          </Button>
          <Button variant="outline" className="h-24">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2" />
              <div>Follow-up Tasks</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}







