# Configuración del Servidor SSH - AgricolaHorizonte

## Pasos para configurar la base de datos en el servidor

### 1. Conectar al servidor
```bash
ssh usuario@tu-servidor.com
```

### 2. Instalar PostgreSQL
```bash
# Actualizar repositorios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar que esté corriendo
sudo systemctl status postgresql
```

### 3. Configurar PostgreSQL
```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Crear la base de datos
CREATE DATABASE Agricolahorizonte;

# Crear usuario para la aplicación
CREATE USER agricola_user WITH PASSWORD 'tu_contraseña_segura';

# Dar permisos completos al usuario
GRANT ALL PRIVILEGES ON DATABASE Agricolahorizonte TO agricola_user;
GRANT ALL ON SCHEMA public TO agricola_user;

# Salir de psql
\q
```

### 4. Clonar el proyecto
```bash
# Navegar al directorio donde quieres el proyecto
cd /var/www/
# O
cd /home/usuario/

# Clonar el repositorio
git clone https://github.com/tu-usuario/AgricolaHorizonte.git
cd AgricolaHorizonte
```

### 5. Configurar variables de entorno
```bash
# Crear archivo .env
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

### 6. Instalar dependencias e inicializar
```bash
# Instalar Node.js si no está instalado
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar dependencias
npm install

# Inicializar la base de datos
npm run init-db
```

### 7. Configurar PM2
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar la aplicación
pm2 start npm --name "agricolahorizonte" -- start

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar con el sistema
pm2 startup
# Seguir las instrucciones que aparecen
```

### 8. Configurar Nginx (si no está configurado)
```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/agricolahorizonte
```

Contenido de la configuración:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/agricolahorizonte /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 9. Configurar firewall
```bash
# Permitir puertos necesarios
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 10. Verificar todo
```bash
# Verificar que la aplicación esté corriendo
pm2 status

# Verificar logs
pm2 logs agricolahorizonte

# Verificar base de datos
sudo -u postgres psql -d Agricolahorizonte -c "SELECT * FROM productos;"
```

## Comandos útiles

### Reiniciar aplicación
```bash
pm2 restart agricolahorizonte
```

### Ver logs en tiempo real
```bash
pm2 logs agricolahorizonte -f
```

### Actualizar desde Git
```bash
git pull origin main
npm install
npm run build
pm2 restart agricolahorizonte
```

### Verificar estado de servicios
```bash
# PostgreSQL
sudo systemctl status postgresql

# Nginx
sudo systemctl status nginx

# PM2
pm2 status
```

## Troubleshooting

### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Reiniciar si es necesario
sudo systemctl restart postgresql

# Verificar configuración
sudo nano /etc/postgresql/*/main/postgresql.conf
```

### Error de permisos
```bash
# Dar permisos a la carpeta del proyecto
sudo chown -R $USER:$USER /ruta/al/proyecto
sudo chmod -R 755 /ruta/al/proyecto

# Dar permisos a uploads
sudo chmod -R 755 public/uploads
```

### Error de puerto en uso
```bash
# Ver qué está usando el puerto 3000
sudo netstat -tlnp | grep :3000

# Matar el proceso si es necesario
sudo kill -9 PID
``` 