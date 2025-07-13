import Image from 'next/image';

const whatsappNumber = '56997322819';
const defaultMessage = encodeURIComponent('¡Hola! Deseo consultar el precio al por mayor o tengo dudas sobre los productos.');
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

export default function WhatsappFloat() {
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 bg-green-500 rounded-full shadow-lg p-0 hover:scale-110 transition-transform"
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
  );
} 