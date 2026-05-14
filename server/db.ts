import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __tochkaPrisma?: PrismaClient;
};

export const prisma = globalForPrisma.__tochkaPrisma ?? new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__tochkaPrisma = prisma;
}
