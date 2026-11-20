
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const queue = await prisma.queueItem.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let settings = await prisma.settings.findUnique({ where: { id: '1' } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: '1', isOpen: true, pin: '1234' } });
    }

    return NextResponse.json({ queue, isOpen: settings.isOpen });
  } catch (e) {
    return NextResponse.json({ queue: [], isOpen: true });
  }
}
