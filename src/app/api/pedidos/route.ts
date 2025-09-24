import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// Función para calcular precio correcto con descuentos
function calcularPrecioCorrecto(precioBase: number, cantidad: number, descuentos: { tipo: string; items: { min: number; precio?: number; porcentaje?: number }[] } | null) {
  if (!descuentos) return precioBase;
  
  if (descuentos.tipo === 'general' && descuentos.items.length > 0) {
    const porcentaje = descuentos.items[0]?.porcentaje;
    if (typeof porcentaje === 'number' && !isNaN(porcentaje)) {
      return Math.round(precioBase * (1 - porcentaje / 100));
    }
  }
  
  if (descuentos.tipo === 'por_cantidad') {
    const items = [...descuentos.items].sort((a, b) => b.min - a.min);
    for (const d of items) {
      if (cantidad >= d.min && typeof d.precio === 'number' && !isNaN(d.precio)) {
        return d.precio;
      }
    }
  }
  
  return precioBase;
}

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
  const { productos, direccion_id, estado, external_id, nombre, apellido, telefono, direccion } = body;
  
  // Verificar si es un pedido personalizado (sin direccion_id pero con datos directos)
  const isPersonalizado = !direccion_id && nombre && apellido && telefono && direccion;
  
  if (!Array.isArray(productos) || (!direccion_id && !isPersonalizado)) {
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
    let direccionSnapshot = null;
    let direccionIdToUse = direccion_id;
    
    if (isPersonalizado) {
      // Para pedidos personalizados, crear un snapshot directo
      direccionSnapshot = {
        nombre_recibe: nombre,
        apellido_recibe: apellido,
        telefono_recibe: telefono,
        region: '',
        comuna: '',
        calle: direccion,
        numero: '',
        depto_oficina: ''
      };
      direccionIdToUse = null; // No hay direccion_id para pedidos personalizados
    } else {
      // Obtener snapshot de la dirección existente
    const direccionRes = await client.query(
      'SELECT region, comuna, calle, numero, depto_oficina, nombre_recibe, apellido_recibe, telefono_recibe FROM direcciones WHERE id = $1',
      [direccion_id]
    );
      direccionSnapshot = direccionRes.rows[0] || null;
    }
    
    // Insertar pedido con snapshot de dirección en detalles
    // Guardar external_id dentro de detalles junto con el snapshot de dirección
    const detallesPayload: Record<string, unknown> = direccionSnapshot ? { ...direccionSnapshot } : {};
    if (external_id) detallesPayload.external_id = external_id;
    const detallesJson = Object.keys(detallesPayload).length > 0 ? JSON.stringify(detallesPayload) : null;

    // Recalcular precios correctamente antes de guardar
    let totalCorrecto = 0;
    const productosConPreciosCorregidos = [];
    
    for (const p of productos) {
      // Obtener información completa del producto para recalcular precio
      const productoRes = await client.query('SELECT precio, descuentos FROM productos WHERE id = $1', [p.id]);
      const producto = productoRes.rows[0];
      
      if (producto) {
        const precioCorrecto = calcularPrecioCorrecto(
          producto.precio, 
          p.cantidad, 
          producto.descuentos
        );
        
        productosConPreciosCorregidos.push({
          ...p,
          precio: precioCorrecto
        });
        
        totalCorrecto += precioCorrecto * p.cantidad;
      }
    }

    const result = await client.query(
      'INSERT INTO pedidos (usuario_id, direccion_id, total, detalles, estado, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      [
        isPersonalizado ? null : userId, // Para pedidos personalizados, no asociar a usuario específico
        direccionIdToUse,
        totalCorrecto,
        detallesJson,
        estado || 'pendiente'
      ]
    );
    const pedidoId = result.rows[0].id;
    // Insertar productos del pedido con precios corregidos
    for (const p of productosConPreciosCorregidos) {
      await client.query(
        'INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
        [pedidoId, p.id, p.cantidad, p.precio]
      );
      // Descontar stock siempre
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
  console.log('PUT /api/pedidos - Iniciando...');
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!(await isAdminUser(userId))) return NextResponse.json({ error: 'Solo admin puede cambiar estado' }, { status: 403 });
  const body = await req.json();
  console.log('Body recibido:', body);
  const { pedido_id, estado, nombre, apellido, telefono, direccion, external_id, productos } = body;
  console.log('external_id recibido:', external_id, 'tipo:', typeof external_id);
  
  // Verificar si es edición completa de pedido o solo cambio de estado
  const isEdicionCompleta = nombre && apellido && telefono && direccion && productos;
  
  if (!pedido_id || (!estado && !isEdicionCompleta)) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }
  
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Conexión establecida');
    
    if (isEdicionCompleta) {
      console.log('Iniciando edición completa del pedido...');
      // Edición completa del pedido
      if (!Array.isArray(productos)) {
        client.release();
        return NextResponse.json({ error: 'Productos inválidos' }, { status: 400 });
      }
      
      // Obtener productos actuales del pedido para calcular stock disponible
      const productosActualesRes = await client.query('SELECT producto_id, cantidad FROM pedido_productos WHERE pedido_id = $1', [pedido_id]);
      const stockDisponible: { [key: number]: number } = {};
      
      // Primero, obtener el stock actual de todos los productos
      for (const p of productos) {
        const res = await client.query('SELECT stock FROM productos WHERE id = $1', [p.id]);
        const stockActual = res.rows[0]?.stock ?? 0;
        stockDisponible[p.id] = stockActual;
      }
      
      // Luego, agregar la cantidad que está en el pedido original para cada producto
      for (const row of productosActualesRes.rows) {
        if (stockDisponible[row.producto_id] !== undefined) {
          stockDisponible[row.producto_id] += row.cantidad;
        }
      }
      
      // Verificar stock suficiente para todos los productos
      for (const p of productos) {
        if (stockDisponible[p.id] < p.cantidad) {
          client.release();
          return NextResponse.json({ error: `Stock insuficiente para el producto ${p.nombre}. Disponible: ${stockDisponible[p.id]}, Solicitado: ${p.cantidad}` }, { status: 400 });
        }
      }
      
      // Devolver stock de productos actuales del pedido
      for (const row of productosActualesRes.rows) {
        await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [row.cantidad, row.producto_id]);
      }
      
      // Eliminar productos actuales del pedido
      await client.query('DELETE FROM pedido_productos WHERE pedido_id = $1', [pedido_id]);
      
      // Crear nuevo snapshot de dirección
      const direccionSnapshot = {
        nombre_recibe: nombre,
        apellido_recibe: apellido,
        telefono_recibe: telefono,
        region: '',
        comuna: '',
        calle: direccion,
        numero: '',
        depto_oficina: ''
      };
      
      // Recalcular precios correctamente antes de actualizar
      let totalCorrecto = 0;
      const productosConPreciosCorregidos = [];
      
      for (const p of productos) {
        // Obtener información completa del producto para recalcular precio
        const productoRes = await client.query('SELECT precio, descuentos FROM productos WHERE id = $1', [p.id]);
        const producto = productoRes.rows[0];
        
        if (producto) {
          const precioCorrecto = calcularPrecioCorrecto(
            producto.precio, 
            p.cantidad, 
            producto.descuentos
          );
          
          productosConPreciosCorregidos.push({
            ...p,
            precio: precioCorrecto
          });
          
          totalCorrecto += precioCorrecto * p.cantidad;
        }
      }

      // Actualizar pedido con nuevos datos
      console.log('Actualizando pedido con total:', totalCorrecto, 'external_id:', external_id);
      await client.query(
        'UPDATE pedidos SET total = $1, detalles = $2, external_id = $3 WHERE id = $4',
        [totalCorrecto, JSON.stringify(direccionSnapshot), external_id || '', pedido_id]
      );
      console.log('Pedido actualizado exitosamente');
      
      // Insertar nuevos productos con precios corregidos y descontar stock
      for (const p of productosConPreciosCorregidos) {
        await client.query(
          'INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
          [pedido_id, p.id, p.cantidad, p.precio]
        );
        await client.query(
          'UPDATE productos SET stock = stock - $1 WHERE id = $2',
          [p.cantidad, p.id]
        );
      }
    } else {
      // Solo cambio de estado
    if (estado === 'cancelado') {
      // Obtener productos del pedido
      const productosRes = await client.query('SELECT producto_id, cantidad FROM pedido_productos WHERE pedido_id = $1', [pedido_id]);
      for (const row of productosRes.rows) {
        await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [row.cantidad, row.producto_id]);
      }
    }
    await client.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, pedido_id]);
    }
    
    client.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en PUT /api/pedidos:', error);
    if (client) {
      client.release();
    }
    return NextResponse.json({ error: 'Error actualizando pedido' }, { status: 500 });
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
        SELECT p.id, p.usuario_id, u.nombre as usuario_nombre, u.apellido as usuario_apellido, d.region, d.comuna, d.calle, d.numero, d.depto_oficina, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe, p.total, p.created_at, p.estado, p.detalles, p.external_id
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN direcciones d ON p.direccion_id = d.id
        ORDER BY p.created_at DESC
      `);
    } else {
      pedidosRes = await client.query(`
        SELECT p.id, p.created_at, p.total, p.estado, d.region, d.comuna, d.calle, d.numero, d.depto_oficina, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe, p.detalles, p.external_id
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
        `SELECT pp.producto_id, pp.cantidad, pp.precio, p.nombre FROM pedido_productos pp JOIN productos p ON pp.producto_id = p.id WHERE pp.pedido_id = $1`,
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
          if (detalles.external_id) {
            pedido.external_id = detalles.external_id;
          }
          
          // Para pedidos personalizados (sin usuario_id), usar los datos del snapshot
          if (!pedido.usuario_id && pedido.nombre_recibe && pedido.apellido_recibe) {
            pedido.usuario_nombre = pedido.nombre_recibe;
            pedido.usuario_apellido = pedido.apellido_recibe;
          }
        } catch {}
      }
      if (isAdmin) {
        // Para pedidos personalizados, mostrar solo la dirección
        if (!pedido.region && !pedido.comuna) {
          pedido.direccion = pedido.calle;
        } else {
        pedido.direccion = `${pedido.region}, ${pedido.comuna}, ${pedido.calle} #${pedido.numero}${pedido.depto_oficina ? ', ' + pedido.depto_oficina : ''}`;
        }
      }
    }
    client.release();
    return NextResponse.json(pedidos);
  } catch {
    return NextResponse.json({ error: 'Error obteniendo pedidos' }, { status: 500 });
  }
} 