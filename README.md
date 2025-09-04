# AgricolaHorizonte

Sitio web para Agricola Horizonte, una empresa especializada en productos hidropónicos y agrícolas.

## 🚀 Características Principales

- **Frontend Moderno**: Next.js 15 y React 19
- **Base de Datos**: PostgreSQL con conexión directa usando `pg`
- **Panel de Administración Completo**: Gestión de productos, pedidos, usuarios y FAQs
- **Sistema de Pedidos Avanzado**: 
  - Pedidos personalizados con descuentos por volumen y generales
  - Edición de pedidos existentes con suma de cantidades
  - Persistencia de IDs externos (WhatsApp)
  - Modales transparentes con fondo difuminado
  - Campos de cantidad editables (botones +/- y escritura directa)
- **Sistema de Descuentos Inteligente**:
  - Descuentos por volumen (mayor cantidad = mayor descuento)
  - Descuentos generales aplicables a productos
  - Cálculo automático de precios con descuentos
- **Gestión de FAQs Dinámica**:
  - Crear, editar y eliminar preguntas frecuentes
  - Subida de imágenes de fondo desde PC
  - Sistema de ordenamiento automático
  - Interfaz de administración intuitiva
- **Sistema de Búsqueda Avanzado**:
  - Búsqueda en tiempo real en página de productos
  - Búsqueda en panel de administración de productos
  - Filtrado por nombre y descripción
  - Contador de resultados en tiempo real
- **Gestión de Usuarios y Pedidos**:
  - Visualización correcta de nombres y direcciones de clientes
  - Estados de pedido: En Proceso, Despachado, Completado
  - Exportación a PDF de reportes de pedidos
- **Flujos Inteligentes**: Redirección según contexto y tipo de usuario
- **Subida de Imágenes**: Sistema para subir y gestionar imágenes locales
- **Diseño Responsivo**: Interfaz moderna con Tailwind CSS
- **Despliegue Automatizado**: Scripts para despliegue en servidor VPS
- **Optimización para Producción**: Corrección de errores de build, ESLint y TypeScript

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- PM2 (para producción)
- Nginx (opcional, para proxy reverso)

