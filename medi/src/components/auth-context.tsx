// /medi/src/components/auth-context.tsx
'use client';
import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { User as PrismaUser, Role } from '@prisma/client'; // Import Prisma types
import apiClient from '@/lib/apiClient';

// Define a more specific User type for the frontend, potentially omitting sensitive fields
export type AuthenticatedUser = Omit<PrismaUser, 'hashedPassword' | 'emailVerified'>; // Adjust if you have these

interface AuthContextType {
  user: AuthenticatedUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  signup: (details: { name?: string, email?: string, role: Role }) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { publicKey, signMessage, connected, disconnect } = useWallet();

  const storeToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const clearToken = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const fetchCurrentUser = useCallback(async (currentToken?: string) => {
    const activeToken = currentToken || token;
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedUser = await apiClient<AuthenticatedUser>('/auth/me', { token: activeToken });
      setUser(fetchedUser);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setUser(null);
      clearToken(); // Token might be invalid
    } finally {
      setIsLoading(false);
    }
  }, [token]); // Dependency on token state

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken); // Set token state first
      fetchCurrentUser(storedToken); // Then fetch user
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]);


  const login = useCallback(async () => {
    if (!publicKey || !signMessage || !connected) {
      console.error("Wallet not connected or signMessage not available");
      throw new Error("Wallet not connected");
    }
    setIsLoading(true);
    try {
      const message = `Welcome to MediCrypt! Sign this message to log in. Nonce: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      const response = await apiClient<{ token: string; user: AuthenticatedUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          signature,
          message,
        }),
      });
      storeToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error("Login error:", error);
      clearToken();
      setUser(null);
      throw error; // Re-throw for caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, connected]);

  const signup = useCallback(async (details: { name?: string, email?: string, role: Role }) => {
    if (!publicKey) {
        console.error("Wallet not connected for signup");
        throw new Error("Wallet not connected");
    }
    setIsLoading(true);
    try {
        const response = await apiClient<{ message: string; user: AuthenticatedUser }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                walletAddress: publicKey.toBase58(),
                ...details,
            }),
        });
        // Optionally auto-login after signup or prompt for login
        console.log(response.message);
        // For simplicity, prompt user to log in after signup
        setUser(null); // Don't auto-login, let them use the login flow
        clearToken();
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  }, [publicKey]);


  const logout = useCallback(() => {
    setUser(null);
    clearToken();
    disconnect(); // Disconnect wallet on logout
    // Potentially redirect to login page via router
  }, [disconnect]);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, signup, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};