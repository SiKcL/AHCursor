import React from 'react'; 
import Galeria from '@/components/Galeria';

export default function GaleriaPage() { 
  return (
    <div>
      <section className="relative w-full flex items-center justify-center bg-green-100 text-center py-20 md:py-32 lg:py-48 overflow-hidden min-h-[400px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/fondovideo.mp4"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
          Nuestra Galería 📸
          </h1>
          <p className="mt-4 text-gray-200 text-lg md:text-xl max-w-xl mx-auto">
          Aquí puedes explorar nuestras obras y creaciones.
          </p>
        </div>
      </section>
      <br />  
      <section className="py-12 md:py-16 bg-white"> {/* Contenedor para el componente Galeria */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Explora Nuestra Galeria
          </h2>
          <Galeria /> {/* Tu componente Galeria */}
        </div>
      </section>
    </div>
  );
}