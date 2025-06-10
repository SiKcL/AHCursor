'use client'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import Image from 'next/image'

export default function CaruselImagenes() {
    const [ref] = useKeenSlider<HTMLDivElement>({
      loop: true,
      rtl: true,
      slides: {
        perView: 3,
        spacing: 10,
      },
    })
    return (
      <div ref={ref} className="keen-slider">
        <div className="keen-slider__slide number-slide1">
            <Image
                src="/Prod1.jpg"
                alt="Imagen 1"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide2">
            <Image
                src="/Prod2.jpg"
                alt="Imagen 2"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide3">
            <Image
                src="/Prod3.jpg"
                alt="Imagen 3"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide4">
            <Image
                src="/Prod4.jpg"
                alt="Imagen 4"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide5">
            <Image
                src="/Prod5.jpg"
                alt="Imagen 5"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide6">
            <Image
                src="/Burg.jpg"
                alt="Imagen 6"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
            />
        </div>
      </div>
    )
  }