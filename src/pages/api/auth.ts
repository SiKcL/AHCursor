import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { action, ...data } = req.body;
    if (action === 'register') {
      // Registro de usuario
      const { nombre, apellido, rut, fecha_nacimiento, email, telefono, password, factura } = data;
      if (!nombre) return res.status(400).json({ error: 'El campo nombre es obligatorio.' });
      if (!email) return res.status(400).json({ error: 'El campo email es obligatorio.' });
      if (!password) return res.status(400).json({ error: 'El campo contraseña es obligatorio.' });
      // Si quieres que fecha_nacimiento sea obligatoria, descomenta:
      // if (!fecha_nacimiento) return res.status(400).json({ error: 'El campo fecha de nacimiento es obligatorio.' });
      try {
        const client = await pool.connect();
        // Verificar si el email ya existe
        const exists = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (exists.rows.length > 0) {
          client.release();
          return res.status(409).json({ error: 'El email ya está registrado.' });
        }
        const hash = await bcrypt.hash(password, 10);
        // Permitir especificar el rol, por defecto 'user'
        const rol = data.rol || 'user';
        const result = await client.query(
          `INSERT INTO usuarios (nombre, apellido, rut, fecha_nacimiento, email, telefono, password_hash, factura, rol)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, nombre, apellido, email, rol` ,
          [nombre, apellido, rut, fecha_nacimiento, email, telefono, hash, !!factura, rol]
        );
        const user = result.rows[0];
        // Guardar datos de facturación si corresponde
        if (factura && data.datos_factura) {
          const f = data.datos_factura;
          await client.query(
            `INSERT INTO facturacion (usuario_id, razon_social, rut, giro, telefono, region, comuna, calle, numero, depto_oficina)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)` ,
            [user.id, f.razon_social, f.rut, f.giro, f.telefono, f.region, f.comuna, f.calle, f.numero, f.depto_oficina || null]
          );
        }
        // Guardar dirección si se envía
        if (data.direccion) {
          const d = data.direccion;
          await client.query(
            `INSERT INTO direcciones (usuario_id, region, comuna, calle, numero, depto_oficina, nombre_recibe, apellido_recibe, telefono_recibe)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)` ,
            [user.id, d.region, d.comuna, d.calle, d.numero, d.depto_oficina || null, d.nombre_recibe || null, d.apellido_recibe || null, d.telefono_recibe || null]
          );
        }
        client.release();
        // Generar token
        const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ user, token });
      } catch {
        return res.status(500).json({ error: 'Error registrando usuario.' });
      }
    } else if (action === 'login') {
      // Login de usuario
      const { email, password } = data;
      if (!email || !password) {
        return res.status(400).json({ error: 'Faltan email o contraseña.' });
      }
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        client.release();
        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        }
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
          return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        }
        // Generar token
        const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '7d' });
        // Actualizar last_login
        const client2 = await pool.connect();
        await client2.query('UPDATE usuarios SET last_login = NOW() WHERE id = $1', [user.id]);
        client2.release();
        // No enviar hash
        delete user.password_hash;
        return res.status(200).json({ user, token });
      } catch {
        return res.status(500).json({ error: 'Error en login.' });
      }
    } else {
      return res.status(400).json({ error: 'Acción no soportada.' });
    }
  } else {
    return res.status(405).json({ error: 'Método no permitido.' });
  }
} 