import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

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
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    // /api/user?section=profile|orders
    const { section } = req.query;
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
        const result = await client.query('SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC', [userId]);
        client.release();
        return res.status(200).json(result.rows);
      } catch {
        return res.status(500).json({ error: 'Error obteniendo pedidos' });
      }
    } else {
      return res.status(400).json({ error: 'Sección no válida' });
    }
  } else if (req.method === 'PUT') {
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