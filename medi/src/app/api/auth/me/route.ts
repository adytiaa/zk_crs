// /medi/src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

interface AuthenticatedRequest extends NextRequest {
  user?: { userId: string; walletAddress: string; role: string }; // Define the user payload structure
}

// Utility to verify token (in real app, use middleware)
async function verifyAuth(req: AuthenticatedRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; walletAddress: string; role: string };
        return decoded;
    } catch (err) {
        return null;
    }
}


export async function GET(req: AuthenticatedRequest) {
    const userPayload = await verifyAuth(req);

    if (!userPayload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
        where: { id: userPayload.userId },
        });

        if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { ...userResponse } = user;
        return NextResponse.json(userResponse, { status: 200 });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}