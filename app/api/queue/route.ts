
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { customerName, mobileNumber, serviceType } = await req.json();

  const count = await prisma.queueItem.count({ where: { status: 'Waiting' } });
  const tokenNumber = `#A${String(count + 1).padStart(2, '0')}`;

  const item = await prisma.queueItem.create({
    data: {
      customerName,
      mobileNumber,
      serviceType,
      tokenNumber,
    },
  });

  return NextResponse.json(item);
}
