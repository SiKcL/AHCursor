import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function getUserIdFromRequest(req: NextRequest): number | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  try {
    const token = auth.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    return payload.id;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const { productos, direccion_id } = body;
  if (!Array.isArray(productos) || !direccion_id) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }
  try {
    const client = await pool.connect();
    // Insertar pedido
    const result = await client.query(
      'INSERT INTO pedidos (usuario_id, direccion_id, total, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [userId, direccion_id, productos.reduce((sum: number, p: any) => sum + p.precio * p.cantidad, 0)]
    );
    const pedidoId = result.rows[0].id;
    // Insertar productos del pedido
    for (const p of productos) {
      await client.query(
        'INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
        [pedidoId, p.id, p.cantidad, p.precio]
      );
    }
    client.release();
    return NextResponse.json({ success: true, pedidoId });
  } catch (e) {
    return NextResponse.json({ error: 'Error guardando pedido' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const client = await pool.connect();
    // Obtener pedidos del usuario
    const pedidosRes = await client.query('SELECT id, created_at, total FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC', [userId]);
    const pedidos = pedidosRes.rows;
    // Para cada pedido, obtener productos
    for (const pedido of pedidos) {
      const prodRes = await client.query(
        `SELECT pp.cantidad, pp.precio, p.nombre FROM pedido_productos pp JOIN productos p ON pp.producto_id = p.id WHERE pp.pedido_id = $1`,
        [pedido.id]
      );
      pedido.productos = prodRes.rows;
    }
    client.release();
    return NextResponse.json(pedidos);
  } catch (e) {
    return NextResponse.json({ error: 'Error obteniendo pedidos' }, { status: 500 });
  }
} 