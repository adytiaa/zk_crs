'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Copy, Check, LogOut, User, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const copyToClipboard = () => {
    if (!user?.walletAddress) return;
    
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    toast.success('Wallet address copied to clipboard');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out');
    router.push('/login');
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and wallet connection
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Your personal information associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={user.name || ''} 
                  placeholder="Not provided" 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user.email || ''} 
                  placeholder="Not provided" 
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  {user.role}
                </div>
              </div>
              <div>
                <Label htmlFor="accountCreated">Account Created</Label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle>Wallet Connection</CardTitle>
            </div>
            <CardDescription>
              Your blockchain wallet information used for authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <div className="flex mt-1.5">
                <div className="flex-1 flex items-center h-10 w-full rounded-l-md border border-input bg-background px-3 py-2 text-sm font-mono">
                  {user.walletAddress}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-none"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">End-to-End Encryption</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your medical records are encrypted with your wallet keys, ensuring that only you control access to your data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              <CardTitle>Sign Out</CardTitle>
            </div>
            <CardDescription>
              Securely sign out from your current session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Remember to sign out when using a shared or public device. Your wallet connection will be removed from this browser.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
