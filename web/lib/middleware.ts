import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// In a real app, use a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export type NextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> | void;

export type AuthenticatedRequest = NextApiRequest & {
  user: {
    id: string;
    walletAddress: string;
  };
};

// Middleware to verify JWT and extract user information
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get the auth token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization token' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; walletAddress: string };
      
      // Add user info to the request object
      (req as AuthenticatedRequest).user = {
        id: decoded.sub,
        walletAddress: decoded.walletAddress,
      };

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      if ((error as Error).name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if ((error as Error).name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
} 