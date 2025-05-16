'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Dummy type for medical records
interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  type: string;
  status: 'encrypted' | 'shared';
  sharedWith?: string[];
}

export default function RecordsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch records from API (mocked with dummy data for now)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Mock API call
      setTimeout(() => {
        setRecords([
          {
            id: '1',
            title: 'Annual Physical Examination',
            date: '2023-04-15',
            type: 'Examination',
            status: 'encrypted'
          },
          {
            id: '2',
            title: 'Blood Test Results',
            date: '2023-05-20',
            type: 'Laboratory',
            status: 'shared',
            sharedWith: ['Dr. Smith']
          },
          {
            id: '3',
            title: 'X-Ray Imaging',
            date: '2023-06-10',
            type: 'Radiology',
            status: 'encrypted'
          }
        ]);
        setIsLoadingRecords(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Medical Records</h1>
        <Button asChild>
          <Link href="/records/upload">Upload New Record</Link>
        </Button>
      </div>

      {isLoadingRecords ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">You don&apos;t have any medical records yet.</p>
          <Button asChild>
            <Link href="/records/upload">Upload Your First Record</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{record.title}</CardTitle>
                  <Badge variant={record.status === 'encrypted' ? 'default' : 'secondary'}>
                    {record.status === 'encrypted' ? 'Encrypted' : 'Shared'}
                  </Badge>
                </div>
                <CardDescription>
                  {record.type} • {new Date(record.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {record.sharedWith && (
                  <p className="text-sm text-muted-foreground">
                    Shared with: {record.sharedWith.join(', ')}
                  </p>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 pt-3">
                <div className="flex gap-2 w-full">
                  <Button variant="secondary" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Manage Access
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 