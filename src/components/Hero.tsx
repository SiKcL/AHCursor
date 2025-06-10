import Image from "next/image";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Carousel from "./Carousel";
import RedesSociales from "./RedesSociales";

export default function Hero() {
  return (
    <div className="flex flex-col w-full">

      {/* Contenido Bienvenido/inicial */}
      <section className="relative w-full flex items-center justify-center bg-green-100 text-center py-20 md:py-32 lg:py-48 overflow-hidden">
        {/* Video fondo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/fondovideo.mp4"
        />

        {/* Fondo oscuro para mejorar lectura */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>

        {/* Contenido */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Cultivando lo Natural 🌿
          </h1>
          <p className="mt-4 text-gray-200 text-lg md:text-xl max-w-xl mx-auto">
            Productos agrícolas saludables, sustentables y hechos con amor desde la tierra chilena.
          </p>
          <button className="mt-6 bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition">
            Conoce nuestros productos
          </button>
        </div>
      </section>


      {/* Galería tipo Carousel */}
      <section className="w-full bg-white py-12 px-6">
        <h2 className="text-2xl font-bold text-center mb-6">Galería de Productos</h2>
        <Carousel />
      </section>
<br />
<br />
      {/* Sección de redes sociales tipo reels */}
      <section className="w-full max-w-7xl mx-auto bg-gray-100 py-12 px-6">
        <RedesSociales />
      </section>

    </div>
  );
}


  