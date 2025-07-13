import { Pool } from 'pg';

// Configuración de la base de datos según el entorno
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  // Configuración por defecto para desarrollo local
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Agricolahorizonte',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
};

const pool = new Pool(getDatabaseConfig());

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
};

// Función para inicializar las tablas
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Crear tabla de productos si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2),
        imagen VARCHAR(500),
        categoria VARCHAR(100),
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de galería si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255),
        descripcion TEXT,
        imagen VARCHAR(500) NOT NULL,
        categoria VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de usuarios si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100),
        rut VARCHAR(20),
        fecha_nacimiento DATE,
        email VARCHAR(255) UNIQUE NOT NULL,
        telefono VARCHAR(30),
        password_hash VARCHAR(255) NOT NULL,
        factura BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de direcciones si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS direcciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        region VARCHAR(100),
        comuna VARCHAR(100),
        calle VARCHAR(255),
        numero VARCHAR(20),
        depto_oficina VARCHAR(100),
        nombre_recibe VARCHAR(100),
        apellido_recibe VARCHAR(100),
        telefono_recibe VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de pedidos si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        direccion_id INTEGER REFERENCES direcciones(id) ON DELETE SET NULL,
        estado VARCHAR(50) DEFAULT 'pendiente',
        total DECIMAL(10,2),
        detalles JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Base de datos inicializada correctamente');
    client.release();
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  }
};

export default pool; 