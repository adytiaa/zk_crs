// /medi/src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Shield } from 'lucide-react';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/home');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)] bg-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -z-10 inset-0">
        <div className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-60"></div>
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl opacity-40"></div>
      </div>
      
      <div className="flex flex-col items-center relative z-10">
        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg shadow-primary/10 border border-primary/20">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-white">MediCrypt</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md px-4">
          Secure Medical Records on Blockchain
        </p>
        
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/20"></div>
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full relative"></div>
        </div>
        
        <p className="text-gray-500 text-sm mt-8 animate-pulse">
          Loading your secure environment...
        </p>
      </div>
    </div>
  );
}