'use client';
import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Shield, 
  Lock, 
  HeartPulse, 
  Share2, 
  Database, 
  ArrowRight, 
  Users, 
  CheckCircle, 
  ExternalLink,
  Smartphone,
  Globe,
  Key,
  CheckIcon,
  Clock,
  Workflow
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const features = [
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "End-to-End Encryption",
      description: "Your medical records are encrypted with your personal keys, ensuring only you control access."
    },
    {
      icon: <HeartPulse className="h-6 w-6 text-primary" />,
      title: "Complete Medical History",
      description: "Store and manage your entire medical history in one secure location."
    },
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "Selective Sharing",
      description: "Grant access to specific healthcare providers and researchers on your terms."
    },
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Blockchain Security",
      description: "Leverage blockchain technology for immutable and transparent record management."
    }
  ];

  const benefits = [
    {
      icon: <Key className="h-5 w-5" />,
      text: "Full ownership of your medical data"
    },
    {
      icon: <Users className="h-5 w-5" />,
      text: "Secure sharing with healthcare providers"
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      text: "Simplified access for emergency situations"
    },
    {
      icon: <Database className="h-5 w-5" />,
      text: "Permanent and tamper-proof records"
    },
    {
      icon: <Globe className="h-5 w-5" />,
      text: "Transparent access history"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "HIPAA-compliant security"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Sign Up",
      description: "Create your account with blockchain wallet security"
    },
    {
      number: 2,
      title: "Upload Records",
      description: "Add your medical documents with end-to-end encryption"
    },
    {
      number: 3,
      title: "Control Access",
      description: "Decide who can view your information and when"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-black text-white">
      {/* Navbar - Adding a simple navbar for better navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md border border-primary/20">
                <span className="font-bold text-primary-foreground text-lg">M</span>
              </div>
              <div className="font-bold text-xl text-white tracking-tight">MediCrypt</div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">Features</Link>
              <Link href="#benefits" className="text-gray-300 hover:text-white transition-colors text-sm">Benefits</Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm">How It Works</Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors text-sm">Testimonials</Link>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-gray-300 hover:text-white">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href="/login">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        <div className="absolute -z-10 right-0 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-70"></div>
        <div className="absolute -z-10 left-1/4 bottom-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -z-10 inset-0 bg-[url('/medical-bg.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-6 py-1.5 px-4 bg-primary/15 border border-primary/20 text-primary">
                <Shield className="h-4 w-4 mr-1" />
                Secure Medical Records Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Take Control of Your <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/70">Medical Records</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8">
                MediCrypt combines blockchain security with encryption to give you complete 
                ownership of your medical data while enabling secure sharing with healthcare providers.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Button asChild size="lg" className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-md shadow-primary/20 border border-primary/20">
                  <Link href="/login" className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-6 border-gray-700 hover:bg-gray-800 text-white">
                  <Link href="#features" className="flex items-center">
                    Learn More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-400">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-400">Military-grade Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-400">Blockchain Technology</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative max-w-lg">
              <div className="bg-gradient-to-tr from-primary/20 to-primary/10 rounded-3xl p-1 shadow-xl border border-primary/30">
                <div className="bg-gray-900/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-gray-800/50">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="col-span-2 bg-black/60 border-primary/20 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                          <HeartPulse className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-md font-semibold text-white">Health Report</p>
                          <p className="text-xs text-gray-400">Updated 2 days ago</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/60 border-primary/20 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                        <Shield className="h-8 w-8 text-primary mb-2" />
                        <p className="text-sm font-semibold text-white">Encrypted</p>
                        <p className="text-xs text-gray-400">AES-256</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/60 border-primary/20 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                        <Database className="h-8 w-8 text-primary mb-2" />
                        <p className="text-sm font-semibold text-white">Immutable</p>
                        <p className="text-xs text-gray-400">Blockchain</p>
                      </CardContent>
                    </Card>
                    <Card className="col-span-2 bg-black/60 border-primary/20 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                          <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-md font-semibold text-white">Access Control</p>
                          <p className="text-xs text-gray-400">You decide who can access</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
              
              {/* Floating elements */}
              <div className="absolute -right-4 top-1/4 animate-pulse">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-md p-0.5">
                  <div className="h-full w-full rounded-[10px] bg-black/60 flex items-center justify-center">
                    <HeartPulse className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>
              <div className="absolute -left-8 bottom-1/4 animate-pulse delay-300">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-md p-0.5">
                  <div className="h-full w-full rounded-[7px] bg-black/60 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/20 to-black -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center mb-16">
            <Badge className="mb-4 py-1.5 px-4 bg-primary/15 border border-primary/20 text-primary">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How MediCrypt Works</h2>
            <p className="text-gray-400">
              Our platform makes it easy to secure, manage, and share your medical records
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full border-t-2 border-dashed border-primary/30" />
                )}
                <Card className="bg-black/60 border-gray-800 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-10" />
                  <CardHeader className="pb-2">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary font-bold border border-primary/30 mb-3">
                      {step.number}
                    </span>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-black text-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900/20 -z-10" />
        <div className="absolute -z-10 inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center mb-16">
            <Badge className="mb-4 py-1.5 px-4 bg-primary/15 border border-primary/20 text-primary">
              Exclusive Benefits
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Medical Data, Your Way</h2>
            <p className="text-gray-400">
              MediCrypt puts you in control of your health information with industry-leading
              security and user-friendly design.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 group p-4 rounded-xl transition-all duration-300 hover:bg-gray-900/50 border border-transparent hover:border-gray-800">
                <div className="mt-1 p-2 rounded-lg bg-primary/15 text-primary border border-primary/30 group-hover:bg-primary/25 transition-all duration-300">
                  {benefit.icon}
                </div>
                <p className="text-lg mt-1">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-gray-900/40 text-white relative">
        <div className="absolute -z-10 left-0 top-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -z-10 right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center mb-16">
            <Badge className="mb-4 py-1.5 px-4 bg-primary/15 border border-primary/20 text-primary">
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose MediCrypt?</h2>
            <p className="text-gray-400">
              Our platform combines advanced technology with intuitive design to 
              provide the best experience for managing your medical records.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={cn(
                  "bg-gray-900/70 rounded-xl p-6 shadow-md border border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all duration-300",
                  "group hover:translate-y-[-2px]"
                )}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="testimonials" className="py-20 bg-gray-900/80 backdrop-blur-sm relative">
        <div className="absolute -z-10 inset-0 bg-[url('/testimonial-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-black/60 border border-gray-800 shadow-xl">
              <div className="flex justify-center mb-6">
                <div className="h-14 w-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white text-center">Trusted by Thousands</h2>
              <p className="text-xl mb-10 italic text-gray-300 text-center leading-relaxed">
                "MediCrypt has revolutionized how I manage my family's health records. 
                Now everything is in one place, secure, and easily shareable with our doctors when needed."
              </p>
              <div className="flex items-center justify-center">
                <div className="h-14 w-14 rounded-full border-2 border-primary/30 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mr-4 shadow-sm">
                  <p className="font-bold text-white">JD</p>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Jane Doe</p>
                  <p className="text-sm text-gray-400">Patient & Family Caretaker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute -z-10 inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute -z-10 right-0 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -z-10 left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4 py-1.5 px-4 bg-primary/15 border border-primary/20 text-primary">
            Get Started Today
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your medical records?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Join thousands of patients, doctors, and researchers who are already using 
            MediCrypt to securely manage medical records.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-md shadow-primary/20 border border-primary/20">
              <Link href="/login" className="flex items-center justify-center">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-gray-700 hover:bg-gray-800 text-white">
              <Link href="/login" className="flex items-center justify-center">
                Learn More
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md border border-primary/20">
                  <span className="font-bold text-primary-foreground text-lg">M</span>
                </div>
                <div className="font-bold text-xl text-white">MediCrypt</div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Secure blockchain-based medical records platform.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Security</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">HIPAA Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MediCrypt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 