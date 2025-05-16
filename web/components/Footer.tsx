import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Footer() {
    return (
      <footer className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-8" src="/logo.png" alt="Logo" />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-8">
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }