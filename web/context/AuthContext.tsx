// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import api, { User } from '../lib/api'; // Import User type

interface AuthContextProps {
  user: User | null; // Use the User type from api module
  token: string | null;
  login: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { publicKey, signMessage, connected } = useWallet();

  const fetchCurrentUser = useCallback(async (jwtToken: string) => {
    try {
      const fetchedUser = await api.getCurrentUser(jwtToken);
      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      // Clear invalid token/user state
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
    } finally {
        setLoading(false);
    }
  }, []);


  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken); // Fetch user data if token exists
    } else {
      setLoading(false); // No token, not loading
    }
  }, [fetchCurrentUser]);


  const login = useCallback(async () => {
    if (!publicKey || !signMessage || !connected) {
      console.error("Wallet not connected or signMessage not available");
      return;
    }

    setLoading(true);
    try {
      // 1. Backend should provide a challenge message (or generate client-side, less secure)
      const message = `Please sign this message to log in to MediCrypt: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);

      // 2. Sign the message
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // 3. Send to backend for verification and JWT generation
      const response = await api.login({
        walletAddress: publicKey.toBase58(),
        signature: signature,
        message: message,
      });

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('authToken', response.token); // Persist token
      } else {
         // Handle login failure (e.g., user not found - prompt signup?)
         console.error("Login failed:", response.error || "Unknown error");
         // Maybe redirect to signup or show error
      }

    } catch (error: unknown) {
      console.error("Login error:", error);
      // Handle specific errors (e.g., user rejected signature)
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage, connected]); // Remove fetchCurrentUser as it's not used in the login function

  const logout = useCallback(() => {
    setLoading(true);
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    // Consider disconnecting the wallet as well if desired
    // disconnect();
    setLoading(false);
     // Redirect to login page
    window.location.href = '/'; // Or use Next router
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};