import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
  const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
  await fs.writeFile(uploadPath, buffer);
  // Devolver la ruta relativa para guardar en la base de datos
  return NextResponse.json({ url: `/uploads/${filename}` });
} 