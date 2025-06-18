import FaqSlider from '@/components/FaqSlider';

// ... (la función getProductos no cambia) ...
async function getProductos() {
    // ...
}
const faqData = [
  {
    question: '¿Tengo que desinfectar los productos de Agrícola Horizonte?',
    answer: 'No es estrictamente necesario, pero siempre recomendamos un enjuague con agua fría antes de consumir.',
    backgroundImageUrl: 'faq1.jpg',
  },
  {
    question: '¿Cuál es la duración de las lechugas?',
    answer: 'Nuestras lechugas se mantienen frescas en el refrigerador entre 5 a 7 días, gracias a nuestro cuidadoso proceso de cultivo.',
    backgroundImageUrl: 'faq2.jpg',
  },
  {
    question: '¿Realizan despachos a todo Santiago?',
    answer: 'Actualmente realizamos despachos en la mayoría de las comunas de la Región Metropolitana. Consulta por la tuya al momento de la compra.',
    backgroundImageUrl: 'faq3.jpg',
  }
]

export default async function HomePage() {
  
  const productos = await getProductos();

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
      <main className="w-full bg-[#ff7300]/60 py-16 md:py-24">
        <section className="max-w-7xl mx-auto px-4 sm:px- lg:px-8 mt-16 md:mt-2">
            <FaqSlider faqs={faqData} />
        </section>
      </main>
    </div>
  );
}