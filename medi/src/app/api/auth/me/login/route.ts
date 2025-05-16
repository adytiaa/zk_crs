// /medi/src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { verifySignature } from '@/lib/solanaAuthUtils'; // You'll need to create this utility

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'; // SET THIS IN .env.local!

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, signature, message } = (await req.json()) as {
      walletAddress: string;
      signature: string; // Base58 encoded signature
      message: string;   // The original message that was signed
    };

    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ error: 'Wallet address, signature, and message are required' }, { status: 400 });
    }

    // 1. Verify the signature
    const isSignatureValid = verifySignature(walletAddress, signature, message);
    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid signature or message' }, { status: 401 });
    }

    // 2. Find user by walletAddress
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found. Please sign up.' }, { status: 404 });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Adjust expiration as needed
    );
    
    const { ...userResponse } = user;

    return NextResponse.json({ message: 'Login successful', token, user: userResponse }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}