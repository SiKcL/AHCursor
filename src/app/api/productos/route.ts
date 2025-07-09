import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const productos = await prisma.product.findMany();
  return NextResponse.json(productos);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const producto = await prisma.product.create({ data });
  return NextResponse.json(producto);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...rest } = data;
  const producto = await prisma.product.update({ where: { id }, data: rest });
  return NextResponse.json(producto);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  // Buscar el producto para obtener la URL de la imagen
  const producto = await prisma.product.findUnique({ where: { id } });
  if (producto && producto.imageUrl && producto.imageUrl.startsWith('/')) {
    // Es una imagen local, intentar borrar el archivo
    const filePath = path.join(process.cwd(), 'public', producto.imageUrl.replace(/^\//, ''));
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // No hacer nada si falla, solo log opcional
      console.error('No se pudo borrar la imagen local:', e);
    }
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} 