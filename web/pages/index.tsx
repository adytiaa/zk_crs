// pages/index.tsx
import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/api'; // Your custom hook for AuthContext
const LoginPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { login, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async () => {
    if (connected && publicKey) {
      await login();
      // Redirect is handled by the useEffect above
    } else {
      // Prompt user to connect wallet first if needed
      console.log("Please connect your wallet first.");
    }
  };

   // If already authenticated, show loading or redirect message
   if (loading || isAuthenticated) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <h1>Welcome to MediCrypt</h1>
      <p>Securely manage and share your medical records.</p>
      <div>
        <WalletMultiButton /> {/* Connect/Disconnect Button */}
      </div>
      {connected && !isAuthenticated && (
        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login with Wallet Signature'}
        </button>
      )}
      {!connected && (
         <p>Connect your Solana wallet to begin.</p>
      )}
      {/* Add link/button for Signup if user not found during login */}
    </div>
  );
};

  export default LoginPage;