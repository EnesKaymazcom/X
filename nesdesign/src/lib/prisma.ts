import { PrismaClient } from '@prisma/client';

// PrismaClient global olarak tanımlanır, böylece hot-reload sırasında birden fazla bağlantı oluşturulmaz
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
