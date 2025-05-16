import { createContext, useContext, useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider } from '@project-serum/anchor';
import { Dezi } from '../target/types/dezi';
import idl from '../target/idl/dezi.json';

interface SolanaContextType {
    connection: Connection;
    program: Program<Dezi>;
    provider: Provider;
}

export const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

export const useSolana = () => {
    const context = useContext(SolanaContext);
    if (!context) {
        throw new Error('useSolana must be used within a SolanaProvider');
    }
    return context;
};

export const SolanaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connection, setConnection] = useState<Connection | null>(null);
    const [program, setProgram] = useState<Program<Dezi> | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);

    useEffect(() => {
        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com');
        const provider = new Provider(connection, null, { preflightCommitment: 'confirmed' });
        setConnection(connection);
        setProgram(new Program<Dezi>(idl, programId, provider));
        setProvider(provider);
    }, []);

    return (
        <SolanaContext.Provider value={{ connection, program, provider }}>
            {children}
        </SolanaContext.Provider>
    );
};