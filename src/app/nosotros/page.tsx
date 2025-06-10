import React from 'react';

export default function NosotrosPage() {
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
          Sobre Nosotros 🔍
          </h1>
          <p className="mt-4 text-gray-200 text-lg md:text-xl max-w-xl mx-auto">
          Aquí puedes conocer nuestra vision, misión y valores. Somos una empresa comprometida con la calidad y sostenibilidad de nuestros productos agrícolas.
          </p>
        </div>
      </section>

      
        <br />
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sobre nosotros</h2>
            <p className="text-gray-700 leading-relaxed">
              Agrícola Horizonte es una empresa familiar, dedicada al cultivo de hortalizas tanto hidropónicas como tradicionales. Nos enorgullecemos de cultivar productos limpios y de alta calidad, comprometidos con la sostenibilidad y el cuidado del medio ambiente.
            </p>
        </div>
          <br />
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestra misión</h2>
            <p className="text-gray-700 leading-relaxed">
              AGRICOLA HORIZONTE, Empresa productora de hortalizas tradicionales y en hidroponia, perteneciente a la comuna de MELIPILLA.
            </p>
          </div>


    </div>
  );
}