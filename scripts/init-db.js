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