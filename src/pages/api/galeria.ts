import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

const GALERIA_DIR = path.join(process.cwd(), 'public', 'galeria');
if (!fs.existsSync(GALERIA_DIR)) {
  fs.mkdirSync(GALERIA_DIR, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: false, uploadDir: GALERIA_DIR, keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'Error al procesar la imagen' });
        return;
      }
      let file = files.imagen as formidable.File | formidable.File[] | undefined;
      if (!file) {
        res.status(400).json({ error: 'No se recibió imagen' });
        return;
      }
      if (Array.isArray(file)) file = file[0];
      const fileName = path.basename(file.filepath);
      const imageUrl = `/galeria/${fileName}`;
      try {
        const { titulo = '', descripcion = '', categoria = '' } = fields;
        const result = await pool.query(
          'INSERT INTO galeria (titulo, descripcion, imagen, categoria) VALUES ($1, $2, $3, $4) RETURNING *',
          [titulo, descripcion, imageUrl, categoria]
        );
        res.status(200).json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: 'Error al guardar en la base de datos' });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM galeria ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la galería' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: 'ID requerido' });
      return;
    }
    try {
      const { rows } = await pool.query('SELECT imagen FROM galeria WHERE id = $1', [id]);
      if (rows.length === 0) {
        res.status(404).json({ error: 'Imagen no encontrada' });
        return;
      }
      const imagePath = path.join(process.cwd(), 'public', rows[0].imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      await pool.query('DELETE FROM galeria WHERE id = $1', [id]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 