## 🛠️ Instalación Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/SiKcL/AHCursor.git
cd AgricolaHorizonte
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos local
```bash
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
git clone https://github.com/SiKcL/AHCursor.git
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
- `tiene_descuento`: Boolean para indicar si tiene descuentos
- `descuentos`: JSON con descuentos por volumen (ej: {10: 5, 20: 10, 50: 15})
- `descuento_general`: Porcentaje de descuento general aplicable
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### `galeria`
- `id`: Identificador único
- `titulo`: Título de la imagen
- `descripcion`: Descripción de la imagen
- `imagen`: Ruta de la imagen
- `categoria`: Categoría de la imagen
- `created_at`: Fecha de creación

#### `usuarios`
- `id`: Identificador único
- `email`: Correo electrónico
- `password`: Contraseña hasheada
- `nombre`: Nombre del usuario
- `direccion`: Dirección principal (opcional)
- `rol`: 'admin' o 'usuario'

#### `pedidos`
- `id`: Identificador único
- `usuario_id`: Usuario que realizó el pedido (null para pedidos personalizados)
- `direccion_id`: Dirección de entrega usada
- `estado`: Estado del pedido (En Proceso, Despachado, Completado)
- `productos`: Lista de productos y cantidades
- `total`: Total del pedido con descuentos aplicados
- `detalles`: JSON con información del cliente (nombre, apellido, dirección)
- `external_id`: ID externo para pedidos de WhatsApp
- `created_at`: Fecha de creación

#### `direcciones`
- `id`: Identificador único
- `usuario_id`: Usuario dueño de la dirección
- `direccion`: Texto de la dirección

#### `faqs`
- `id`: Identificador único
- `pregunta`: Pregunta frecuente
- `respuesta`: Respuesta a la pregunta
- `imagen_fondo`: Ruta de la imagen de fondo (opcional)
- `orden`: Orden de visualización
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

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

### Pedidos
- `GET /api/pedidos`: Obtener pedidos (admin ve todos, usuario ve los suyos)
- `POST /api/pedidos`: Crear nuevo pedido (incluye pedidos personalizados)
- `PUT /api/pedidos/[id]`: Actualizar pedido (cambiar estado, editar productos, actualizar external_id)

### FAQs
- `GET /api/faqs`: Obtener todas las preguntas frecuentes ordenadas
- `POST /api/faqs`: Crear nueva pregunta frecuente
- `PUT /api/faqs/[id]`: Actualizar pregunta frecuente
- `DELETE /api/faqs/[id]`: Eliminar pregunta frecuente

### Subida de Archivos
- `POST /api/upload`: Subir imagen al servidor (productos, galería, FAQs)

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

## 📦 Flujos y Experiencia de Usuario

### 🛒 Flujo de Compra
- **Carrito y Checkout**: El usuario debe iniciar sesión o registrarse antes de comprar. Puede agregar una dirección en el checkout, que se guarda como principal y se asocia al pedido.
- **Sistema de Descuentos**: Los descuentos se aplican automáticamente según la cantidad comprada y los descuentos configurados por el administrador.
- **Búsqueda de Productos**: Búsqueda en tiempo real por nombre o descripción en la página de productos.

### 👤 Gestión de Usuarios
- **Registro e Inicio de Sesión**: El registro solo guarda dirección si el usuario la ingresa. Tras login/registro, el usuario es redirigido al checkout (si venía del carrito) o a su perfil.
- **Perfil de Usuario**: Visualización de todos los pedidos, estado y dirección de entrega.

### 🔧 Panel de Administración
- **Gestión Completa**: Solo el admin (admin@admin.com) puede acceder al panel completo.
- **Gestión de Productos**: 
  - Crear, editar y eliminar productos
  - Configurar descuentos por volumen y generales
  - Búsqueda avanzada de productos
  - Control de stock
- **Gestión de Pedidos**:
  - Crear pedidos personalizados con información del cliente
  - Editar pedidos existentes (sumar cantidades, no duplicar)
  - Cambiar estado de pedidos
  - Persistir IDs externos (WhatsApp)
  - Exportar reportes en PDF
- **Gestión de FAQs**:
  - Crear, editar y eliminar preguntas frecuentes
  - Subir imágenes de fondo desde PC
  - Ordenamiento automático
- **Gestión de Usuarios**: Visualización y administración de usuarios registrados

### 📊 Características Avanzadas
- **Modales Intuitivos**: Fondo transparente con blur para mejor experiencia visual
- **Campos Editables**: Cantidades editables tanto con botones +/- como escritura directa
- **Búsqueda Inteligente**: Filtrado en tiempo real con contador de resultados
- **Exportación a PDF**: El admin puede descargar tablas de pedidos activos o completados para respaldo
- **Redirecciones Inteligentes**: El admin es redirigido automáticamente al panel de administración tras login
- **Optimización y Producción**: El proyecto está 100% listo para producción, con todos los flujos probados y optimizados

## 🆕 Funcionalidades Recientes Implementadas

### 🎯 Sistema de Descuentos Avanzado
- **Descuentos por Volumen**: Configuración automática de descuentos según cantidad (ej: 10+ unidades = 5% descuento)
- **Descuentos Generales**: Porcentaje de descuento aplicable a productos específicos
- **Cálculo Automático**: Los precios se calculan automáticamente con descuentos aplicados
- **Interfaz Intuitiva**: Configuración fácil desde el panel de administración

### 📝 Gestión de Pedidos Mejorada
- **Pedidos Personalizados**: Creación de pedidos para clientes sin cuenta
- **Edición Inteligente**: Al editar pedidos, las cantidades se suman (no duplican)
- **IDs Externos**: Persistencia de IDs de WhatsApp para pedidos externos
- **Modales Transparentes**: Interfaz moderna con fondo difuminado
- **Campos Editables**: Cantidades editables con botones +/- y escritura directa

### 🔍 Sistema de Búsqueda
- **Búsqueda en Productos**: Filtrado en tiempo real por nombre o descripción
- **Búsqueda en Admin**: Búsqueda avanzada en el panel de administración
- **Contador de Resultados**: Visualización del número de productos encontrados
- **Interfaz Limpia**: Posicionamiento estratégico del buscador

### ❓ Gestión de FAQs
- **CRUD Completo**: Crear, editar y eliminar preguntas frecuentes
- **Subida de Imágenes**: Imágenes de fondo subidas desde PC
- **Ordenamiento Automático**: Sistema inteligente de reordenamiento
- **Interfaz Administrativa**: Panel completo para gestión de FAQs

## 📸 Gestión de Imágenes

El sistema soporta dos tipos de imágenes:
1. **Imágenes locales**: Subidas desde el panel admin, guardadas en `public/uploads/`
2. **URLs externas**: Enlaces directos a imágenes en la web

Las imágenes se eliminan automáticamente del servidor cuando se borra o edita un producto.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto es privado y pertenece a Agricola Horizonte.
