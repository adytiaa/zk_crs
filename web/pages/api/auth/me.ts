import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import db from '../../../lib/db';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user } = req as AuthenticatedRequest;
    
    // In a real app, you would fetch the user from your database
    // using the ID from the token
    const userData = db.getUser(user.walletAddress);
    
    if (!userData) {
      // This shouldn't normally happen if the token is valid,
      // but just in case the user was deleted after the token was issued
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler); 