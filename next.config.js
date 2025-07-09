const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.fscl15-1.fna.fbcdn.net',
      },
      // Puedes agregar más patrones aquí si usas otros dominios
    ],
  },
};

module.exports = nextConfig; 