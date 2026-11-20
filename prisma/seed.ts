
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial queue data...');

  // Reset existing data
  await prisma.queueItem.deleteMany();
  await prisma.settings.deleteMany();

  // Create Settings
  await prisma.settings.create({
    data: {
      id: '1',
      isOpen: true,
      pin: '1234',
    },
  });

  // Seed sample customers
  const sampleCustomers = [
    {
      tokenNumber: '#A01',
      customerName: 'Rahul Sharma',
      mobileNumber: '+91 9876543210',
      serviceType: 'Haircut',
      status: 'In-Chair',
      notified15Min: true,
    },
    {
      tokenNumber: '#A02',
      customerName: 'Amit Verma',
      mobileNumber: '+91 9812345678',
      serviceType: 'Combo',
      status: 'Waiting',
      notified15Min: true,
    },
    {
      tokenNumber: '#A03',
      customerName: 'Vikram Singh',
      mobileNumber: '+91 9765432109',
      serviceType: 'Beard',
      status: 'Waiting',
      notified15Min: false,
    },
    {
      tokenNumber: '#A04',
      customerName: 'Suresh Kumar',
      mobileNumber: '+91 9988776655',
      serviceType: 'Facial',
      status: 'Waiting',
      notified15Min: false,
    },
  ];

  for (const customer of sampleCustomers) {
    await prisma.queueItem.create({
      data: customer,
    });
  }

  console.log('Database seeded successfully with 4 sample queue tokens!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
