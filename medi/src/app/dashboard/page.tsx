// /medi/src/app/dashboard/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  FileText, 
  User, 
  Shield, 
  Bell, 
  ChevronRight, 
  PlusCircle, 
  Clock, 
  LayoutDashboard, 
  Activity,
  Check,
  X, 
  Calendar,
  ArrowUpRight,
  Sparkles,
  Share2
} from 'lucide-react';
import { ellipsify } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Mock data types
interface DashboardStats {
  totalRecords: number;
  pendingRequests: number;
  sharedRecords: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'access' | 'approved' | 'rejected';
  title: string;
  date: string;
  actor?: string;
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ totalRecords: 0, pendingRequests: 0, sharedRecords: 0 });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch dashboard data (mocked)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Mock API call
      setTimeout(() => {
        setStats({
          totalRecords: 3,
          pendingRequests: 1,
          sharedRecords: 1
        });
        
        setActivities([
          {
            id: '1',
            type: 'upload',
            title: 'X-Ray Imaging uploaded',
            date: '2023-06-10'
          },
          {
            id: '2',
            type: 'access',
            title: 'Dr. Jane Smith requested access',
            date: '2023-11-15',
            actor: 'Dr. Jane Smith'
          },
          {
            id: '3',
            type: 'approved',
            title: 'You approved access for MediData Research',
            date: '2023-11-10',
            actor: 'MediData Research'
          }
        ]);
        
        setIsLoadingData(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'access': return <User className="h-5 w-5 text-amber-500" />;
      case 'approved': return <Check className="h-5 w-5 text-green-500" />;
      case 'rejected': return <X className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'upload': return 'bg-blue-500/10';
      case 'access': return 'bg-amber-500/10';
      case 'approved': return 'bg-green-500/10';
      case 'rejected': return 'bg-red-500/10';
      default: return 'bg-primary/10';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="pb-12">
      {/* Welcome Section */}
      <div className="relative mb-10 pb-8 border-b border-border/60">
        <div className="absolute top-0 right-0 -z-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user.name || ellipsify(user.walletAddress, 4)}!</h1>
            <p className="text-muted-foreground">
              You&apos;re logged in as a {user.role.toLowerCase()}. Here&apos;s an overview of your medical records.
            </p>
          </div>
          <Button asChild className="md:self-start rounded-full">
            <Link href="/records/upload" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Upload New Record
            </Link>
            </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <Card className="border-2 border-border/50 hover:border-primary/40 transition-colors shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalRecords}</div>
            <p className="text-sm text-muted-foreground mt-0.5">Medical documents</p>
          </CardContent>
          <CardFooter className="pt-0 pb-3">
            <Link href="/records" className="text-primary text-sm flex items-center hover:underline">
              View all records <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="border-2 border-border/50 hover:border-primary/40 transition-colors shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {stats.pendingRequests === 1 ? 'Request' : 'Requests'} waiting
            </p>
          </CardContent>
          <CardFooter className="pt-0 pb-3">
            {stats.pendingRequests > 0 ? (
              <Link href="/access-requests" className="text-primary text-sm flex items-center hover:underline">
                Review now <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">No pending requests</span>
            )}
          </CardFooter>
        </Card>
        
        <Card className="border-2 border-border/50 hover:border-primary/40 transition-colors shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-muted-foreground">Shared Records</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.sharedRecords}</div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {stats.sharedRecords === 1 ? 'Record' : 'Records'} shared
            </p>
          </CardContent>
          <CardFooter className="pt-0 pb-3">
            <Link href="/access-requests?tab=approved" className="text-primary text-sm flex items-center hover:underline">
              Manage access <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Actions Section */}
        <div className="md:col-span-1">
          <div className="flex items-center mb-4">
            <LayoutDashboard className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Card className="border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-0">
                <Link href="/records/upload" className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">Upload New Record</h3>
                    <p className="text-sm text-muted-foreground">Add a new medical record</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/60" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-0">
                <Link href="/access-requests" className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">Manage Access</h3>
                    <p className="text-sm text-muted-foreground">Control who can view your records</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/60" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-0">
                <Link href="/records" className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">View All Records</h3>
                    <p className="text-sm text-muted-foreground">Browse your medical history</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/60" />
                </Link>
              </CardContent>
            </Card>

            {user.role === 'PATIENT' && (
              <div className="bg-primary/5 rounded-lg p-4 mt-6 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm">Health Tip</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Regular health check-ups can help detect potential issues early. Consider scheduling an annual check-up with your primary care provider.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            {activities.length > 3 && (
              <Button variant="ghost" size="sm" className="text-sm gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Card className="border-border/60">
            <CardContent className="p-0">
              {isLoadingData ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground font-medium mb-1">No recent activity</p>
                  <p className="text-sm text-muted-foreground/70">
                    Your activity will appear here once you start using MediCrypt
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 h-9 w-9 rounded-full ${getActivityBg(activity.type)} flex items-center justify-center`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="font-medium">{activity.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-normal">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(activity.date)}
                              </Badge>
                              {activity.type === 'access' && (
                                <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                                  <Link href="/access-requests">Review</Link>
                                </Button>
                              )}
                            </div>
                          </div>
                          {activity.actor && (
                            <p className="text-sm text-muted-foreground mt-1">
                              From: {activity.actor}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card className="border-border/60 bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Coming Soon: Healthcare Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We&apos;re working on integrating appointment scheduling with your healthcare providers.
                  Stay tuned for this upcoming feature!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}