"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Shield, 
  User, 
  Menu, 
  X,
  Sun,
  Moon,
  LogOut,
  Settings,
  Bell,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Handle screen resize
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Close sidebar when navigation occurs on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out");
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      title: "Home",
      href: isAuthenticated ? "/dashboard" : "/home",
      icon: <Home className="h-5 w-5" />
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      requireAuth: true
    },
    {
      title: "My Records",
      href: "/records",
      icon: <FileText className="h-5 w-5" />,
      requireAuth: true
    },
    {
      title: "Upload Record",
      href: "/records/upload",
      icon: <Upload className="h-5 w-5" />,
      requireAuth: true
    },
    {
      title: "Access Requests",
      href: "/access-requests",
      icon: <Shield className="h-5 w-5" />,
      requireAuth: true
    },
    {
      title: "Account",
      href: "/account",
      icon: <User className="h-5 w-5" />,
      requireAuth: true
    },
  ];

  const filteredNavItems = navItems.filter(
    item => !item.requireAuth || isAuthenticated
  );

  const NavContent = () => (
    <>
      <div className="px-4 py-6">
        <Link href={isAuthenticated ? "/dashboard" : "/home"} 
          className="mb-10 flex items-center px-2 group transition-all duration-300 hover:opacity-90">
          <div className="mr-4 h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 border border-primary/20">
            <div className="font-bold text-primary-foreground text-2xl bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">M</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white">MediCrypt</div>
            <div className="text-xs text-gray-400 font-medium">Secure Medical Records</div>
          </div>
        </Link>

        {/* Main Navigation */}
        <div className="mb-6 space-y-1">
          {filteredNavItems.map((item) => (
            <TooltipProvider key={item.href} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive(item.href) 
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-semibold shadow-sm border-l-4 border-primary" 
                        : "text-gray-400 hover:bg-primary/10 hover:text-primary hover:border-l-4 hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "transition-colors",
                        isActive(item.href) ? "text-primary" : "text-gray-400 group-hover:text-primary"
                      )}>
                        {item.icon}
                      </div>
                      <span className={cn(
                        isActive(item.href) ? "font-semibold" : "font-medium",
                        "transition-transform group-hover:translate-x-0.5"
                      )}>
                        {item.title}
                      </span>
                    </div>
                    {isActive(item.href) && (
                      <ChevronRight className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Divider with label */}
        <div className="flex items-center gap-2 px-3 my-6">
          <div className="h-px bg-gray-800 flex-grow"></div>
          <span className="text-xs font-medium text-gray-500">Settings</span>
          <div className="h-px bg-gray-800 flex-grow"></div>
        </div>

        {/* Settings links */}
        <div className="mb-6 space-y-1">
          <Link 
            href="/settings"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive("/settings") 
                ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-semibold shadow-sm border-l-4 border-primary" 
                : "text-gray-400 hover:bg-primary/10 hover:text-primary hover:border-l-4 hover:border-primary/40"
            )}
          >
            <Settings className="h-4.5 w-4.5" />
            <span>Settings</span>
          </Link>

          <Link 
            href="/notifications"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive("/notifications") 
                ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-semibold shadow-sm border-l-4 border-primary" 
                : "text-gray-400 hover:bg-primary/10 hover:text-primary hover:border-l-4 hover:border-primary/40"
            )}
          >
            <div className="relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
            <span>Notifications</span>
          </Link>
        </div>
      </div>
      
      {/* Bottom section with theme and user profile */}
      <div className="mt-auto px-4 py-5 border-t border-gray-800/50">
        <div className="mb-4 rounded-lg bg-gray-800/40 p-3">
          <div className="flex justify-between items-center px-1 mb-2">
            <span className="text-sm font-medium text-gray-300">Theme</span>
            <div className="flex gap-1">
              <Button 
                variant={theme === "light" ? "secondary" : "ghost"} 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-md transition-all duration-200",
                  theme === "light" ? "bg-primary/20 text-primary shadow-sm shadow-primary/30" : "bg-gray-700/50 hover:bg-gray-600/50"
                )}
                onClick={() => setTheme("light")}
                aria-label="Light theme"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button 
                variant={theme === "dark" ? "secondary" : "ghost"} 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-md transition-all duration-200",
                  theme === "dark" ? "bg-primary/20 text-primary shadow-sm shadow-primary/30" : "bg-gray-700/50 hover:bg-gray-600/50"
                )}
                onClick={() => setTheme("dark")}
                aria-label="Dark theme"
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {user && (
          <>
            <Link href="/account" className="block">
              <div className="flex items-center gap-3 rounded-lg bg-gray-800/60 px-3 py-3.5 text-sm mb-3 hover:bg-gray-700/60 transition-colors cursor-pointer border border-gray-700/30 hover:border-primary/20">
                <Avatar className="h-10 w-10 border-2 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold truncate text-white">{user.name || "User"}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.walletAddress?.substring(0, 6)}...{user.walletAddress?.substring(user.walletAddress.length - 4)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-primary" />
              </div>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm font-medium gap-2.5 hover:bg-red-500/15 hover:text-red-400 transition-colors py-3 px-3 text-gray-400 border border-transparent hover:border-red-500/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </Button>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-5 left-5 z-50 lg:hidden shadow-md border-gray-700/80 bg-gray-800/90 backdrop-blur-md hover:bg-gray-700/90"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Mobile Sidebar with overlay */}
      {isMobile && (
        <div className={cn(
          "fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div 
            className={cn(
              "fixed left-0 top-0 z-50 h-full w-80 bg-gray-900/95 backdrop-blur-lg shadow-xl transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <ScrollArea className="h-full">
              <NavContent />
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className={cn(
            "hidden lg:block fixed left-0 top-0 z-30 h-full w-80 border-r border-gray-800/80 bg-gray-900/95 backdrop-blur-lg shadow-md",
            className
          )}
        >
          <ScrollArea className="h-full">
            <NavContent />
          </ScrollArea>
        </div>
      )}
    </>
  );
} 