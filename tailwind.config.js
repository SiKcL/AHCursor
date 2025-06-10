// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Elimina 'avigea' de 'extend' y redefínelo directamente en 'theme'
      // Esto hace que la fuente predeterminada 'sans' de Tailwind sea Avigea
      // No necesitas el 'aspectRatio' aquí si ya lo definiste en otro lugar
      // o si ya no lo usas.
    },
    fontFamily: { // <--- AÑADIR/MODIFICAR ESTO DIRECTAMENTE EN 'theme', NO EN 'extend'
      sans: ['Avigea', ...fontFamily.sans], // 'Avigea' será la primera fuente para 'font-sans'
      // Si tenías otras familias de fuentes personalizadas, puedes definirlas aquí también
      // avigea: ['Avigea', ...fontFamily.sans], // <-- No es necesaria si 'sans' es Avigea
    },
    aspectRatio: { // Puedes mover esta sección aquí si la tienes en 'extend'
      '3/4': '3 / 4',
      '9/16': '9 / 16',
    },
  },
  plugins: [],
};