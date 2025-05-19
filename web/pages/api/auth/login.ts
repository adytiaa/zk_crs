import type { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';
import db from '../../../lib/db';

// In a real app, use a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(walletAddress);

    const isValid = sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Get or create user
    const user = db.getUserOrCreate(walletAddress);

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id,
        walletAddress: user.walletAddress,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 