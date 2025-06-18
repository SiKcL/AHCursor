# Proyecto Agrícola Horizonte

Sitio web y plataforma de visualización de productos para Agrícola Horizonte, desarrollado con las últimas tecnologías web para ofrecer una experiencia de usuario moderna y eficiente.

## Tecnologías Utilizadas

- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Componentes de Slider**: Keen Slider
- **Despliegue (Hosting)**: (Ej: Vercel, Netlify, AWS)

---

## Cómo Empezar (Guía de Instalación)

Sigue estos pasos para levantar una copia del proyecto en tu entorno local.

### Prerrequisitos

Asegúrate de tener instalado lo siguiente:
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [pnpm](https://pnpm.io/installation) (o puedes usar `npm` que viene con Node.js)
- Una instancia de [PostgreSQL](https://www.postgresql.org/download/) corriendo en tu máquina.

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd AgricolaHorizonte-main
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar las variables de entorno:**
    Crea un archivo llamado `.env` en la raíz del proyecto. Puedes copiar el contenido de `.env.example` si existe, o añadir la siguiente línea, reemplazando los valores con tus credenciales:
    ```env
    # .env
    DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_DB"
    ```
    *Ejemplo:* `DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/Agricolahorizonte"`

4.  **Sincronizar la Base de Datos:**
    Este comando leerá tu `schema.prisma` y creará las tablas necesarias en tu base de datos.
    ```bash
    npx prisma db push
    ```

5.  **(Opcional) Poblar la base de datos con datos de ejemplo:**
    Si configuraste un script de "seed", ejecútalo para añadir productos y FAQs de prueba.
    ```bash
    npx prisma db seed
    ```

6.  **Correr el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Estructura del Proyecto

Una breve descripción de las carpetas más importantes:

-   `prisma/`: Contiene el esquema de la base de datos (`schema.prisma`) y el script para poblar la base de datos (`seed.ts`).
-   `public/`: Almacena archivos estáticos como imágenes y videos.
-   `src/app/`: Contiene las rutas y páginas de la aplicación, siguiendo la estructura del App Router de Next.js.
-   `src/components/`: Almacena todos los componentes de React reutilizables (ej: `ProductoSlider`, `FaqSlider`, `ProductoModal`).
-   `src/lib/`: Contiene librerías y configuraciones auxiliares, como la instancia del cliente de Prisma (`prisma.ts`).

---

## Componentes Clave

### `ProductoSlider.tsx`
- **Propósito**: Muestra un carrusel interactivo de los productos obtenidos de la base de datos.
- **Props**:
    - `productos`: Un array de objetos `Producto`, donde cada objeto coincide con el modelo de Prisma.

### `ProductoModal.tsx`
- **Propósito**: Muestra una ventana modal con la vista detallada de un producto cuando el usuario hace clic en él.
- **Props**:
    - `producto`: El objeto del producto seleccionado.
    - `onClose`: Una función que se ejecuta para cerrar el modal.

### `FaqSlider.tsx`
- **Propósito**: Muestra un slider a pantalla completa con las preguntas y respuestas frecuentes.
- **Props**:
    - `faqs`: Un array de objetos `FaqItem` que contiene `question`, `answer` y `backgroundImageUrl`.
