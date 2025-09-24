"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';

const whatsappNumber = '56997322819';
const defaultMessage = encodeURIComponent('¡Hola! Deseo consultar el precio al por mayor o tengo dudas sobre los productos.');
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

const frases = [
  '¿Necesitas ayuda?',
  '¿Tienes dudas de los productos?',
  '¡Escríbenos por WhatsApp!'
];

export default function WhatsappFloat() {
  const [visible, setVisible] = useState(true);
  const [fraseIdx, setFraseIdx] = useState(0);

  useEffect(() => {
    // Alternar frases cada 3.5 segundos
    const interval = setInterval(() => {
      setFraseIdx(idx => (idx + 1) % frases.length);
    }, 3500);
    // En móvil, ocultar el globo tras 8 segundos
    const timeout = setTimeout(() => {
      if (window.innerWidth < 768) setVisible(false);
    }, 8000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 flex items-end gap-2">
      {/* Globo animado */}
      {visible && (
        <div
          className={
            'whatsapp-float-bubble bg-white text-green-700 font-semibold rounded-xl shadow-lg px-4 py-2 mb-2 mr-1 text-sm border border-green-200 select-none transition-all duration-500 ease-out' +
            ' animate-slidein'
          }
          style={{
            maxWidth: 220,
            whiteSpace: 'pre-line',
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)'
          }}
        >
          {frases[fraseIdx]}
        </div>
      )}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="bg-green-500 rounded-full shadow-lg p-0 hover:scale-110 transition-transform"
        style={{ width: 64, height: 64 }}
      >
        <Image
          src="/wsp.png"
          alt="WhatsApp"
          width={64}
          height={64}
          priority
        />
      </a>
      <style jsx>{`
        @keyframes slidein {
          0% { opacity: 0; transform: translateX(40px) scale(0.95); }
          60% { opacity: 1; transform: translateX(-8px) scale(1.05); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-slidein {
          animation: slidein 0.7s cubic-bezier(.4,1.7,.7,1.01);
        }
      `}</style>
    </div>
  );
} 