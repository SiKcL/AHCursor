import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const uploadDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => !!(mimetype && mimetype.startsWith('image/')),
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al subir la imagen' });
    }
    // Tomar el primer archivo, sin importar el nombre del campo
    const fileField = Object.values(files)[0];
    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    if (!file) {
      return res.status(400).json({ error: 'No se recibió archivo' });
    }
    const filePath = file.filepath || file.path;
    if (!filePath) {
      return res.status(500).json({ error: 'No se pudo determinar la ruta del archivo' });
    }
    const fileName = path.basename(filePath);
    return res.status(200).json({ url: `/${fileName}` });
  });
} 