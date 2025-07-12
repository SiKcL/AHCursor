# AgricolaHorizonte

Sitio web para Agricola Horizonte, una empresa especializada en productos hidropónicos y agrícolas.

## 🚀 Características

- **Frontend Moderno**: Desarrollado con Next.js 15 y React 19
- **Base de Datos**: PostgreSQL con conexión directa usando `pg`
- **Panel de Administración**: Gestión completa de productos y galería
- **Subida de Imágenes**: Sistema para subir y gestionar imágenes locales
- **Diseño Responsivo**: Interfaz moderna con Tailwind CSS
- **Despliegue Automatizado**: Scripts para despliegue en servidor VPS

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- PM2 (para producción)
- Nginx (opcional, para proxy reverso)

## 🛠️ Instalación Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/AgricolaHorizonte.git
cd AgricolaHorizonte
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos local
```bash
# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 4. Inicializar base de datos
```bash
npm run init-db
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🚀 Despliegue en Servidor

### Configuración Rápida
```bash
# En el servidor SSH
git clone https://github.com/tu-usuario/AgricolaHorizonte.git
cd AgricolaHorizonte
npm install
npm run init-db
npm run build
pm2 start npm --name "agricolahorizonte" -- start
```

### Configuración Completa
Ver archivo `DEPLOYMENT.md` para instrucciones detalladas.

## 📁 Estructura del Proyecto

```
AgricolaHorizonte/
├── src/
│   ├── app/                 # Páginas y API routes de Next.js
│   │   ├── admin/          # Panel de administración
│   │   ├── api/            # Endpoints de la API
│   │   ├── productos/      # Página de productos
│   │   ├── galeria/        # Página de galería
│   │   └── nosotros/       # Página sobre nosotros
│   ├── components/         # Componentes React reutilizables
│   └── lib/               # Utilidades y configuración
├── public/                # Archivos estáticos
│   └── uploads/          # Imágenes subidas por el admin
├── scripts/              # Scripts de automatización
│   ├── init-db.js       # Inicialización de base de datos
│   └── deploy.sh        # Script de despliegue
└── prisma/              # Configuración de Prisma (eliminado)
```

## 🗄️ Base de Datos

### Tablas Principales

#### `productos`
- `id`: Identificador único
- `nombre`: Nombre del producto
- `descripcion`: Descripción detallada
- `precio`: Precio del producto
- `imagen`: Ruta de la imagen
- `categoria`: Categoría del producto
- `stock`: Cantidad disponible
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### `galeria`
- `id`: Identificador único
- `titulo`: Título de la imagen
- `descripcion`: Descripción de la imagen
- `imagen`: Ruta de la imagen
- `categoria`: Categoría de la imagen
- `created_at`: Fecha de creación

## 🔧 Scripts Disponibles

- `npm run dev`: Ejecutar en modo desarrollo
- `npm run build`: Construir para producción
- `npm run start`: Ejecutar en modo producción
- `npm run init-db`: Inicializar base de datos
- `npm run deploy`: Ejecutar script de despliegue (en servidor)

## 🌐 API Endpoints

### Productos
- `GET /api/productos`: Obtener todos los productos
- `POST /api/productos`: Crear nuevo producto
- `PUT /api/productos/[id]`: Actualizar producto
- `DELETE /api/productos/[id]`: Eliminar producto

### Galería
- `GET /api/galeria`: Obtener todas las imágenes
- `POST /api/galeria`: Subir nueva imagen
- `DELETE /api/galeria/[id]`: Eliminar imagen

### Subida de Archivos
- `POST /api/upload`: Subir imagen al servidor

## 🔒 Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Agricolahorizonte
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# Servidor
PORT=3000
NODE_ENV=production

# Imágenes
UPLOAD_DIR=public/uploads
```

## 📸 Gestión de Imágenes

El sistema soporta dos tipos de imágenes:
1. **Imágenes locales**: Subidas desde el panel admin, guardadas en `public/uploads/`
2. **URLs externas**: Enlaces directos a imágenes en la web

Las imágenes se eliminan automáticamente del servidor cuando se borra o edita un producto.

## 🚀 Próximas Características

- [ ] Integración con Webpay para pagos
- [ ] Sistema de usuarios y autenticación
- [ ] Panel de administración mejorado
- [ ] Optimización de imágenes automática
- [ ] Sistema de notificaciones

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto es privado y pertenece a Agricola Horizonte.
