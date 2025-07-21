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
    const res = await client.query('SELECT rol FROM usuarios WHERE id = $1', [userId]);
    client.release();
    return res.rows.length > 0 && res.rows[0].rol === 'admin';
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
    // Verificar stock suficiente para todos los productos
    for (const p of productos) {
      const res = await client.query('SELECT stock FROM productos WHERE id = $1', [p.id]);
      const stockActual = res.rows[0]?.stock ?? 0;
      if (stockActual < p.cantidad) {
        client.release();
        return NextResponse.json({ error: `Stock insuficiente para el producto ${p.nombre}` }, { status: 400 });
      }
    }
    // Obtener snapshot de la dirección
    const direccionRes = await client.query(
      'SELECT region, comuna, calle, numero, depto_oficina, nombre_recibe, apellido_recibe, telefono_recibe FROM direcciones WHERE id = $1',
      [direccion_id]
    );
    const direccionSnapshot = direccionRes.rows[0] || null;
    // Insertar pedido con snapshot de dirección en detalles
    const result = await client.query(
      'INSERT INTO pedidos (usuario_id, direccion_id, total, detalles, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [
        userId,
        direccion_id,
        productos.reduce((sum: number, p: { precio: number, cantidad: number }) => sum + p.precio * p.cantidad, 0),
        direccionSnapshot ? JSON.stringify(direccionSnapshot) : null
      ]
    );
    const pedidoId = result.rows[0].id;
    // Insertar productos del pedido y descontar stock
    for (const p of productos) {
      await client.query(
        'INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
        [pedidoId, p.id, p.cantidad, p.precio]
      );
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [p.cantidad, p.id]
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
    // Si el nuevo estado es 'cancelado', devolver el stock de los productos
    if (estado === 'cancelado') {
      // Obtener productos del pedido
      const productosRes = await client.query('SELECT producto_id, cantidad FROM pedido_productos WHERE pedido_id = $1', [pedido_id]);
      for (const row of productosRes.rows) {
        await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [row.cantidad, row.producto_id]);
      }
    }
    await client.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, pedido_id]);
    client.release();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error actualizando estado' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!(await isAdminUser(userId))) return NextResponse.json({ error: 'Solo admin puede borrar historial' }, { status: 403 });
  const estado = req.nextUrl.searchParams.get('estado');
  if (!estado || (estado !== 'completado' && estado !== 'cancelado')) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }
  try {
    const client = await pool.connect();
    // Eliminar productos de los pedidos primero (por FK)
    const pedidosRes = await client.query('SELECT id FROM pedidos WHERE estado = $1', [estado]);
    const pedidosIds = pedidosRes.rows.map(r => r.id);
    if (pedidosIds.length > 0) {
      await client.query('DELETE FROM pedido_productos WHERE pedido_id = ANY($1)', [pedidosIds]);
      await client.query('DELETE FROM pedidos WHERE id = ANY($1)', [pedidosIds]);
    }
    client.release();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error borrando historial' }, { status: 500 });
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
      pedidosRes = await client.query(`
        SELECT p.id, p.usuario_id, u.nombre as usuario_nombre, u.apellido as usuario_apellido, d.region, d.comuna, d.calle, d.numero, d.depto_oficina, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe, p.total, p.created_at, p.estado, p.detalles
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN direcciones d ON p.direccion_id = d.id
        ORDER BY p.created_at DESC
      `);
    } else {
      pedidosRes = await client.query(`
        SELECT p.id, p.created_at, p.total, p.estado, d.region, d.comuna, d.calle, d.numero, d.depto_oficina, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe, p.detalles
        FROM pedidos p
        LEFT JOIN direcciones d ON p.direccion_id = d.id
        WHERE p.usuario_id = $1
        ORDER BY p.created_at DESC
      `, [userId]);
    }
    const pedidos = pedidosRes.rows;
    // Para cada pedido, obtener productos y usar snapshot de dirección si existe
    for (const pedido of pedidos) {
      const prodRes = await client.query(
        `SELECT pp.cantidad, pp.precio, p.nombre FROM pedido_productos pp JOIN productos p ON pp.producto_id = p.id WHERE pp.pedido_id = $1`,
        [pedido.id]
      );
      pedido.productos = prodRes.rows;
      // Usar snapshot de dirección si existe
      if (pedido.detalles) {
        try {
          const detalles = typeof pedido.detalles === 'string' ? JSON.parse(pedido.detalles) : pedido.detalles;
          pedido.region = detalles.region;
          pedido.comuna = detalles.comuna;
          pedido.calle = detalles.calle;
          pedido.numero = detalles.numero;
          pedido.depto_oficina = detalles.depto_oficina;
          pedido.nombre_recibe = detalles.nombre_recibe;
          pedido.apellido_recibe = detalles.apellido_recibe;
          pedido.telefono_recibe = detalles.telefono_recibe;
        } catch {}
      }
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