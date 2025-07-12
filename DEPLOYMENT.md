# Guía de Despliegue - AgricolaHorizonte

## Configuración de Base de Datos en el Servidor

### 1. Conectar al servidor SSH
```bash
ssh usuario@tu-servidor.com
```

### 2. Instalar PostgreSQL (si no está instalado)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 3. Configurar PostgreSQL
```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Crear la base de datos
CREATE DATABASE Agricolahorizonte;

# Crear un usuario para la aplicación
CREATE USER agricola_user WITH PASSWORD 'tu_contraseña_segura';

# Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE Agricolahorizonte TO agricola_user;

# Salir de psql
\q
```

### 4. Configurar variables de entorno
Crear archivo `.env` en el servidor:
```bash
# En el directorio del proyecto
nano .env
```

Contenido del archivo `.env`:
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Agricolahorizonte
DB_USER=agricola_user
DB_PASSWORD=tu_contraseña_segura

# Configuración del Servidor
PORT=3000
NODE_ENV=production

# Configuración de Imágenes
UPLOAD_DIR=public/uploads
```

### 5. Inicializar la base de datos
```bash
# Instalar dependencias
npm install

# Ejecutar script de inicialización
npm run init-db
```

### 6. Verificar la conexión
El script debería mostrar:
- ✅ Conexión establecida correctamente
- ✅ Tabla productos creada/verificada
- ✅ Tabla galeria creada/verificada
- ✅ Datos de ejemplo insertados
- 🎉 Base de datos inicializada correctamente

## Despliegue con Git

### 1. Preparar el proyecto local
```bash
# Asegurarse de que todos los cambios estén committeados
git add .
git commit -m "Configuración de base de datos para despliegue"
```

### 2. Subir a Git
```bash
# Si es la primera vez
git remote add origin https://github.com/tu-usuario/AgricolaHorizonte.git
git branch -M main
git push -u origin main

# Para futuras actualizaciones
git push origin main
```

### 3. En el servidor
```bash
# Clonar el repositorio (si es la primera vez)
git clone https://github.com/tu-usuario/AgricolaHorizonte.git
cd AgricolaHorizonte

# O actualizar si ya existe
cd AgricolaHorizonte
git pull origin main
```

### 4. Configurar y ejecutar
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (ver paso 4 arriba)
nano .env

# Inicializar base de datos
npm run init-db

# Construir la aplicación
npm run build

# Reiniciar PM2
pm2 restart agricolahorizonte
# O si es la primera vez
pm2 start npm --name "agricolahorizonte" -- start
```

## Verificación

### 1. Verificar que la aplicación esté corriendo
```bash
pm2 status
pm2 logs agricolahorizonte
```

### 2. Verificar la base de datos
```bash
# Conectar a PostgreSQL
sudo -u postgres psql -d Agricolahorizonte

# Verificar tablas
\dt

# Verificar datos
SELECT * FROM productos;
SELECT * FROM galeria;

# Salir
\q
```

### 3. Verificar el sitio web
Abrir en el navegador: `http://tu-dominio.com`

## Troubleshooting

### Error de conexión a la base de datos
1. Verificar que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
2. Verificar credenciales en `.env`
3. Verificar que el usuario tenga permisos: `sudo -u postgres psql -c "SELECT * FROM pg_user;"`

### Error de permisos
```bash
# Dar permisos de escritura a la carpeta uploads
sudo chown -R www-data:www-data public/uploads
sudo chmod -R 755 public/uploads
```

### Error de puerto en uso
```bash
# Verificar qué está usando el puerto
sudo netstat -tlnp | grep :3000

# Matar el proceso si es necesario
sudo kill -9 PID
``` 