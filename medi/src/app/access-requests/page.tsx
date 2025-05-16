'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle, XCircle, UserPlus, Shield, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Type definitions
interface AccessRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  requesterWallet: string;
  recordTitle: string;
  recordId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  expiryDate?: string;
}

export default function AccessRequestsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch access requests from API
  useEffect(() => {
    if (isAuthenticated && user) {
      // Mock API call
      setTimeout(() => {
        setRequests([
          {
            id: '1',
            requesterName: 'Dr. Jane Smith',
            requesterRole: 'Doctor',
            requesterWallet: '8xKMs2...',
            recordTitle: 'Annual Physical Examination',
            recordId: '1',
            requestDate: '2023-11-15',
            status: 'pending'
          },
          {
            id: '2',
            requesterName: 'MediData Research',
            requesterRole: 'Researcher',
            requesterWallet: '3rFa9s...',
            recordTitle: 'Blood Test Results',
            recordId: '2',
            requestDate: '2023-11-10',
            status: 'approved',
            expiryDate: '2023-12-31'
          },
          {
            id: '3',
            requesterName: 'Dr. Michael Johnson',
            requesterRole: 'Doctor',
            requesterWallet: '7gHj2k...',
            recordTitle: 'X-Ray Imaging',
            recordId: '3',
            requestDate: '2023-11-05',
            status: 'rejected'
          }
        ]);
        setIsLoadingRequests(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

  const handleApprove = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'approved', expiryDate: '2023-12-31' } : req
    ));
    toast.success('Access request approved');
  };

  const handleReject = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    toast.success('Access request rejected');
  };

  const handleRevokeAccess = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    toast.success('Access has been revoked');
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return req.status === 'pending';
    if (activeTab === 'approved') return req.status === 'approved';
    if (activeTab === 'rejected') return req.status === 'rejected';
    return true;
  });

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;
  const rejectedCount = requests.filter(req => req.status === 'rejected').length;

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Access Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage who can access your medical records
        </p>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {isLoadingRequests ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium mb-2">No {tab} access requests</p>
                  <p className="text-muted-foreground text-sm max-w-md text-center mb-4">
                    {tab === 'pending' ? 
                      "You don&apos;t have any pending access requests at the moment." : 
                      tab === 'approved' ? 
                      "You haven&apos;t approved any access requests yet." : 
                      "You haven&apos;t rejected any access requests yet."}
                  </p>
                  {tab === 'approved' && (
                    <Button asChild>
                      <Link href="/records">Go to My Records</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(request.status)}
                          <h3 className="font-medium">{request.requesterName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.requesterRole} • {request.requesterWallet}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Requested on {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                        {request.expiryDate && (
                          <div className="flex items-center justify-end text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Expires: {new Date(request.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Record Access Request</span>
                      </div>
                      <p className="text-sm mb-1">
                        <span className="text-muted-foreground">Record: </span>
                        <Link href={`/records/${request.recordId}`} className="hover:underline text-primary">
                          {request.recordTitle}
                        </Link>
                      </p>
                    </div>

                    {request.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => handleApprove(request.id)} size="sm" className="flex-1">
                          Approve Access
                        </Button>
                        <Button onClick={() => handleReject(request.id)} size="sm" variant="outline" className="flex-1">
                          Reject
                        </Button>
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <div className="mt-4">
                        <Button 
                          onClick={() => handleRevokeAccess(request.id)} 
                          size="sm" 
                          variant="destructive" 
                          className="w-full"
                        >
                          Revoke Access
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 