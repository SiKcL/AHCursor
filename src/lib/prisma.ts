// Archivo: src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Declaramos una variable global para el cliente de Prisma
// para evitar crear múltiples conexiones en desarrollo.
declare global {
  var prisma: PrismaClient | undefined;
}

// Si ya existe una instancia de prisma, la usamos.
// Si no, creamos una nueva.
// 'globalThis.prisma' no se ve afectado por el Hot Reload de Next.js.
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;