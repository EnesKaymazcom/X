"use client"

import { useRef, useEffect, useState } from "react"

const VECTOR_X_PATHS = [
  "M717.78,819.87c-11.02.75-18.03-5.92-25.03-12.93-51.16-51.2-102.36-102.37-153.63-153.45-21.83-21.75-32.38-21.66-54.24.08-21.06,20.95-41.97,42.06-63.09,62.95-14.87,14.7-30.68,16.01-42.62,3.9-11.64-11.81-10.14-28.25,4.29-42.72,35.08-35.18,70.22-70.3,105.48-105.3,16.45-16.32,29.7-16.38,46.09-.06,66.21,65.91,132.26,131.99,198.48,197.89,9.73,9.68,14.23,20.5,8.48,33.57-4.49,10.22-12.98,15.51-24.2,16.07Z",
  "M820.54,307.25c.4,11.01-6.52,17.92-13.47,24.86-50.49,50.34-101.02,100.64-151.43,151.06-24.26,24.26-24.22,33.46-.17,57.52,20.62,20.63,41.41,41.09,61.92,61.83,14.52,14.69,15.44,30.76,2.92,42.54-11.82,11.11-27.62,9.74-41.51-4.04-35.66-35.36-71.28-70.76-106.71-106.36-15.51-15.58-15.63-29.6-.27-44.98,66.39-66.49,132.99-132.77,199.43-199.2,9.23-9.23,19.6-13.43,32.24-8.37,11.23,4.49,16.27,13.51,17.07,25.15Z",
  "M652.54,324.82c.28,7.58-4.32,14.02-10.22,19.9-36.28,36.16-72.41,72.49-108.87,108.48-14.49,14.29-28.2,14.5-42.51.3-67.34-66.86-134.49-133.92-201.51-201.1-12.85-12.88-13.17-29.01-1.89-40.23,11.6-11.54,27.85-10.82,41.45,2.69,51.65,51.33,103.06,102.89,154.63,154.3,23.56,23.49,33.16,23.52,56.43.41,21.82-21.66,43.47-43.49,65.33-65.1,8.82-8.72,19.2-11.84,31.03-6.51,10.95,4.93,16.3,13.6,16.13,26.86Z",
  "M229.27,744.09c-9.77-.56-18.73-5.66-23.43-16.76-5.01-11.84-1.9-22.18,6.91-31.01,28.62-28.67,57.32-57.26,85.97-85.89,25.22-25.19,50.54-50.28,75.58-75.64,16.28-16.48,16.16-29.17-.34-45.89-22-22.29-44.38-44.22-66.42-66.47-14.97-15.11-16.49-30.38-4.7-42.61,11.89-12.33,28.49-10.66,43.81,4.58,34.45,34.28,68.89,68.57,103.24,102.95,18.49,18.51,18.41,31.04-.11,49.53-64.98,64.86-130.03,129.65-194.93,194.58-6.69,6.7-13.55,12.41-25.58,12.63Z",
]

const VECTOR_X_VIEWBOX = { width: 1024, height: 1024 }

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const isTouchingRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setIsMobile(window.innerWidth < 768)
    }

    updateCanvasSize()

    let particles: {
      x: number
      y: number
      baseX: number
      baseY: number
      size: number
      color: string
      scatteredColor: string
      life: number
    }[] = []

    let textImageData: ImageData | null = null

    function createTextImage() {
      if (!ctx || !canvas) return 0

      ctx.save()

      const logoSize = isMobile ? 220 : 300
      const scale = logoSize / VECTOR_X_VIEWBOX.width

      // Center the logo
      ctx.translate(
        canvas.width / 2 - (VECTOR_X_VIEWBOX.width * scale) / 2,
        canvas.height / 2 - (VECTOR_X_VIEWBOX.height * scale) / 2,
      )

      ctx.scale(scale, scale)

      // Draw the white circular background first
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(512, 512, 512, 0, Math.PI * 2)
      ctx.fill()

      // Draw the black logo paths on top
      ctx.fillStyle = "black"
      VECTOR_X_PATHS.forEach((pathData) => {
        const path = new Path2D(pathData)
        ctx.fill(path)
      })

      ctx.restore()

      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      return scale
    }

    // Also update the particle colors to be more visible
    function createParticle(scale: number) {
      if (!ctx || !canvas || !textImageData) return null

      const data = textImageData.data

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width)
        const y = Math.floor(Math.random() * canvas.height)

        if (data[(y * canvas.width + x) * 4 + 3] > 128) {
          const r = data[(y * canvas.width + x) * 4]
          const g = data[(y * canvas.width + x) * 4 + 1]
          const b = data[(y * canvas.width + x) * 4 + 2]
          const isLogoPart = r < 128 && g < 128 && b < 128
          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * 1.5 + 0.5,
            color: isLogoPart ? "black" : "#ffffff",
            scatteredColor: "#ffffff",
            life: Math.random() * 100 + 50,
          }
        }
      }

      return null
    }

    function createInitialParticles(scale: number) {
      const baseParticleCount = 5000
      const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)))
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle(scale)
        if (particle) particles.push(particle)
      }
    }

    let animationFrameId: number

    // Update the animate function to use the particle's individual color
    function animate(scale: number) {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const { x: mouseX, y: mouseY } = mousePositionRef.current
      const maxDistance = 40

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance && (isTouchingRef.current || !("ontouchstart" in window))) {
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          const moveX = Math.cos(angle) * force * 25
          const moveY = Math.sin(angle) * force * 25
          p.x = p.baseX - moveX
          p.y = p.baseY - moveY

          ctx.fillStyle = p.scatteredColor
        } else {
          p.x += (p.baseX - p.x) * 0.08
          p.y += (p.baseY - p.y) * 0.08
          ctx.fillStyle = p.color // Use the particle's original color
        }

        ctx.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const newParticle = createParticle(scale)
          if (newParticle) {
            particles[i] = newParticle
          } else {
            particles.splice(i, 1)
            i--
          }
        }
      }

      const baseParticleCount = 5000
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
      )
      while (particles.length < targetParticleCount) {
        const newParticle = createParticle(scale)
        if (newParticle) particles.push(newParticle)
      }

      animationFrameId = requestAnimationFrame(() => animate(scale))
    }

    const scale = createTextImage()
    createInitialParticles(scale)
    animate(scale)

    const handleResize = () => {
      updateCanvasSize()
      const newScale = createTextImage()
      particles = []
      createInitialParticles(newScale)
    }

    const handleMove = (x: number, y: number) => {
      const rect = canvas.getBoundingClientRect()
      mousePositionRef.current = {
        x: x - rect.left,
        y: y - rect.top
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleTouchStart = () => {
      isTouchingRef.current = true
    }

    const handleTouchEnd = () => {
      isTouchingRef.current = false
      mousePositionRef.current = { x: 0, y: 0 }
    }

    const handleMouseLeave = () => {
      if (!("ontouchstart" in window)) {
        mousePositionRef.current = { x: 0, y: 0 }
      }
    }

    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0 touch-none"
        aria-label="Interactive particle effect with Vector X logo"
      />
      <div className="absolute bottom-[100px] text-center z-10">
        <p className="font-mono text-gray-400 text-xs sm:text-base md:text-sm">
          Explore the future with{" "}
          <a
            href="https://vectorx.co.uk"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
            rel="noreferrer"
          >
            vectorx.co.uk
          </a>
          <br />
          <span className="text-gray-500 text-xs mt-2.5 inline-block">Interactive particle logo effect</span>
        </p>
      </div>
    </div>
  )
}