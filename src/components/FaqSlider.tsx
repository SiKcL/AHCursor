'use client'

import React, { useState } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

interface FaqItem {
  question: string;
  answer: string;
  backgroundImageUrl: string;
}

export default function FaqSlider({ faqs }: { faqs: FaqItem[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: true, 
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
  })

  return (
    <div className="relative shadow-lg rounded-lg overflow-hidden">
      <div ref={sliderRef} className="keen-slider h-[400px] md:h-[500px]">
        
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="keen-slider__slide bg-cover bg-center"
            style={{ backgroundImage: `url(${faq.backgroundImageUrl})` }}
          >
            {/* Overlay oscuro para mejorar la legibilidad del texto */}
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-4">
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {faq.question}
              </h2>
              {/* Separador decorativo */}
              <div className="w-24 h-px bg-white/50 my-4"></div>
              <p className="text-lg md:text-xl text-gray-200 max-w-3xl">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Flechas de Navegación (reutilizamos el mismo componente Arrow) */}
      {loaded && instanceRef.current && (
        <>
          <Arrow
            left
            onClick={(e) => {
              e.stopPropagation();
              instanceRef.current?.prev();
            }}
          />
          <Arrow
            onClick={(e) => {
              e.stopPropagation();
              instanceRef.current?.next();
            }}
          />
        </>
      )}
    </div>
  )
}

function Arrow(props: {
  left?: boolean
  onClick: (e: any) => void
}) {
  return (
    <svg
      onClick={props.onClick}
      className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 fill-white cursor-pointer transition-opacity hover:opacity-75 ${
        props.left ? "left-4" : "right-4"
      }`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {props.left && (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      )}
      {!props.left && (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  )
}