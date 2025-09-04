"use client";

import { useEffect, useState } from 'react';
import FaqSlider from '@/components/FaqSlider';

interface FaqItem {
  id: number;
  pregunta: string;
  respuesta: string;
  imagen_fondo: string;
  orden: number;
}

export default function PreguntasPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/faqs');
        const data = await res.json();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Datos de respaldo si falla la API
        setFaqs([
          {
            id: 1,
            pregunta: '¿Tengo que desinfectar los productos de Agrícola Horizonte?',
            respuesta: 'No es estrictamente necesario, pero siempre recomendamos un enjuague con agua fría antes de consumir.',
            imagen_fondo: '/faq1.jpg',
            orden: 1
          },
          {
            id: 2,
            pregunta: '¿Cuál es la duración de las lechugas?',
            respuesta: 'Nuestras lechugas se mantienen frescas en el refrigerador entre 5 a 7 días, gracias a nuestro cuidadoso proceso de cultivo.',
            imagen_fondo: '/faq2.jpg',
            orden: 2
          },
          {
            id: 3,
            pregunta: '¿Realizan despachos a todo Santiago?',
            respuesta: 'Actualmente realizamos despachos en la mayoría de las comunas de la Región Metropolitana. Consulta por la tuya al momento de la compra.',
            imagen_fondo: '/faq3.jpg',
            orden: 3
          }
        ]);
      } finally {
        setCargando(false);
      }
    }
    fetchFaqs();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <section className="relative w-full flex items-center justify-center bg-green-100 text-center py-20 md:py-32 lg:py-48 overflow-hidden min-h-[400px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/fondopreguntas.mp4"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Preguntas Frecuentes 🤔🔍
          </h1>
          <p className="mt-4 text-gray-200 text-lg md:text-xl max-w-xl mx-auto">
            Aquí puedes encontrar respuestas a las preguntas más comunes sobre nuestros productos y servicios.
          </p>
        </div>
      </section>

      <main className="w-full bg-[#ff7300]/20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cargando ? (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600">Cargando preguntas frecuentes...</p>
            </div>
          ) : faqs.length > 0 ? (
            <FaqSlider faqs={faqs.map(faq => ({
              question: faq.pregunta,
              answer: faq.respuesta,
              backgroundImageUrl: faq.imagen_fondo
            }))} />
          ) : (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600">No hay preguntas frecuentes disponibles en este momento.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}