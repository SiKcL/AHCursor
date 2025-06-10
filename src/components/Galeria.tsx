'use client'

import React, { MutableRefObject } from "react"
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
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
  })
  const [thumbnailRef] = useKeenSlider<HTMLDivElement>(
    {
      initial: 0,
      slides: {
        perView: 4,
        spacing: 10,
      },
    },
    [ThumbnailPlugin(instanceRef)]
  )

  return (
    <>
      <div ref={sliderRef} className="keen-slider">
        <div className="keen-slider__slide number-slide1">
            <Image
              src="/Prod1.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide2">
        <Image
              src="/Prod2.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide3">
        <Image
              src="/Prod3.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide4">
        <Image
              src="/Prod4.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide5">
        <Image
              src="/Prod5.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide6">
        <Image
              src="/Burg.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
      </div>
      <b/>
      <div ref={thumbnailRef} className="keen-slider thumbnail">
        <div className="keen-slider__slide number-slide1">
        <Image
              src="/Prod2.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide2">
        <Image
              src="/Prod3.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide3">
        <Image
              src="/Prod4.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide4">
        <Image
              src="/Prod5.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide5">
        <Image
              src="/Prod1.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
        <div className="keen-slider__slide number-slide6">
        <Image
              src="/Burg.jpg"
                alt="Imagen 1"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>
      </div>
    </>
  )
}