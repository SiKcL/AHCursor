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
            Somos Agrícola Horizonte Spa, una empresa que se dedica a la producción de hortalizas en la zona rural de Melipilla, Chile.  Si bien nuestra formalización data de 2022, somos herederos de un legado de generaciones dedicadas al campo, con un conocimiento transmitido con profundo respeto por la naturaleza. Entendemos que la agricultura no es solo un medio de producción, sino una forma de vida que debe ser preservada y fortalecida.<br></br><br></br>
            Con el objetivo de adaptarnos a los desafíos actuales, hemos implementado un enfoque de agricultura sostenible que combina el legado de la agricultura tradicional y agroecológica con las innovaciones modernas de la hidroponía. Esta fusión nos permite maximizar el uso de los espacios disponibles, minimizando el impacto ambiental y garantizando un suministro constante de hortalizas frescas y nutritivas. Nos enorgullece preservar nuestras raíces mientras miramos hacia el futuro, comprometidos con prácticas que benefician tanto a nuestros clientes como al medio ambiente.
            </p>
        </div>
          <br />
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestra misión</h2>
            <p className="text-gray-700 leading-relaxed">
              En Agrícola Horizonte SPA, nos comprometemos a ser líderes en la producción sostenible de hortalizas, asegurando que cada producto que entregamos no solo cumpla con estándares de calidad, sino que también promueva prácticas que protejan el medio ambiente y mejoren la vida de nuestra comunidad. Buscamos inspirar un cambio positivo en la forma en que se produce y consume la agricultura. Creemos que al respetar y cuidar nuestra tierra, no solo preservamos un legado familiar, sino que también aseguramos un futuro próspero para las próximas generaciones.
            </p>
          </div>
    </div>
  );
}