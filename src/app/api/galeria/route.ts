import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM galleryimage ORDER BY createdat DESC');
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { url } = await request.json();
  const result = await pool.query(
    'INSERT INTO galleryimage (url) VALUES ($1) RETURNING *',
    [url]
  );
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await pool.query('DELETE FROM galleryimage WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
} 