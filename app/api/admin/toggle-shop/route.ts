
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { isOpen } = await req.json();

    const settings = await prisma.settings.upsert({
      where: { id: '1' },
      update: { isOpen },
      create: { id: '1', isOpen, pin: '1234' },
    });

    return NextResponse.json({ success: true, isOpen: settings.isOpen });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update shop status' }, { status: 500 });
  }
}
