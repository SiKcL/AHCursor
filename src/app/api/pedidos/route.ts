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

async function isAdminUser(userId: number): Promise<boolean> {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT email FROM usuarios WHERE id = $1', [userId]);
    client.release();
    return res.rows.length > 0 && res.rows[0].email === 'admin@admin.com';
  } catch {
    return false;
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
      [userId, direccion_id, productos.reduce((sum: number, p: { precio: number, cantidad: number }) => sum + p.precio * p.cantidad, 0)]
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
  } catch {
    return NextResponse.json({ error: 'Error guardando pedido' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!(await isAdminUser(userId))) return NextResponse.json({ error: 'Solo admin puede cambiar estado' }, { status: 403 });
  const body = await req.json();
  const { pedido_id, estado } = body;
  if (!pedido_id || !estado) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  try {
    const client = await pool.connect();
    await client.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, pedido_id]);
    client.release();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error actualizando estado' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const isAdmin = req.nextUrl.searchParams.get('admin') === '1' && await isAdminUser(userId);
  try {
    const client = await pool.connect();
    let pedidosRes;
    if (isAdmin) {
      // Obtener todos los pedidos con datos de usuario y dirección
      pedidosRes = await client.query(`
        SELECT p.id, p.usuario_id, u.nombre as usuario_nombre, u.apellido as usuario_apellido, d.region, d.comuna, d.calle, d.numero, d.depto_oficina, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe, p.total, p.created_at, p.estado
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN direcciones d ON p.direccion_id = d.id
        ORDER BY p.created_at DESC
      `);
    } else {
      // Obtener pedidos del usuario con dirección
      pedidosRes = await client.query(`
        SELECT p.id, p.created_at, p.total, p.estado, d.region, d.comuna, d.calle, d.numero, d.depto_oficina, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe
        FROM pedidos p
        LEFT JOIN direcciones d ON p.direccion_id = d.id
        WHERE p.usuario_id = $1
        ORDER BY p.created_at DESC
      `, [userId]);
    }
    const pedidos = pedidosRes.rows;
    // Para cada pedido, obtener productos
    for (const pedido of pedidos) {
      const prodRes = await client.query(
        `SELECT pp.cantidad, pp.precio, p.nombre FROM pedido_productos pp JOIN productos p ON pp.producto_id = p.id WHERE pp.pedido_id = $1`,
        [pedido.id]
      );
      pedido.productos = prodRes.rows;
      if (isAdmin) {
        pedido.direccion = `${pedido.region}, ${pedido.comuna}, ${pedido.calle} #${pedido.numero}${pedido.depto_oficina ? ', ' + pedido.depto_oficina : ''}`;
      }
    }
    client.release();
    return NextResponse.json(pedidos);
  } catch {
    return NextResponse.json({ error: 'Error obteniendo pedidos' }, { status: 500 });
  }
} 