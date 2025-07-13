const { Pool } = require('pg');
require('dotenv').config();

const initializeDatabase = async () => {
  // Configuración de la base de datos
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Agricolahorizonte',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };

  console.log('🔧 Inicializando base de datos...');
  console.log('Configuración:', { ...config, password: '***' });

  const pool = new Pool(config);

  try {
    // Probar conexión
    const client = await pool.connect();
    console.log('✅ Conexión establecida correctamente');

    // Crear tabla de productos
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
    console.log('✅ Tabla productos creada/verificada');

    // Crear tabla de galería
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
    console.log('✅ Tabla galeria creada/verificada');

    // Crear tabla de redes sociales
    await client.query(`
      CREATE TABLE IF NOT EXISTS redes (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        titulo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla redes creada/verificada');

    // Crear tabla de usuarios
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
    console.log('✅ Tabla usuarios creada/verificada');

    // Crear tabla de direcciones
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
    console.log('✅ Tabla direcciones creada/verificada');

    // Crear tabla de pedidos
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
    console.log('✅ Tabla pedidos creada/verificada');

    // Crear tabla de facturación
    await client.query(`
      CREATE TABLE IF NOT EXISTS facturacion (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        razon_social VARCHAR(100) NOT NULL,
        rut VARCHAR(20) NOT NULL,
        giro VARCHAR(40) NOT NULL,
        telefono VARCHAR(30) NOT NULL,
        region VARCHAR(100) NOT NULL,
        comuna VARCHAR(100) NOT NULL,
        calle VARCHAR(255) NOT NULL,
        numero VARCHAR(20) NOT NULL,
        depto_oficina VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla facturacion creada/verificada');

    // Eliminar tabla de favoritos (no crear más)

    // Insertar algunos datos de ejemplo
    const productosEjemplo = [
      {
        nombre: 'Producto Ejemplo 1',
        descripcion: 'Descripción del producto ejemplo',
        precio: 29.99,
        imagen: '/Prod1.jpg',
        categoria: 'Hidroponía',
        stock: 10
      },
      {
        nombre: 'Producto Ejemplo 2',
        descripcion: 'Otro producto de ejemplo',
        precio: 49.99,
        imagen: '/Prod2.jpg',
        categoria: 'Sustratos',
        stock: 5
      }
    ];

    for (const producto of productosEjemplo) {
      await client.query(`
        INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, stock)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [producto.nombre, producto.descripcion, producto.precio, producto.imagen, producto.categoria, producto.stock]);
    }
    console.log('✅ Datos de ejemplo insertados');

    client.release();
    await pool.end();
    
    console.log('🎉 Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
  }
};

initializeDatabase(); 