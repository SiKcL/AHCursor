#!/bin/bash

# Script de despliegue automatizado para AgricolaHorizonte
# Uso: ./scripts/deploy.sh

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de AgricolaHorizonte..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    print_warning "No se encontró archivo .env. Creando uno básico..."
    cat > .env << EOF
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Agricolahorizonte
DB_USER=postgres
DB_PASSWORD=

# Configuración del Servidor
PORT=3000
NODE_ENV=production

# Configuración de Imágenes
UPLOAD_DIR=public/uploads
EOF
    print_warning "Archivo .env creado. Por favor, edítalo con las credenciales correctas."
fi

print_status "Instalando dependencias..."
npm install

print_status "Inicializando base de datos..."
npm run init-db

print_status "Construyendo la aplicación..."
npm run build

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 no está instalado. Instalando..."
    npm install -g pm2
fi

# Verificar si la aplicación ya está corriendo en PM2
if pm2 list | grep -q "agricolahorizonte"; then
    print_status "Reiniciando aplicación en PM2..."
    pm2 restart agricolahorizonte
else
    print_status "Iniciando aplicación en PM2..."
    pm2 start npm --name "agricolahorizonte" -- start
fi

# Guardar configuración de PM2
pm2 save

print_status "Verificando estado de la aplicación..."
pm2 status

print_status "Mostrando logs recientes..."
pm2 logs agricolahorizonte --lines 10

echo ""
print_status "🎉 Despliegue completado exitosamente!"
print_status "La aplicación debería estar disponible en: http://localhost:3000"
print_status "Para ver logs en tiempo real: pm2 logs agricolahorizonte -f"
print_status "Para reiniciar: pm2 restart agricolahorizonte" 