import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM redes ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch {
      res.status(500).json({ error: 'Error al obtener los enlaces de redes sociales' });
    }
  } else if (req.method === 'POST') {
    const { url, titulo } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL requerida' });
      return;
    }
    try {
      const result = await pool.query(
        'INSERT INTO redes (url, titulo) VALUES ($1, $2) RETURNING *',
        [url, titulo || '']
      );
      res.status(200).json(result.rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al guardar el enlace' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: 'ID requerido' });
      return;
    }
    try {
      await pool.query('DELETE FROM redes WHERE id = $1', [id]);
      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar el enlace' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 