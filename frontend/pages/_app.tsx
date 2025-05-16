// pages/_app.tsx
import React, { useMemo } from 'react';
import { AppProps } from 'next/app';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'; // Add other wallets as needed
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { AuthProvider } from '../context/AuthContext'; // Your Auth Context
import { SolanaProvider } from '../context/SolanaContext'; // Your Solana Context
import Layout from '../components/Layout';

require('@solana/wallet-adapter-react-ui/styles.css'); // Default styles

function MyApp({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet; // Or Mainnet-beta, Testnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Add other wallet adapters (Solflare, Ledger, etc.) here
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider> {/* Manages JWT, user state */}
            <SolanaProvider> {/* Manages Anchor program instance, connection */}
              <Layout> {/* Your app layout */}
                <Component {...pageProps} />
              </Layout>
            </SolanaProvider>
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;