'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'

// عنصر بيميل 3D ورا وقدام حسب مكان الماوس عليه
export default function Tilt({ children, max = 10, radius = 32, glare = true, className = '' }) {
  const ref = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 18 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 18 })
  const gx = useTransform(px, (v) => v * 100)
  const gy = useTransform(py, (v) => v * 100)
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.45), transparent 55%)`

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const reset = () => { px.set(0.5); py.set(0.5) }

  return (
    <div style={{ perspective: 1100 }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', height: '100%', position: 'relative' }}
      >
        {children}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: glareBg, borderRadius: radius, zIndex: 20 }}
          />
        )}
      </motion.div>
    </div>
  )
}
