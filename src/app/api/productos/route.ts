import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

function isLocalImage(url: string | null) {
  return url && url.startsWith('/uploads/');
}

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM productos');
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const data = await request.json();
  const { nombre, descripcion, precio, imagen } = data;
  const result = await pool.query(
    'INSERT INTO productos (nombre, descripcion, precio, imagen) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre, descripcion, precio, imagen]
  );
  return NextResponse.json(result.rows[0]);
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, ...rest } = data;
  // Obtener la imagen anterior
  const { rows } = await pool.query('SELECT imagen FROM productos WHERE id = $1', [id]);
  const oldImage = rows[0]?.imagen || null;
  const newImage = rest.imagen;
  // Si la imagen cambió y la anterior era local, eliminarla
  if (oldImage && isLocalImage(oldImage) && oldImage !== newImage) {
    const filePath = path.join(process.cwd(), 'public', oldImage);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  const fields = Object.keys(rest);
  const values = Object.values(rest);
  const setString = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const result = await pool.query(
    `UPDATE productos SET ${setString} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  // Obtener la imagen antes de borrar
  const { rows } = await pool.query('SELECT imagen FROM productos WHERE id = $1', [id]);
  const image = rows[0]?.imagen || null;
  if (image && isLocalImage(image)) {
    const filePath = path.join(process.cwd(), 'public', image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  await pool.query('DELETE FROM productos WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
} 