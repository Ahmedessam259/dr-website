'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [on, setOn] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 260, damping: 24, mass: .6 })
  const ry = useSpring(y, { stiffness: 260, damping: 24, mass: .6 })

  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return
    setOn(true)
    const mv = (e) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', mv)
    return () => window.removeEventListener('mousemove', mv)
  }, [x, y])

  if (!on) return null
  return (
    <>
      <motion.div className="fixed z-[100] w-2 h-2 rounded-full bg-royal pointer-events-none"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }} />
      <motion.div className="fixed z-[99] w-9 h-9 rounded-full border border-royal/40 pointer-events-none"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }} />
    </>
  )
}
