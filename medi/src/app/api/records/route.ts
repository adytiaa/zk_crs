// /medi/src/app/api/records/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
// import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
// import { AnchorProvider, Program } from '@coral-xyz/anchor';
// import { Medicrypt, MedicryptIDL, MEDICRYPT_PROGRAM_ID } from '@/anchor'; // Assuming your anchor exports are set up

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

interface AuthenticatedRequest extends NextRequest {
  user?: { userId: string; walletAddress: string; role: string };
}
async function verifyAuth(req: AuthenticatedRequest) { /* ... (same as in /me route) ... */
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) { return null; }
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; walletAddress: string; role: string };
    } catch (err) { return null; }
}


// Placeholder for Solana interaction logic
// In a real app, this would involve:
// 1. Setting up a Connection and AnchorProvider with a payer keypair (backend wallet)
// 2. Constructing the transaction to call `register_record` on the Medicrypt program
// 3. Signing and sending the transaction
async function registerRecordOnChain(
    ownerWalletAddress: string,
    cid: string,
    encryptedDataHash: string,
    fileName: string,
    ownerEncryptedSymmetricKey: string
): Promise<{ success: boolean, recordPda?: string, error?: string, transactionSignature?: string }> {
    console.log(`Simulating on-chain registration for CID: ${cid} by owner: ${ownerWalletAddress}`);
    // const connection = new Connection(process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899', 'confirmed');
    // const payer = Keypair.fromSecretKey(bs58.decode(process.env.BACKEND_PAYER_SECRET_KEY!)); // Load from env
    // const provider = new AnchorProvider(connection, new NodeWallet(payer), { commitment: 'confirmed' });
    // const program = new Program<Medicrypt>(MedicryptIDL as Medicrypt, MEDICRYPT_PROGRAM_ID, provider);
    // const ownerPubkey = new PublicKey(ownerWalletAddress);
    // const [recordPda, _bump] = PublicKey.findProgramAddressSync(
    //   [Buffer.from("record"), ownerPubkey.toBuffer(), Buffer.from(cid)],
    //   program.programId
    // );
    // try {
    //   const txSignature = await program.methods
    //     .registerRecord(cid, encryptedDataHash, fileName, ownerEncryptedSymmetricKey)
    //     .accounts({
    //       recordMetadata: recordPda,
    //       owner: ownerPubkey,
    //       systemProgram: SystemProgram.programId,
    //     })
    //     // .signers([payer]) // If payer is different from 'owner' account in instruction
    //     .rpc(); // This assumes owner (patient) is signing. If backend pays, owner is just an account.
                  // If owner is the signer, client needs to send a partially signed transaction or sign it fully.
                  // For now, assume backend is just a relayer and owner has signed or will sign.
                  // The current program structure assumes `owner` is a `Signer`.
                  // This API endpoint would need to receive a transaction signed by the patient,
                  // or this backend would need the patient's private key (highly insecure).
                  // Best: Client prepares TX, backend co-signs as payer (if needed), client signs fully and sends.
                  // Simplest (but less secure/flexible): Backend acts as authority (NOT for medical data).

    //   return { success: true, recordPda: recordPda.toBase58(), transactionSignature: txSignature };
    // } catch (e) {
    //   console.error("On-chain registration error:", e);
    //   return { success: false, error: (e as Error).message };
    // }
    // SIMULATION:
    const simulatedPda = `simulated-pda-${Date.now()}`;
    return { success: true, recordPda: simulatedPda, transactionSignature: `sim-tx-${Date.now()}` };
}


export async function POST(req: AuthenticatedRequest) {
  const userPayload = await verifyAuth(req);
  if (!userPayload || userPayload.role !== Role.PATIENT) { // Only patients can create records for themselves
    return NextResponse.json({ error: 'Unauthorized or invalid role' }, { status: 401 });
  }

  try {
    // IMPORTANT: For file uploads, use `multipart/form-data`.
    // Next.js API routes don't handle this natively as easily as Express/Multer.
    // You might need a library or custom parsing if sending actual file data.
    // For this example, we assume JSON payload with metadata (CID comes from client after client-side upload to IPFS).
    const {
        cid,
        fileName,
        encryptedDataHash,
        ownerEncryptedSymmetricKey // Client encrypts symmetric key with their own pubkey
    } = await req.json();

    if (!cid || !fileName || !encryptedDataHash || !ownerEncryptedSymmetricKey) {
      return NextResponse.json({ error: 'Missing required record data (cid, fileName, encryptedDataHash, ownerEncryptedSymmetricKey)' }, { status: 400 });
    }

    // 1. Simulate/Perform on-chain registration
    // The owner for the on-chain record is userPayload.walletAddress
    const onChainResult = await registerRecordOnChain(
        userPayload.walletAddress,
        cid,
        encryptedDataHash,
        fileName,
        ownerEncryptedSymmetricKey
    );

    if (!onChainResult.success || !onChainResult.recordPda) {
      return NextResponse.json({ error: `On-chain registration failed: ${onChainResult.error || 'Unknown error'}` }, { status: 500 });
    }

    // 2. Save metadata to off-chain DB
    const newRecord = await prisma.medicalRecord.create({
      data: {
        ownerId: userPayload.userId,
        recordPda: onChainResult.recordPda,
        cid,
        fileName,
        encryptedDataHash,
        ownerEncryptedSymmetricKey,
        // onChainCreatedAt: new Date() // Ideally from block timestamp via event listener
      },
    });

    return NextResponse.json({ message: 'Record created successfully', record: newRecord, transaction: onChainResult.transactionSignature }, { status: 201 });
  } catch (error) {
    console.error('Create record error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error while creating record' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: AuthenticatedRequest) {
    const userPayload = await verifyAuth(req);
    if (!userPayload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let records;
        if (userPayload.role === Role.PATIENT) {
            // Patient sees their own records
            records = await prisma.medicalRecord.findMany({
                where: { ownerId: userPayload.userId, isOffChainActive: true },
                orderBy: { offChainCreatedAt: 'desc' },
            });
        } else if (userPayload.role === Role.DOCTOR || userPayload.role === Role.RESEARCHER) {
            // Doctors/Researchers see records they have active grants for
            records = await prisma.medicalRecord.findMany({
                where: {
                    accessGrants: {
                        some: {
                            requesterId: userPayload.userId,
                            isOffChainActive: true, // Assuming this mirrors on-chain grant status
                        },
                    },
                    isOffChainActive: true,
                },
                include: {
                    // Optionally include the specific grant info if needed for display
                    accessGrants: {
                        where: { requesterId: userPayload.userId, isOffChainActive: true },
                        select: { grantPda: true, reEncryptedSymmetricKey: true /* other fields */ }
                    }
                },
                orderBy: { offChainCreatedAt: 'desc' },
            });
        } else {
             // Admins might see all, or based on other criteria (not implemented here)
            records = await prisma.medicalRecord.findMany({
                where: { isOffChainActive: true }, // Example: Admin sees all active records
                orderBy: { offChainCreatedAt: 'desc' },
            });
        }
        return NextResponse.json(records, { status: 200 });
    } catch (error) {
        console.error('Get records error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}