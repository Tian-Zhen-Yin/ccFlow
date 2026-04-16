'use client'

import { useEffect, useRef, useState } from 'react'

const TYPING_TEXTS = [
  '用代码构建未来',
  '探索无限可能',
  '创造属于你的数字世界',
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }

    const particles: Particle[] = []
    const count = 80
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(108, 99, 255, 0.6)'
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.2 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  useEffect(() => {
    let textIndex = 0
    let charIndex = 0
    let isDeleting = false
    let timeout: NodeJS.Timeout

    const tick = () => {
      const currentText = TYPING_TEXTS[textIndex]

      if (!isDeleting) {
        setDisplayText(currentText.substring(0, charIndex + 1))
        charIndex++
        if (charIndex === currentText.length) {
          isDeleting = true
          timeout = setTimeout(tick, 2000)
          return
        }
        timeout = setTimeout(tick, 100)
      } else {
        setDisplayText(currentText.substring(0, charIndex - 1))
        charIndex--
        if (charIndex === 0) {
          isDeleting = false
          textIndex = (textIndex + 1) % TYPING_TEXTS.length
          timeout = setTimeout(tick, 500)
          return
        }
        timeout = setTimeout(tick, 50)
      }
    }

    timeout = setTimeout(tick, 1000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
          PangHu
        </h1>
        <p className="text-xl md:text-2xl text-text-primary h-8">
          {displayText}
          <span className="animate-pulse ml-0.5">|</span>
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/projects"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium"
          >
            查看作品
          </a>
          <a
            href="/about"
            className="px-6 py-3 border border-primary text-primary hover:bg-primary-soft rounded-lg transition-colors font-medium"
          >
            了解更多
          </a>
        </div>
      </div>
    </section>
  )
}
