// Ruta: src/app/productos/page.tsx

import prisma from '@/lib/prisma';
import { Product } from '@prisma/client';
import ProductoSlider from '@/components/Productos'; 

async function getProductos() {
  try {
    const productosFromDb = await prisma.producto.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const productos = productosFromDb.map((producto: Product) => ({
      ...producto,
      precio: producto.precio.toNumber(),
    }));

    return productos;
  } catch (error) {
    console.error("No se pudieron obtener los productos:", error);
    return [];
  }
}

export default async function ProductosPage() {
  
  const productos = await getProductos();

  return (
    <div className="bg-gray-100 min-h-screen">
        {/* Sección de encabezado con video de fondo */}
      <section className="relative w-full flex items-center justify-center bg-green-100 text-center py-20 md:py-32 lg:py-48 overflow-hidden min-h-[400px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/fondoproductos.mp4"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
          Nuestros Productos 🥗
          </h1>
          <p className="mt-4 text-gray-200 text-lg md:text-xl max-w-xl mx-auto">
          Frescura y Calidad del campo directamente a tu mesa.
          </p>
        </div>
      </section>

      <main className="w-full py-12 md:py-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {productos.length > 0 ? (
            // Ahora 'productos' contiene solo datos simples y se puede pasar al cliente
            <ProductoSlider productos={productos} />
          ) : (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <p className="text-gray-600">No hay productos disponibles en este momento. ¡Vuelve pronto!</p>
            </div>
          )}

        </section>
      </main>

    </div>
  );
}