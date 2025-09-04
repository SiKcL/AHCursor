const { Pool } = require('pg');

// Usar la misma configuración que la aplicación
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Agricolahorizonte',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function addExternalIdColumn() {
  let client;
  try {
    console.log('🔄 Conectando a la base de datos...');
    client = await pool.connect();
    console.log('✅ Conexión establecida');
    
    console.log('🔄 Agregando columna external_id a la tabla pedidos...');
    await client.query(`
      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);
    `);
    
    console.log('✅ Columna external_id agregada correctamente');
    
    // Verificar que la columna existe
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos' AND column_name = 'external_id';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación: La columna external_id existe en la tabla pedidos');
    } else {
      console.log('❌ Error: La columna external_id no se encontró');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

addExternalIdColumn();

