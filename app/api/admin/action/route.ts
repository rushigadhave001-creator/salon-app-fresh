
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    const updatedItem = await prisma.queueItem.update({
      where: { id },
      data: { status: action },
    });

    // If a service starts or completes, check remaining waiting customers and trigger 15-min alerts if applicable
    if (action === 'In-Chair' || action === 'Completed') {
      const waitingCustomers = await prisma.queueItem.findMany({
        where: { status: 'Waiting' },
        orderBy: { createdAt: 'asc' },
      });

      // If there are waiting customers, check the first one (or customers whose estimated turn is ~15 mins away)
      // Service average duration is ~15-20 mins. The customer right next in line (position 1) or position 2
      // should get a 15-minute alert if not already notified.
      for (let i = 0; i < waitingCustomers.length; i++) {
        const cust = waitingCustomers[i];
        // Position i+1 in waiting list. If position is 1 or 2, they are 15-30 mins away.
        if ((i === 0 || i === 1) && !cust.notified15Min) {
          await sendNotification(cust.customerName, cust.mobileNumber, '15min_alert', cust.tokenNumber);
          await prisma.queueItem.update({
            where: { id: cust.id },
            data: { notified15Min: true },
          });
        }
      }
    }

    if (action === 'In-Chair') {
      await sendNotification(updatedItem.customerName, updatedItem.mobileNumber, 'turn_now', updatedItem.tokenNumber);
    }

    return NextResponse.json({ success: true, updatedItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
