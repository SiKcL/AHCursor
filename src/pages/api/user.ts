import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function getUserIdFromRequest(req: NextApiRequest): number | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try {
    const token = auth.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    return payload.id;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { section } = req.query;
  // Permitir acceso sin autenticación solo para section=all
  let userId: number | null = null;
  if (section !== 'all') {
    userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
  }

  if (req.method === 'GET') {
    // /api/user?section=profile|orders|facturacion|direcciones
    if (section === 'direcciones') {
      // Obtener direcciones del usuario
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM direcciones WHERE usuario_id = $1 ORDER BY created_at DESC', [userId]);
        client.release();
        return res.status(200).json(result.rows);
      } catch {
        return res.status(500).json({ error: 'Error obteniendo direcciones' });
      }
    }
    if (section === 'facturacion') {
      // Obtener datos de facturación
      try {
        const client = await pool.connect();
        let targetUserId = userId;
        if (req.query.user_id) {
          // Si es admin, permitir consultar por user_id
          const adminCheck = await client.query('SELECT rol FROM usuarios WHERE id = $1', [userId]);
          if (adminCheck.rows.length > 0 && adminCheck.rows[0].rol === 'admin') {
            targetUserId = parseInt(req.query.user_id as string, 10);
          }
        }
        const result = await client.query('SELECT razon_social, rut, giro, telefono, region, comuna, calle, numero, depto_oficina FROM facturacion WHERE usuario_id = $1', [targetUserId]);
        client.release();
        if (result.rows.length === 0) return res.status(200).json(null);
        return res.status(200).json(result.rows[0]);
      } catch {
        return res.status(500).json({ error: 'Error obteniendo datos de facturación' });
      }
    }
    if (section === 'profile') {
      // Obtener perfil
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, nombre, apellido, rut, fecha_nacimiento, email, telefono, factura, created_at FROM usuarios WHERE id = $1', [userId]);
        client.release();
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        return res.status(200).json(result.rows[0]);
      } catch {
        return res.status(500).json({ error: 'Error obteniendo perfil' });
      }
    } else if (section === 'orders') {
      // Obtener pedidos
      try {
        const client = await pool.connect();
        let pedidos;
        // Permitir que el admin consulte pedidos de cualquier usuario
        const requestedUserId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : null;
        let isAdmin = false;
        if (userId) {
          const adminRes = await client.query('SELECT email FROM usuarios WHERE id = $1', [userId]);
          isAdmin = adminRes.rows.length > 0 && adminRes.rows[0].email === 'admin@admin.com';
        }
        if (isAdmin && requestedUserId) {
          pedidos = await client.query('SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC', [requestedUserId]);
        } else {
          pedidos = await client.query('SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC', [userId]);
        }
        const pedidosArr = pedidos.rows;
        // Para cada pedido, obtener productos
        for (const pedido of pedidosArr) {
          const prodRes = await client.query(
            `SELECT pp.cantidad, pp.precio, p.nombre FROM pedido_productos pp JOIN productos p ON pp.producto_id = p.id WHERE pp.pedido_id = $1`,
            [pedido.id]
          );
          pedido.productos = prodRes.rows;
        }
        client.release();
        return res.status(200).json(pedidosArr);
      } catch {
        return res.status(500).json({ error: 'Error obteniendo pedidos' });
      }
    } else if (section === 'favoritos') {
      // Listar productos favoritos del usuario
      try {
        const client = await pool.connect();
        const result = await client.query(`
          SELECT p.* FROM favoritos f
          JOIN productos p ON f.producto_id = p.id
          WHERE f.usuario_id = $1
          ORDER BY f.created_at DESC
        `, [userId]);
        client.release();
        return res.status(200).json(result.rows);
      } catch {
        return res.status(500).json({ error: 'Error obteniendo favoritos' });
      }
    } else if (section === 'all') {
      // Obtener todos los usuarios con resumen de dirección principal y cantidad de pedidos
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, nombre, apellido, rut, email, telefono, factura, rol, last_login FROM usuarios ORDER BY created_at DESC');
        const users = result.rows;
        // Para cada usuario, buscar su dirección principal (la más reciente) y contar pedidos
        for (const u of users) {
          const dirRes = await client.query('SELECT region, comuna, calle, numero FROM direcciones WHERE usuario_id = $1 ORDER BY created_at DESC LIMIT 1', [u.id]);
          u.direccion = dirRes.rows[0] || null;
          const pedidosRes = await client.query('SELECT COUNT(*) FROM pedidos WHERE usuario_id = $1', [u.id]);
          u.pedidos_realizados = parseInt(pedidosRes.rows[0].count, 10);
        }
        client.release();
        return res.status(200).json(users);
      } catch {
        return res.status(500).json({ error: 'Error obteniendo usuarios' });
      }
    } else {
      return res.status(400).json({ error: 'Sección no válida' });
    }
  } else if (req.method === 'POST') {
    // Agregar nueva dirección
    if (req.body.producto_favorito) {
      // Añadir producto a favoritos
      const producto_id = req.body.producto_favorito;
      try {
        const client = await pool.connect();
        await client.query(
          `INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [userId, producto_id]
        );
        client.release();
        return res.status(201).json({ success: true });
      } catch {
        return res.status(500).json({ error: 'Error guardando favorito' });
      }
    }
    const d = req.body;
    try {
      const client = await pool.connect();
      const result = await client.query(
        `INSERT INTO direcciones (usuario_id, region, comuna, calle, numero, depto_oficina, nombre_recibe, apellido_recibe, telefono_recibe)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id` ,
        [userId, d.region, d.comuna, d.calle, d.numero, d.depto_oficina || null, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe]
      );
      client.release();
      return res.status(201).json({ success: true, id: result.rows[0].id });
    } catch {
      return res.status(500).json({ error: 'Error guardando dirección' });
    }
  } else if (req.method === 'DELETE') {
    // Permitir que solo el admin elimine usuarios completos
    const adminId = getUserIdFromRequest(req);
    let adminRol = null;
    if (adminId) {
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT rol FROM usuarios WHERE id = $1', [adminId]);
        client.release();
        if (result.rows.length > 0) {
          adminRol = result.rows[0].rol;
        }
      } catch {}
    }
    // Si se envía user_id, es intento de eliminar usuario completo (solo admin)
    if (req.body.user_id && adminRol === 'admin') {
      const userIdToDelete = req.body.user_id;
      try {
        const client = await pool.connect();
        // Eliminar datos relacionados
        await client.query('DELETE FROM favoritos WHERE usuario_id = $1', [userIdToDelete]);
        await client.query('DELETE FROM pedidos WHERE usuario_id = $1', [userIdToDelete]);
        await client.query('DELETE FROM direcciones WHERE usuario_id = $1', [userIdToDelete]);
        await client.query('DELETE FROM facturacion WHERE usuario_id = $1', [userIdToDelete]);
        // Eliminar usuario
        await client.query('DELETE FROM usuarios WHERE id = $1', [userIdToDelete]);
        client.release();
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        return res.status(500).json({ error: 'Error eliminando usuario', detalle: (err as Error).message });
      }
    }
    // Eliminar dirección por id
    if (req.body.favorito_id) {
      // Quitar producto de favoritos
      const producto_id = req.body.favorito_id;
      try {
        const client = await pool.connect();
        await client.query('DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2', [userId, producto_id]);
        client.release();
        return res.status(200).json({ success: true });
      } catch {
        return res.status(500).json({ error: 'Error eliminando favorito' });
      }
    }
    const { id } = req.body;
    try {
      const client = await pool.connect();
      await client.query('DELETE FROM direcciones WHERE id = $1 AND usuario_id = $2', [id, userId]);
      client.release();
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: 'Error eliminando dirección' });
    }
  } else if (req.method === 'PUT') {
    // Editar dirección existente
    if (req.body.direccion) {
      const d = req.body.direccion;
      try {
        const client = await pool.connect();
        await client.query(
          `UPDATE direcciones SET region=$1, comuna=$2, calle=$3, numero=$4, depto_oficina=$5, nombre_recibe=$6, apellido_recibe=$7, telefono_recibe=$8 WHERE id=$9 AND usuario_id=$10`,
          [d.region, d.comuna, d.calle, d.numero, d.depto_oficina || null, d.nombre_recibe, d.apellido_recibe, d.telefono_recibe, d.id, userId]
        );
        client.release();
        return res.status(200).json({ success: true });
      } catch {
        return res.status(500).json({ error: 'Error actualizando dirección' });
      }
    }
    // Eliminar datos de facturación
    if (req.body.deleteFacturacion) {
      try {
        const client = await pool.connect();
        await client.query('DELETE FROM facturacion WHERE usuario_id = $1', [userId]);
        client.release();
        return res.status(200).json({ success: true });
      } catch {
        return res.status(500).json({ error: 'Error eliminando datos de facturación' });
      }
    }
    // Guardar/actualizar datos de facturación
    if (req.body.facturacion) {
      const f = req.body.facturacion;
      try {
        const client = await pool.connect();
        // Verificar si ya existen datos
        const exists = await client.query('SELECT id FROM facturacion WHERE usuario_id = $1', [userId]);
        if (exists.rows.length > 0) {
          await client.query(
            `UPDATE facturacion SET razon_social=$1, rut=$2, giro=$3, telefono=$4, region=$5, comuna=$6, calle=$7, numero=$8, depto_oficina=$9 WHERE usuario_id=$10`,
            [f.razon_social, f.rut, f.giro, f.telefono, f.region, f.comuna, f.calle, f.numero, f.depto_oficina || null, userId]
          );
        } else {
          await client.query(
            `INSERT INTO facturacion (usuario_id, razon_social, rut, giro, telefono, region, comuna, calle, numero, depto_oficina) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)` ,
            [userId, f.razon_social, f.rut, f.giro, f.telefono, f.region, f.comuna, f.calle, f.numero, f.depto_oficina || null]
          );
        }
        client.release();
        return res.status(200).json({ success: true });
      } catch {
        return res.status(500).json({ error: 'Error guardando datos de facturación' });
      }
    }
    // Cambio de contraseña
    const { oldPassword, newPassword } = req.body;
    if (oldPassword && newPassword) {
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT password_hash FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
          client.release();
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const hash = result.rows[0].password_hash;
        const match = await bcrypt.compare(oldPassword, hash);
        if (!match) {
          client.release();
          return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }
        const newHash = await bcrypt.hash(newPassword, 10);
        await client.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [newHash, userId]);
        client.release();
        return res.status(200).json({ success: true });
      } catch {
        return res.status(500).json({ error: 'Error cambiando la contraseña' });
      }
    }
    // Editar perfil
    const { nombre, apellido, rut, fecha_nacimiento, telefono, factura } = req.body;
    try {
      const client = await pool.connect();
      await client.query(
        `UPDATE usuarios SET nombre=$1, apellido=$2, rut=$3, fecha_nacimiento=$4, telefono=$5, factura=$6 WHERE id=$7`,
        [nombre, apellido, rut, fecha_nacimiento, telefono, !!factura, userId]
      );
      client.release();
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: 'Error actualizando perfil' });
    }
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
} 