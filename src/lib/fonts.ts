import localFont from 'next/font/local'

// Definimos la fuente Avigea y le decimos dónde encontrar el archivo
export const avigea = localFont({
  // La ruta es relativa desde la carpeta raíz del proyecto
  src: '../font/avigea.ttf',
  display: 'swap',
  // La expondremos como una variable CSS para usarla con Tailwind
  variable: '--font-avigea', 
})