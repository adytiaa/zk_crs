// /medi/src/app/login/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/solana/solana-provider';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@prisma/client'; // Import Role enum
import { toast } from 'sonner';
import { Shield, LockKeyhole, UserPlus, HeartPulse, Stethoscope, Microscope, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export default function LoginPage() {
  const { connected, publicKey } = useWallet();
  const { login, signup, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [isSignupMode, setIsSignupMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.PATIENT);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard'); // Redirect if already logged in
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first.');
      return;
    }
    try {
      setFormSubmitting(true);
      await login();
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      if (isErrorWithMessage(error) && error.message.includes('User not found')) {
        toast.error('User not found. Please sign up.');
        setIsSignupMode(true);
      } else {
        const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';
        toast.error(`Login failed: ${errorMessage}`);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (!connected || !publicKey) {
        toast.error('Please connect your wallet first.');
        return;
    }
    try {
        setFormSubmitting(true);
        await signup({ name: name || undefined, email: email || undefined, role: selectedRole });
        toast.success('Signup successful! Please log in.');
        setIsSignupMode(false); // Switch back to login mode
        // Clear form fields
        setName('');
        setEmail('');
    } catch (error) {
        const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';
        toast.error(`Signup failed: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-black">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-black">
        <div className="text-center animate-pulse">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <ChevronRight className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-medium text-white">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden py-12 bg-black">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-10 top-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl opacity-70"></div>
        <div className="absolute right-0 bottom-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-60"></div>
      </div>
      
      <div className="px-4 sm:px-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2 pl-0 gap-1 text-gray-400 hover:text-white transition-colors">
            <Link href="/home">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="mx-auto max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-5 shadow-lg shadow-primary/10 border border-primary/20">
              <Shield className="h-9 w-9 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-center text-white">MediCrypt</h1>
            <p className="text-gray-400 text-center mt-2">
              Secure blockchain-based medical records management
            </p>
          </div>
          
          <Card className="border-2 border-gray-800 shadow-lg bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-white">
                {isSignupMode ? 'Create an Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                {isSignupMode
                  ? 'Sign up to securely manage your medical records'
                  : 'Sign in to access your secure medical account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full flex justify-center">
                <WalletButton />
              </div>

              {connected && publicKey && (
                <>
                  <div className="rounded-lg border border-gray-700 bg-black/40 p-3 text-center">
                    <p className="text-sm text-gray-400">
                      Connected as: <span className="font-medium text-white">{publicKey.toBase58().substring(0,6)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 4)}</span>
                    </p>
                  </div>
                  
                  {isSignupMode ? (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="John Doe" 
                          className="h-11 bg-gray-800 border-gray-700 text-white focus:border-primary focus:ring-primary/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="you@example.com" 
                          className="h-11 bg-gray-800 border-gray-700 text-white focus:border-primary focus:ring-primary/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="role" className="text-gray-300">I am a:</Label>
                         <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                            <SelectTrigger id="role" className="h-11 bg-gray-800 border-gray-700 text-white focus:ring-primary/40">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value={Role.PATIENT} className="focus:bg-primary/10">
                                  <div className="flex items-center">
                                    <HeartPulse className="h-4 w-4 mr-2 text-primary" />
                                    Patient
                                  </div>
                                </SelectItem>
                                <SelectItem value={Role.DOCTOR} className="focus:bg-primary/10">
                                  <div className="flex items-center">
                                    <Stethoscope className="h-4 w-4 mr-2 text-primary" />
                                    Doctor
                                  </div>
                                </SelectItem>
                                <SelectItem value={Role.RESEARCHER} className="focus:bg-primary/10">
                                  <div className="flex items-center">
                                    <Microscope className="h-4 w-4 mr-2 text-primary" />
                                    Researcher
                                  </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleSignup} 
                        className={cn(
                          "w-full mt-5 h-11 rounded-md text-white flex items-center justify-center",
                          "bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-md shadow-primary/20 border border-primary/20"
                        )}
                        disabled={formSubmitting}
                        size="lg"
                      >
                        {formSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleLogin} 
                      className={cn(
                        "w-full mt-4 h-11 rounded-md text-white flex items-center justify-center",
                        "bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-md shadow-primary/20 border border-primary/20"
                      )}
                      disabled={formSubmitting}
                      size="lg"
                    >
                      {formSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LockKeyhole className="h-4 w-4 mr-2" />
                          Sign in with Wallet
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-primary hover:text-primary/90 hover:bg-gray-800 transition-colors" 
                onClick={() => setIsSignupMode(!isSignupMode)}
                disabled={formSubmitting}
              >
                                  {isSignupMode
                    ? 'Already have an account? Sign in'
                    : 'No account yet? Sign up'}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="flex items-center gap-2 mt-8 justify-center">
            <div className="h-px w-8 bg-gray-800"></div>
                         <p className="text-center text-xs text-gray-500">
               By continuing, you agree to MediCrypt&apos;s Terms of Service and Privacy Policy.
              </p>
            <div className="h-px w-8 bg-gray-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
}