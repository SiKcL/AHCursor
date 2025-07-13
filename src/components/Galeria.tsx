'use client'

import React, { MutableRefObject, useEffect, useState } from "react"
import Image from "next/image"
import {
  useKeenSlider,
  KeenSliderPlugin,
  KeenSliderInstance,
} from "keen-slider/react"
import "keen-slider/keen-slider.min.css"

function ThumbnailPlugin(
  mainRef: MutableRefObject<KeenSliderInstance | null>
): KeenSliderPlugin {
  return (slider) => {
    function removeActive() {
      slider.slides.forEach((slide) => {
        slide.classList.remove("active")
      })
    }
    function addActive(idx: number) {
      slider.slides[idx].classList.add("active")
    }

    function addClickEvents() {
      slider.slides.forEach((slide, idx) => {
        slide.addEventListener("click", () => {
          if (mainRef.current) mainRef.current.moveToIdx(idx)
        })
      })
    }

    slider.on("created", () => {
      if (!mainRef.current) return
      addActive(slider.track.details.rel)
      addClickEvents()
      mainRef.current.on("animationStarted", (main) => {
        removeActive()
        const next = main.animator.targetIdx || 0
        addActive(main.track.absToRel(next))
        slider.moveToIdx(Math.min(slider.track.details.maxIdx, next))
      })
    })
  }
}

export default function Galeria() {
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
  });
  const [thumbnailRef] = useKeenSlider<HTMLDivElement>(
    {
      initial: 0,
      slides: {
        perView: 4,
        spacing: 10,
      },
    },
    [ThumbnailPlugin(instanceRef)]
  );

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
    <div className="max-w-4xl mx-auto">
      <div ref={sliderRef} className="keen-slider max-w-3xl mx-auto">
        {imagenes.map((img, idx) => (
          <div className="keen-slider__slide" key={img.id || idx}>
            <Image
              src={img.imagen}
              alt={img.titulo || `Imagen ${idx + 1}`}
              width={600}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
      <br />
      <div ref={thumbnailRef} className="keen-slider thumbnail">
        {imagenes.map((img, idx) => (
          <div className="keen-slider__slide" key={img.id || idx}>
            <Image
              src={img.imagen}
              alt={img.titulo || `Imagen ${idx + 1}`}
              width={600}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}