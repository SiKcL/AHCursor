'use client'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function CaruselImagenes() {
    const [imagenes, setImagenes] = useState<any[]>([]);
    const [ref] = useKeenSlider<HTMLDivElement>({
      loop: true,
      rtl: true,
      slides: {
        perView: 3,
        spacing: 10,
      },
    });

    useEffect(() => {
      fetch('/api/galeria')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setImagenes(data);
        });
    }, []);

    if (!imagenes.length) {
      return <div className="text-center text-gray-500">No hay imágenes en la galería.</div>;
    }

    return (
      <div ref={ref} className="keen-slider">
        {imagenes.map((img, idx) => (
          <div className="keen-slider__slide" key={img.id || idx}>
            <Image
              src={img.imagen}
              alt={img.titulo || `Imagen ${idx + 1}`}
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    );
  }