// /medi/anchor/src/medicrypt-exports.ts
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import MedicryptIDL from '../target/idl/medicrypt.json'; // Adjust path if needed
import type { Medicrypt } from '../target/types/medicrypt'; // Adjust path if needed

export { Medicrypt, MedicryptIDL };

// Use the Program ID from your deployed Medicrypt program
// You get this after `anchor deploy`. It's also in MedicryptIDL.address
export const MEDICRYPT_PROGRAM_ID = new PublicKey(MedicryptIDL.address);

export function getMedicryptProgram(provider: AnchorProvider, address?: PublicKey): Program<Medicrypt> {
  return new Program(
    { ...MedicryptIDL, address: address ? address.toBase58() : MedicryptIDL.address } as Medicrypt,
    provider
  );
}

// Example function if you have different program IDs per cluster
export function getMedicryptProgramId(cluster: Cluster | string) {
  // If you deploy the same program ID to all clusters, this can be simpler
  // For now, assume IDL address is the source of truth
  // In a real scenario, you might have a mapping:
  // switch (cluster) {
  //   case 'devnet':
  //     return new PublicKey('YourDevnetMedicryptProgramID');
  //   case 'mainnet-beta':
  //     return new PublicKey('YourMainnetMedicryptProgramID');
  //   default: // localnet or testnet
  //     return MEDICRYPT_PROGRAM_ID;
  // }
  return MEDICRYPT_PROGRAM_ID;
}