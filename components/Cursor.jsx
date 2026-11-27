'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [on, setOn] = useState(false)
  const [hovering, setHovering] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 260, damping: 24, mass: .6 })
  const ry = useSpring(y, { stiffness: 260, damping: 24, mass: .6 })

  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return
    setOn(true)
    const mv = (e) => { x.set(e.clientX); y.set(e.clientY) }
    const over = (e) => setHovering(!!e.target.closest('a,button'))
    window.addEventListener('mousemove', mv)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', mv)
      window.removeEventListener('mouseover', over)
    }
  }, [x, y])

  if (!on) return null
  return (
    <>
      <motion.div
        className="fixed z-[100] w-2 h-2 rounded-full bg-royal pointer-events-none"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: hovering ? 2 : 1, backgroundColor: hovering ? '#0f9d8f' : '#1d4ed8' }}
        transition={{ duration: .25 }}
      />
      <motion.div
        className="fixed z-[99] w-9 h-9 rounded-full border border-royal/40 pointer-events-none"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: hovering ? 1.9 : 1, borderColor: hovering ? 'rgba(15,157,143,.6)' : 'rgba(29,78,216,.4)' }}
        transition={{ duration: .3 }}
      />
    </>
  )
}
