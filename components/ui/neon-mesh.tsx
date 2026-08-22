'use client'

import React, { useEffect, useRef, useState, memo } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
  oldX: number
  oldY: number
  oldZ: number
  pinned: boolean
  baseX: number
  baseY: number
  baseZ: number
  projX: number
  projY: number
  projScale: number
}

interface Constraint3D {
  p1: Point3D
  p2: Point3D
  length: number
}

export interface NeonMeshProps {
  title?: string
  subtitle?: string
  description?: string
  className?: string
  variant?: 'landing' | 'audit' | 'screenshot' | 'results' | 'failure'
  interactive?: boolean
}

export const NeonMesh = memo(function NeonMesh({
  className = '',
  variant = 'landing',
  interactive = true,
}: NeonMeshProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let scrollY = 0

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Interactive mouse camera angles & forces
    const mouse = {
      x: -1000,
      y: -1000,
      targetAngleX: 0.15,
      targetAngleY: -0.2,
      angleX: 0.15,
      angleY: -0.2,
      radius: 160,
    }

    let points: Point3D[] = []
    let constraints: Constraint3D[] = []

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width || window.innerWidth
      height = rect.height || window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Safe transform reset to prevent progressive scale multiplication
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initMesh()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || prefersReducedMotion) return
      const rect = container.getBoundingClientRect()
      const rawX = e.clientX - rect.left
      const rawY = e.clientY - rect.top

      mouse.x = rawX
      mouse.y = rawY

      // Subtle 3D camera tilt
      const normX = (rawX / (width || 1) - 0.5) * 2
      const normY = (rawY / (height || 1) - 0.5) * 2
      mouse.targetAngleY = normX * 0.25
      mouse.targetAngleX = -normY * 0.2 + 0.15
    }

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
      mouse.targetAngleX = 0.15
      mouse.targetAngleY = -0.1
    }

    const initMesh = () => {
      points = []
      constraints = []

      // Responsive spacing: denser on desktop, optimized on mobile
      const isMobile = width < 768
      const spacing = isMobile ? 54 : 44
      const cols = Math.ceil((width * 1.15) / spacing) + 1
      const rows = Math.ceil((height * 1.15) / spacing) + 1

      const grid: Point3D[][] = []
      const startX = -(cols * spacing) / 2
      const startY = -(rows * spacing) / 2

      for (let j = 0; j < rows; j++) {
        grid[j] = []
        for (let i = 0; i < cols; i++) {
          const bx = startX + i * spacing
          const by = startY + j * spacing
          const bz = 0

          const isEdge = i === 0 || i === cols - 1 || j === 0 || j === rows - 1

          const p: Point3D = {
            x: bx,
            y: by,
            z: bz,
            oldX: bx,
            oldY: by,
            oldZ: bz,
            pinned: isEdge,
            baseX: bx,
            baseY: by,
            baseZ: bz,
            projX: 0,
            projY: 0,
            projScale: 1,
          }

          points.push(p)
          grid[j][i] = p
        }
      }

      // 3D Grid Springs
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          if (i < cols - 1) {
            constraints.push({
              p1: grid[j][i],
              p2: grid[j][i + 1],
              length: spacing,
            })
          }
          if (j < rows - 1) {
            constraints.push({
              p1: grid[j][i],
              p2: grid[j + 1][i],
              length: spacing,
            })
          }
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    let time = 0

    const render = () => {
      // Step speed adjusted per page variant
      const speed = prefersReducedMotion
        ? 0
        : variant === 'audit'
          ? 0.018
          : variant === 'screenshot'
            ? 0.016
            : 0.012
      time += speed

      // Smooth camera angle interpolation
      mouse.angleX += (mouse.targetAngleX - mouse.angleX) * 0.04
      mouse.angleY += (mouse.targetAngleY - mouse.angleY) * 0.04

      // Subtle scroll parallax
      const scrollTilt = Math.min(scrollY * 0.0003, 0.15)
      const cosX = Math.cos(mouse.angleX + scrollTilt)
      const sinX = Math.sin(mouse.angleX + scrollTilt)
      const cosY = Math.cos(mouse.angleY)
      const sinY = Math.sin(mouse.angleY)

      ctx.clearRect(0, 0, width, height)

      // AUDEXIFY Color System (Restrained dark/charcoal canvas with acid-lime signals)
      const neonLime = '#C7F36B'
      const baseMeshColor =
        variant === 'failure'
          ? '255, 107, 107'
          : variant === 'audit'
            ? '199, 243, 107'
            : '142, 147, 127'

      // Verlet Physics Step with 3D Spatial Wave Dynamics
      if (!prefersReducedMotion) {
        for (let i = 0; i < points.length; i++) {
          const p = points[i]
          if (p.pinned) continue

          const vx = (p.x - p.oldX) * 0.94
          const vy = (p.y - p.oldY) * 0.94
          const vz = (p.z - p.oldZ) * 0.94

          p.oldX = p.x
          p.oldY = p.y
          p.oldZ = p.z

          p.x += vx
          p.y += vy
          p.z += vz

          // Organic 3D wave oscillation along Z
          const ambientZ = Math.sin(p.baseX * 0.012 + p.baseY * 0.012 + time) * 14

          // Anchor Pull Restoration Force
          p.x += (p.baseX - p.x) * 0.035
          p.y += (p.baseY - p.y) * 0.035
          p.z += (p.baseZ + ambientZ - p.z) * 0.035
        }
      }

      // 3D Projection Calculation
      const perspective = 550
      const centerX = width / 2
      const centerY = height / 2

      for (let i = 0; i < points.length; i++) {
        const p = points[i]

        // 3D Y Rotation
        const rx1 = p.x * cosY + p.z * sinY
        const ry1 = p.y
        const rz1 = -p.x * sinY + p.z * cosY

        // 3D X Pitch Rotation
        const rx2 = rx1
        const ry2 = ry1 * cosX - rz1 * sinX
        const rz2 = ry1 * sinX + rz1 * cosX + 420

        // Perspective Scale Factor
        const scale = perspective / Math.max(1, rz2)
        p.projScale = scale
        p.projX = centerX + rx2 * scale
        p.projY = centerY + ry2 * scale

        // Screen-space 3D Interactive Force
        if (!p.pinned && interactive && !prefersReducedMotion) {
          const dx = p.projX - mouse.x
          const dy = p.projY - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 14
            const angle = Math.atan2(dy, dx)
            p.x += (Math.cos(angle) * force) / p.projScale
            p.y += (Math.sin(angle) * force) / p.projScale
            p.z -= (force * 1.2) / p.projScale
          }
        }
      }

      // Iterative Constraint Relaxation
      const iterations = width < 768 ? 2 : 3
      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < constraints.length; i++) {
          const c = constraints[i]
          const dx = c.p2.x - c.p1.x
          const dy = c.p2.y - c.p1.y
          const dz = c.p2.z - c.p1.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          const delta = (dist - c.length) / (dist || 1)

          if (!c.p1.pinned) {
            c.p1.x += dx * 0.5 * delta
            c.p1.y += dy * 0.5 * delta
            c.p1.z += dz * 0.5 * delta
          }
          if (!c.p2.pinned) {
            c.p2.x -= dx * 0.5 * delta
            c.p2.y -= dy * 0.5 * delta
            c.p2.z -= dz * 0.5 * delta
          }
        }
      }

      // Render Elastic 3D Wireframe Mesh
      for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i]
        const midX = (c.p1.projX + c.p2.projX) / 2
        const midY = (c.p1.projY + c.p2.projY) / 2

        const dx = mouse.x - midX
        const dy = mouse.y - midY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const isHot = dist < mouse.radius && interactive
        const avgScale = (c.p1.projScale + c.p2.projScale) / 2

        ctx.strokeStyle = isHot
          ? `rgba(199, 243, 107, ${Math.min(0.65, 0.4 * avgScale)})`
          : `rgba(${baseMeshColor}, ${Math.min(0.2, 0.08 * avgScale)})`
        ctx.lineWidth = isHot ? 1.4 * avgScale : 0.6 * avgScale

        ctx.beginPath()
        ctx.moveTo(c.p1.projX, c.p1.projY)
        ctx.lineTo(c.p2.projX, c.p2.projY)
        ctx.stroke()
      }

      // Render Active Depth Nodes around cursor
      if (interactive && !prefersReducedMotion && mouse.x > 0) {
        for (let i = 0; i < points.length; i++) {
          const p = points[i]
          const dx = mouse.x - p.projX
          const dy = mouse.y - p.projY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 90) {
            ctx.fillStyle = neonLime
            ctx.beginPath()
            ctx.arc(p.projX, p.projY, 1.8 * p.projScale, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [variant, interactive])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-0 select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  )
})

export default NeonMesh
