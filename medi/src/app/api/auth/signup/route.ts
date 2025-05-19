// /medi/src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, name, email, role } = (await req.json()) as {
      walletAddress: string;
      name?: string;
      email?: string;
      role: Role; // Ensure role is a valid enum member
    };

    if (!walletAddress || !role) {
      return NextResponse.json({ error: 'Wallet address and role are required' }, { status: 400 });
    }

    // Validate role
    if (!Object.values(Role).includes(role)) {
        return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this wallet address already exists' }, { status: 409 });
    }
    
    if (email) {
        const existingEmailUser = await prisma.user.findUnique({ where: { email } });
        if (existingEmailUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }
    }


    const newUser = await prisma.user.create({
      data: {
        walletAddress,
        name,
        email,
        role,
      },
    });

    // Exclude sensitive fields if any for the response
    const { ...userResponse } = newUser;

    return NextResponse.json({ message: 'User registered successfully', user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error during signup' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}